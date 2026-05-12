import { describe, it, expect } from "vitest";
import { filterTodos } from "./SearchInput.js";
import type { TodoItem } from "../app/page.js";

const todos: TodoItem[] = [
  { id: "1", title: "buy milk" },
  { id: "2", title: "Walk the Dog" },
  { id: "3", title: "read a book" },
];

describe("filterTodos — AC#2: keyword filters titles", () => {
  it("returns only todos whose title contains the query", () => {
    const result = filterTodos(todos, "milk");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("returns multiple matches when several titles contain the query", () => {
    const result = filterTodos(todos, "the");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });
});
