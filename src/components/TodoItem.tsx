import { useState } from "react";
import type { Todo } from "../lib/types.js";
import TodoForm from "./TodoForm.js";

interface Props {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string, dueDate: string | null) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li>
        <TodoForm
          mode="edit"
          initialTitle={todo.title}
          initialDueDate={todo.due_date}
          onSave={(title, dueDate) => {
            onUpdate(todo.id, title, dueDate);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      />
      <span
        style={{ textDecoration: todo.completed ? "line-through" : "none" }}
        data-completed={todo.completed ? "true" : "false"}
      >
        {todo.title}
      </span>
      {todo.due_date && <small> — due {todo.due_date}</small>}
      <button type="button" onClick={() => setEditing(true)}>
        Edit
      </button>
      <button type="button" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  );
}
