import type { Todo } from "../lib/types.js";
import { TodoItem } from "./TodoItem.js";

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, dueDate: string | null) => void;
}

export function TodoList({ todos, onToggle, onDelete, onEdit }: Props) {
  if (todos.length === 0) return null;

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
