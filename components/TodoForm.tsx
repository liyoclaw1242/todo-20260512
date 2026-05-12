import { useState } from "react";

interface Props {
  onAdd: (title: string, dueDate: string | null) => void;
}

export function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(title, dueDate || null);
    setTitle("");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        Due Date
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </label>
      <button type="submit">Add</button>
    </form>
  );
}
