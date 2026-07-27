"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { Mic, FileText, Sparkles, Download, RefreshCw } from "lucide-react";

import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiFetch } from "@/lib/api-client";

export default function TranscribePage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [lectureTitle, setLectureTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [rawText, setRawText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  const handleStartRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error(
        isRtl ? "متصفحك لا يدعم التسجيل الصوتي المباشر" : "Browser speech recognition not supported"
      );
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = isRtl ? "ar-SA" : "en-US";
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info(
          isRtl ? "بدأ التسجيل الصوتي... تحدث الآن 🎙️" : "Recording started... Speak now 🎙️"
        );
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setRawText((prev) => prev + " " + transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureTitle || !subjectName) {
      toast.error(
        isRtl ? "يرجى ملء اسم المحاضرة والمادة" : "Please fill lecture title and subject"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; summary: string }>(
        "/api/ai/transcribe-lecture",
        {
          method: "POST",
          body: {
            lectureTitle,
            subjectName,
            notesText: rawText,
          },
        }
      );

      if (res?.summary) {
        setSummaryResult(res.summary);
        toast.success(
          isRtl ? "تم تحويل المحاضرة إلى تلخيص أكاديمي! 📑" : "Lecture summary generated! 📑"
        );
      }
    } catch {
      toast.error(isRtl ? "حدث خطأ أثناء معالجة المحاضرة" : "Failed to generate summary");
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
            <Mic size={14} />
            <span>{isRtl ? "محول الصوتيات والتلاخيص" : "Audio Transcriber & Summarizer"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "حول التسجيلات الصوتية إلى ملخصات مكتوبة 🎙️"
              : "Transform Lecture Audio to Smart Notes"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "سجل صوت المحاضرة مباشرة أو أدخل ملاحظاتك ليقوم الذكاء الاصطناعي بتنظيمها وتلخيصها فورياً."
              : "Record in-person lectures or input audio transcripts to generate organized markdown notes."}
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <ScaleIn>
          <form
            onSubmit={handleTranscribe}
            className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {isRtl ? "عنوان المحاضرة *" : "Lecture Title *"}
              </label>
              <input
                type="text"
                required
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                placeholder={
                  isRtl ? "مثال: المحاضرة 4 - المصادقة والأمان" : "e.g. Lecture 4 - Authentication"
                }
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {isRtl ? "اسم المادة *" : "Subject Name *"}
              </label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder={isRtl ? "مثال: هندسة البرمجيات" : "e.g. Software Engineering"}
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary text-sm font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-foreground">
                  {isRtl ? "ملاحظات المحاضرة / تفريغ الصوت" : "Lecture Notes / Transcript"}
                </label>
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 transition ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  <Mic size={14} />
                  <span>
                    {isRecording
                      ? isRtl
                        ? "جاري التسجيل..."
                        : "Recording..."
                      : isRtl
                        ? "تسجيل ميكروفون"
                        : "Mic Record"}
                  </span>
                </button>
              </div>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  isRtl
                    ? "أدخل النص أو استخدم زر التسجيل المباشر..."
                    : "Paste notes or use live recording..."
                }
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border outline-none focus:border-primary text-sm font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-sm hover:opacity-95 transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>{isRtl ? "جاري التلخيص..." : "Summarizing..."}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>
                    {isRtl ? "إنشاء التلخيص المنسق 📑" : "Generate Structured Summary 📑"}
                  </span>
                </>
              )}
            </button>
          </form>
        </ScaleIn>

        {/* Display Generated Summary */}
        <ScaleIn>
          <div className="p-6 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl min-h-[350px] flex flex-col justify-between">
            {summaryResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-xs font-black text-primary uppercase">
                    {isRtl ? "التلخيص النهائي" : "Generated Summary"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(summaryResult);
                      toast.success(isRtl ? "تم نسخ الملخص!" : "Summary copied!");
                    }}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center gap-1"
                  >
                    <Download size={14} />
                    <span>{isRtl ? "نسخ" : "Copy"}</span>
                  </button>
                </div>

                <div className="prose dark:prose-invert text-xs sm:text-sm max-h-[400px] overflow-y-auto pr-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryResult}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3 text-muted-foreground">
                <FileText size={48} className="text-primary/40" />
                <p className="text-sm font-bold">
                  {isRtl
                    ? "سيظهر الملخص الأكاديمي المنسق هنا فور التوليد"
                    : "Generated summary will appear here"}
                </p>
              </div>
            )}
          </div>
        </ScaleIn>
      </div>
    </div>
  );
}
