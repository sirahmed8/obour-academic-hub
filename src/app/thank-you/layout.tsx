import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تم استلام طلب الاشتراك | Obour Plus Confirmation",
  description: "تم استلام طلب تفعيل اشتراك العبور بلس بنجاح. يتم تفعيل الحسابات في أقل من ساعتين.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
