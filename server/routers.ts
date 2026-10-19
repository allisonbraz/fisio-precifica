import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, rateLimitedProcedure, router } from "./_core/trpc";
import { createLead, getLeads, getLeadsCount, getLeadsForExport, getUnifiedContacts, getUnifiedContactsForExport, savePricingData, loadPricingData, getUserByEmail, updateUserEmail } from "./db";
import { supabaseAdmin } from "./_core/supabase";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
  }),

  leads: router({
    register: rateLimitedProcedure
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
          source: 'banner',
        });
        return { success: true };
      }),

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

    exportAll: adminProcedure.query(async () => {
      const items = await getLeadsForExport();
      return { items };
    }),
  }),

  pricing: router({
    save: protectedProcedure
      .input(z.object({
        data: z.object({
          custosFixos: z.array(z.object({
            id: z.string(),
            nome: z.string(),
            valor: z.number().min(0),
            frequencia: z.enum(['mensal', 'anual']),
            observacao: z.string().optional().default(''),
            descricao: z.string().optional().default(''),
            temParcelaAtiva: z.boolean().optional(),
            isDepreciacao: z.boolean().optional(),
          })).optional(),
          custosVariaveis: z.array(z.object({
            id: z.string(),
            nome: z.string(),
            valor: z.number().min(0),
            frequencia: z.enum(['mensal', 'anual']),
            observacao: z.string().optional().default(''),
            descricao: z.string().optional().default(''),
            modo: z.enum(['mensal', 'por_sessao', 'percentual_receita']).optional(),
            percentual: z.number().min(0).max(1).optional(),
          })).optional(),
          reservasEstrategicas: z.array(z.object({
            id: z.string(),
            nome: z.string(),
            valor: z.number().min(0),
            frequencia: z.enum(['mensal', 'anual']),
            descricao: z.string().optional().default(''),
            modo: z.enum(['fixo', 'percentual']).optional(),
            percentual: z.number().min(0).max(1).optional(),
          })).optional(),
          sessoesMeta: z.number().min(0).optional(),
          margemLucro: z.number().min(0).max(1).optional(),
          impostoPercentual: z.number().min(0).max(1).optional(),
          etapasConcluidas: z.object({
            custos: z.boolean().optional(),
            precificacao: z.boolean().optional(),
            servicos: z.boolean().optional(),
          }).optional(),
          precoDefinido: z.number().min(0).optional(),
          horasTrabalho: z.number().min(0).optional(),
          diasUteis: z.number().min(0).optional(),
          sessoesporDia: z.number().min(0).optional(),
          duracaoPadraoMinutos: z.number().min(0).optional(),
          regimeTributario: z.enum(['mei', 'simples', 'presumido', 'autonomo', 'personalizado']).optional(),
          tiposServico: z.array(z.object({
            id: z.string(),
            nome: z.string(),
            duracaoMinutos: z.number().min(0),
            custoAdicional: z.number().min(0),
            multiplicadorPreco: z.number().min(0),
            descricao: z.string().optional().default(''),
          })).optional(),
          planosTratamento: z.array(z.object({
            id: z.string(),
            nome: z.string(),
            tipoServicoId: z.string(),
            quantidadeSessoes: z.number().min(1),
            descontoPercentual: z.number().min(0).max(100),
            validade: z.number().min(1),
          })).optional(),
          registrosMensais: z.array(z.object({
            id: z.string(),
            mes: z.string(),
            sessoesRealizadas: z.number().min(0),
            receitaTotal: z.number().min(0),
            custoFixoTotal: z.number().min(0),
            custoVariavelTotal: z.number().min(0),
            observacoes: z.string().optional().default(''),
          })).optional(),
          _perfil: z.object({
            nome: z.string(),
            cidade: z.string(),
            endereco: z.string(),
            crefito: z.string(),
            especialidades: z.string(),
            logoUrl: z.string(),
            whatsapp: z.string(),
            instagram: z.string(),
            cpfCnpj: z.string(),
            nomeEmpresa: z.string(),
            site: z.string(),
            outraRedeSocial: z.string(),
          }).partial().optional(),
        }).passthrough(),
      }))
      .mutation(async ({ input, ctx }) => {
        const saved = await savePricingData(ctx.user.email!, input.data);
        return { success: saved };
      }),

    load: protectedProcedure
      .query(async ({ ctx }) => {
        const data = await loadPricingData(ctx.user.email!);
        return { data };
      }),
  }),

  contacts: router({
    list: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        return getUnifiedContacts(limit, offset);
      }),

    exportAll: adminProcedure.query(async () => {
      const items = await getUnifiedContactsForExport();
      return { items };
    }),

    changeEmail: adminProcedure
      .input(z.object({
        currentEmail: z.string().email(),
        newEmail: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        if (!supabaseAdmin) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione a variável de ambiente.' });
        }

        const userRecord = await getUserByEmail(input.currentEmail);
        if (!userRecord) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado com esse e-mail.' });
        }

        // Check if new email is already in use
        const existingUser = await getUserByEmail(input.newEmail);
        if (existingUser) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Já existe um usuário com esse novo e-mail.' });
        }

        // Update in Supabase Auth
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          userRecord.supabaseId,
          { email: input.newEmail, email_confirm: true },
        );
        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Erro Supabase: ${error.message}` });
        }

        // Update in all DB tables
        await updateUserEmail(input.currentEmail, input.newEmail);

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
