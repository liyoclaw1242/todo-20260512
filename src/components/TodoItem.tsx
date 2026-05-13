import { useState } from "react";
import type { Todo } from "../lib/types.js";
import TodoForm from "./TodoForm.js";
import { getDueDateStatus } from "../lib/utils.js";
import type { DueDateStatus } from "../lib/utils.js";

interface Props {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string, dueDate: string | null) => void;
}

/** Inline styles keyed by DueDateStatus — applied to the <li> element. */
const dueDateStyles: Record<DueDateStatus, React.CSSProperties> = {
  overdue: { borderLeft: "4px solid red", paddingLeft: "6px" },
  today: { borderLeft: "4px solid orange", paddingLeft: "6px", background: "#fffbea" },
  none: {},
};

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);

  // Completed todos suppress alert styling (AC#5)
  const status: DueDateStatus = todo.completed ? "none" : getDueDateStatus(todo.due_date);

  if (editing) {
    return (
      <li data-due-status="none">
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
    <li data-due-status={status} style={dueDateStyles[status]}>
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
