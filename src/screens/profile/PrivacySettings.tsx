import { useState, useEffect } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import {
  usersService,
  PrivacyDmFrom,
  PrivacyStatusVisibility,
  PrivacyGroupInvite,
} from '../../services/users.service'
import { AlertCircle, Loader, CheckCircle2 } from 'lucide-react'
import Button from '../../components/common/Button'
import './PrivacySettings.css'

function normalizeDmSelect(v: PrivacyDmFrom | undefined): PrivacyDmFrom {
  if (!v || v === 'everyone') return 'contacts_or_follow'
  return v
}

const DM_OPTIONS: { value: PrivacyDmFrom; title: string; hint: string }[] = [
  {
    value: 'contacts_or_follow',
    title: 'Mode par défaut',
    hint:
      'Abonné à vous ou votre numéro dans son répertoire importé.',
  },
  {
    value: 'followers',
    title: 'Uniquement mes abonnés',
    hint: 'La personne doit vous suivre.',
  },
  {
    value: 'mutual',
    title: 'Abonnement mutuel',
    hint: 'Vous devez vous suivre mutuellement.',
  },
  {
    value: 'none',
    title: 'Aucune nouvelle conversation',
    hint: 'Personne ne peut envoyer un premier message.',
  },
]

const GROUP_OPTIONS: { value: PrivacyGroupInvite; title: string; hint: string }[] = [
  {
    value: 'dm_only',
    title: 'Si conversation privée existante',
    hint: 'Parmi ceux avec qui vous avez déjà discuté.',
  },
  {
    value: 'none',
    title: 'Personne',
    hint: 'Impossible de vous ajouter à un groupe.',
  },
]

const STATUS_OPTIONS: { value: PrivacyStatusVisibility; title: string; hint: string }[] = [
  { value: 'everyone', title: 'Tout le monde', hint: 'Affichage futur.' },
  { value: 'followers', title: 'Mes abonnés', hint: 'Uniquement vos abonnés.' },
  { value: 'nobody', title: 'Personne', hint: 'Activité masquée.' },
]

const PrivacySettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [privacyDmFrom, setPrivacyDmFrom] = useState<PrivacyDmFrom>('contacts_or_follow')
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatusVisibility>('everyone')
  const [privacyGroupInvite, setPrivacyGroupInvite] = useState<PrivacyGroupInvite>('dm_only')
  const [contactsText, setContactsText] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [syncTone, setSyncTone] = useState<'ok' | 'warn' | 'err' | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const me = await usersService.getMe()
        if (cancelled) return
        setPrivacyDmFrom(normalizeDmSelect(me.privacy_dm_from))
        setPrivacyStatus(me.privacy_status_visibility ?? 'everyone')
        setPrivacyGroupInvite(me.privacy_group_invite ?? 'dm_only')
      } catch {
        if (!cancelled) setError('Impossible de charger vos paramètres.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (patch: {
    privacy_dm_from?: PrivacyDmFrom
    privacy_status_visibility?: PrivacyStatusVisibility
    privacy_group_invite?: PrivacyGroupInvite
  }) => {
    try {
      setSaving(true)
      setError(null)
      const updated = await usersService.updateMe(patch)
      localStorage.setItem('user', JSON.stringify(updated))
      if (patch.privacy_dm_from != null) setPrivacyDmFrom(normalizeDmSelect(updated.privacy_dm_from))
      if (patch.privacy_status_visibility != null) setPrivacyStatus(updated.privacy_status_visibility ?? 'everyone')
      if (patch.privacy_group_invite != null) setPrivacyGroupInvite(updated.privacy_group_invite ?? 'dm_only')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Enregistrement impossible. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  const syncContacts = async () => {
    const raw = contactsText.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
    if (raw.length === 0) {
      setSyncTone('warn')
      setSyncMsg('Collez des numéros (un par ligne ou séparés par des virgules).')
      return
    }
    try {
      setSyncing(true)
      setSyncMsg(null)
      setSyncTone(null)
      const r = await usersService.syncContacts(raw)
      setSyncTone('ok')
      setSyncMsg(
        `${r.saved} numéro(s) enregistré(s). Vous pourrez contacter ces numéros sur Babylone sans les suivre, si leur confidentialité est sur le mode défaut (abonné ou répertoire).`,
      )
    } catch {
      setSyncTone('err')
      setSyncMsg('Échec de la synchronisation.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <ScreenLayout title="Confidentialité" showBack showBottomNav contentClassName="privacy-settings-layout">
      <div className="privacy-settings">
        {loading ? (
          <div className="privacy-loading">
            <Loader className="spin" size={26} aria-hidden />
            <p className="privacy-loading-text">Chargement…</p>
          </div>
        ) : (
          <>
            <p className="privacy-intro">
              Une nouvelle conversation demande en général que la personne s’abonne à votre compte, sauf exception répertoire ci‑dessous. Les discussions déjà ouvertes ne sont pas concernées.
            </p>

            <div className="privacy-block">
              <p className="privacy-block-label">Premiers messages</p>
              <p className="privacy-block-hint">Qui peut vous envoyer un premier message ?</p>
              <div className="privacy-list" role="radiogroup" aria-label="Premiers messages">
                {DM_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`privacy-row ${privacyDmFrom === opt.value ? 'is-selected' : ''} ${saving ? 'is-disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="privacy_dm_from"
                      value={opt.value}
                      checked={privacyDmFrom === opt.value}
                      disabled={saving}
                      onChange={() => {
                        setPrivacyDmFrom(opt.value)
                        void save({ privacy_dm_from: opt.value })
                      }}
                    />
                    <span className="privacy-row-body">
                      <span className="privacy-row-title">{opt.title}</span>
                      <span className="privacy-row-sub">{opt.hint}</span>
                    </span>
                    <span className="privacy-row-radio" aria-hidden />
                  </label>
                ))}
              </div>
            </div>

            <div className="privacy-block">
              <p className="privacy-block-label">Répertoire importé</p>
              <p className="privacy-block-hint">
                Même format que sur Babylone (ex. +237…). En mode défaut, vous pourrez écrire sans suivre si le numéro est ici ; pour qu’on vous écrive sans vous suivre, votre numéro doit être dans leur répertoire.
              </p>
              <div className="privacy-list privacy-list--pad">
                <textarea
                  className="privacy-textarea"
                  rows={3}
                  placeholder={'+2376…\n+2376…'}
                  value={contactsText}
                  onChange={(e) => setContactsText(e.target.value)}
                  autoComplete="off"
                />
                <Button variant="outline" fullWidth disabled={syncing} onClick={() => void syncContacts()}>
                  {syncing ? 'Enregistrement…' : 'Enregistrer ces numéros'}
                </Button>
                {syncMsg && (
                  <p
                    className={`privacy-sync-msg privacy-sync-msg--${syncTone ?? 'neutral'}`}
                    role="status"
                  >
                    {syncTone === 'ok' && <CheckCircle2 className="privacy-sync-icon" size={15} aria-hidden />}
                    {syncMsg}
                  </p>
                )}
              </div>
            </div>

            <div className="privacy-block">
              <p className="privacy-block-label">Groupes</p>
              <p className="privacy-block-hint">Qui peut vous ajouter à un groupe ?</p>
              <div className="privacy-list" role="radiogroup" aria-label="Groupes">
                {GROUP_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`privacy-row ${privacyGroupInvite === opt.value ? 'is-selected' : ''} ${saving ? 'is-disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="privacy_group_invite"
                      value={opt.value}
                      checked={privacyGroupInvite === opt.value}
                      disabled={saving}
                      onChange={() => {
                        setPrivacyGroupInvite(opt.value)
                        void save({ privacy_group_invite: opt.value })
                      }}
                    />
                    <span className="privacy-row-body">
                      <span className="privacy-row-title">{opt.title}</span>
                      <span className="privacy-row-sub">{opt.hint}</span>
                    </span>
                    <span className="privacy-row-radio" aria-hidden />
                  </label>
                ))}
              </div>
            </div>

            <div className="privacy-block">
              <p className="privacy-block-label">Statut et activité</p>
              <p className="privacy-block-hint">Qui peut voir votre activité (affichage futur)</p>
              <div className="privacy-list" role="radiogroup" aria-label="Statut">
                {STATUS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`privacy-row ${privacyStatus === opt.value ? 'is-selected' : ''} ${saving ? 'is-disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="privacy_status_visibility"
                      value={opt.value}
                      checked={privacyStatus === opt.value}
                      disabled={saving}
                      onChange={() => {
                        setPrivacyStatus(opt.value)
                        void save({ privacy_status_visibility: opt.value })
                      }}
                    />
                    <span className="privacy-row-body">
                      <span className="privacy-row-title">{opt.title}</span>
                      <span className="privacy-row-sub">{opt.hint}</span>
                    </span>
                    <span className="privacy-row-radio" aria-hidden />
                  </label>
                ))}
              </div>
            </div>

            <p className="privacy-footnote">
              Pour créer un groupe, vous ne pouvez ajouter que des personnes avec qui vous avez déjà une conversation individuelle.
            </p>
          </>
        )}

        {error && (
          <div className="privacy-error-banner" role="alert">
            <AlertCircle size={18} aria-hidden />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="privacy-saved-toast" role="status">
            <CheckCircle2 size={16} aria-hidden />
            Enregistré
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default PrivacySettings
