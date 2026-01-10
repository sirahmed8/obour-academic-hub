import { TodoList } from "@/components/features/todo/TodoList";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "To-Do List | Obour Academic Hub",
  description: "Manage your academic tasks and reminders",
};

export default function TodoPage() {
  return (
    <AppShell>
      <TodoList />
    </AppShell>
  );
}
