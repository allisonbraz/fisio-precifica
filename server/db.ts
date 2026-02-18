import { eq, desc, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertLead, leads } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
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
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    // Set source to 'oauth' for OAuth logins
    values.source = 'oauth';

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // After upsert, try to link any existing lead with the same email
    if (user.email) {
      const dbUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

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
    await db.insert(leads).values(lead);
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

/**
 * Get all contacts unified from both leads and users tables.
 * Deduplicates by email — if a lead and user share the same email, they merge.
 */
export async function getUnifiedContacts(limit = 100, offset = 0): Promise<{ items: UnifiedContact[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  // Get all leads
  const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));

  // Get all users (excluding admin/owner)
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  // Merge by email
  const contactMap = new Map<string, UnifiedContact>();

  // First, add all leads
  for (const lead of allLeads) {
    const key = lead.email.toLowerCase().trim();
    if (!contactMap.has(key)) {
      contactMap.set(key, {
        id: `lead-${lead.id}`,
        nome: lead.nome,
        email: lead.email,
        whatsapp: lead.whatsapp,
        source: lead.source || 'banner',
        hasOAuth: false,
        createdAt: lead.createdAt,
        lastSignedIn: null,
      });
    }
  }

  // Then, merge/add users
  for (const user of allUsers) {
    if (!user.email) continue;
    const key = user.email.toLowerCase().trim();
    const existing = contactMap.get(key);
    if (existing) {
      // Merge: lead already exists, enrich with OAuth info
      existing.hasOAuth = true;
      existing.lastSignedIn = user.lastSignedIn;
      existing.source = `${existing.source} + oauth`;
      // Use user name if lead name is empty
      if (!existing.nome && user.name) existing.nome = user.name;
      // Use user whatsapp if available
      if (user.whatsapp && !existing.whatsapp) existing.whatsapp = user.whatsapp;
    } else {
      // New contact from OAuth only
      contactMap.set(key, {
        id: `user-${user.id}`,
        nome: user.name || '',
        email: user.email,
        whatsapp: user.whatsapp || '',
        source: user.source || 'oauth',
        hasOAuth: true,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      });
    }
  }

  const all = Array.from(contactMap.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = all.length;
  const items = all.slice(offset, offset + limit);

  return { items, total };
}

/**
 * Get all contacts for CSV export
 */
export async function getUnifiedContactsForExport(): Promise<UnifiedContact[]> {
  const result = await getUnifiedContacts(10000, 0);
  return result.items;
}
