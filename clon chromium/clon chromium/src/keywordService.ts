export function parseKeywords(text: string): string[] {
  return text
    .split(/\r?\n|,/)
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x);
}
