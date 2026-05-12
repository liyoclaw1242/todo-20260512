import { useState } from "react";
import { TodoForm } from "../components/TodoForm.js";
import { TodoList } from "../components/TodoList.js";
import {
  addTodo,
  deleteTodo,
  editTodo,
  loadTodos,
  saveTodos,
  toggleTodo,
} from "../lib/store.js";
import type { Todo } from "../lib/types.js";

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());

  function update(next: Todo[]) {
    setTodos(next);
    saveTodos(next);
  }

  return (
    <main>
      <h1>Todos</h1>
      <TodoForm
        onAdd={(title, dueDate) => update(addTodo(todos, title, dueDate))}
      />
      <TodoList
        todos={todos}
        onToggle={(id) => update(toggleTodo(todos, id))}
        onDelete={(id) => update(deleteTodo(todos, id))}
        onEdit={(id, title, dueDate) =>
          update(editTodo(todos, id, title, dueDate))
        }
      />
    </main>
  );
}
