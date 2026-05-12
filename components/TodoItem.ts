/**
 * Renders a single todo item as an HTML string with due-date alert styling.
 *
 * Pure function — no side effects. The alert state is embedded in the
 * static HTML so it is visible on fresh page load without any client JS
 * (satisfying AC#3 — no flicker).
 *
 * CSS conventions (AC#1, AC#2):
 *   .due-overdue → red indicator (border-left: 3px solid #d32f2f)
 *   .due-today   → amber/gold highlight (border-left: 3px solid #f9a825)
 *
 * The `data-due-status` attribute carries the machine-readable status for
 * tests and potential JS enhancements without coupling them to class names.
 */
import { classifyDueDate } from "../lib/utils.js";
import type { Todo } from "../lib/types.js";

/**
 * Render a todo item `<li>` element as an HTML string.
 *
 * @param todo  - The todo item to render.
 * @param today - Today's date as "YYYY-MM-DD" — passed in so the function
 *                remains pure and testable without clock mocking.
 * @returns     An HTML `<li>` string with appropriate due-date CSS classes.
 */
export function renderTodoItem(todo: Todo, today: string): string {
  const status = classifyDueDate(todo, today);
  const alertClass = status === "overdue" ? " due-overdue"
    : status === "today" ? " due-today"
    : "";

  const completedClass = todo.completed ? " completed" : "";
  const cssClass = `todo-item${alertClass}${completedClass}`;

  return `<li class="${escapeAttr(cssClass)}" data-id="${escapeAttr(todo.id)}" data-title="${escapeAttr(todo.title)}" data-due-status="${status}">${escapeHtml(todo.title)}</li>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
