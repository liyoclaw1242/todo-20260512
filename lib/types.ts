/**
 * Core domain types for the todo app.
 */

/** ISO date string in "YYYY-MM-DD" format. */
export type ISODate = string;

/** Classification of a todo item's due-date alert state. */
export type DueDateStatus = "overdue" | "today" | "upcoming" | "none";

/** A single todo item. */
export interface Todo {
  id: string;
  title: string;
  /** Optional ISO date "YYYY-MM-DD". Absent means no due date. */
  dueDate?: ISODate;
  /** Whether the todo has been marked complete. Defaults to false. */
  completed?: boolean;
}
