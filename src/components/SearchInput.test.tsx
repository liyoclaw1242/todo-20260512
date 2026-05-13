/**
 * Tests for <SearchInput /> component and its integration in <App />.
 * AC#1: search input visible on main screen.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchInput from "./SearchInput.js";
import App from "../App.js";

// ── Fake DB boundary ──────────────────────────────────────────────────────────

type FakeTodo = {
  id: number;
  title: string;
  due_date: string | null;
  completed: number;
  created_at: string;
};

function makeFakeStore(seed: FakeTodo[] = []) {
  const todos: FakeTodo[] = [...seed];
  let nextId = seed.length + 1;

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
  const select = vi.fn(async (): Promise<any> => [...todos]);

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
    reset(seed: FakeTodo[] = []) {
      currentStore = makeFakeStore(seed);
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

import { _resetDb } from "../lib/db.js";

beforeEach(() => {
  fakeStore.reset();
  _resetDb();
});

// ── AC#1: SearchInput is visible on main screen ──────────────────────────────

describe("AC#1 — search input visible at all times", () => {
  it("renders a visible search input when App mounts", async () => {
    render(<App />);
    await screen.findByPlaceholderText(/title/i);
    const searchInput = screen.getByRole("searchbox");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeVisible();
  });

  it("SearchInput renders a search role input with placeholder text", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    const input = screen.getByRole("searchbox");
    expect(input).toBeInTheDocument();
  });
});

// ── AC#2: Typing immediately filters visible list ─────────────────────────────

describe("AC#2 — typing filters list in real-time (no submit required)", () => {
  it("typing a keyword hides non-matching todos immediately", async () => {
    render(<App />);
    const titleInput = await screen.findByPlaceholderText(/title/i);

    fireEvent.change(titleInput, { target: { value: "buy milk" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    await screen.findByText("buy milk");

    fireEvent.change(titleInput, { target: { value: "walk dog" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    await screen.findByText("walk dog");

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "milk" } });

    await waitFor(() => {
      expect(screen.getByText("buy milk")).toBeInTheDocument();
      expect(screen.queryByText("walk dog")).toBeNull();
    });
  });
});
