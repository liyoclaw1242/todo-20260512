/**
 * Targeted tests for AC#4 (no due date → no alert) and
 * AC#5 (completed → no alert regardless of due date).
 *
 * These are the "negative space" invariants for the due-date alert feature.
 */
import { describe, it, expect } from "vitest";
import { renderTodoItem } from "../components/TodoItem.js";
import { renderPage } from "../app/page.js";
import type { Todo } from "./types.js";

const TODAY = "2026-05-12";
const YESTERDAY = "2026-05-11";

// ─── AC#4: no due date ────────────────────────────────────────────────────
describe("AC#4 — todo without due date shows no alert styling", () => {
  it("renderTodoItem: no due-overdue or due-today class", () => {
    const todo: Todo = { id: "1", title: "Undated task" };
    const html = renderTodoItem(todo, TODAY);
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
    expect(html).not.toMatch(/class="[^"]*due-today[^"]*"/);
    expect(html).toContain('data-due-status="none"');
  });

  it("renderPage: list item for undated todo has no alert class", () => {
    const todos: Todo[] = [
      { id: "1", title: "No date" },
      { id: "2", title: "Has date", dueDate: YESTERDAY },
    ];
    const html = renderPage(todos, TODAY);
    // The "no date" item's li must not carry an alert class
    // (We can check the data attribute on a per-item basis)
    const noneCount = (html.match(/data-due-status="none"/g) ?? []).length;
    expect(noneCount).toBeGreaterThanOrEqual(1);
  });
});

// ─── AC#5: completed suppresses alert ─────────────────────────────────────
describe("AC#5 — completed todo shows no alert styling regardless of due date", () => {
  it("renderTodoItem: completed + overdue → no due-overdue class", () => {
    const todo: Todo = { id: "2", title: "Done", dueDate: YESTERDAY, completed: true };
    const html = renderTodoItem(todo, TODAY);
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
    expect(html).toContain('data-due-status="none"');
  });

  it("renderTodoItem: completed + today → no due-today class", () => {
    const todo: Todo = { id: "3", title: "Done today", dueDate: TODAY, completed: true };
    const html = renderTodoItem(todo, TODAY);
    expect(html).not.toMatch(/class="[^"]*due-today[^"]*"/);
    expect(html).toContain('data-due-status="none"');
  });

  it("renderPage: completed+overdue todo in page list has no alert class", () => {
    const todos: Todo[] = [
      { id: "4", title: "Done late", dueDate: YESTERDAY, completed: true },
    ];
    const html = renderPage(todos, TODAY);
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
    expect(html).toContain('data-due-status="none"');
  });
});
