import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, InsertLead, leads, pricingData } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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
  source: string;
  hasOAuth: boolean;
  createdAt: Date;
  lastSignedIn: Date | null;
}

const UNIFIED_CONTACTS_MAX = 5000;

export async function getUnifiedContacts(limit = 100, offset = 0): Promise<{ items: UnifiedContact[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const [allLeads, allUsers] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(UNIFIED_CONTACTS_MAX),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(UNIFIED_CONTACTS_MAX),
  ]);

  const userByEmail = new Map<string, typeof allUsers[number]>();
  for (const user of allUsers) {
    if (user.email) {
      userByEmail.set(user.email.toLowerCase().trim(), user);
    }
  }

  const contactMap = new Map<string, UnifiedContact>();

  for (const lead of allLeads) {
    const key = lead.email.toLowerCase().trim();
    if (contactMap.has(key)) continue;

    const matchedUser = userByEmail.get(key);
    contactMap.set(key, {
      id: `lead-${lead.id}`,
      nome: lead.nome || matchedUser?.name || '',
      email: lead.email,
      whatsapp: lead.whatsapp || matchedUser?.whatsapp || '',
      source: matchedUser ? `${lead.source || 'banner'} + login` : (lead.source || 'banner'),
      hasOAuth: !!matchedUser,
      createdAt: lead.createdAt,
      lastSignedIn: matchedUser?.lastSignedIn ?? null,
    });
    if (matchedUser) userByEmail.delete(key);
  }

  for (const [key, user] of Array.from(userByEmail.entries())) {
    if (contactMap.has(key)) continue;
    contactMap.set(key, {
      id: `user-${user.id}`,
      nome: user.name || '',
      email: user.email!,
      whatsapp: user.whatsapp || '',
      source: user.source || 'supabase',
      hasOAuth: true,
      createdAt: user.createdAt,
      lastSignedIn: user.lastSignedIn,
    });
  }

  const all = Array.from(contactMap.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = all.length;
  const items = all.slice(offset, offset + limit);

  return { items, total };
}

export async function getUnifiedContactsForExport(): Promise<UnifiedContact[]> {
  const result = await getUnifiedContacts(UNIFIED_CONTACTS_MAX, 0);
  return result.items;
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
