/**
 * Calculates the Jaro similarity between two strings.
 */
export function jaroSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const len1 = s1.length;
  const len2 = s2.length;

  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const matches1 = new Array(len1).fill(false);
  const matches2 = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(len2 - 1, i + matchWindow);

    for (let j = start; j <= end; j++) {
      if (!matches2[j] && s1[i] === s2[j]) {
        matches1[i] = true;
        matches2[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (matches1[i]) {
      while (!matches2[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  const t = transpositions / 2;
  return (matches / len1 + matches / len2 + (matches - t) / matches) / 3;
}

/**
 * Calculates the Jaro-Winkler similarity between two strings.
 */
export function jaroWinkler(s1, s2) {
  const jaro = jaroSimilarity(s1, s2);
  if (jaro < 0.7) return jaro;

  // Calculate common prefix (up to 4 characters)
  let prefix = 0;
  const maxPrefix = Math.min(4, s1.length, s2.length);
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) {
      prefix++;
    } else {
      break;
    }
  }

  // Winkler scaling factor (standard is 0.1)
  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Tokenizes a string into a set of lowercased alphanumeric words.
 */
function tokenize(text) {
  if (!text) return new Set();
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ") // replace punctuation with space
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1); // filter out single letter words / spaces
  return new Set(clean);
}

/**
 * Calculates the Jaccard similarity (set intersection over union) between two strings.
 */
export function jaccardSimilarity(text1, text2) {
  const set1 = tokenize(text1);
  const set2 = tokenize(text2);

  if (set1.size === 0 && set2.size === 0) return 0;
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      intersection++;
    }
  }

  const union = set1.size + set2.size - intersection;
  return intersection / union;
}
