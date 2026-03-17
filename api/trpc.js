// server/vercel-entry.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var isProduction = process.env.NODE_ENV === "production";
function requireEnv(name, fallback) {
  const value = process.env[name];
  if (value) return value;
  if (fallback !== void 0) return fallback;
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  console.warn(`[ENV] Missing ${name} \u2014 using empty fallback (dev mode)`);
  return "";
}
var ENV = {
  databaseUrl: requireEnv("DATABASE_URL"),
  supabaseUrl: requireEnv("SUPABASE_URL", process.env.VITE_SUPABASE_URL ?? ""),
  supabaseAnonKey: requireEnv("SUPABASE_ANON_KEY", process.env.VITE_SUPABASE_ANON_KEY ?? ""),
  adminEmail: requireEnv("ADMIN_EMAIL", ""),
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// shared/const.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
import { index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Supabase Auth user UUID */
  supabaseId: uuid("supabaseId").notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  whatsapp: varchar("whatsapp", { length: 30 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  source: varchar("source", { length: 100 }).default("supabase"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 30 }).notNull(),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  source: varchar("source", { length: 100 }).default("banner"),
  userId: integer("userId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (table) => [
  uniqueIndex("idx_leads_email").on(table.email),
  index("idx_leads_created_at").on(table.createdAt)
]);
var pricingData = pgTable("pricing_data", {
  id: serial("id").primaryKey(),
  ownerEmail: varchar("ownerEmail", { length: 320 }).notNull().unique(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.supabaseId) {
    throw new Error("User supabaseId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      supabaseId: user.supabaseId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    values.source = "supabase";
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.supabaseId,
      set: updateSet
    });
    if (user.email) {
      const dbUser = await db.select().from(users).where(eq(users.supabaseId, user.supabaseId)).limit(1);
      if (dbUser.length > 0) {
        await db.update(leads).set({ userId: dbUser[0].id }).where(eq(leads.email, user.email));
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserBySupabaseId(supabaseId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.supabaseId, supabaseId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createLead(lead) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }
  try {
    await db.insert(leads).values(lead).onConflictDoUpdate({
      target: leads.email,
      set: {
        nome: sql`excluded.nome`,
        whatsapp: sql`excluded.whatsapp`,
        source: sql`excluded.source`
      }
    });
    return true;
  } catch (error) {
    console.error("[Database] Failed to create lead:", error);
    throw error;
  }
}
async function getLeads(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
}
async function getLeadsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(leads);
  return result[0]?.count ?? 0;
}
async function getLeadsForExport() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}
var UNIFIED_CONTACTS_MAX = 5e3;
async function getUnifiedContacts(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const [allLeads, allUsers] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(UNIFIED_CONTACTS_MAX),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(UNIFIED_CONTACTS_MAX)
  ]);
  const userByEmail = /* @__PURE__ */ new Map();
  for (const user of allUsers) {
    if (user.email) {
      userByEmail.set(user.email.toLowerCase().trim(), user);
    }
  }
  const contactMap = /* @__PURE__ */ new Map();
  for (const lead of allLeads) {
    const key = lead.email.toLowerCase().trim();
    if (contactMap.has(key)) continue;
    const matchedUser = userByEmail.get(key);
    contactMap.set(key, {
      id: `lead-${lead.id}`,
      nome: lead.nome || matchedUser?.name || "",
      email: lead.email,
      whatsapp: lead.whatsapp || matchedUser?.whatsapp || "",
      source: matchedUser ? `${lead.source || "banner"} + login` : lead.source || "banner",
      hasOAuth: !!matchedUser,
      createdAt: lead.createdAt,
      lastSignedIn: matchedUser?.lastSignedIn ?? null
    });
    if (matchedUser) userByEmail.delete(key);
  }
  for (const [key, user] of Array.from(userByEmail.entries())) {
    if (contactMap.has(key)) continue;
    contactMap.set(key, {
      id: `user-${user.id}`,
      nome: user.name || "",
      email: user.email,
      whatsapp: user.whatsapp || "",
      source: user.source || "supabase",
      hasOAuth: true,
      createdAt: user.createdAt,
      lastSignedIn: user.lastSignedIn
    });
  }
  const all = Array.from(contactMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = all.length;
  const items = all.slice(offset, offset + limit);
  return { items, total };
}
async function getUnifiedContactsForExport() {
  const result = await getUnifiedContacts(UNIFIED_CONTACTS_MAX, 0);
  return result.items;
}
async function savePricingData(ownerEmail, data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save pricing data: database not available");
    return false;
  }
  try {
    await db.insert(pricingData).values({ ownerEmail, data }).onConflictDoUpdate({
      target: pricingData.ownerEmail,
      set: { data, updatedAt: /* @__PURE__ */ new Date() }
    });
    return true;
  } catch (error) {
    console.error("[Database] Failed to save pricing data:", error);
    throw error;
  }
}
async function loadPricingData(ownerEmail) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot load pricing data: database not available");
    return null;
  }
  try {
    const result = await db.select({ data: pricingData.data }).from(pricingData).where(eq(pricingData.ownerEmail, ownerEmail)).limit(1);
    return result.length > 0 ? result[0].data : null;
  } catch (error) {
    console.error("[Database] Failed to load pricing data:", error);
    return null;
  }
}

// server/routers.ts
import { z as z2 } from "zod";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user)
  }),
  leads: router({
    register: publicProcedure.input(z2.object({
      nome: z2.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      email: z2.string().email("E-mail inv\xE1lido"),
      whatsapp: z2.string().min(8, "WhatsApp deve ter pelo menos 8 d\xEDgitos")
    })).mutation(async ({ input, ctx }) => {
      const ip = ctx.req.headers["x-forwarded-for"] || ctx.req.ip || "";
      const userAgent = ctx.req.headers["user-agent"] || "";
      await createLead({
        nome: input.nome,
        email: input.email,
        whatsapp: input.whatsapp,
        ip: typeof ip === "string" ? ip.split(",")[0].trim() : "",
        userAgent,
        source: "banner"
      });
      return { success: true };
    }),
    list: adminProcedure.input(z2.object({
      limit: z2.number().min(1).max(500).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()).query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const [items, total] = await Promise.all([
        getLeads(limit, offset),
        getLeadsCount()
      ]);
      return { items, total, limit, offset };
    }),
    exportAll: adminProcedure.query(async () => {
      const items = await getLeadsForExport();
      return { items };
    })
  }),
  pricing: router({
    save: publicProcedure.input(z2.object({
      email: z2.string().email(),
      data: z2.record(z2.string(), z2.unknown())
    })).mutation(async ({ input }) => {
      const saved = await savePricingData(input.email, input.data);
      return { success: saved };
    }),
    load: publicProcedure.input(z2.object({
      email: z2.string().email()
    })).query(async ({ input }) => {
      const data = await loadPricingData(input.email);
      return { data };
    })
  }),
  contacts: router({
    list: adminProcedure.input(z2.object({
      limit: z2.number().min(1).max(500).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()).query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      return getUnifiedContacts(limit, offset);
    }),
    exportAll: adminProcedure.query(async () => {
      const items = await getUnifiedContactsForExport();
      return { items };
    })
  })
});

// server/_core/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
var supabase = createClient(supabaseUrl, supabaseAnonKey);

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        const supabaseUser = data.user;
        const isAdmin = ENV.adminEmail && supabaseUser.email === ENV.adminEmail;
        await upsertUser({
          supabaseId: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || null,
          email: supabaseUser.email || null,
          loginMethod: "email",
          lastSignedIn: /* @__PURE__ */ new Date(),
          ...isAdmin ? { role: "admin" } : {}
        });
        user = await getUserBySupabaseId(supabaseUser.id) ?? null;
      }
    }
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/vercel-entry.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var vercel_entry_default = app;
export {
  vercel_entry_default as default
};
