import type { Todo, DueDateStatus } from "./types.js";

/**
 * Classify a todo's due-date alert state relative to `today`.
 *
 * Rules (WP #6):
 *  - completed todo → "none"  (AC#5)
 *  - no dueDate → "none"       (AC#4)
 *  - dueDate < today → "overdue"  (AC#1)
 *  - dueDate === today → "today"  (AC#2)
 *  - dueDate > today → "upcoming"
 *
 * @param todo  - The todo item to classify.
 * @param today - Today's date as an ISO "YYYY-MM-DD" string.
 * @returns     The DueDateStatus for styling purposes.
 */
export function classifyDueDate(todo: Todo, today: string): DueDateStatus {
  if (todo.completed) return "none";
  if (!todo.dueDate) return "none";
  if (todo.dueDate < today) return "overdue";
  if (todo.dueDate === today) return "today";
  return "upcoming";
}
