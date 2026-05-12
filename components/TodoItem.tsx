import { useState } from "react";
import type { Todo } from "../lib/types.js";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, dueDate: string | null) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");

  function handleSave() {
    onEdit(todo.id, editTitle, editDueDate || null);
    setEditing(false);
  }

  return (
    <li data-testid="todo-item" data-completed={String(todo.completed)}>
      <input
        type="checkbox"
        checked={todo.completed}
        aria-label={todo.title}
        onChange={() => onToggle(todo.id)}
      />

      {editing ? (
        <>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <span
            style={
              todo.completed
                ? { textDecoration: "line-through", color: "#888" }
                : undefined
            }
          >
            {todo.title}
          </span>
          {todo.dueDate && <span> — {todo.dueDate}</span>}
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </>
      )}
    </li>
  );
}
