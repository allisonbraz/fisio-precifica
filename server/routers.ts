import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { createLead, getLeads, getLeadsCount, getLeadsForExport } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  leads: router({
    /** Public endpoint - anyone can register as a lead */
    register: publicProcedure
      .input(z.object({
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        whatsapp: z.string().min(8, "WhatsApp deve ter pelo menos 8 dígitos"),
      }))
      .mutation(async ({ input, ctx }) => {
        const ip = ctx.req.headers['x-forwarded-for'] as string || ctx.req.ip || '';
        const userAgent = ctx.req.headers['user-agent'] || '';
        await createLead({
          nome: input.nome,
          email: input.email,
          whatsapp: input.whatsapp,
          ip: typeof ip === 'string' ? ip.split(',')[0].trim() : '',
          userAgent,
          source: 'fisioprecifica',
        });
        return { success: true };
      }),

    /** Admin-only: list leads with pagination */
    list: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        const [items, total] = await Promise.all([
          getLeads(limit, offset),
          getLeadsCount(),
        ]);
        return { items, total, limit, offset };
      }),

    /** Admin-only: export all leads */
    exportAll: adminProcedure.query(async () => {
      const items = await getLeadsForExport();
      return { items };
    }),
  }),
});

export type AppRouter = typeof appRouter;
