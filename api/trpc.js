// server/vercel-entry.ts
import "dotenv/config";
import * as Sentry from "@sentry/node";
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
if (!ENV.databaseUrl) {
  console.error("\n\u26A0\uFE0F  DATABASE_URL not set \u2014 database features will be unavailable.");
  console.error("   Copy .env.example to .env and fill in your PostgreSQL connection string.\n");
}
if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
  console.warn("[ENV] Supabase not configured \u2014 authentication will not work.");
}

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
var rateLimitStore = /* @__PURE__ */ new Map();
var RATE_LIMIT_WINDOW_MS = 6e4;
var RATE_LIMIT_MAX = 5;
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  });
}, 6e4);
var rateLimit = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || ctx.req.ip || "unknown";
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT_MAX) {
      throw new TRPCError2({
        code: "TOO_MANY_REQUESTS",
        message: "Muitas requisi\xE7\xF5es. Tente novamente em 1 minuto."
      });
    }
    entry.count++;
  } else {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }
  return next();
});
var rateLimitedProcedure = t.procedure.use(rateLimit);
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
}, (table) => [
  index("idx_users_email").on(table.email)
]);
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
var _lastAttempt = 0;
var DB_RETRY_INTERVAL_MS = 5e3;
async function getDb() {
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
async function getUnifiedContacts(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as total FROM (
      SELECT LOWER(TRIM(email)) as key FROM leads
      UNION
      SELECT LOWER(TRIM(email)) as key FROM users WHERE email IS NOT NULL
    ) unified
  `);
  const total = Number(countResult[0]?.total ?? 0);
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
  const emails = rows.map((r) => r.email?.toLowerCase().trim()).filter(Boolean);
  let perfilByEmail = /* @__PURE__ */ new Map();
  if (emails.length > 0) {
    const pricingRows = await db.select({ ownerEmail: pricingData.ownerEmail, data: pricingData.data }).from(pricingData).where(sql`LOWER(TRIM("ownerEmail")) = ANY(ARRAY[${sql.join(emails.map((e) => sql`${e}`), sql`,`)}])`);
    for (const pd of pricingRows) {
      const perfil = pd.data?._perfil;
      if (perfil) {
        perfilByEmail.set(pd.ownerEmail.toLowerCase().trim(), perfil);
      }
    }
  }
  const items = rows.map((row) => {
    const email = row.email || "";
    const perfil = perfilByEmail.get(email.toLowerCase().trim());
    return {
      id: row.id,
      nome: row.nome || "",
      email,
      whatsapp: row.whatsapp || perfil?.whatsapp || "",
      instagram: perfil?.instagram || "",
      especialidades: perfil?.especialidades || "",
      source: row.computed_source || row.source || "",
      hasOAuth: row.hasOAuth,
      createdAt: new Date(row.createdAt),
      lastSignedIn: row.lastSignedIn ? new Date(row.lastSignedIn) : null
    };
  });
  return { items, total };
}
async function getUnifiedContactsForExport() {
  const db = await getDb();
  if (!db) return [];
  const allItems = [];
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
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateUserEmail(oldEmail, newEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ email: newEmail, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.email, oldEmail));
  await db.update(pricingData).set({ ownerEmail: newEmail, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pricingData.ownerEmail, oldEmail));
  const leadExists = await db.select({ id: leads.id }).from(leads).where(eq(leads.email, oldEmail)).limit(1);
  if (leadExists.length > 0) {
    await db.update(leads).set({ email: newEmail }).where(eq(leads.email, oldEmail));
  }
}

// server/_core/supabase.ts
import { createClient } from "@supabase/supabase-js";
var configuredSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
var configuredSupabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
var supabaseUrl = configuredSupabaseUrl || "http://127.0.0.1:54321";
var supabaseAnonKey = configuredSupabaseAnonKey || "local-anon-key";
if (!configuredSupabaseUrl || !configuredSupabaseAnonKey) {
  console.warn("[Supabase] Sem credenciais configuradas; a autentica\xE7\xE3o fica desligada.");
}
var supabase = createClient(supabaseUrl, supabaseAnonKey);
var supabaseAdmin = supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
}) : null;

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user)
  }),
  leads: router({
    register: rateLimitedProcedure.input(z2.object({
      nome: z2.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      email: z2.string().email("E-mail inv\xE1lido"),
      whatsapp: z2.string().min(8, "WhatsApp deve ter pelo menos 8 d\xEDgitos"),
      marketingConsent: z2.literal(true, {
        error: "O consentimento para contato de marketing \xE9 obrigat\xF3rio"
      })
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
    save: protectedProcedure.input(z2.object({
      data: z2.object({
        custosFixos: z2.array(z2.object({
          id: z2.string(),
          nome: z2.string(),
          valor: z2.number().min(0),
          frequencia: z2.enum(["mensal", "anual"]),
          observacao: z2.string().optional().default(""),
          descricao: z2.string().optional().default(""),
          temParcelaAtiva: z2.boolean().optional(),
          isDepreciacao: z2.boolean().optional()
        })).optional(),
        custosVariaveis: z2.array(z2.object({
          id: z2.string(),
          nome: z2.string(),
          valor: z2.number().min(0),
          frequencia: z2.enum(["mensal", "anual"]),
          observacao: z2.string().optional().default(""),
          descricao: z2.string().optional().default(""),
          modo: z2.enum(["mensal", "por_sessao", "percentual_receita"]).optional(),
          percentual: z2.number().min(0).max(1).optional()
        })).optional(),
        reservasEstrategicas: z2.array(z2.object({
          id: z2.string(),
          nome: z2.string(),
          valor: z2.number().min(0),
          frequencia: z2.enum(["mensal", "anual"]),
          descricao: z2.string().optional().default(""),
          modo: z2.enum(["fixo", "percentual"]).optional(),
          percentual: z2.number().min(0).max(1).optional()
        })).optional(),
        sessoesMeta: z2.number().min(0).optional(),
        margemLucro: z2.number().min(0).max(1).optional(),
        impostoPercentual: z2.number().min(0).max(1).optional(),
        etapasConcluidas: z2.object({
          custos: z2.boolean().optional(),
          precificacao: z2.boolean().optional(),
          servicos: z2.boolean().optional()
        }).optional(),
        precoDefinido: z2.number().min(0).optional(),
        horasTrabalho: z2.number().min(0).optional(),
        diasUteis: z2.number().min(0).optional(),
        sessoesporDia: z2.number().min(0).optional(),
        duracaoPadraoMinutos: z2.number().min(0).optional(),
        regimeTributario: z2.enum(["mei", "simples", "presumido", "autonomo", "personalizado"]).optional(),
        tiposServico: z2.array(z2.object({
          id: z2.string(),
          nome: z2.string(),
          duracaoMinutos: z2.number().min(0),
          custoAdicional: z2.number().min(0),
          multiplicadorPreco: z2.number().min(0),
          descricao: z2.string().optional().default("")
        })).optional(),
        planosTratamento: z2.array(z2.object({
          id: z2.string(),
          nome: z2.string(),
          tipoServicoId: z2.string(),
          quantidadeSessoes: z2.number().min(1),
          descontoPercentual: z2.number().min(0).max(100),
          validade: z2.number().min(1)
        })).optional(),
        registrosMensais: z2.array(z2.object({
          id: z2.string(),
          mes: z2.string(),
          sessoesRealizadas: z2.number().min(0),
          receitaTotal: z2.number().min(0),
          custoFixoTotal: z2.number().min(0),
          custoVariavelTotal: z2.number().min(0),
          observacoes: z2.string().optional().default(""),
          tipo: z2.enum(["simples", "completo"]).optional(),
          servicosVendidos: z2.array(z2.object({
            tipoServicoId: z2.string(),
            quantidade: z2.number().min(0),
            receitaGerada: z2.number().min(0)
          })).optional(),
          planosVendidos: z2.array(z2.object({
            planoTratamentoId: z2.string(),
            quantidade: z2.number().min(0),
            receitaGerada: z2.number().min(0)
          })).optional()
        })).optional(),
        _perfil: z2.object({
          nome: z2.string(),
          cidade: z2.string(),
          endereco: z2.string(),
          crefito: z2.string(),
          especialidades: z2.string(),
          logoUrl: z2.string(),
          whatsapp: z2.string(),
          instagram: z2.string(),
          cpfCnpj: z2.string(),
          nomeEmpresa: z2.string(),
          site: z2.string(),
          outraRedeSocial: z2.string()
        }).partial().optional()
      }).passthrough()
    })).mutation(async ({ input, ctx }) => {
      const saved = await savePricingData(ctx.user.email, input.data);
      return { success: saved };
    }),
    load: protectedProcedure.query(async ({ ctx }) => {
      const data = await loadPricingData(ctx.user.email);
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
    }),
    changeEmail: adminProcedure.input(z2.object({
      currentEmail: z2.string().email(),
      newEmail: z2.string().email()
    })).mutation(async ({ input }) => {
      if (!supabaseAdmin) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "SUPABASE_SERVICE_ROLE_KEY n\xE3o configurada. Adicione a vari\xE1vel de ambiente." });
      }
      const userRecord = await getUserByEmail(input.currentEmail);
      if (!userRecord) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Usu\xE1rio n\xE3o encontrado com esse e-mail." });
      }
      const existingUser = await getUserByEmail(input.newEmail);
      if (existingUser) {
        throw new TRPCError3({ code: "CONFLICT", message: "J\xE1 existe um usu\xE1rio com esse novo e-mail." });
      }
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userRecord.supabaseId,
        { email: input.newEmail, email_confirm: true }
      );
      if (error) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: `Erro Supabase: ${error.message}` });
      }
      await updateUserEmail(input.currentEmail, input.newEmail);
      return { success: true };
    })
  })
});

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
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.2
  });
}
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ path, error }) => {
      console.error(`[tRPC Error] ${path ?? "unknown"}:`, error.message);
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("[tRPC Error] Stack:", error.stack);
        Sentry.captureException(error, { extra: { path } });
      }
    }
  })
);
var vercel_entry_default = app;
export {
  vercel_entry_default as default
};
