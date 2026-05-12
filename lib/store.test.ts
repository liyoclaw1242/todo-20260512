import { beforeEach, describe, expect, it } from "vitest";
import {
  addTodo,
  deleteTodo,
  editTodo,
  loadTodos,
  makeMemoryStorage,
  saveTodos,
  toggleTodo,
} from "./store.js";

// Each test gets its own in-memory storage — no jsdom, no shared state.
let storage: Storage;
beforeEach(() => {
  storage = makeMemoryStorage();
});

describe("loadTodos", () => {
  it("returns [] when storage is empty", () => {
    expect(loadTodos(storage)).toEqual([]);
  });

  it("returns previously saved todos", () => {
    const todos = addTodo([], "Buy milk", null);
    saveTodos(todos, storage);
    expect(loadTodos(storage)).toEqual(todos);
  });

  it("returns [] if storage contains invalid JSON", () => {
    storage.setItem("todos", "{bad json");
    expect(loadTodos(storage)).toEqual([]);
  });
});

describe("addTodo", () => {
  it("adds a todo with title and no due date", () => {
    const result = addTodo([], "Read book", null);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Read book");
    expect(result[0]?.dueDate).toBeNull();
    expect(result[0]?.completed).toBe(false);
  });

  it("adds a todo with a due date", () => {
    const result = addTodo([], "Doctor", "2026-06-01");
    expect(result[0]?.dueDate).toBe("2026-06-01");
  });

  it("ignores empty (whitespace-only) title", () => {
    const result = addTodo([], "   ", null);
    expect(result).toHaveLength(0);
  });

  it("trims whitespace from title", () => {
    const result = addTodo([], "  Hello  ", null);
    expect(result[0]?.title).toBe("Hello");
  });

  it("appends to an existing list", () => {
    const first = addTodo([], "First", null);
    const second = addTodo(first, "Second", null);
    expect(second).toHaveLength(2);
  });
});

describe("toggleTodo", () => {
  it("marks an incomplete todo as complete", () => {
    const todos = addTodo([], "Task", null);
    const id = todos[0]!.id;
    const result = toggleTodo(todos, id);
    expect(result[0]?.completed).toBe(true);
  });

  it("marks a complete todo as incomplete (toggle twice)", () => {
    const todos = addTodo([], "Task", null);
    const id = todos[0]!.id;
    const toggled = toggleTodo(todos, id);
    const restored = toggleTodo(toggled, id);
    expect(restored[0]?.completed).toBe(false);
  });
});

describe("deleteTodo", () => {
  it("removes the specified todo", () => {
    const todos = addTodo(addTodo([], "A", null), "B", null);
    const id = todos[0]!.id;
    const result = deleteTodo(todos, id);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("B");
  });

  it("is a no-op when id does not exist", () => {
    const todos = addTodo([], "A", null);
    const result = deleteTodo(todos, "nonexistent");
    expect(result).toHaveLength(1);
  });
});

describe("editTodo", () => {
  it("updates title and due date", () => {
    const todos = addTodo([], "Old", null);
    const id = todos[0]!.id;
    const result = editTodo(todos, id, "New", "2026-12-31");
    expect(result[0]?.title).toBe("New");
    expect(result[0]?.dueDate).toBe("2026-12-31");
  });

  it("ignores empty title — leaves todo unchanged", () => {
    const todos = addTodo([], "Keep", null);
    const id = todos[0]!.id;
    const result = editTodo(todos, id, "  ", null);
    expect(result[0]?.title).toBe("Keep");
  });
});

// ── AC#5: persistence round-trip ─────────────────────────────────────────────
describe("AC#5 — saveTodos / loadTodos localStorage round-trip", () => {
  it("persists todos across a save + load cycle", () => {
    const todos = addTodo([], "Persistent task", "2026-05-30");
    saveTodos(todos, storage);
    const loaded = loadTodos(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.title).toBe("Persistent task");
    expect(loaded[0]?.dueDate).toBe("2026-05-30");
  });

  it("overwrites previous data on save", () => {
    saveTodos(addTodo([], "Old", null), storage);
    saveTodos(addTodo([], "New", null), storage);
    const loaded = loadTodos(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.title).toBe("New");
  });
});
