/**
 * src/lib/db.ts
 *
 * CRUD layer over tauri-plugin-sql (SQLite).
 * All SQL operations run through the Tauri IPC boundary.
 */

import Database from "@tauri-apps/plugin-sql";
import type { Todo } from "./types.js";

/**
 * Persistent SQLite file path.
 * Tauri resolves "sqlite:todos.db" relative to the app's data directory
 * (`tauri::path::BaseDirectory::App`), so the file survives app restarts — AC#6.
 */
export const DB_PATH = "sqlite:todos.db";

const CREATE_TODOS_TABLE = `
  CREATE TABLE IF NOT EXISTS todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    due_date   TEXT,
    completed  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`;

let _db: Database | null = null;

/** Opens (or returns the cached) database and ensures the schema exists. */
export async function getDb(): Promise<Database> {
  if (_db === null) {
    _db = await Database.load(DB_PATH);
    await _db.execute(CREATE_TODOS_TABLE);
  }
  return _db;
}

/**
 * For testing only — resets the singleton so the next getDb() call
 * re-runs the migration against the fresh mock.
 */
export function _resetDb(): void {
  _db = null;
}

// ── Queries ──────────────────────────────────────────────────────────────────

type RawTodo = Omit<Todo, "completed"> & { completed: number };

export async function getTodos(): Promise<Todo[]> {
  const db = await getDb();
  const rows = await db.select<RawTodo[]>(
    "SELECT id, title, due_date, completed, created_at FROM todos ORDER BY created_at ASC"
  );
  return rows.map((r) => ({ ...r, completed: r.completed === 1 }));
}

export async function createTodo(title: string, dueDate?: string): Promise<number> {
  const db = await getDb();
  const result = await db.execute("INSERT INTO todos (title, due_date) VALUES (?, ?)", [
    title,
    dueDate ?? null,
  ]);
  return result.lastInsertId ?? 0;
}

export async function toggleTodo(id: number, completed: boolean): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE todos SET completed = ? WHERE id = ?", [completed ? 1 : 0, id]);
}

export async function deleteTodo(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM todos WHERE id = ?", [id]);
}

export async function updateTodo(
  id: number,
  title: string,
  dueDate: string | null
): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE todos SET title = ?, due_date = ? WHERE id = ?", [
    title,
    dueDate,
    id,
  ]);
}
