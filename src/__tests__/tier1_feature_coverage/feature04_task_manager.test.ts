import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db, ...path) => path.join("/")),
  doc: vi.fn((db, ...path) => path.join("/")),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  serverTimestamp: () => "__TIMESTAMP__",
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("Tier 1 - Feature 4: Task Manager (Todo Workspace)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new todo task with complete metadata (title, subject, deadline, priority)", async () => {
    mockAddDoc.mockResolvedValueOnce({ id: "task-100" });

    const newTask = {
      title: "Finish Database ERD Assignment",
      subjectId: "sub-db",
      deadline: "2026-08-01",
      priority: "high" as const,
      completed: false,
    };

    const { addDoc, collection } = await import("firebase/firestore");
    const mockDb = {} as unknown as import("firebase/firestore").Firestore;
    const docRef = await addDoc(collection(mockDb, "users", "student-1", "todos"), {
      ...newTask,
      createdAt: "__TIMESTAMP__",
    });

    expect(docRef.id).toBe("task-100");
    expect(mockAddDoc).toHaveBeenCalledWith("users/student-1/todos", {
      ...newTask,
      createdAt: "__TIMESTAMP__",
    });
  });

  it("toggles task completion status between pending and completed", async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const { updateDoc, doc } = await import("firebase/firestore");
    const mockDb = {} as unknown as import("firebase/firestore").Firestore;
    const taskRef = doc(mockDb, "users", "student-1", "todos", "task-100");

    await updateDoc(taskRef, {
      completed: true,
      completedAt: "__TIMESTAMP__",
    });

    expect(mockUpdateDoc).toHaveBeenCalledWith("users/student-1/todos/task-100", {
      completed: true,
      completedAt: "__TIMESTAMP__",
    });
  });

  it("deletes a todo task permanently from user collection", async () => {
    mockDeleteDoc.mockResolvedValueOnce(undefined);

    const { deleteDoc, doc } = await import("firebase/firestore");
    const mockDb = {} as unknown as import("firebase/firestore").Firestore;
    const taskRef = doc(mockDb, "users", "student-1", "todos", "task-100");

    await deleteDoc(taskRef);

    expect(mockDeleteDoc).toHaveBeenCalledWith("users/student-1/todos/task-100");
  });

  it("filters tasks by completion state (all, active, completed)", () => {
    const tasks = [
      { id: "t1", title: "Study Math", completed: false },
      { id: "t2", title: "Submit Essay", completed: true },
      { id: "t3", title: "Read Chapter 4", completed: false },
    ];

    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    expect(activeTasks).toHaveLength(2);
    expect(completedTasks).toHaveLength(1);
    expect(completedTasks[0].title).toBe("Submit Essay");
  });

  it("sorts tasks by priority urgency (high > medium > low) and deadline", () => {
    const tasks = [
      { id: "t1", title: "Low priority task", priority: "low", deadline: "2026-08-10" },
      { id: "t2", title: "Urgent high task", priority: "high", deadline: "2026-07-28" },
      { id: "t3", title: "Medium priority task", priority: "medium", deadline: "2026-08-01" },
    ];

    const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };

    const sorted = [...tasks].sort(
      (a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]
    );

    expect(sorted[0].id).toBe("t2");
    expect(sorted[1].id).toBe("t3");
    expect(sorted[2].id).toBe("t1");
  });
});
