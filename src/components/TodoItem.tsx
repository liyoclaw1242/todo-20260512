import { useState } from "react";
import type { Todo } from "../lib/types.js";
import { getDueDateStatus } from "../lib/utils.js";
import TodoForm from "./TodoForm.js";

interface Props {
  todo: Todo;
  /** ISO-8601 date string for "today" (YYYY-MM-DD). Injected so callers control time. */
  today: string;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string, dueDate: string | null) => void;
}

const ALERT_STYLES: Record<"overdue" | "today", React.CSSProperties> = {
  overdue: { borderLeft: "3px solid #cc0000", paddingLeft: "0.4rem" },
  today: { borderLeft: "3px solid #d97706", paddingLeft: "0.4rem" },
};

export default function TodoItem({ todo, today, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);

  // Computed synchronously during render — no useEffect, so no flicker (AC#3).
  const alertStatus = getDueDateStatus(todo.due_date, todo.completed, today);
  const liProps = {
    style: alertStatus !== null ? ALERT_STYLES[alertStatus] : undefined,
    "data-alert": alertStatus ?? undefined,
  };

  if (editing) {
    return (
      <li {...liProps}>
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
    <li {...liProps}>
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
