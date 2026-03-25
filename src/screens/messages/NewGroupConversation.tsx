import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search, X } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import { chatService } from '../../services/chat.service'
import { authService } from '../../services/auth.service'
import { getMessagesBasePath } from '../../utils/professionalMessages'
import './NewGroupConversation.css'

const NewGroupConversation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const messagesBase = getMessagesBasePath(location.pathname)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selected, setSelected] = useState<User[]>([])
  const [allowedUserIds, setAllowedUserIds] = useState<Set<string>>(new Set())
  const [loadingChats, setLoadingChats] = useState(true)

  const me = authService.getCurrentUserId()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const convs = await chatService.getConversations()
        if (cancelled) return
        const ids = new Set<string>()
        for (const c of convs) {
          if (c.type !== 'individual') continue
          if (c.other_user_id) {
            ids.add(c.other_user_id)
            continue
          }
          const parts = c.participants
          if (!parts?.length) continue
          const other = parts.find((p) => p.user_id !== me)
          if (other?.user_id) ids.add(other.user_id)
        }
        setAllowedUserIds(ids)
      } catch {
        setAllowedUserIds(new Set())
      } finally {
        if (!cancelled) setLoadingChats(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [me])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    try {
      setLoading(true)
      const users = await usersService.searchUsers(query.trim())
      setResults(users)
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err)
    } finally {
      setLoading(false)
    }
  }

  const addMember = (user: User) => {
    if (selected.some((u) => u.id === user.id)) return
    setSelected((prev) => [...prev, user])
  }

  const removeMember = (userId: string) => {
    setSelected((prev) => prev.filter((u) => u.id !== userId))
  }

  const createGroup = async () => {
    const name = groupName.trim()
    if (!name) return
    if (selected.length === 0) return
    try {
      setCreating(true)
      const conversation = await chatService.createGroupConversation({
        name,
        participant_ids: selected.map((u) => u.id),
      })
      navigate(`${messagesBase}/group/${conversation.id}`)
    } catch (err: unknown) {
      console.error('Erreur creation groupe:', err)
      const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      const msg = Array.isArray(raw) ? raw[0] : raw
      if (msg === 'GROUP_REQUIRES_PRIOR_CHAT') {
        alert('Vous ne pouvez ajouter que des personnes avec qui vous avez déjà une conversation privée.')
      } else if (msg === 'GROUP_INVITE_BLOCKED') {
        alert('Cette personne refuse d’être ajoutée à des groupes.')
      } else {
        alert('Impossible de créer le groupe.')
      }
    } finally {
      setCreating(false)
    }
  }

  const getUserName = (user: User) => {
    const n = `${user.first_name || ''} ${user.last_name || ''}`.trim()
    return n || user.telephone
  }

  return (
    <ScreenLayout title="Nouveau groupe" showBack showBottomNav>
      <div className="new-group-conversation">
        <div className="group-name-field">
          <Input
            placeholder="Nom du groupe"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {selected.length > 0 && (
          <div className="selected-chips">
            {selected.map((user) => (
              <span key={user.id} className="chip">
                {getUserName(user)}
                <button type="button" className="chip-remove" onClick={() => removeMember(user.id)} aria-label="Retirer">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="search-section">
          <Input
            placeholder="Rechercher des contacts a ajouter..."
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="contacts-list">
          {loadingChats ? (
            <p className="list-hint">Chargement de vos conversations…</p>
          ) : loading ? (
            <p className="list-hint">Recherche...</p>
          ) : searchQuery.length < 2 ? (
            <p className="list-hint">Tapez au moins 2 caracteres pour rechercher</p>
          ) : results.length === 0 ? (
            <p className="list-hint">Aucun utilisateur trouve</p>
          ) : (
            results
              .filter((user) => allowedUserIds.has(user.id))
              .map((user) => {
              const isSelected = selected.some((u) => u.id === user.id)
              return (
                <div
                  key={user.id}
                  className={`contact-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => addMember(user)}
                  style={{ opacity: creating ? 0.5 : 1 }}
                >
                  <div className="contact-avatar">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" />
                    ) : (
                      <span>{getUserName(user).charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{getUserName(user)}</span>
                    <span className="contact-status">{user.telephone}</span>
                  </div>
                  {isSelected && <span className="check-label">Ajoute</span>}
                </div>
              )
            })
          )}
          {!loadingChats &&
            searchQuery.length >= 2 &&
            results.length > 0 &&
            results.every((u) => !allowedUserIds.has(u.id)) && (
              <p className="list-hint" style={{ color: '#a14545' }}>
                Vous ne pouvez ajouter que des personnes avec qui vous avez déjà discuté en message privé. Ouvrez d’abord une conversation avec eux.
              </p>
            )}
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={createGroup}
          disabled={creating || !groupName.trim() || selected.length === 0}
        >
          {creating ? 'Creation...' : `Creer le groupe (${selected.length})`}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default NewGroupConversation
