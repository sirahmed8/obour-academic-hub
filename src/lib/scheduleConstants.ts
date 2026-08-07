export interface LectureSlot {
  id: string;
  subjectAr: string;
  subjectEn: string;
  doctorAr: string;
  doctorEn: string;
  hall: string;
  dayAr: string;
  dayEn: string;
  time: string;
  attended: boolean;
}

export const INITIAL_SCHEDULE: LectureSlot[] = [
  {
    id: "1",
    subjectAr: "برمجة هيكلية (OOP)",
    subjectEn: "OOP Programming",
    doctorAr: "د. أحمد كمال",
    doctorEn: "Dr. Ahmed Kamal",
    hall: "مدرج 302",
    dayAr: "الأحد",
    dayEn: "Sunday",
    time: "09:00 AM - 11:00 AM",
    attended: true,
  },
  {
    id: "2",
    subjectAr: "قواعد البيانات (Databases)",
    subjectEn: "Databases",
    doctorAr: "د. مريم محمود",
    doctorEn: "Dr. Maryam Mahmoud",
    hall: "معمل حاسب 4",
    dayAr: "الإثنين",
    dayEn: "Monday",
    time: "11:30 AM - 01:30 PM",
    attended: false,
  },
  {
    id: "3",
    subjectAr: "رياضيات حاسب (Discrete Math)",
    subjectEn: "Discrete Math",
    doctorAr: "د. حسن السيد",
    doctorEn: "Dr. Hassan El-Sayed",
    hall: "مدرج 101",
    dayAr: "الثلاثاء",
    dayEn: "Tuesday",
    time: "10:00 AM - 12:00 PM",
    attended: true,
  },
];
