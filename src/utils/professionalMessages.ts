/** Préfixe des routes messagerie réservées à l’espace professionnel (barre du bas pro + retour cohérent). */
export const PROFESSIONAL_MESSAGES_BASE = '/professional/messages' as const

export function isProfessionalMessagesPath(pathname: string): boolean {
  return pathname.startsWith(PROFESSIONAL_MESSAGES_BASE)
}

export function getMessagesBasePath(pathname: string): '/messages' | typeof PROFESSIONAL_MESSAGES_BASE {
  return isProfessionalMessagesPath(pathname) ? PROFESSIONAL_MESSAGES_BASE : '/messages'
}
