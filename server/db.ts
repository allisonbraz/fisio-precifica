import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, InsertLead, leads, pricingData } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _lastAttempt = 0;
const DB_RETRY_INTERVAL_MS = 5000;

export async function getDb() {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) return null;

  const now = Date.now();
  if (now - _lastAttempt < DB_RETRY_INTERVAL_MS) return null;

  _lastAttempt = now;
  try {
    const client = postgres(process.env.DATABASE_URL);
    _db = drizzle(client);
    return _db;
  } catch (error) {
    console.warn("[Database] Connection failed, will retry in 5s:", error);
    return null;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.supabaseId) {
    throw new Error("User supabaseId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      supabaseId: user.supabaseId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    values.source = 'supabase';

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.supabaseId,
      set: updateSet,
    });

    // Link existing leads with same email
    if (user.email) {
      const dbUser = await db.select().from(users).where(eq(users.supabaseId, user.supabaseId)).limit(1);
      if (dbUser.length > 0) {
        await db.update(leads)
          .set({ userId: dbUser[0].id })
          .where(eq(leads.email, user.email));
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserBySupabaseId(supabaseId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.supabaseId, supabaseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== LEADS =====

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }
  try {
    await db.insert(leads).values(lead)
      .onConflictDoUpdate({
        target: leads.email,
        set: {
          nome: sql`excluded.nome`,
          whatsapp: sql`excluded.whatsapp`,
          source: sql`excluded.source`,
        },
      });
    return true;
  } catch (error) {
    console.error("[Database] Failed to create lead:", error);
    throw error;
  }
}

export async function getLeads(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
}

export async function getLeadsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(leads);
  return result[0]?.count ?? 0;
}

export async function getLeadsForExport() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

// ===== UNIFIED CONTACTS =====

export interface UnifiedContact {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  instagram: string;
  especialidades: string;
  source: string;
  hasOAuth: boolean;
  createdAt: Date;
  lastSignedIn: Date | null;
}

export async function getUnifiedContacts(limit = 100, offset = 0): Promise<{ items: UnifiedContact[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  // Count total unique contacts at DB level
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as total FROM (
      SELECT LOWER(TRIM(email)) as key FROM leads
      UNION
      SELECT LOWER(TRIM(email)) as key FROM users WHERE email IS NOT NULL
    ) unified
  `);
  const total = Number(countResult[0]?.total ?? 0);

  // Paginated query: leads first (with user join), then users without leads
  const rows = await db.execute(sql`
    WITH lead_contacts AS (
      SELECT DISTINCT ON (LOWER(TRIM(l.email)))
        'lead-' || l.id::text as id,
        l.nome,
        l.email,
        COALESCE(l.whatsapp, u.whatsapp, '') as whatsapp,
        COALESCE(l.source, 'banner') as source,
        l."createdAt",
        u."lastSignedIn",
        CASE WHEN u.id IS NOT NULL THEN true ELSE false END as "hasOAuth",
        CASE WHEN u.id IS NOT NULL
          THEN COALESCE(l.source, 'banner') || ' + login'
          ELSE COALESCE(l.source, 'banner')
        END as computed_source
      FROM leads l
      LEFT JOIN users u ON LOWER(TRIM(u.email)) = LOWER(TRIM(l.email))
      ORDER BY LOWER(TRIM(l.email)), l."createdAt" DESC
    ),
    user_only_contacts AS (
      SELECT
        'user-' || u.id::text as id,
        COALESCE(u.name, '') as nome,
        u.email,
        COALESCE(u.whatsapp, '') as whatsapp,
        COALESCE(u.source, 'supabase') as source,
        u."createdAt",
        u."lastSignedIn",
        true as "hasOAuth",
        COALESCE(u.source, 'supabase') as computed_source
      FROM users u
      WHERE u.email IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM leads l
          WHERE LOWER(TRIM(l.email)) = LOWER(TRIM(u.email))
        )
    ),
    all_contacts AS (
      SELECT * FROM lead_contacts
      UNION ALL
      SELECT * FROM user_only_contacts
    )
    SELECT * FROM all_contacts
    ORDER BY "createdAt" DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  // Enrich only the current page with pricing_data perfil
  const emails = (rows as Array<Record<string, unknown>>)
    .map(r => (r.email as string)?.toLowerCase().trim())
    .filter(Boolean);

  let perfilByEmail = new Map<string, Record<string, string>>();
  if (emails.length > 0) {
    const pricingRows = await db.select({ ownerEmail: pricingData.ownerEmail, data: pricingData.data })
      .from(pricingData)
      .where(sql`LOWER(TRIM("ownerEmail")) = ANY(ARRAY[${sql.join(emails.map(e => sql`${e}`), sql`,`)}])`);

    for (const pd of pricingRows) {
      const perfil = (pd.data as Record<string, unknown>)?._perfil as Record<string, string> | undefined;
      if (perfil) {
        perfilByEmail.set(pd.ownerEmail.toLowerCase().trim(), perfil);
      }
    }
  }

  const items: UnifiedContact[] = (rows as Array<Record<string, unknown>>).map(row => {
    const email = (row.email as string) || '';
    const perfil = perfilByEmail.get(email.toLowerCase().trim());
    return {
      id: row.id as string,
      nome: (row.nome as string) || '',
      email,
      whatsapp: (row.whatsapp as string) || perfil?.whatsapp || '',
      instagram: perfil?.instagram || '',
      especialidades: perfil?.especialidades || '',
      source: (row.computed_source as string) || (row.source as string) || '',
      hasOAuth: row.hasOAuth as boolean,
      createdAt: new Date(row.createdAt as string),
      lastSignedIn: row.lastSignedIn ? new Date(row.lastSignedIn as string) : null,
    };
  });

  return { items, total };
}

export async function getUnifiedContactsForExport(): Promise<UnifiedContact[]> {
  const db = await getDb();
  if (!db) return [];

  // For export, paginate in chunks to avoid loading everything at once
  const allItems: UnifiedContact[] = [];
  let offset = 0;
  const chunkSize = 500;
  while (true) {
    const { items } = await getUnifiedContacts(chunkSize, offset);
    allItems.push(...items);
    if (items.length < chunkSize) break;
    offset += chunkSize;
  }
  return allItems;
}

// ===== PRICING DATA =====

export async function savePricingData(ownerEmail: string, data: unknown): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save pricing data: database not available");
    return false;
  }
  try {
    await db.insert(pricingData)
      .values({ ownerEmail, data })
      .onConflictDoUpdate({
        target: pricingData.ownerEmail,
        set: { data, updatedAt: new Date() },
      });
    return true;
  } catch (error) {
    console.error("[Database] Failed to save pricing data:", error);
    throw error;
  }
}

export async function loadPricingData(ownerEmail: string): Promise<unknown | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot load pricing data: database not available");
    return null;
  }
  try {
    const result = await db.select({ data: pricingData.data })
      .from(pricingData)
      .where(eq(pricingData.ownerEmail, ownerEmail))
      .limit(1);
    return result.length > 0 ? result[0].data : null;
  } catch (error) {
    console.error("[Database] Failed to load pricing data:", error);
    return null;
  }
}

// ===== ADMIN: UPDATE USER EMAIL =====

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserEmail(oldEmail: string, newEmail: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(users)
    .set({ email: newEmail, updatedAt: new Date() })
    .where(eq(users.email, oldEmail));

  await db.update(pricingData)
    .set({ ownerEmail: newEmail, updatedAt: new Date() })
    .where(eq(pricingData.ownerEmail, oldEmail));

  // Update leads if exists
  const leadExists = await db.select({ id: leads.id }).from(leads).where(eq(leads.email, oldEmail)).limit(1);
  if (leadExists.length > 0) {
    await db.update(leads)
      .set({ email: newEmail })
      .where(eq(leads.email, oldEmail));
  }
}
