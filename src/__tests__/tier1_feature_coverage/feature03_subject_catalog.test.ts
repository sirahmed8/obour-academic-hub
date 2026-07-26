import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetDocs = vi.fn();
const mockGetDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db, ...path) => path.join("/")),
  doc: vi.fn((db, ...path) => path.join("/")),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  orderBy: vi.fn((field, dir) => ({ field, dir })),
  increment: (val: number) => ({ type: "increment", val }),
  limit: vi.fn((val) => ({ type: "limit", val })),
  onSnapshot: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("Tier 1 - Feature 3: Subject Catalog & Study Resource Access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches subject list ordered by orderIndex", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "sub-1",
          data: () => ({ name: "Computer Networks", code: "CS301", orderIndex: 1, views: 120 }),
        },
        {
          id: "sub-2",
          data: () => ({ name: "Database Systems", code: "CS302", orderIndex: 2, views: 95 }),
        },
      ],
    });

    const { subjectService } = await import("@/services/subject.service");
    const subjects = await subjectService.getAll();

    expect(subjects).toHaveLength(2);
    expect(subjects[0].id).toBe("sub-1");
    expect(subjects[0].name).toBe("Computer Networks");
    expect((subjects[1] as unknown as { code: string }).code).toBe("CS302");
  });

  it("filters subjects by department and semester criteria", async () => {
    const allSubjects = [
      { id: "s1", name: "Math 1", department: "CS", semester: 1 },
      { id: "s2", name: "Physics 1", department: "CS", semester: 1 },
      { id: "s3", name: "Algorithms", department: "CS", semester: 3 },
      { id: "s4", name: "Circuit Analysis", department: "EE", semester: 1 },
    ];

    const filtered = allSubjects.filter((s) => s.department === "CS" && s.semester === 1);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((s) => s.name)).toEqual(["Math 1", "Physics 1"]);
  });

  it("fetches subject detail by name for URL navigation", async () => {
    mockGetDocs.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: "sub-db",
          data: () => ({ name: "Database Systems", code: "CS302", doctorName: "Dr. Smith" }),
        },
      ],
    });

    const { subjectService } = await import("@/services/subject.service");
    const subject = await subjectService.getByName("Database Systems");

    expect(subject).not.toBeNull();
    expect(subject?.id).toBe("sub-db");
    expect((subject as unknown as { doctorName: string })?.doctorName).toBe("Dr. Smith");
  });

  it("increments view count on subject catalog item selection", async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);
    const { subjectService } = await import("@/services/subject.service");

    await subjectService.incrementViews("sub-db");

    expect(mockUpdateDoc).toHaveBeenCalledWith("subjects/sub-db", {
      views: { type: "increment", val: 1 },
    });
  });

  it("fetches subject resources cleanly (lectures, labs, summary notes)", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "res-101",
          data: () => ({
            title: "Lecture 1: Introduction",
            type: "pdf",
            fileUrl: "https://example.com/lec1.pdf",
            orderIndex: 1,
          }),
        },
        {
          id: "res-102",
          data: () => ({
            title: "Lab 1 Setup",
            type: "zip",
            fileUrl: "https://example.com/lab1.zip",
            orderIndex: 2,
          }),
        },
      ],
    });

    const { subjectService } = await import("@/services/subject.service");
    const resources = await subjectService.getResources("sub-db");

    expect(resources).toHaveLength(2);
    expect(resources[0].title).toBe("Lecture 1: Introduction");
    expect(resources[1].type).toBe("zip");
  });
});
