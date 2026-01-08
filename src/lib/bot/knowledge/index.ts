import { ACADEMIC_KNOWLEDGE } from "./academic";
import { TECHNICAL_KNOWLEDGE } from "./technical";
import { GENERAL_KNOWLEDGE } from "./general";
import { FAQ_KNOWLEDGE } from "./faq";
import { QA } from "../types";

export const KNOWLEDGE_BASE: QA[] = [
  ...GENERAL_KNOWLEDGE,
  ...ACADEMIC_KNOWLEDGE,
  ...TECHNICAL_KNOWLEDGE,
  ...FAQ_KNOWLEDGE,
];
