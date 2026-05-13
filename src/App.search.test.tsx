/**
 * Integration tests for keyword search — WP#11 AC#1–AC#4.
 *
 * External boundary mocked: @tauri-apps/plugin-sql (stateful in-memory store).
 * Same mock harness as App.test.tsx; isolated module scope per Vitest design.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// ── Stateful in-memory fake ─────────────────────────────────────────────────

type FakeTodo = {
  id: number;
  title: string;
  due_date: string | null;
  completed: number;
  created_at: string;
};

function makeFakeStore() {
  const todos: FakeTodo[] = [];
  let nextId = 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = vi.fn(async (sql: string, params?: unknown[]): Promise<any> => {
    const s = sql.trim().toLowerCase();
    if (s.startsWith("create table")) return { rowsAffected: 0, lastInsertId: 0 };
    if (s.startsWith("insert into todos")) {
      const id = nextId++;
      todos.push({
        id,
        title: params?.[0] as string,
        due_date: (params?.[1] as string | null) ?? null,
        completed: 0,
        created_at: new Date().toISOString(),
      });
      return { rowsAffected: 1, lastInsertId: id };
    }
    if (s.startsWith("update todos set completed")) {
      const completed = params?.[0] as number;
      const id = params?.[1] as number;
      const t = todos.find((x) => x.id === id);
      if (t) t.completed = completed;
      return { rowsAffected: 1, lastInsertId: 0 };
    }
    if (s.startsWith("delete from todos")) {
      const id = params?.[0] as number;
      const idx = todos.findIndex((x) => x.id === id);
      if (idx !== -1) todos.splice(idx, 1);
      return { rowsAffected: 1, lastInsertId: 0 };
    }
    if (s.startsWith("update todos set title")) {
      const title = params?.[0] as string;
      const dueDate = params?.[1] as string | null;
      const id = params?.[2] as number;
      const t = todos.find((x) => x.id === id);
      if (t) { t.title = title; t.due_date = dueDate; }
      return { rowsAffected: 1, lastInsertId: 0 };
    }
    return { rowsAffected: 0, lastInsertId: 0 };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const select = vi.fn(async (_sql: string): Promise<any> => [...todos]);

  return { execute, select };
}

const { fakeStore, mockLoad } = vi.hoisted(() => {
  let currentStore = makeFakeStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockLoad = vi.fn(async (_path: string): Promise<any> => ({
    execute: currentStore.execute,
    select: currentStore.select,
  }));

  const fakeStore = {
    reset() {
      currentStore = makeFakeStore();
      mockLoad.mockResolvedValue({
        execute: currentStore.execute,
        select: currentStore.select,
      });
    },
  };

  return { fakeStore, mockLoad };
});

vi.mock("@tauri-apps/plugin-sql", () => ({
  default: { load: mockLoad },
}));

import { _resetDb } from "./lib/db.js";

beforeEach(() => {
  fakeStore.reset();
  _resetDb();
});

// ── Helpers ─────────────────────────────────────────────────────────────────

async function addTodo(title: string) {
  const titleInput = await screen.findByPlaceholderText(/title/i);
  fireEvent.change(titleInput, { target: { value: title } });
  fireEvent.click(screen.getByRole("button", { name: /add/i }));
  await screen.findByText(title);
}

// ── AC#1 — search input always visible ──────────────────────────────────────

describe("AC#1 — search input visible at all times", () => {
  it("renders a search input immediately — no todos needed", () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});

// ── AC#2 — typing keyword filters immediately (no submit required) ───────────

describe("AC#2 — real-time keyword filter", () => {
  it("typing in the search box shows only matching todos without pressing Enter", async () => {
    render(<App />);
    await addTodo("buy milk");
    await addTodo("walk the dog");

    const searchBox = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchBox, { target: { value: "milk" } });

    // Matching item is visible; non-matching item is not
    expect(screen.getByText("buy milk")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("walk the dog")).toBeNull();
    });
  });

  it("a non-matching query hides all todos", async () => {
    render(<App />);
    await addTodo("buy milk");

    const searchBox = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchBox, { target: { value: "zzznomatch" } });

    await waitFor(() => {
      expect(screen.queryByText("buy milk")).toBeNull();
    });
  });
});
