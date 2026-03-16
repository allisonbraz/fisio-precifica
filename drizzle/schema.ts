import { index, integer, json, jsonb, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  whatsapp: varchar("whatsapp", { length: 30 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  source: varchar("source", { length: 100 }).default("oauth"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads table - captures visitor registration data for mailing list.
 */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 30 }).notNull(),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  source: varchar("source", { length: 100 }).default("banner"),
  /** Link to users table if this lead also has an OAuth account */
  userId: integer("userId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_leads_email").on(table.email),
  index("idx_leads_created_at").on(table.createdAt),
]);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Pricing data — stores the full DadosPrecificacao JSON per owner.
 * Uses JSON column to accommodate the evolving data model without schema migrations.
 * Keyed by ownerEmail (lead or user email) for cross-device sync.
 */
export const pricingData = pgTable("pricing_data", {
  id: serial("id").primaryKey(),
  ownerEmail: varchar("ownerEmail", { length: 320 }).notNull().unique(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PricingData = typeof pricingData.$inferSelect;
export type InsertPricingData = typeof pricingData.$inferInsert;
