import { parseUtc } from './date'

/** Heure affichée dans la liste des conversations (fuseau local, dates UTC corrigées) */
export function formatConversationListTime(dateString?: string): string {
  if (!dateString) return ''
  const date = parseUtc(dateString)
  if (!date) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return "À l'instant"
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 2) return "À l'instant"
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24 && date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `${diffH} h`
  }
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfMsgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const dayDiff = Math.round((startOfToday - startOfMsgDay) / 86400000)
  if (dayDiff === 1) return 'Hier'
  if (dayDiff < 7) return `${dayDiff} j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/** Bulle de message : heure + jour si pas aujourd’hui */
export function formatChatMessageTime(dateString?: string): string {
  if (!dateString) return ''
  const date = parseUtc(dateString)
  if (!date) return ''
  const now = new Date()
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return time
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  if (isYesterday) return `Hier ${time}`
  return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} ${time}`
}
