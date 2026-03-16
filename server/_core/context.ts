import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabase } from "./supabase";
import * as db from "../db";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data.user) {
        const supabaseUser = data.user;
        const isAdmin = ENV.adminEmail && supabaseUser.email === ENV.adminEmail;

        // Upsert user in our database
        await db.upsertUser({
          supabaseId: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || null,
          email: supabaseUser.email || null,
          loginMethod: "email",
          lastSignedIn: new Date(),
          ...(isAdmin ? { role: "admin" } : {}),
        });

        user = (await db.getUserBySupabaseId(supabaseUser.id)) ?? null;
      }
    }
  } catch (error) {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
