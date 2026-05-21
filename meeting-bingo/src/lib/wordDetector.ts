function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.,!?;:]/g, ' ');
}

function buildPattern(phrase: string): RegExp {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // \b works on word boundaries; for multi-word phrases boundary is on the outer edges
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

// Spoken variants for acronyms and slash-separated terms
export const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration continuous delivery'],
  'mvp': ['minimum viable product', 'em vee pee'],
  'roi': ['return on investment', 'ar oh eye'],
  'api': ['a p i', 'a pi', 'application programming interface'],
  'devops': ['dev ops', 'dev-ops'],
  'on-premise': ['on premise', 'on prem', 'on premises'],
  'user story': ['user stories'],
  'story points': ['story point'],
  'scrum master': ['scrummaster'],
  'standup': ['stand up', 'stand-up', 'daily stand up'],
  'daily standup': ['daily stand up', 'daily stand-up'],
  'retrospective': ['retro'],
  'definition of done': ['dod'],
  'acceptance criteria': ['a c'],
  'kubernetes': ['k8s', 'kube'],
  'tech debt': ['technical debt'],
  'pull request': ['p r', 'pull requests'],
  'key performance indicators': ['kpi', 'kpis'],
};

/**
 * Detects which card words (or their known aliases) appear in a speech transcript.
 * @param transcript - Raw speech recognition text to scan.
 * @param cardWords - Words present on the current bingo card.
 * @param alreadyFilled - Set of normalized words already marked as filled (excluded from detection).
 * @returns Array of matched card words (in original casing) that were detected in the transcript.
 */
export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalized = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    const wordNorm = normalizeText(word);
    if (alreadyFilled.has(wordNorm)) continue;

    const patterns = [wordNorm, ...(WORD_ALIASES[wordNorm] ?? [])];
    const found = patterns.some((p) => buildPattern(p).test(normalized));
    if (found) detected.push(word);
  }

  return detected;
}
