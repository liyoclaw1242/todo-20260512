/**
 * Date utilities for due-date alert classification.
 *
 * localDateString() derives the LOCAL calendar date (YYYY-MM-DD), never UTC,
 * so that users in any timezone see the correct alert status.
 */

export type DueDateStatus = "overdue" | "today" | "none";

/**
 * Return the local calendar date as "YYYY-MM-DD".
 * Exported for easy testing / stubbing.
 */
export function localDateString(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Classify a todo's due date relative to today.
 *
 * @param dueDate - ISO date string "YYYY-MM-DD" or null
 * @param today   - override today (defaults to local calendar date); useful in tests
 * @returns 'overdue' | 'today' | 'none'
 */
export function getDueDateStatus(
  dueDate: string | null,
  today = localDateString(),
): DueDateStatus {
  if (!dueDate) return "none";
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "none";
}
