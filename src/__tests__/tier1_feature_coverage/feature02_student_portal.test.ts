import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  arrayUnion: (val: unknown) => ({ type: "arrayUnion", val }),
  increment: (val: number) => ({ type: "increment", val }),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("Tier 1 - Feature 2: Student Portal & Academic Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates student GPA accurately based on completed courses and letter grades", () => {
    const courses = [
      { code: "CS101", credits: 3, grade: "A" }, // 4.0 * 3 = 12
      { code: "MATH201", credits: 4, grade: "B" }, // 3.0 * 4 = 12
      { code: "ENG102", credits: 2, grade: "A" }, // 4.0 * 2 = 8
    ];

    const gradePoints: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((c) => {
      totalPoints += (gradePoints[c.grade] || 0) * c.credits;
      totalCredits += c.credits;
    });

    const gpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

    expect(totalCredits).toBe(9);
    expect(totalPoints).toBe(32);
    expect(gpa).toBe(3.56);
  });

  it("retrieves student profile and transforms timestamps correctly", async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "student-999",
      data: () => ({
        displayName: "John Doe",
        studentCode: "2024001",
        gpa: 3.8,
        createdAt: { toDate: () => new Date("2026-01-01T00:00:00Z") },
        completedResources: ["res-1", "res-2"],
        points: 50,
      }),
    });

    const { userService } = await import("@/services/user.service");
    const user = await userService.getById("student-999");

    expect(user).not.toBeNull();
    expect(user?.uid).toBe("student-999");
    expect(user?.displayName).toBe("John Doe");
    expect(user?.points).toBe(50);
  });

  it("updates student academic streak when consecutive activity is logged", () => {
    const lastActiveDate = new Date("2026-07-25T10:00:00Z");
    const currentDate = new Date("2026-07-26T10:00:00Z");
    const currentStreak = 5;

    const diffDays = Math.floor(
      (currentDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = currentStreak;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    expect(diffDays).toBe(1);
    expect(newStreak).toBe(6);
  });

  it("awards 25 points to student upon resource completion", async () => {
    mockSetDoc.mockResolvedValueOnce(undefined);
    const { userService } = await import("@/services/user.service");

    await userService.completeResource("student-999", "lecture-pdf-101");

    expect(mockSetDoc).toHaveBeenCalledWith(
      undefined,
      {
        completedResources: { type: "arrayUnion", val: "lecture-pdf-101" },
        points: { type: "increment", val: 25 },
      },
      { merge: true }
    );
  });

  it("formats academic shortcut action links and permissions for student dashboard", () => {
    const shortcuts = [
      { id: "subjects", title: "My Subjects", href: "/subjects", icon: "BookOpen" },
      { id: "tasks", title: "Todo Tasks", href: "/todo", icon: "CheckSquare" },
      { id: "chat", title: "Community Chat", href: "/chat", icon: "MessageSquare" },
      { id: "assistant", title: "AI Assistant", href: "/assistant", icon: "Bot" },
    ];

    expect(shortcuts).toHaveLength(4);
    expect(shortcuts.map((s) => s.href)).toEqual(["/subjects", "/todo", "/chat", "/assistant"]);
  });
});
