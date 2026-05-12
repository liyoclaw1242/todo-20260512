/**
 * Renders the main todo page HTML with due-date visual alerts.
 *
 * Pure function — no side effects, no I/O. Takes the list of todos and
 * today's date (as "YYYY-MM-DD"), returns a complete HTML document string.
 *
 * Alert states (WP #6):
 *  - .due-overdue  red left border — dueDate strictly before today (AC#1)
 *  - .due-today    amber left border — dueDate equals today (AC#2)
 *  - (none)        no styling — no dueDate or completed (AC#4, AC#5)
 *
 * All styling is embedded in a <style> block in the <head> so the alert
 * state is visible on the very first paint — no flicker, no JS dependency
 * (AC#3). CSS uses only standard properties (no vendor prefixes) for
 * Chrome + Safari on Mac compatibility (AC#6).
 */
import { renderTodoItem } from "../components/TodoItem.js";
import type { Todo } from "../lib/types.js";

/**
 * Render the full todo page.
 *
 * @param todos - List of todo items to display.
 * @param today - Today's date as "YYYY-MM-DD"; injected so the function
 *                stays pure and testable without mocking Date.
 * @returns     A complete HTML document string.
 */
export function renderPage(todos: Todo[], today: string): string {
  const itemsHtml = todos
    .map((t) => `    ${renderTodoItem(t, today)}`)
    .join("\n");

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todos</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    ul { list-style: none; padding: 0; margin-top: 1rem; }
    li.todo-item { padding: 0.4rem 0.6rem; border-bottom: 1px solid #eee; border-left: 3px solid transparent; }
    li.due-overdue { border-left: 3px solid #d32f2f; color: #d32f2f; }
    li.due-today { border-left: 3px solid #f9a825; font-weight: 600; }
    li.completed { text-decoration: line-through; opacity: 0.6; }
  </style>
</head>
<body>
  <h1>Todos</h1>
  <ul id="todo-list">
${itemsHtml}
  </ul>
</body>
</html>`;
}
