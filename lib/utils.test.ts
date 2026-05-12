import { describe, it, expect } from "vitest";
import { classifyDueDate } from "./utils.js";
import type { Todo } from "./types.js";

const TODAY = "2026-05-12";
const YESTERDAY = "2026-05-11";
const TOMORROW = "2026-05-13";

describe("classifyDueDate — AC#1: overdue (past date)", () => {
  it("returns 'overdue' when dueDate is strictly before today", () => {
    const todo: Todo = { id: "1", title: "Old task", dueDate: YESTERDAY };
    expect(classifyDueDate(todo, TODAY)).toBe("overdue");
  });

  it("returns 'overdue' for a date one week in the past", () => {
    const todo: Todo = { id: "2", title: "Old task", dueDate: "2026-05-05" };
    expect(classifyDueDate(todo, TODAY)).toBe("overdue");
  });
});

describe("classifyDueDate — AC#2: today highlight", () => {
  it("returns 'today' when dueDate equals today", () => {
    const todo: Todo = { id: "3", title: "Due today", dueDate: TODAY };
    expect(classifyDueDate(todo, TODAY)).toBe("today");
  });
});

describe("classifyDueDate — AC#4: no due date", () => {
  it("returns 'none' when dueDate is absent", () => {
    const todo: Todo = { id: "4", title: "No date" };
    expect(classifyDueDate(todo, TODAY)).toBe("none");
  });
});

describe("classifyDueDate — AC#5: completed todo", () => {
  it("returns 'none' even if dueDate is in the past and completed=true", () => {
    const todo: Todo = { id: "5", title: "Done", dueDate: YESTERDAY, completed: true };
    expect(classifyDueDate(todo, TODAY)).toBe("none");
  });

  it("returns 'none' even if dueDate is today and completed=true", () => {
    const todo: Todo = { id: "6", title: "Done today", dueDate: TODAY, completed: true };
    expect(classifyDueDate(todo, TODAY)).toBe("none");
  });
});

describe("classifyDueDate — upcoming (future date)", () => {
  it("returns 'upcoming' when dueDate is in the future", () => {
    const todo: Todo = { id: "7", title: "Future task", dueDate: TOMORROW };
    expect(classifyDueDate(todo, TODAY)).toBe("upcoming");
  });
});
