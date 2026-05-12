import type { Todo } from "./types.js";

const STORAGE_KEY = "todos";

/**
 * Returns a simple in-memory Storage object.
 * Useful for injecting into store functions during tests so no real
 * localStorage / jsdom is required.
 */
export function makeMemoryStorage(): Storage {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
    clear: () => {
      for (const k of Object.keys(data)) delete data[k];
    },
    get length() {
      return Object.keys(data).length;
    },
    key: (i) => Object.keys(data)[i] ?? null,
  };
}

export function loadTodos(storage: Storage = localStorage): Todo[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Todo[];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[], storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function addTodo(
  todos: Todo[],
  title: string,
  dueDate: string | null,
): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos;
  const next: Todo = {
    id: crypto.randomUUID(),
    title: trimmed,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  return [...todos, next];
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t,
  );
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((t) => t.id !== id);
}

export function editTodo(
  todos: Todo[],
  id: string,
  title: string,
  dueDate: string | null,
): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos;
  return todos.map((t) =>
    t.id === id ? { ...t, title: trimmed, dueDate } : t,
  );
}
