/**
 * Component tests for <TodoItem /> — due-date visual alert behaviour.
 * AC#1, AC#2, AC#4, AC#5.
 *
 * System clock is pinned via vi.useFakeTimers() + vi.setSystemTime().
 * We do NOT mock getDueDateStatus — it runs as real code inside TodoItem.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TodoItem from "./TodoItem.js";
import type { Todo } from "../lib/types.js";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    title: "Test task",
    due_date: null,
    completed: false,
    created_at: "",
    ...overrides,
  };
}

// Pin clock to 2026-05-13
function pinDate(): void {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-13T12:00:00"));
}

// ── AC#1 — overdue red indicator ────────────────────────────────────────────

describe("AC#1 — overdue todo shows red indicator", () => {
  beforeEach(pinDate);
  afterEach(() => vi.useRealTimers());

  it("listitem has data-due-status=overdue", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: "2026-05-12" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-due-status",
      "overdue",
    );
  });
});

// ── AC#2 — today distinct highlight ─────────────────────────────────────────

describe("AC#2 — today todo shows distinct highlight", () => {
  beforeEach(pinDate);
  afterEach(() => vi.useRealTimers());

  it("listitem has data-due-status=today", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: "2026-05-13" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-due-status",
      "today",
    );
  });

  it("today status differs from overdue", () => {
    const { rerender } = render(
      <TodoItem
        todo={makeTodo({ due_date: "2026-05-13" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    const todayStatus = screen.getByRole("listitem").getAttribute("data-due-status");

    rerender(
      <TodoItem
        todo={makeTodo({ due_date: "2026-05-12" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    const overdueStatus = screen.getByRole("listitem").getAttribute("data-due-status");

    expect(todayStatus).not.toBe(overdueStatus);
  });
});

// ── AC#4 — no due date shows no alert styling ────────────────────────────────

describe("AC#4 — todo with no due date has no alert", () => {
  beforeEach(pinDate);
  afterEach(() => vi.useRealTimers());

  it("listitem has data-due-status=none for null due_date", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: null })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-due-status",
      "none",
    );
  });

  it("listitem has data-due-status=none for a future due_date", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: "2030-12-31" })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-due-status",
      "none",
    );
  });
});

// ── AC#5 — completed todo shows no alert styling ─────────────────────────────

describe("AC#5 — completed todo shows no alert styling", () => {
  beforeEach(pinDate);
  afterEach(() => vi.useRealTimers());

  it("completed overdue todo has no alert (data-due-status=none)", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: "2026-05-12", completed: true })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-due-status",
      "none",
    );
  });

  it("completed today todo has no alert", () => {
    render(
      <TodoItem
        todo={makeTodo({ due_date: "2026-05-13", completed: true })}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-due-status",
      "none",
    );
  });
});
