interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: Props) {
  return (
    <input
      type="search"
      placeholder="Search todos…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search todos"
    />
  );
}
