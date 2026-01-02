/**
 * Profanity Filter for Arabic and English
 * Blocks/censors inappropriate language
 */

// Common bad words (abbreviated for brevity, expand as needed)
const ENGLISH_BAD_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "bastard",
  "crap",
  "dick",
  "pussy",
  "cock",
  "whore",
  "slut",
  "nigger",
  "faggot",
  "retard",
  "idiot",
  "stupid",
];

const ARABIC_BAD_WORDS = [
  "كس",
  "طيز",
  "زب",
  "شرموط",
  "عرص",
  "متناك",
  "خول",
  "لعن",
  "ابن الكلب",
  "ابن الشرموطة",
  "يلعن",
  "كسمك",
  "امك",
  "عاهرة",
  "قحبة",
  "منيك",
  "خرا",
];

const ALL_BAD_WORDS = [...ENGLISH_BAD_WORDS, ...ARABIC_BAD_WORDS];

// Create regex patterns (case insensitive for English)
const createPattern = (word: string) => {
  // Escape special regex characters
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "gi");
};

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return ALL_BAD_WORDS.some((word) => {
    const pattern = createPattern(word);
    return pattern.test(lowerText) || pattern.test(text);
  });
}

/**
 * Filter/censor profanity with asterisks
 */
export function filterProfanity(text: string): string {
  let filtered = text;

  ALL_BAD_WORDS.forEach((word) => {
    const pattern = createPattern(word);
    filtered = filtered.replace(pattern, (match) => "*".repeat(match.length));
  });

  return filtered;
}

/**
 * Get censored version of text (same as filterProfanity)
 */
export function censorText(text: string): string {
  return filterProfanity(text);
}
