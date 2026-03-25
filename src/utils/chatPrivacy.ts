/** Erreur API quand le destinataire refuse un nouveau message (réglages confidentialité) */
export const DM_PRIVACY_ERROR_CODE = 'DM_PRIVACY_BLOCKED'

export const DM_PRIVACY_BLOCKED_MESSAGE_FR =
  "Cette personne limite qui peut lui écrire (confidentialité). Suivez-la, importez son numéro dans Confidentialité, ou cette conversation existe déjà."

export const GROUP_PRIOR_CHAT_CODE = 'GROUP_REQUIRES_PRIOR_CHAT'
export const GROUP_INVITE_BLOCKED_CODE = 'GROUP_INVITE_BLOCKED'

export function isDmPrivacyBlocked(err: unknown): boolean {
  const e = err as { response?: { status?: number; data?: { message?: string | string[] } } }
  const msg = e?.response?.data?.message
  const m = Array.isArray(msg) ? msg[0] : msg
  return e?.response?.status === 403 && m === DM_PRIVACY_ERROR_CODE
}
