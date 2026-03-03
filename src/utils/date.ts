/**
 * Parse une date renvoyée par l'API en UTC.
 * Le backend peut envoyer la date sans "Z" ou avec un fuseau incorrect,
 * ce qui affichait "59min" / "1h" au lieu de "à l'instant" pour un post frais.
 * On normalise (espace → T) et on force l'interprétation en UTC.
 */
export function parseUtc(dateString: string | undefined): Date {
  if (!dateString) return new Date()
  let s = String(dateString).trim()
  if (!s) return new Date()
  // Remplacer l'espace date/heure par T pour ISO (ex: "2025-01-30 13:00:00" → "2025-01-30T13:00:00")
  const normalized = s.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)/, '$1T$2')
  const hasTimezone = /[Zz]$/.test(normalized) || /[+-]\d{2}:?\d{2}$/.test(normalized)
  const toParse = hasTimezone ? normalized : normalized + 'Z'
  const d = new Date(toParse)
  if (Number.isNaN(d.getTime())) return new Date()
  return d
}

/**
 * Affiche un âge relatif : "à l'instant", "5s", "2min", "3h", "2j"
 */
export function formatTimeAgo(dateString: string | undefined): string {
  const d = parseUtc(dateString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 0) return 'à l\'instant'
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}j`
}
