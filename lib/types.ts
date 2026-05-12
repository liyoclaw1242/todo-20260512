export interface Todo {
  /** Unique identifier (UUID) */
  id: string;
  /** User-supplied label. Non-empty. */
  title: string;
  /** ISO 8601 date string (YYYY-MM-DD) or null when no due date is set. */
  dueDate: string | null;
  /** True when the user has marked this item done. */
  completed: boolean;
  /** ISO 8601 datetime of creation. */
  createdAt: string;
}
