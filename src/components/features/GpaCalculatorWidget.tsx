"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { calculateGPA } from "@/lib/utils";
import { Calculator, Plus, Trash2, Award } from "lucide-react";

interface CourseInput {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

const GRADE_OPTIONS = [
  { letter: "A+", points: 4.0 },
  { letter: "A", points: 3.7 },
  { letter: "B+", points: 3.3 },
  { letter: "B", points: 3.0 },
  { letter: "C+", points: 2.7 },
  { letter: "C", points: 2.4 },
  { letter: "D", points: 2.0 },
  { letter: "F", points: 0.0 },
];

export function GpaCalculatorWidget() {
  const { language } = useLanguage();
  const [courses, setCourses] = useState<CourseInput[]>([
    {
      id: "1",
      name: language === "ar" ? "برمجة هيكلية" : "OOP Programming",
      grade: "A",
      credits: 3,
    },
    { id: "2", name: language === "ar" ? "قواعد بيانات" : "Databases", grade: "B+", credits: 3 },
    {
      id: "3",
      name: language === "ar" ? "رياضيات حاسب" : "Discrete Math",
      grade: "A+",
      credits: 2,
    },
  ]);

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: Date.now().toString(),
        name:
          language === "ar"
            ? `مادة جديدة ${courses.length + 1}`
            : `New Course ${courses.length + 1}`,
        grade: "A",
        credits: 3,
      },
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof CourseInput, value: string | number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const gpaResult = calculateGPA(
    courses.map((c) => ({
      name: c.name,
      grade: c.grade,
      credits: c.credits,
    }))
  );

  return (
    <div className="p-6 rounded-[2rem] bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2 font-harman">
              <span>
                {language === "ar"
                  ? "حاسبة المعدل التراكمي (GPA Calculator)"
                  : "GPA & Grade Calculator"}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {language === "ar"
                ? "احسب معدلك الفصلي والتراكمي المتوقع تلقائياً"
                : "Calculate your estimated semester GPA"}
            </p>
          </div>
        </div>

        {/* GPA Display Pill */}
        <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-lg shadow-lg flex items-center gap-2">
          <Award size={20} />
          <span>{gpaResult.toFixed(2)} / 4.0</span>
        </div>
      </div>

      {/* Courses Form Table */}
      <div className="space-y-3">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl bg-background/50 border border-border/50"
          >
            <input
              type="text"
              value={c.name}
              onChange={(e) => updateCourse(c.id, "name", e.target.value)}
              placeholder={language === "ar" ? "اسم المادة" : "Course name"}
              className="flex-1 bg-transparent border-none outline-none font-bold text-xs sm:text-sm text-foreground"
            />

            <div className="flex items-center gap-2">
              <select
                value={c.grade}
                onChange={(e) => updateCourse(c.id, "grade", e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground"
              >
                {GRADE_OPTIONS.map((opt) => (
                  <option key={opt.letter} value={opt.letter}>
                    {opt.letter} ({opt.points})
                  </option>
                ))}
              </select>

              <select
                value={c.credits}
                onChange={(e) => updateCourse(c.id, "credits", parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground"
              >
                {[1, 2, 3, 4, 6].map((hrs) => (
                  <option key={hrs} value={hrs}>
                    {hrs} {language === "ar" ? "ساعات" : "Hrs"}
                  </option>
                ))}
              </select>

              {courses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCourse(c.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCourse}
        className="w-full py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        <span>{language === "ar" ? "إضافة مادة دراسية أخرى" : "Add Another Course"}</span>
      </button>
    </div>
  );
}
