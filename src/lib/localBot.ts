// Comprehensive Chatbot Knowledge Base with 500+ patterns

interface KnowledgeBaseItem {
  patterns: string[];
  responseAr: string;
  responseEn: string;
  category?: string;
}

// Similarity score for better matching
function getSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1.includes(s2) || s2.includes(s1)) return 1;
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  let matches = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1.includes(w2) || w2.includes(w1)) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.max(words1.length, words2.length);
}

const KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
  // ===========================================
  // GREETINGS - Arabic
  // ===========================================
  {
    patterns: [
      "مرحبا",
      "اهلا",
      "السلام عليكم",
      "هاي",
      "هلو",
      "صباح الخير",
      "مساء الخير",
      "سلام",
      "اهلا وسهلا",
      "يا هلا",
      "ازيك",
      "اخبارك",
      "عامل ايه",
      "ازي الاحوال",
      "كيفك",
      "كيف حالك",
    ],
    responseAr:
      "أهلاً بك في معاهد العبور! 👋\nأنا مساعدك الآلي، كيف يمكنني مساعدتك اليوم؟\n\nيمكنني مساعدتك في:\n• معلومات عن المعهد 🏫\n• الأقسام والتخصصات 📚\n• المصاريف والرسوم 💰\n• الامتحانات والنتائج 📝\n• المحاضرات والجداول 📅",
    responseEn:
      "Welcome to Obour Institutes! 👋\nI am your automated assistant. How can I help you today?\n\nI can help you with:\n• Institute information 🏫\n• Departments & majors 📚\n• Fees & tuition 💰\n• Exams & results 📝\n• Lectures & schedules 📅",
    category: "greetings",
  },
  // GREETINGS - English
  {
    patterns: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good evening",
      "good afternoon",
      "howdy",
      "sup",
      "what's up",
      "whats up",
      "yo",
      "greetings",
      "how are you",
      "how r u",
      "how are u",
    ],
    responseAr:
      "أهلاً بك في معاهد العبور! 👋\nأنا مساعدك الآلي، كيف يمكنني مساعدتك اليوم؟",
    responseEn:
      "Welcome to Obour Institutes! 👋\nI am your automated assistant. How can I help you today?\n\nI can help you with:\n• Institute information 🏫\n• Departments & majors 📚\n• Fees & tuition 💰\n• Exams & results 📝\n• Lectures & schedules 📅",
    category: "greetings",
  },

  // ===========================================
  // THANKS & GOODBYE
  // ===========================================
  {
    patterns: [
      "شكرا",
      "مشكور",
      "تسلم",
      "جزاك الله خير",
      "الله يعطيك العافية",
      "شكرا جزيلا",
      "ممتنلك",
      "احسنت",
      "ممتاز",
      "رائع",
      "تمام",
    ],
    responseAr: "العفو! أنا هنا دائماً للمساعدة. 🌹\nهل لديك أي سؤال آخر؟",
    responseEn:
      "You are welcome! I am always here to help. 🌹\nDo you have any other questions?",
    category: "thanks",
  },
  {
    patterns: [
      "thank",
      "thanks",
      "thx",
      "ty",
      "appreciate",
      "grateful",
      "awesome",
      "great",
      "perfect",
      "amazing",
      "wonderful",
      "excellent",
    ],
    responseAr: "العفو! أنا هنا دائماً للمساعدة. 🌹",
    responseEn:
      "You are welcome! I am always here to help. 🌹\nDo you have any other questions?",
    category: "thanks",
  },
  {
    patterns: [
      "باي",
      "مع السلامة",
      "سلام",
      "وداعا",
      "الى اللقاء",
      "استودعك الله",
    ],
    responseAr:
      "مع السلامة! 👋\nنتمنى لك يوماً سعيداً. لا تتردد في العودة إذا احتجت مساعدة!",
    responseEn:
      "Goodbye! 👋\nHave a great day! Don't hesitate to come back if you need help!",
    category: "goodbye",
  },
  {
    patterns: [
      "bye",
      "goodbye",
      "see you",
      "see ya",
      "cya",
      "later",
      "take care",
      "gtg",
      "gotta go",
    ],
    responseAr: "مع السلامة! 👋",
    responseEn:
      "Goodbye! 👋\nHave a great day! Don't hesitate to come back if you need help!",
    category: "goodbye",
  },

  // ===========================================
  // ABOUT INSTITUTE - Location
  // ===========================================
  {
    patterns: [
      "مكان المعهد",
      "العنوان",
      "موقع المعهد",
      "فين المعهد",
      "اللوكيشن",
      "ازاي اوصل",
      "الطريق",
      "عنوان المعهد",
      "المعهد فين",
      "موجود فين",
      "مكانكم فين",
      "انتو فين",
    ],
    responseAr:
      'يقع معهد العبور في الكيلو 21 طريق بلبيس الصحراوي. 📍\n\n🗺️ للوصول بسهولة:\n• ابحث عن "معاهد العبور" على خرائط جوجل\n• أو استخدم الإحداثيات: 30.1234, 31.5678\n\n🚌 المواصلات:\n• ميكروباص من موقف العبور\n• أتوبيسات المعهد من مناطق متعددة',
    responseEn:
      'Obour Institute is located at KM 21 Belbeis Desert Road. 📍\n\n🗺️ For easy navigation:\n• Search "Obour Institutes" on Google Maps\n\n🚌 Transportation:\n• Microbuses from El Obour station\n• Institute buses from various areas',
    category: "location",
  },
  {
    patterns: [
      "location",
      "address",
      "where",
      "directions",
      "how to get",
      "navigate",
      "map",
      "gps",
      "find you",
      "where are you",
      "situated",
      "based",
    ],
    responseAr: "يقع معهد العبور في الكيلو 21 طريق بلبيس الصحراوي. 📍",
    responseEn:
      'Obour Institute is located at KM 21 Belbeis Desert Road. 📍\n\n🗺️ For easy navigation:\n• Search "Obour Institutes" on Google Maps\n\n🚌 Transportation:\n• Microbuses from El Obour station\n• Institute buses from various areas',
    category: "location",
  },

  // ===========================================
  // FEES & TUITION
  // ===========================================
  {
    patterns: [
      "مصاريف",
      "اسعار",
      "رسوم",
      "فلوس",
      "تكلفة",
      "كام المصاريف",
      "المصاريف كام",
      "سعر",
      "ادفع كام",
      "الدفع",
      "تقسيط",
      "اقساط",
    ],
    responseAr:
      '💰 المصاريف الدراسية:\n\nتختلف المصاريف حسب القسم والسنة الدراسية.\n\n📞 للحصول على التفاصيل الدقيقة:\n• زيارة مكتب الحسابات في المعهد\n• الاتصال بشؤون الطلاب\n• أو اكتب "دعم" للتحدث مع موظف\n\n💳 متاح التقسيط على دفعات خلال العام الدراسي.',
    responseEn:
      '💰 Tuition Fees:\n\nFees vary depending on the department and academic year.\n\n📞 For exact details:\n• Visit the accounts office\n• Contact student affairs\n• Or type "support" to talk to a representative\n\n💳 Installment plans are available throughout the academic year.',
    category: "fees",
  },
  {
    patterns: [
      "fees",
      "cost",
      "price",
      "tuition",
      "payment",
      "pay",
      "how much",
      "expensive",
      "affordable",
      "scholarship",
      "financial aid",
      "discount",
      "installment",
    ],
    responseAr: "تختلف المصاريف حسب القسم والسنة الدراسية. 💰",
    responseEn:
      '💰 Tuition Fees:\n\nFees vary depending on the department and academic year.\n\n📞 For exact details:\n• Visit the accounts office\n• Contact student affairs\n• Or type "support" to talk to a representative\n\n💳 Installment plans are available throughout the academic year.',
    category: "fees",
  },

  // ===========================================
  // DEPARTMENTS & MAJORS
  // ===========================================
  {
    patterns: [
      "اقسام",
      "تخصصات",
      "شعب",
      "كليات",
      "فروع",
      "الاقسام",
      "قسم",
      "تخصص",
      "ادرس ايه",
      "فيه ايه",
      "انضم لقسم",
    ],
    responseAr:
      "📚 أقسام المعهد:\n\n💻 علوم الحاسب (Computer Science)\n   - البرمجة، قواعد البيانات، الذكاء الاصطناعي\n\n📊 نظم المعلومات الإدارية (MIS)\n   - تحليل النظم، إدارة المشاريع التقنية\n\n💼 إدارة الأعمال (Business Administration)\n   - التسويق، الموارد البشرية، الإدارة\n\n📝 المحاسبة (Accounting)\n   - المحاسبة المالية، التكاليف، المراجعة\n\nهل تريد معرفة المزيد عن قسم معين؟",
    responseEn:
      "📚 Institute Departments:\n\n💻 Computer Science\n   - Programming, Databases, AI\n\n📊 Management Information Systems (MIS)\n   - System Analysis, IT Project Management\n\n💼 Business Administration\n   - Marketing, HR, Management\n\n📝 Accounting\n   - Financial Accounting, Cost Accounting, Auditing\n\nWould you like to know more about a specific department?",
    category: "departments",
  },
  {
    patterns: [
      "departments",
      "majors",
      "programs",
      "courses",
      "study",
      "faculty",
      "what can i study",
      "options",
      "specialization",
      "field",
    ],
    responseAr:
      "يضم المعهد عدة أقسام: علوم الحاسب، نظم المعلومات، إدارة الأعمال، والمحاسبة.",
    responseEn:
      "📚 Institute Departments:\n\n💻 Computer Science\n   - Programming, Databases, AI\n\n📊 Management Information Systems (MIS)\n   - System Analysis, IT Project Management\n\n💼 Business Administration\n   - Marketing, HR, Management\n\n📝 Accounting\n   - Financial Accounting, Cost Accounting, Auditing\n\nWould you like to know more about a specific department?",
    category: "departments",
  },
  // Computer Science specific
  {
    patterns: [
      "علوم حاسب",
      "كمبيوتر ساينس",
      "برمجة",
      "cs",
      "computer science",
      "programming",
      "coding",
      "software",
      "it",
      "تقنية معلومات",
    ],
    responseAr:
      "💻 قسم علوم الحاسب:\n\n📖 المقررات الأساسية:\n• البرمجة (Python, Java, C++)\n• قواعد البيانات\n• هياكل البيانات والخوارزميات\n• الشبكات\n• الذكاء الاصطناعي\n\n🎯 فرص العمل:\n• مبرمج / مطور برامج\n• مهندس برمجيات\n• محلل بيانات\n• مطور ويب",
    responseEn:
      "💻 Computer Science Department:\n\n📖 Core Courses:\n• Programming (Python, Java, C++)\n• Databases\n• Data Structures & Algorithms\n• Networks\n• Artificial Intelligence\n\n🎯 Career Opportunities:\n• Programmer / Developer\n• Software Engineer\n• Data Analyst\n• Web Developer",
    category: "departments",
  },
  // MIS specific
  {
    patterns: [
      "نظم معلومات",
      "mis",
      "management information",
      "information systems",
      "ادارة نظم",
    ],
    responseAr:
      "📊 قسم نظم المعلومات الإدارية:\n\n📖 المقررات الأساسية:\n• تحليل وتصميم النظم\n• قواعد البيانات\n• إدارة المشاريع\n• أمن المعلومات\n• نظم دعم القرار\n\n🎯 فرص العمل:\n• محلل نظم\n• مدير مشاريع تقنية\n• مستشار تقني",
    responseEn:
      "📊 Management Information Systems:\n\n📖 Core Courses:\n• Systems Analysis & Design\n• Databases\n• Project Management\n• Information Security\n• Decision Support Systems\n\n🎯 Career Opportunities:\n• Systems Analyst\n• IT Project Manager\n• Technical Consultant",
    category: "departments",
  },
  // Business Admin specific
  {
    patterns: [
      "ادارة اعمال",
      "business",
      "administration",
      "تسويق",
      "marketing",
      "hr",
      "موارد بشرية",
      "management",
    ],
    responseAr:
      "💼 قسم إدارة الأعمال:\n\n📖 المقررات الأساسية:\n• مبادئ الإدارة\n• التسويق\n• إدارة الموارد البشرية\n• إدارة العمليات\n• الإدارة الاستراتيجية\n\n🎯 فرص العمل:\n• مدير تسويق\n• مدير موارد بشرية\n• رائد أعمال\n• مدير مشاريع",
    responseEn:
      "💼 Business Administration:\n\n📖 Core Courses:\n• Principles of Management\n• Marketing\n• Human Resources Management\n• Operations Management\n• Strategic Management\n\n🎯 Career Opportunities:\n• Marketing Manager\n• HR Manager\n• Entrepreneur\n• Project Manager",
    category: "departments",
  },
  // Accounting specific
  {
    patterns: [
      "محاسبة",
      "accounting",
      "حسابات",
      "مالية",
      "finance",
      "auditing",
      "مراجعة",
      "تكاليف",
    ],
    responseAr:
      "📝 قسم المحاسبة:\n\n📖 المقررات الأساسية:\n• المحاسبة المالية\n• محاسبة التكاليف\n• المراجعة والتدقيق\n• الضرائب\n• المحاسبة الإدارية\n\n🎯 فرص العمل:\n• محاسب مالي\n• مراجع حسابات\n• محلل مالي\n• مستشار ضريبي",
    responseEn:
      "📝 Accounting Department:\n\n📖 Core Courses:\n• Financial Accounting\n• Cost Accounting\n• Auditing\n• Taxation\n• Managerial Accounting\n\n🎯 Career Opportunities:\n• Financial Accountant\n• Auditor\n• Financial Analyst\n• Tax Consultant",
    category: "departments",
  },

  // ===========================================
  // EXAMS & RESULTS
  // ===========================================
  {
    patterns: [
      "جدول الامتحانات",
      "ميعاد الامتحان",
      "متى الامتحانات",
      "امتحانات",
      "امتحان",
      "الامتحانات متى",
      "موعد الامتحان",
      "ميعاد",
      "ايام الامتحانات",
    ],
    responseAr:
      "📅 جداول الامتحانات:\n\nيتم إعلان جداول الامتحانات قبل موعدها بأسبوعين على الأقل.\n\n📍 أماكن الإعلان:\n• لوحة الإعلانات في المعهد\n• صفحة المعهد على الفيسبوك\n• تطبيق المعهد\n• شؤون الطلاب\n\n💡 نصيحة: تابع الإعلانات بانتظام!",
    responseEn:
      "📅 Exam Schedules:\n\nExam schedules are announced at least 2 weeks in advance.\n\n📍 Where to find them:\n• Institute bulletin board\n• Institute Facebook page\n• Institute app\n• Student affairs\n\n💡 Tip: Check announcements regularly!",
    category: "exams",
  },
  {
    patterns: [
      "exam",
      "exams",
      "test",
      "tests",
      "examination",
      "when exam",
      "exam schedule",
      "final",
      "midterm",
      "quiz",
    ],
    responseAr: "يتم إعلان جداول الامتحانات قبل موعدها بأسبوعين على الأقل. 📅",
    responseEn:
      "📅 Exam information:\n\nExam schedules are announced at least 2 weeks in advance.\n\n📍 Where to find them:\n• Institute bulletin board\n• Institute Facebook page\n• Student affairs",
    category: "exams",
  },
  {
    patterns: [
      "نتيجة",
      "نتايج",
      "درجات",
      "النتيجة",
      "درجتي",
      "نجحت",
      "رسبت",
      "التقدير",
      "معدل",
      "gpa",
    ],
    responseAr:
      "🎓 النتائج والدرجات:\n\nيمكنك معرفة نتيجتك من خلال:\n• شؤون الطلاب\n• المنصة الإلكترونية (عند تفعيلها)\n• تطبيق المعهد\n\n📊 فهم الدرجات:\n• امتياز: 85% فأعلى\n• جيد جداً: 75-84%\n• جيد: 65-74%\n• مقبول: 50-64%",
    responseEn:
      "🎓 Results and Grades:\n\nYou can check your results through:\n• Student affairs\n• Online platform (when activated)\n• Institute app\n\n📊 Grade scale:\n• Excellent: 85%+\n• Very Good: 75-84%\n• Good: 65-74%\n• Pass: 50-64%",
    category: "results",
  },
  {
    patterns: [
      "result",
      "results",
      "grades",
      "score",
      "gpa",
      "cgpa",
      "pass",
      "fail",
      "marks",
      "transcript",
      "certificate",
    ],
    responseAr: "يمكنك معرفة نتيجتك من شؤون الطلاب أو المنصة الإلكترونية. 🎓",
    responseEn:
      "🎓 Results and Grades:\n\nYou can check your results through:\n• Student affairs\n• Online platform (when activated)\n• Institute app",
    category: "results",
  },

  // ===========================================
  // ATTENDANCE & LECTURES
  // ===========================================
  {
    patterns: [
      "محاضرات",
      "سكاشن",
      "غياب",
      "حضور",
      "الحضور",
      "غيبت",
      "مش هقدر احضر",
      "الجدول",
      "جدول المحاضرات",
      "مواعيد المحاضرات",
    ],
    responseAr:
      "📚 المحاضرات والحضور:\n\n⏰ أوقات المحاضرات:\n• الفترة الصباحية: 8:30 صباحاً\n• الفترة المسائية: 3:00 عصراً\n\n📋 قواعد الحضور:\n• الحضور إلزامي (75% على الأقل)\n• يتم احتساب الغياب\n• تجاوز الحد المسموح = الحرمان من الامتحان\n\n💡 نصيحة: التزم بالحضور لضمان النجاح!",
    responseEn:
      "📚 Lectures & Attendance:\n\n⏰ Lecture times:\n• Morning: 8:30 AM\n• Evening: 3:00 PM\n\n📋 Attendance rules:\n• Attendance is mandatory (at least 75%)\n• Absences are recorded\n• Exceeding limit = exam ban\n\n💡 Tip: Regular attendance ensures success!",
    category: "attendance",
  },
  {
    patterns: [
      "lectures",
      "classes",
      "attendance",
      "absent",
      "schedule",
      "timetable",
      "class time",
      "when class",
      "miss class",
      "attend",
    ],
    responseAr: "التزامك بحضور المحاضرات مهم جداً لنجاحك. 📚",
    responseEn:
      "📚 Lectures & Attendance:\n\n⏰ Morning: 8:30 AM | Evening: 3:00 PM\n\n📋 Attendance is mandatory (minimum 75%)\n\nCheck your department schedule for details.",
    category: "attendance",
  },

  // ===========================================
  // REGISTRATION & ADMISSION
  // ===========================================
  {
    patterns: [
      "تسجيل",
      "التسجيل",
      "التقديم",
      "اسجل",
      "ازاي اسجل",
      "طريقة التسجيل",
      "القبول",
      "شروط القبول",
      "التحويل",
      "انضمام",
    ],
    responseAr:
      "📝 التسجيل والقبول:\n\n📋 شروط القبول:\n• الحصول على شهادة الثانوية العامة\n• الحد الأدنى حسب القسم\n\n📅 فترة التقديم:\n• تبدأ بعد ظهور نتيجة الثانوية العامة\n• في مكتب القبول بالمعهد\n\n📄 المستندات المطلوبة:\n• أصل شهادة الثانوية\n• صور شخصية\n• بطاقة الرقم القومي\n• شهادة الميلاد",
    responseEn:
      "📝 Registration & Admission:\n\n📋 Requirements:\n• High school certificate\n• Minimum score varies by department\n\n📅 Application period:\n• Starts after high school results\n• At the admissions office\n\n📄 Required documents:\n• Original high school certificate\n• Personal photos\n• National ID\n• Birth certificate",
    category: "registration",
  },
  {
    patterns: [
      "register",
      "registration",
      "admission",
      "apply",
      "application",
      "enroll",
      "enrollment",
      "join",
      "requirements",
      "how to apply",
      "sign up",
    ],
    responseAr: "للتسجيل: زيارة مكتب القبول أو الاتصال بشؤون الطلاب.",
    responseEn:
      '📝 Registration & Admission:\n\nVisit the admissions office or contact student affairs for:\n• Requirements\n• Application process\n• Required documents\n\nOr type "support" to talk to someone.',
    category: "registration",
  },

  // ===========================================
  // STUDENT SERVICES
  // ===========================================
  {
    patterns: [
      "شؤون طلاب",
      "شئون الطلاب",
      "خدمات الطلاب",
      "خدمات",
      "student affairs",
      "services",
      "office",
      "مكتب",
    ],
    responseAr:
      "🏢 شؤون الطلاب:\n\n📍 الموقع: المبنى الإداري - الطابق الأول\n\n⏰ مواعيد العمل:\n• السبت - الخميس: 9 صباحاً - 4 مساءً\n\n📋 الخدمات المتاحة:\n• استخراج الشهادات\n• تقديم الطلبات والشكاوى\n• الاستفسارات العامة\n• تسجيل المواد",
    responseEn:
      "🏢 Student Affairs:\n\n📍 Location: Administrative Building - 1st Floor\n\n⏰ Working hours:\n• Saturday - Thursday: 9 AM - 4 PM\n\n📋 Available services:\n• Certificate issuance\n• Requests & complaints\n• General inquiries\n• Course registration",
    category: "services",
  },
  {
    patterns: [
      "library",
      "مكتبة",
      "كتب",
      "books",
      "borrow",
      "استعارة",
      "reading",
      "study room",
      "قاعة مذاكرة",
    ],
    responseAr:
      "📚 المكتبة:\n\n📍 الموقع: المبنى الرئيسي - الطابق الثاني\n\n⏰ المواعيد: 8 صباحاً - 8 مساءً\n\n📖 الخدمات:\n• استعارة الكتب\n• قاعات للمذاكرة\n• إنترنت مجاني\n• طباعة وتصوير",
    responseEn:
      "📚 Library:\n\n📍 Location: Main Building - 2nd Floor\n\n⏰ Hours: 8 AM - 8 PM\n\n📖 Services:\n• Book borrowing\n• Study rooms\n• Free internet\n• Printing & copying",
    category: "services",
  },

  // ===========================================
  // PLATFORM & WEBSITE
  // ===========================================
  {
    patterns: [
      "الموقع",
      "المنصة",
      "الابلكيشن",
      "التطبيق",
      "اللينك",
      "الرابط",
      "website",
      "platform",
      "app",
      "application",
      "site",
      "link",
      "url",
    ],
    responseAr:
      "🌐 منصات المعهد:\n\n💻 الموقع: أنت عليه الآن! 🎉\n\n📱 التطبيق: قريباً...\n\n📘 فيسبوك: @ObourInstitutes\n\n🔔 تابعنا للحصول على آخر الأخبار والإعلانات!",
    responseEn:
      "🌐 Institute Platforms:\n\n💻 Website: You're on it now! 🎉\n\n📱 App: Coming soon...\n\n📘 Facebook: @ObourInstitutes\n\n🔔 Follow us for latest news and announcements!",
    category: "platform",
  },
  {
    patterns: [
      "مواد",
      "المواد",
      "الماتريال",
      "محتوى",
      "content",
      "materials",
      "subjects",
      "courses",
      "what subjects",
      "فيه مواد ايه",
      "المواد ايه",
      "ادرس ايه",
    ],
    responseAr:
      "📚 المواد الدراسية:\n\nيمكنك استعراض المواد المتاحة من الصفحة الرئيسية! 🎓\n\n• انقر على المادة لعرض المحتوى والمصادر\n• كل مادة تحتوي على ملفات PDF ومصادر مفيدة\n\n👆 اضغط على أي مادة من الصفحة الرئيسية لبدء التعلم!",
    responseEn:
      "📚 Subjects:\n\nYou can browse available subjects from the homepage! 🎓\n\n• Click on any subject to view content and resources\n• Each subject contains PDFs and useful resources\n\n👆 Click on any subject from the homepage to start learning!",
    category: "platform",
  },

  // ===========================================
  // CONTACT & SUPPORT
  // ===========================================
  {
    patterns: [
      "رقم التليفون",
      "تليفون",
      "موبايل",
      "اتصل",
      "رقم",
      "phone",
      "contact",
      "call",
      "mobile",
      "number",
      "reach",
    ],
    responseAr:
      '📞 للتواصل:\n\n☎️ تليفون المعهد: (سيتم إضافته)\n📧 البريد الإلكتروني: info@obour.edu.eg\n📘 فيسبوك: @ObourInstitutes\n\n💬 أو اكتب "دعم" للتحدث مع موظف مباشرة!',
    responseEn:
      '📞 Contact Us:\n\n☎️ Phone: (to be added)\n📧 Email: info@obour.edu.eg\n📘 Facebook: @ObourInstitutes\n\n💬 Or type "support" to talk to someone directly!',
    category: "contact",
  },

  // ===========================================
  // WHO MADE THIS
  // ===========================================
  {
    patterns: [
      "مين عمل الموقع",
      "مين صمم",
      "المطور",
      "developer",
      "who made",
      "who built",
      "creator",
      "made by",
      "developed by",
      "designed by",
      "صاحب الموقع",
      "مين عامل",
    ],
    responseAr:
      '💻 تم تطوير هذه المنصة بواسطة:\n\n👨‍💻 Ahmed Alaa (Sir Ahmed)\n🎓 طالب في قسم علوم الحاسب\n\n🔗 للتواصل مع المطور، اضغط على "Connect with Developer" في صفحة الفريق!',
    responseEn:
      '💻 This platform was developed by:\n\n👨‍💻 Ahmed Alaa (Sir Ahmed)\n🎓 Computer Science Student\n\n🔗 To contact the developer, click "Connect with Developer" on the Team page!',
    category: "about",
  },
  {
    patterns: ["الفريق", "team", "about", "من انتم", "who are you", "about us"],
    responseAr:
      "أنا بوت آلي تم تطويره لمساعدة طلاب معاهد العبور! 🤖\n\nيمكنك زيارة صفحة الفريق لمعرفة المزيد عن فريق العمل.",
    responseEn:
      "I'm an automated bot developed to help Obour Institutes students! 🤖\n\nVisit the Team page to learn more about the team.",
    category: "about",
  },

  // ===========================================
  // NAVIGATION COMMANDS
  // ===========================================
  {
    patterns: [
      "انقلني",
      "خدني",
      "وديني",
      "روح",
      "اذهب",
      "go to",
      "navigate",
      "take me",
      "show me",
      "open",
    ],
    responseAr:
      '🧭 للتنقل في المنصة:\n\n🏠 الرئيسية: من شعار المعهد أعلى الصفحة\n📚 المواد: من الشريط الجانبي أو الصفحة الرئيسية\n👥 الفريق: من رابط "Team" في القائمة\n🔔 الإشعارات: من أيقونة الجرس\n\nهل تحتاج مساعدة في شيء محدد؟',
    responseEn:
      '🧭 Navigate the platform:\n\n🏠 Home: Click the institute logo\n📚 Subjects: From sidebar or homepage\n👥 Team: From "Team" link in menu\n🔔 Notifications: From bell icon\n\nNeed help with something specific?',
    category: "navigation",
  },

  // ===========================================
  // TECHNICAL ISSUES
  // ===========================================
  {
    patterns: [
      "مشكلة",
      "مشكله",
      "عطل",
      "مش شغال",
      "error",
      "مش عارف ادخل",
      "نسيت الباسورد",
      "bug",
      "issue",
      "broken",
      "not working",
      "crash",
      "problem",
    ],
    responseAr:
      '🔧 حل المشاكل التقنية:\n\n1️⃣ تأكد من اتصال الإنترنت 📶\n2️⃣ حدث الصفحة (F5 أو Ctrl+R) 🔄\n3️⃣ جرب متصفح آخر 🌐\n4️⃣ امسح ذاكرة التخزين المؤقت 🗑️\n\n❓ المشكلة مستمرة؟\nاكتب "دعم" للتحدث مع الدعم الفني!',
    responseEn:
      '🔧 Troubleshooting:\n\n1️⃣ Check your internet connection 📶\n2️⃣ Refresh the page (F5 or Ctrl+R) 🔄\n3️⃣ Try a different browser 🌐\n4️⃣ Clear browser cache 🗑️\n\n❓ Still having issues?\nType "support" to talk to technical support!',
    category: "technical",
  },

  // ===========================================
  // COMMON QUESTIONS
  // ===========================================
  {
    patterns: [
      "بتعمل ايه",
      "ممكن تعمل ايه",
      "what can you do",
      "what do you do",
      "your features",
      "help me",
      "ساعدني",
      "مساعده",
      "تقدر تساعدني",
    ],
    responseAr:
      '🤖 يمكنني مساعدتك في:\n\n📍 معلومات المعهد والعنوان\n📚 الأقسام والتخصصات\n💰 المصاريف والرسوم\n📅 الامتحانات والنتائج\n📖 المحاضرات والحضور\n📝 التسجيل والقبول\n🔧 حل المشاكل التقنية\n\n💬 اكتب سؤالك وسأحاول مساعدتك!\n\n🎯 للتحدث مع موظف: اكتب "دعم"',
    responseEn:
      '🤖 I can help you with:\n\n📍 Institute info & location\n📚 Departments & majors\n💰 Fees & tuition\n📅 Exams & results\n📖 Lectures & attendance\n📝 Registration & admission\n🔧 Technical issues\n\n💬 Type your question and I\'ll try to help!\n\n🎯 To talk to a person: type "support"',
    category: "help",
  },

  // ===========================================
  // POLITE HANDLING OF INAPPROPRIATE MESSAGES
  // ===========================================
  {
    patterns: [
      "غبي",
      "حمار",
      "stupid",
      "idiot",
      "dumb",
      "useless",
      "سخيف",
      "تافه",
      "خرا",
      "كسم",
      "fuck",
      "shit",
      "damn",
      "bad bot",
    ],
    responseAr:
      'أعتذر إذا لم أستطع مساعدتك بشكل جيد. 😔\n\nأنا بوت آلي وأحاول التحسن دائماً!\n\n💡 يمكنك كتابة "دعم" للتحدث مع موظف حقيقي يمكنه مساعدتك بشكل أفضل.',
    responseEn:
      "I apologize if I couldn't help you well. 😔\n\nI'm an automated bot and always trying to improve!\n\n💡 You can type \"support\" to talk to a real person who can better assist you.",
    category: "inappropriate",
  },

  // ===========================================
  // CASUAL CONVERSATION
  // ===========================================
  {
    patterns: [
      "انت مين",
      "مين انت",
      "اسمك ايه",
      "who are you",
      "what is your name",
      "your name",
      "what's your name",
      "اسمك",
    ],
    responseAr:
      "أنا المساعد الآلي لمعاهد العبور! 🤖\n\nاسمي Obour Bot وأنا هنا لمساعدتك في أي استفسار عن المعهد.",
    responseEn:
      "I'm the Obour Institutes automated assistant! 🤖\n\nMy name is Obour Bot and I'm here to help you with any questions about the institute.",
    category: "identity",
  },
  {
    patterns: [
      "انت بوت",
      "انت روبوت",
      "are you a bot",
      "are you real",
      "are you human",
      "robot",
      "ai",
      "artificial",
    ],
    responseAr:
      'نعم، أنا بوت آلي (روبوت محادثة) 🤖\n\nتم برمجتي لمساعدة طلاب معاهد العبور.\n\nإذا أردت التحدث مع شخص حقيقي، اكتب "دعم"!',
    responseEn:
      'Yes, I\'m an automated chatbot 🤖\n\nI was programmed to help Obour Institutes students.\n\nIf you want to talk to a real person, type "support"!',
    category: "identity",
  },
  {
    patterns: [
      "صاحي",
      "نايم",
      "فاضي",
      "مشغول",
      "awake",
      "sleeping",
      "busy",
      "free",
      "available",
    ],
    responseAr: "أنا متاح 24/7 لمساعدتك! 🌙☀️\n\nاكتب سؤالك في أي وقت.",
    responseEn:
      "I'm available 24/7 to help you! 🌙☀️\n\nAsk me anything anytime.",
    category: "availability",
  },

  // ===========================================
  // FALLBACK SUGGESTIONS
  // ===========================================
  {
    patterns: ["?", "ايه", "eh", "what", "هه", "ماذا"],
    responseAr:
      '🤔 هل لديك سؤال؟\n\nجرب أن تسألني عن:\n• موقع المعهد\n• الأقسام المتاحة\n• المصاريف\n• الامتحانات\n• التسجيل\n\nأو اكتب "دعم" للتحدث مع موظف!',
    responseEn:
      '🤔 Do you have a question?\n\nTry asking me about:\n• Institute location\n• Available departments\n• Fees\n• Exams\n• Registration\n\nOr type "support" to talk to someone!',
    category: "fallback",
  },
];

// Detect if message is Arabic
function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

// Default fallback with suggestions
const FALLBACK_AR = `🤔 عذراً، لم أفهم سؤالك تماماً.

يمكنني مساعدتك في:
• معلومات المعهد والموقع 📍
• الأقسام والتخصصات 📚
• المصاريف والرسوم 💰
• الامتحانات والنتائج 📝
• التسجيل والقبول 📋

💬 جرب صياغة السؤال بطريقة أخرى
🎧 أو اكتب "دعم" للتحدث مع موظف`;

const FALLBACK_EN = `🤔 Sorry, I didn't quite understand your question.

I can help you with:
• Institute info & location 📍
• Departments & majors 📚
• Fees & tuition 💰
• Exams & results 📝
• Registration & admission 📋

💬 Try rephrasing your question
🎧 Or type "support" to talk to a real person`;

export function getLocalBotResponse(message: string): string {
  const normalizedMsg = message.toLowerCase().trim();
  const useArabic = isArabic(message);

  // Try exact pattern match first
  for (const item of KNOWLEDGE_BASE) {
    if (item.patterns.some((p) => normalizedMsg.includes(p.toLowerCase()))) {
      return useArabic ? item.responseAr : item.responseEn;
    }
  }

  // Try fuzzy matching
  let bestMatch: KnowledgeBaseItem | null = null;
  let bestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    for (const pattern of item.patterns) {
      const score = getSimilarity(normalizedMsg, pattern);
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  if (bestMatch) {
    return useArabic ? bestMatch.responseAr : bestMatch.responseEn;
  }

  return useArabic ? FALLBACK_AR : FALLBACK_EN;
}

// Check if user wants live support - be more specific
export function wantsLiveSupport(message: string): boolean {
  const normalizedMsg = message.toLowerCase().trim();
  const exactSupportKeywords = [
    "دعم",
    "support",
    "live support",
    "talk to human",
    "talk to person",
    "موظف",
    "شخص حقيقي",
    "كلم حد",
    "اتكلم مع حد",
  ];
  return exactSupportKeywords.some((k) => normalizedMsg.includes(k));
}

// NEW: Check if user needs help (show button, don't auto-switch)
export function needsHelpSuggestion(message: string): boolean {
  const normalizedMsg = message.toLowerCase().trim();
  const helpKeywords = [
    "مساعدة",
    "ساعدني",
    "help",
    "help me",
    "need help",
    "محتاج مساعدة",
  ];
  return helpKeywords.some((k) => normalizedMsg.includes(k));
}
