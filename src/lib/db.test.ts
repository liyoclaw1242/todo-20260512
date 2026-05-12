/**
 * Tests for src/lib/db.ts — CRUD layer over tauri-plugin-sql.
 *
 * External boundary mocked: @tauri-apps/plugin-sql (Database class + IPC).
 * Everything above (db.ts functions) is tested as real code.
 *
 * Test structure:
 *   AC#1 migration describe — resets singleton before every test so getDb()
 *       always runs the migration.
 *   AC#2–6 CRUD describes — pre-warm the DB (consuming the migration call)
 *       then clear call history so each test only sees its own SQL.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock @tauri-apps/plugin-sql at the IPC boundary ---
const { mockLoad, mockExecute, mockSelect } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockExecute = vi.fn<(sql: string, params?: unknown[]) => Promise<any>>()
    .mockResolvedValue({ rowsAffected: 0, lastInsertId: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSelect = vi.fn<(sql: string, params?: unknown[]) => Promise<any>>()
    .mockResolvedValue([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockLoad = vi.fn<(path: string) => Promise<any>>()
    .mockResolvedValue({ execute: mockExecute, select: mockSelect });
  return { mockLoad, mockExecute, mockSelect };
});

vi.mock("@tauri-apps/plugin-sql", () => ({
  default: { load: mockLoad },
}));

import {
  getDb,
  getTodos,
  createTodo,
  toggleTodo,
  deleteTodo,
  updateTodo,
  _resetDb,
  DB_PATH,
} from "./db.js";

// Helper: warm the DB singleton so subsequent calls skip the migration.
// After warming, clears all call history so tests only see their own SQL.
async function warmDb(): Promise<void> {
  _resetDb();
  vi.clearAllMocks();
  await getDb();            // runs migration (consumes mockExecute once)
  vi.clearAllMocks();       // wipe migration call records
  // restore default implementations (vi.clearAllMocks keeps them, but be explicit)
  mockExecute.mockResolvedValue({ rowsAffected: 0, lastInsertId: 0 });
  mockSelect.mockResolvedValue([]);
}

// ── AC#1: migration ────────────────────────────────────────────────────────

describe("AC#1 — getDb() migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetDb();
  });

  it("calls Database.load with the persistent file path", async () => {
    await getDb();
    expect(mockLoad).toHaveBeenCalledWith(DB_PATH);
  });

  it("runs CREATE TABLE IF NOT EXISTS todos on first call", async () => {
    await getDb();
    const sqls = mockExecute.mock.calls.map((c) => (c[0] as string).toLowerCase());
    expect(sqls.some((s) => s.includes("create table if not exists todos"))).toBe(true);
  });

  it("only loads the DB once across multiple calls", async () => {
    await getDb();
    await getDb();
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });
});

// ── AC#2: create + list ────────────────────────────────────────────────────

describe("AC#2 — createTodo / getTodos", () => {
  beforeEach(async () => { await warmDb(); });

  it("createTodo inserts a row and returns the new id", async () => {
    mockExecute.mockResolvedValueOnce({ rowsAffected: 1, lastInsertId: 42 });
    const id = await createTodo("Buy milk");
    expect(id).toBe(42);
    const insertCall = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().startsWith("insert")
    );
    expect((insertCall?.[0] as string).toLowerCase()).toContain("insert into todos");
    expect(insertCall?.[1]).toContain("Buy milk");
  });

  it("createTodo passes optional due_date", async () => {
    await createTodo("Read book", "2026-05-20");
    const call = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().startsWith("insert")
    );
    expect(call?.[1]).toContain("2026-05-20");
  });

  it("getTodos maps completed INTEGER to boolean", async () => {
    mockSelect.mockResolvedValueOnce([
      { id: 1, title: "Test", due_date: null, completed: 0, created_at: "2026-01-01" },
      { id: 2, title: "Done", due_date: null, completed: 1, created_at: "2026-01-02" },
    ]);
    const todos = await getTodos();
    expect(todos[0]!.completed).toBe(false);
    expect(todos[1]!.completed).toBe(true);
  });
});

// ── AC#3: toggle ──────────────────────────────────────────────────────────

describe("AC#3 — toggleTodo", () => {
  beforeEach(async () => { await warmDb(); });

  it("executes UPDATE todos SET completed for the given id", async () => {
    await toggleTodo(5, true);
    const call = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().includes("update todos")
    );
    expect(call).toBeDefined();
    expect(call?.[1]).toContain(5);
  });

  it("passes 1 for completed=true and 0 for completed=false", async () => {
    await toggleTodo(1, true);
    const trueCall = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().includes("update todos")
    );
    expect(trueCall?.[1]).toContain(1); // 1 = true

    vi.clearAllMocks();
    await toggleTodo(1, false);
    const falseCall = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().includes("update todos")
    );
    expect(falseCall?.[1]).toContain(0); // 0 = false
  });
});

// ── AC#4: delete ──────────────────────────────────────────────────────────

describe("AC#4 — deleteTodo", () => {
  beforeEach(async () => { await warmDb(); });

  it("executes DELETE FROM todos for the given id", async () => {
    await deleteTodo(7);
    const call = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().includes("delete from todos")
    );
    expect(call).toBeDefined();
    expect(call?.[1]).toContain(7);
  });
});

// ── AC#5: update ──────────────────────────────────────────────────────────

describe("AC#5 — updateTodo", () => {
  beforeEach(async () => { await warmDb(); });

  it("executes UPDATE todos SET title, due_date for the given id", async () => {
    await updateTodo(3, "Edited title", "2026-06-01");
    const call = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().includes("update todos")
    );
    expect(call).toBeDefined();
    expect(call?.[1]).toContain("Edited title");
    expect(call?.[1]).toContain("2026-06-01");
    expect(call?.[1]).toContain(3);
  });

  it("allows clearing due_date by passing null", async () => {
    await updateTodo(3, "Edited title", null);
    const call = mockExecute.mock.calls.find(([s]) =>
      (s as string).toLowerCase().includes("update todos")
    );
    expect(call?.[1]).toContain(null);
  });
});

// ── AC#6: persistence ─────────────────────────────────────────────────────

describe("AC#6 — persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetDb();
  });

  it("loads sqlite:todos.db (not an in-memory DB)", async () => {
    await getDb();
    expect(mockLoad).toHaveBeenCalledWith("sqlite:todos.db");
    expect(mockLoad).not.toHaveBeenCalledWith("sqlite::memory:");
  });
});
