export interface Todo {
  id: number;
  title: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}
