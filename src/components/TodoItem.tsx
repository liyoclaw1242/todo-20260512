import type { Todo } from "../lib/types.js";

interface Props {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string, dueDate: string | null) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate: _onUpdate }: Props) {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      />
      <span>{todo.title}</span>
      {todo.due_date && <small> — due {todo.due_date}</small>}
      <button type="button" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  );
}
