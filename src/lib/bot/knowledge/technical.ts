import { QA } from "../types";

export const TECHNICAL_KNOWLEDGE: QA[] = [
  // ==================== LOGIN & AUTH ====================
  {
    questions: [
      "login error",
      "cant login",
      "google sign in error",
      "auth failed",
      "403",
      "access denied",
      "مشكلة دخول",
      "مش عارف ادخل",
      "خطأ تسجيل",
      "جوجل مش شغال",
      "مشكلة في الحساب",
      "مرفوض",
    ],
    answer: {
      ar: [
        "🚫 **مشكلة في تسجيل الدخول؟**\n1. تأكد أنك تستخدم **ايميل جوجل**.\n2. إذا كنت تستخدم ايميل المعهد، تأكد أنه مفعل.\n3. امسح كاش المتصفح وجرب تاني.\nلو لسه المشكلة موجودة، كلم الدعم فوراً!",
        "🔐 **خطأ في الدخول:** غالباً سببه الكاش أو ضعف النت. جرب وضع التصفح الخفي (Incognito) وشوف هيشتغل ولا لأ.",
      ],
      en: [
        "🚫 **Login Troubles?**\n1. Ensure you're using a **Google Email**.\n2. If using Uni email, check it's active.\n3. Clear browser cache and retry.\nIf it persists, contact support instantly!",
        "🔐 **Auth Error:** Usually cache or net lag. Try Incognito Mode, it implies a clean state.",
      ],
    },
    suggestions: {
      ar: ["كيف أمسح الكاش؟", "تحدث للدعم"],
      en: ["How to clear cache?", "Talk to Support"],
    },
  },
  {
    questions: [
      "clear cache",
      "how to clear cache",
      "cleaning browser",
      "مسح الكاش",
      "ازاي امسح الكاش",
      "تنظيف المتصفح",
    ],
    answer: {
      ar: "🧹 **لمسح الكاش (Chrome):**\n1. اضغط `Ctrl + Shift + Delete`\n2. اختر 'Cached images and files'\n3. اضغط 'Clear data'\n4. اعمل Refresh للصفحة.",
      en: "🧹 **To Clear Cache (Chrome):**\n1. Press `Ctrl + Shift + Delete`\n2. Select 'Cached images and files'\n3. Click 'Clear data'\n4. Refresh the page.",
    },
  },

  // ==================== APP & PWA ====================
  {
    questions: [
      "install app",
      "download apk",
      "ios app",
      "iphone app",
      "android app",
      "pwa",
      "تطبيق الايفون",
      "تطبيق الاندرويد",
      "تحميل البرنامج",
      "تثبيت التطبيق",
      "رابط التطبيق",
    ],
    answer: {
      ar: "📱 **تثبيت التطبيق (PWA):**\nمنصتنا مش محتاجة App Store!\n\n• **iPhone (Safari):**\nاضغط زر المشاركة (Share) ⬅️ اختر 'Add to Home Screen'.\n\n• **Android (Chrome):**\nاضغط الـ 3 نقط فوق ⬅️ اختر 'Install App' أو 'Add to Home System'.",
      en: "📱 **Install App (PWA):**\nNo App Store needed!\n\n• **iPhone (Safari):**\nTap Share ⬅️ Select 'Add to Home Screen'.\n\n• **Android (Chrome):**\nTap 3 dots ⬅️ Select 'Install App' or 'Add to Home Screen'.",
    },
  },

  // ==================== PERFORMANCE & BUGS ====================
  {
    questions: [
      "slow",
      "lagging",
      "very slow",
      "latency",
      "loading stuck",
      "بطيء",
      "النت بطيء",
      "الموقع تقيل",
      "بيحمل كتير",
      "معلق",
    ],
    answer: {
      ar: "🐢 **الموقع بطيء؟**\n1. شيك على سرعة النت عندك.\n2. لو فاتح تابات كتير اقفلها.\n3. الموقع مصمم يكون خفيف جداً، فغالباً المشكلة في الاتصال.",
      en: "🐢 **Site Slow?**\n1. Check your internet speed.\n2. Close unused tabs.\n3. The site is optimized to be very light, so it's likely a connection issue.",
    },
  },
  {
    questions: [
      "white screen",
      "blank screen",
      "nothing showing",
      "crash",
      "شاشة بيضاء",
      "مش ظاهر حاجة",
      "الموقع ابيض",
      "اختفى",
    ],
    answer: {
      ar: "⚪ **الشاشة البيضاء:** دي غالباً مشكلة تحديث. جرب تعمل `Hard Reload` (اضغط `Ctrl + F5`). لو مفيش فايدة، يبقى سيرفراتنا فيها صيانة مؤقتة.",
      en: "⚪ **White Screen:** Usually an update glitch. Try `Hard Reload` (`Ctrl + F5`). If not fixed, we might be under temporary maintenance.",
    },
  },

  // ==================== FILE UPLOAD/DOWNLOAD ====================
  {
    questions: [
      "cant upload",
      "upload fail",
      "file too big",
      "submit assignment",
      "مش عارف ارفع",
      "فشل الرفع",
      "الملف كبير",
      "تسليم الواجب",
    ],
    answer: {
      ar: "📤 **مشكلة في الرفع؟**\n1. تأكد إن حجم الملف مش أكبر من 10MB.\n2. الصيغ المدعومة: PDF, JPG, PNG, DOCX.\n3. لو النت عندك بيقطع الرفع هيفشل.",
      en: "📤 **Upload Failed?**\n1. Ensure file size is under 10MB.\n2. Supported: PDF, JPG, PNG, DOCX.\n3. Unstable internet will kill uploads.",
    },
  },
  {
    questions: [
      "cant download",
      "pdf not opening",
      "corrupt file",
      "مش عارف احمل",
      "الملف مش بيفتح",
      "تحميل معطوب",
    ],
    answer: {
      ar: "📥 **مشكلة في التحميل؟**\nجرب تفتح الملف في 'Tab' جديد (كليك يمين -> Open in new tab). أحياناً مانع الإعلانات (AdBlock) بيمنع التحميل، جرب توقفه.",
      en: "📥 **Download Issue?**\nTry opening in a new tab (Right click -> Open in new tab). Sometimes AdBlockers stop downloads, try disabling them.",
    },
  },
];
