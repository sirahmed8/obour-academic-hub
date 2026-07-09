import { ColorOption, SubjectFormData } from "./types";

export const COLOR_OPTIONS: ColorOption[] = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Indgo", value: "bg-indigo-500" },
  { label: "Violet", value: "bg-violet-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Fuchsia", value: "bg-fuchsia-500" },
  { label: "Pink", value: "bg-pink-500" },
  { label: "Rose", value: "bg-rose-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Amber", value: "bg-amber-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Teal", value: "bg-teal-500" },
  { label: "Cyan", value: "bg-cyan-500" },
  { label: "Sky", value: "bg-sky-500" },
];

export const INITIAL_SUBJECT_FORM: SubjectFormData = {
  name: "",
  nameAr: "",
  profName: "",
  profNameAr: "",
  description: "",
  descriptionAr: "",
  icon: "BookOpen",
  color: "bg-blue-500",
};
