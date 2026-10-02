// Shared by artist and game searches; display text remains unchanged.
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, character =>
      String.fromCharCode(character.charCodeAt(0) - 0x60)
    )
    .replace(/\s+/g, ' ')
    .trim();
}
