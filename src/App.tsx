import { useState, useEffect } from "react";
import type { Todo } from "./lib/types.js";
import { getTodos, createTodo, toggleTodo, deleteTodo, updateTodo } from "./lib/db.js";
import TodoForm from "./components/TodoForm.js";
import TodoList from "./components/TodoList.js";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    getTodos().then(setTodos).catch(console.error);
  }, []);

  async function handleAdd(title: string, dueDate?: string) {
    const id = await createTodo(title, dueDate);
    const newTodo: Todo = {
      id,
      title,
      due_date: dueDate ?? null,
      completed: false,
      created_at: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, newTodo]);
  }

  async function handleToggle(id: number, completed: boolean) {
    await toggleTodo(id, completed);
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
  }

  async function handleDelete(id: number) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleUpdate(id: number, title: string, dueDate: string | null) {
    await updateTodo(id, title, dueDate);
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title, due_date: dueDate } : t))
    );
  }

  return (
    <main>
      <h1>Todo</h1>
      <TodoForm onAdd={handleAdd} />
      <TodoList
        todos={todos}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </main>
  );
}
