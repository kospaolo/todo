export interface Todo {
  _id: string;
  text: string;
  done: boolean;
  order: number;
  dueDate?: string;
}
