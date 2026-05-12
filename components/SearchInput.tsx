/**
 * Pure keyword-filter logic for the todo list.
 *
 * filterTodos is the shared utility used by both the server-side query
 * handler (GET /todos?q=…) and the inline browser script in app/page.tsx.
 * Keeping it here makes the logic testable independently of the HTTP layer.
 */
import type { TodoItem } from "../app/page.js";

/**
 * Filter todos by keyword.
 *
 * @param todos - Full list of todos.
 * @param query - Search string. Empty string / whitespace-only returns all todos.
 * @returns Todos whose title contains `query` (case-insensitive substring match).
 */
export function filterTodos(todos: TodoItem[], query: string): TodoItem[] {
  const q = query.trim().toLowerCase();
  if (q === "") return todos;
  return todos.filter((t) => t.title.toLowerCase().includes(q));
}
