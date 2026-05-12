import { useState } from "react";

interface AddProps {
  mode?: never;
  onAdd: (title: string, dueDate?: string) => void;
}

interface EditProps {
  mode: "edit";
  initialTitle: string;
  initialDueDate: string | null;
  onSave: (title: string, dueDate: string | null) => void;
  onCancel: () => void;
}

type Props = AddProps | EditProps;

export default function TodoForm(props: Props) {
  const isEdit = props.mode === "edit";

  const [title, setTitle] = useState(isEdit ? props.initialTitle : "");
  const [dueDate, setDueDate] = useState(
    isEdit ? (props.initialDueDate ?? "") : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (!isEdit) {
      props.onAdd(trimmed, dueDate || undefined);
      setTitle("");
      setDueDate("");
    } else {
      props.onSave(trimmed, dueDate || null);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label={isEdit ? undefined : "Title"}
      />
      <label htmlFor={isEdit ? "edit-due-date" : "todo-due-date"}>Due date</label>
      <input
        id={isEdit ? "edit-due-date" : "todo-due-date"}
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      {!isEdit ? (
        <button type="submit">Add</button>
      ) : (
        <>
          <button type="submit">Save</button>
          <button type="button" onClick={props.onCancel}>
            Cancel
          </button>
        </>
      )}
    </form>
  );
}
