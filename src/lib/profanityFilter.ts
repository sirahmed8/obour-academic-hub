/**
 * Profanity Filter for Arabic and English
 * Uses word boundaries to avoid false positives (e.g., "class" won't match "ass")
 */

// Common bad words - ONLY actual slurs and explicit profanity
// Removed generic words like "idiot", "stupid" that are not profanity
const ENGLISH_BAD_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "dick",
  "pussy",
  "cock",
  "whore",
  "slut",
  "nigger",
  "faggot",
];

const ARABIC_BAD_WORDS = [
  "كس",
  "طيز",
  "زب",
  "شرموط",
  "عرص",
  "متناك",
  "خول",
  "ابن الكلب",
  "ابن الشرموطة",
  "كسمك",
  "عاهرة",
  "قحبة",
  "منيك",
  "خرا",
];

const ALL_BAD_WORDS = [...ENGLISH_BAD_WORDS, ...ARABIC_BAD_WORDS];

// Create regex patterns with WORD BOUNDARIES to avoid false positives
// This ensures "class" won't match "ass", "grass" won't match "ass", etc.
const createPattern = (word: string) => {
  // Escape special regex characters
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Use word boundaries \b for English words to avoid partial matches
  // For Arabic words, we don't use \b as it doesn't work well with Arabic
  const isEnglish = /^[a-zA-Z]+$/.test(word);
  if (isEnglish) {
    return new RegExp(`\\b${escaped}\\b`, "gi");
  }
  return new RegExp(escaped, "gi");
};

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  return ALL_BAD_WORDS.some((word) => {
    const pattern = createPattern(word);
    return pattern.test(text);
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
