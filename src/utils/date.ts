/**
 * Parse une date renvoyée par l'API en UTC.
 * Le backend peut envoyer la date sans "Z" ou avec un fuseau incorrect,
 * ce qui affichait "59min" / "1h" au lieu de "à l'instant" pour un post frais.
 * On normalise (espace → T) et on force l'interprétation en UTC.
 *
 * Ne renvoie **jamais** `new Date()` pour une entrée invalide (sinon tout affichait « à l'instant »).
 */
export function parseUtc(
  input: string | number | Date | undefined | null,
): Date | null {
  if (input == null || input === '') return null
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  if (typeof input === 'number') {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }
  let s = String(input).trim()
  if (!s || s === '[object Object]') return null
  // Remplacer l'espace date/heure par T pour ISO (ex: "2025-01-30 13:00:00" → "2025-01-30T13:00:00")
  const normalized = s.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)/, '$1T$2')
  const hasTimezone = /[Zz]$/.test(normalized) || /[+-]\d{2}:?\d{2}$/.test(normalized)
  const toParse = hasTimezone ? normalized : normalized + 'Z'
  const d = new Date(toParse)
  if (Number.isNaN(d.getTime())) return null
  return d
}

/** Compat : retourne une Date valide ou epoch pour les calculs qui exigent une Date */
export function parseUtcOrEpoch(input: string | number | Date | undefined | null): Date {
  return parseUtc(input) ?? new Date(0)
}

/**
 * Affiche un âge relatif : "à l'instant", "5s", "2min", "3h", "2j"
 */
export function formatTimeAgo(dateString: string | undefined): string {
  const d = parseUtc(dateString)
  if (!d) return ''
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 0) return 'à l\'instant'
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}j`
}
