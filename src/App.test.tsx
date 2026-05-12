/**
 * Integration tests for <App /> — AC#2: add todo, appears in list immediately.
 *
 * External boundary mocked: @tauri-apps/plugin-sql (stateful in-memory store).
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
    return { rowsAffected: 0, lastInsertId: 0 };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const select = vi.fn(async (_sql: string): Promise<any> => [...todos]);

  return { execute, select, todos };
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

// ── AC#2 ───────────────────────────────────────────────────────────────────

describe("AC#2 — adding a todo", () => {
  it("new item appears in the list immediately after submit", async () => {
    render(<App />);
    const titleInput = await screen.findByPlaceholderText(/title/i);

    fireEvent.change(titleInput, { target: { value: "Buy milk" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(await screen.findByText("Buy milk")).toBeInTheDocument();
  });

  it("title input is required — empty submit does not add item", async () => {
    render(<App />);
    await screen.findByPlaceholderText(/title/i);

    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(screen.queryByRole("listitem")).toBeNull();
    });
  });

  it("optional due_date is accepted alongside title", async () => {
    render(<App />);
    const titleInput = await screen.findByPlaceholderText(/title/i);
    const dateInput = screen.getByLabelText(/due date/i);

    fireEvent.change(titleInput, { target: { value: "Doctor appointment" } });
    fireEvent.change(dateInput, { target: { value: "2026-06-01" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(await screen.findByText("Doctor appointment")).toBeInTheDocument();
  });
});
