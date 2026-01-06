export function normalizeArabic(text: string): string {
  if (!text) return "";
  let normalized = text.toLowerCase().trim();

  // Remove Tashkeel (diacritics)
  normalized = normalized.replace(/[\u064B-\u065F]/g, "");

  // Normalize Alef
  normalized = normalized.replace(/[أإآ]/g, "ا");

  // Normalize Hamza variations
  normalized = normalized.replace(/ؤ/g, "و");
  normalized = normalized.replace(/ئ/g, "ي");

  // Normalize Teh Marbuta
  normalized = normalized.replace(/ة/g, "ه");

  // Normalize Yeh
  normalized = normalized.replace(/ى/g, "ي");

  // Remove punctuation and special charts
  normalized = normalized.replace(/[^\w\s\u0600-\u06FF]/g, " ");

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, " ");

  return normalized.trim();
}

export function getSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;

  if (longerLength === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longerLength - editDistance) / parseFloat(longerLength.toString());
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
