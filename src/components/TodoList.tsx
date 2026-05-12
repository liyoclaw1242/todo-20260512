import type { Todo } from "../lib/types.js";
import TodoItem from "./TodoItem.js";

interface Props {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string, dueDate: string | null) => void;
}

export default function TodoList({ todos, onToggle, onDelete, onUpdate }: Props) {
  if (todos.length === 0) return null;

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}
