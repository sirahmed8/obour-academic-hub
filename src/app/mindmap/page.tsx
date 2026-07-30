"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { GitFork, Sparkles, RefreshCw, Layers, ChevronRight } from "lucide-react";

import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

interface MindNode {
  title: string;
  children?: MindNode[];
}

interface MindMapData {
  root: string;
  children: MindNode[];
}

export default function MindMapPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [topic, setTopic] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mindmap, setMindmap] = useState<MindMapData | null>(null);

  const handleGenerateMindmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error(isRtl ? "يرجى كتابة اسم الموضوع" : "Please enter a topic name");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; mindmap: MindMapData }>(
        "/api/ai/generate-mindmap",
        {
          method: "POST",
          body: { topic, subjectName },
        }
      );

      if (res?.mindmap) {
        setMindmap(res.mindmap);
        toast.success(isRtl ? "تم توليد الخريطة الذهنية بنجاح! 🧠" : "Mind map generated! 🧠");
      }
    } catch {
      toast.error(isRtl ? "حدث خطأ أثناء إنشاء الخريطة الذهنية" : "Failed to generate mind map");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
            <GitFork size={14} />
            <span>
              {isRtl ? "مولد الخرائط الذهنية بالذكاء الاصطناعي" : "AI Mind Map Generator"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "بسط الفصول المعقدة إلى خرائط تفاعلية 🧠"
              : "Visualize Complex Academic Topics"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "أدخل اسم الفصل أو الموضوع لرسم خريطة تفاعلية توضح العلاقات بين المفاهيم."
              : "Generate hierarchical mind maps for chapters, algorithms, and concepts."}
          </p>
        </div>
      </FadeIn>

      {/* Input Form */}
      <ScaleIn>
        <form
          onSubmit={handleGenerateMindmap}
          className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {isRtl ? "الموضوع أو الفصل الدراسي *" : "Topic / Chapter Name *"}
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  isRtl
                    ? "مثال: البرمجة الكائنية / خوارزميات الترتيب"
                    : "e.g. OOP Concepts / Sorting Algorithms"
                }
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border/80 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 focus:bg-background/80 hover:border-primary/40 transition-all duration-300 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {isRtl ? "المادة الدراسية (اختياري)" : "Subject Name (Optional)"}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { ar: "OOP", en: "OOP" },
                  { ar: "شبكات", en: "Networks" },
                  { ar: "قواعد بيانات", en: "Databases" },
                  { ar: "هندسة برمجيات", en: "Software Eng." },
                ].map((sub) => (
                  <button
                    key={sub.en}
                    type="button"
                    onClick={() => setSubjectName(isRtl ? sub.ar : sub.en)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all border ${
                      subjectName === (isRtl ? sub.ar : sub.en)
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-muted/60 text-muted-foreground border-border hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {isRtl ? sub.ar : sub.en}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder={isRtl ? "مثال: علوم الحاسب" : "e.g. Computer Science"}
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border/80 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 focus:bg-background/80 hover:border-primary/40 transition-all duration-300 text-sm font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-sm hover:opacity-95 transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                <span>{isRtl ? "جاري رسم الخريطة الذهنية..." : "Generating Mind Map..."}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{isRtl ? "إنشاء الخريطة الذهنية 🧠" : "Generate Mind Map 🧠"}</span>
              </>
            )}
          </button>
        </form>
      </ScaleIn>

      {/* Rendered Mind Map Display */}
      {mindmap && (
        <ScaleIn>
          <div className="p-8 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <Layers className="text-primary" />
                <span>{mindmap.root}</span>
              </h2>

              <span className="text-xs font-bold text-muted-foreground">
                {isRtl ? "شجرة المفاهيم الأكاديمية" : "Concept Tree Map"}
              </span>
            </div>

            {/* Tree Nodes Renderer */}
            <div className="space-y-4">
              {mindmap.children?.map((child, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3"
                >
                  <div className="font-extrabold text-sm text-primary flex items-center gap-2">
                    <ChevronRight size={16} />
                    <span>{child.title}</span>
                  </div>

                  {child.children && child.children.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6 sm:pr-8">
                      {child.children.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="p-2.5 rounded-xl bg-card border border-border/50 text-xs font-bold text-foreground"
                        >
                          • {sub.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScaleIn>
      )}
    </div>
  );
}
