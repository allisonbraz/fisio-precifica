/**
 * Vercel Serverless Function — Express adapter for tRPC
 * Built with esbuild into api/trpc.js
 */
import 'dotenv/config';
import * as Sentry from '@sentry/node';
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers';
import { createContext } from './_core/context';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.2,
  });
}

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ path, error }) => {
      console.error(`[tRPC Error] ${path ?? 'unknown'}:`, error.message);
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error('[tRPC Error] Stack:', error.stack);
        Sentry.captureException(error, { extra: { path } });
      }
    },
  }),
);

export default app;
