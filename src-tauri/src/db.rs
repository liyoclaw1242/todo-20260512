/// SQL schema for the todos table.
/// The TypeScript layer (src/lib/db.ts) executes this via tauri-plugin-sql
/// on every `Database.load()` call (CREATE TABLE IF NOT EXISTS is idempotent).
pub const CREATE_TODOS_TABLE: &str = "
  CREATE TABLE IF NOT EXISTS todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    due_date   TEXT,
    completed  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
";
