/**
 * Component integration tests for <TodoItem /> due-date visual alerts.
 * AC#1 – AC#5 from WP #10.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TodoItem from "./TodoItem";
import type { Todo } from "../lib/types";

const TODAY = "2026-05-13";
const YESTERDAY = "2026-05-12";
const TOMORROW = "2026-05-14";

const noop = () => {};

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    title: "Test task",
    due_date: null,
    completed: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// ── AC#1 ──────────────────────────────────────────────────────────────────────

describe("AC#1 — overdue todo shows red visual indicator", () => {
  it("list item has data-alert=overdue for past due date", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: YESTERDAY })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("data-alert", "overdue");
  });

  it("overdue item has a visible red border-left style", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: "2020-01-01" })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    const li = screen.getByRole("listitem");
    expect(li.style.borderLeft).toMatch(/red|#[Cc][Cc]0+0|rgb\(204,\s*0,\s*0\)/);
  });
});

// ── AC#2 ──────────────────────────────────────────────────────────────────────

describe("AC#2 — today todo shows distinct highlight (not red)", () => {
  it("list item has data-alert=today for due_date equal to today", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: TODAY })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("data-alert", "today");
  });

  it("today highlight colour differs from overdue (not red)", () => {
    const { container } = render(
      <TodoItem
        todo={makeTodo({ due_date: TODAY })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    const li = container.querySelector("li")!;
    // Must have a borderLeft but it should NOT be the same red as overdue
    expect(li.style.borderLeft).not.toMatch(/^3px solid red/);
    expect(li.style.borderLeft.length).toBeGreaterThan(0);
  });
});

// ── AC#3 ──────────────────────────────────────────────────────────────────────

describe("AC#3 — alert state visible on first render (no flicker)", () => {
  it("overdue alert is present without waitFor (synchronous render)", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: YESTERDAY })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    // No async — if the component computed state in a useEffect it wouldn't be here yet
    const li = screen.getByRole("listitem");
    expect(li).toHaveAttribute("data-alert", "overdue");
  });
});

// ── AC#4 ──────────────────────────────────────────────────────────────────────

describe("AC#4 — no due date shows no alert styling", () => {
  it("list item has no data-alert when due_date is null", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: null })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    const li = screen.getByRole("listitem");
    expect(li).not.toHaveAttribute("data-alert");
    expect(li.style.borderLeft).toBe("");
  });

  it("future due date shows no alert styling", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: TOMORROW })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    const li = screen.getByRole("listitem");
    expect(li).not.toHaveAttribute("data-alert");
  });
});

// ── AC#5 ──────────────────────────────────────────────────────────────────────

describe("AC#5 — completed todo shows no alert styling", () => {
  it("completed overdue todo has no data-alert", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: YESTERDAY, completed: true })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    const li = screen.getByRole("listitem");
    expect(li).not.toHaveAttribute("data-alert");
    expect(li.style.borderLeft).toBe("");
  });

  it("completed today todo has no data-alert", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: TODAY, completed: true })}
        today={TODAY}
        onToggle={noop}
        onDelete={noop}
        onUpdate={noop}
      />
    );
    expect(screen.getByRole("listitem")).not.toHaveAttribute("data-alert");
  });
});
