import type { Todo } from "../lib/types.js";

interface Props {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
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
      <button type="button" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  );
}
