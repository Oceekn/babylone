/** Catégories de services par défaut (alignées avec le backend). */
export const DEFAULT_SERVICE_CATEGORIES = [
  'Maison',
  'Beauté',
  'Éducation',
  'Événements',
  'Santé',
  'Transport',
  'Plomberie',
] as const

export type DefaultCategory = (typeof DEFAULT_SERVICE_CATEGORIES)[number]
