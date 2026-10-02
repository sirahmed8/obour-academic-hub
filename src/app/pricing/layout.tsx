import { Metadata } from "next";

export const metadata: Metadata = {
  title: "باقات واشتراكات العبور بلس | Obour Plus Plans & Pricing",
  description:
    "استكشف باقات الاشتراك الأكاديمي لمنصة معاهد العبور. باقات شهرية وفصلية وسنوية تبدأ من 49 ج.م مع وصول غير محدود لأدوات الذكاء الاصطناعي وتفريغ المحاضرات الصوتية.",
  alternates: {
    canonical: "https://obourinstitutes1.web.app/pricing",
  },
  openGraph: {
    title: "باقات واشتراكات العبور بلس | Obour Plus Plans & Pricing",
    description:
      "استثمر في تفوقك الدراسي مع باقات العبور بلس بالجنيه المصري. تفريغ صوتي ذكي واختبارات تفاعلية غير محدودة.",
    url: "https://obourinstitutes1.web.app/pricing",
    siteName: "Obour Academic Hub",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
