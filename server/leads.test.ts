import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the db module to avoid real database calls during tests
vi.mock("./db", () => ({
  createLead: vi.fn().mockResolvedValue(true),
  getLeads: vi.fn().mockResolvedValue([
    {
      id: 1,
      nome: "Dr. Maria",
      email: "maria@fisio.com",
      whatsapp: "(11) 99999-0000",
      ip: "127.0.0.1",
      userAgent: "test-agent",
      source: "fisioprecifica",
      createdAt: new Date(),
    },
  ]),
  getLeadsCount: vi.fn().mockResolvedValue(1),
  getLeadsForExport: vi.fn().mockResolvedValue([
    {
      id: 1,
      nome: "Dr. Maria",
      email: "maria@fisio.com",
      whatsapp: "(11) 99999-0000",
      ip: "127.0.0.1",
      userAgent: "test-agent",
      source: "fisioprecifica",
      createdAt: new Date(),
    },
  ]),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "test-browser/1.0",
      },
      ip: "127.0.0.1",
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@fisio.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@fisio.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("leads.register", () => {
  it("successfully registers a lead with valid data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.register({
      nome: "Dr. João Silva",
      email: "joao@fisioterapia.com",
      whatsapp: "(11) 99999-1234",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects registration with invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.register({
        nome: "Dr. João",
        email: "invalid-email",
        whatsapp: "(11) 99999-1234",
      })
    ).rejects.toThrow();
  });

  it("rejects registration with short name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.register({
        nome: "J",
        email: "joao@fisio.com",
        whatsapp: "(11) 99999-1234",
      })
    ).rejects.toThrow();
  });

  it("rejects registration with short whatsapp", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.register({
        nome: "Dr. João",
        email: "joao@fisio.com",
        whatsapp: "123",
      })
    ).rejects.toThrow();
  });
});

describe("leads.list", () => {
  it("allows admin to list leads", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.list({ limit: 50, offset: 0 });

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("rejects non-admin users from listing leads", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.list({ limit: 50, offset: 0 })).rejects.toThrow();
  });

  it("rejects unauthenticated users from listing leads", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.list({ limit: 50, offset: 0 })).rejects.toThrow();
  });
});

describe("leads.exportAll", () => {
  it("allows admin to export all leads", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.exportAll();

    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toHaveProperty("nome", "Dr. Maria");
  });

  it("rejects non-admin users from exporting leads", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.leads.exportAll()).rejects.toThrow();
  });
});
