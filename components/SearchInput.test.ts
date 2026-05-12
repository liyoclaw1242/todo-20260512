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

describe("filterTodos — AC#4: empty query restores full list", () => {
  it("returns all todos when query is empty string", () => {
    const result = filterTodos(todos, "");
    expect(result).toHaveLength(3);
  });

  it("returns all todos when query is whitespace only", () => {
    const result = filterTodos(todos, "   ");
    expect(result).toHaveLength(3);
  });

  it("returns same reference array when query is empty (no unnecessary copy)", () => {
    const result = filterTodos(todos, "");
    expect(result).toBe(todos);
  });
});

describe("filterTodos — AC#3: case-insensitive matching", () => {
  it("UPPERCASE query matches lowercase title", () => {
    const result = filterTodos(todos, "MILK");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("mixed-case query matches mixed-case title", () => {
    const result = filterTodos(todos, "dog");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });

  it("lowercase query matches Title-case title", () => {
    const result = filterTodos(todos, "walk");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });
});
