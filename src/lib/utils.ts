/**
 * Pure utility functions for due-date alert logic.
 */

/**
 * Classify a todo's due-date urgency.
 *
 * @param dueDate  ISO-8601 date string (YYYY-MM-DD) or null
 * @param completed  whether the todo is completed
 * @param today  ISO-8601 date string for "today" (injected for testability)
 * @returns "overdue" | "today" | null
 *   - null  → no alert (no due date, future date, or completed)
 *   - "overdue" → due_date < today and not completed
 *   - "today"   → due_date === today and not completed
 */
export function getDueDateStatus(
  dueDate: string | null,
  completed: boolean,
  today: string
): "overdue" | "today" | null {
  if (dueDate === null || completed) return null;
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return null;
}
