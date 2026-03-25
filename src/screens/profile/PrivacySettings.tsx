import { useState, useEffect } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import {
  usersService,
  PrivacyDmFrom,
  PrivacyStatusVisibility,
  PrivacyGroupInvite,
} from '../../services/users.service'
import { AlertCircle, Loader } from 'lucide-react'
import Button from '../../components/common/Button'
import './PrivacySettings.css'

function normalizeDmSelect(v: PrivacyDmFrom | undefined): PrivacyDmFrom {
  if (!v || v === 'everyone') return 'contacts_or_follow'
  return v
}

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
      setSyncMsg('Collez des numéros (un par ligne ou séparés par des virgules).')
      return
    }
    try {
      setSyncing(true)
      setSyncMsg(null)
      const r = await usersService.syncContacts(raw)
      setSyncMsg(
        `${r.saved} numéro(s) enregistré(s). Vous pourrez contacter ces numéros sur Babylone sans les suivre, si leur confidentialité est sur le mode défaut (abonné ou répertoire).`,
      )
    } catch {
      setSyncMsg('Échec de la synchronisation.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <ScreenLayout title="Confidentialité" showBack showBottomNav>
      <div className="privacy-settings">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader className="spin" size={28} />
          </div>
        ) : (
          <>
            <p className="privacy-intro">
              <strong>Règle générale :</strong> on ne peut pas ouvrir une nouvelle conversation avec quelqu’un sans s’être <strong>abonné à son compte</strong> (le suivre),{' '}
              <em>sauf</em> l’exception ci‑dessous (répertoire). Les réglages ci‑dessous s’appliquent aux <strong>nouvelles</strong> conversations ; si une discussion existe déjà, vous continuez à échanger.
            </p>

            <div className="settings-section">
              <div className="setting-item">
                <div>
                  <label className="setting-label">Qui peut m’envoyer un premier message ?</label>
                  <p className="setting-description">
                    Choisissez le niveau : uniquement abonnés à vous, abonnement mutuel, ou le mode par défaut avec exception « numéro dans le répertoire ».
                  </p>
                </div>
                <select
                  value={privacyDmFrom === 'everyone' ? 'contacts_or_follow' : privacyDmFrom}
                  disabled={saving}
                  onChange={(e) => {
                    const v = e.target.value as PrivacyDmFrom
                    setPrivacyDmFrom(v)
                    void save({ privacy_dm_from: v })
                  }}
                  className="setting-select"
                >
                  <option value="contacts_or_follow">
                    Défaut : abonné à mon compte OU mon numéro Babylone dans son répertoire importé
                  </option>
                  <option value="followers">
                    Uniquement si la personne s’est abonnée à mon compte (elle me suit)
                  </option>
                  <option value="mutual">
                    Uniquement si nous sommes abonnés l’un à l’autre (mutuel)
                  </option>
                  <option value="none">Personne (aucune nouvelle conversation)</option>
                </select>
              </div>

              <div className="setting-item privacy-contacts-sync">
                <div>
                  <label className="setting-label">Mon répertoire (numéros importés)</label>
                  <p className="setting-description">
                    Importez les numéros de <strong>votre</strong> téléphone (même format que sur Babylone, ex. +237…). Ainsi, pour les comptes en mode défaut,{' '}
                    <strong>vous pourrez leur écrire sans les suivre</strong> si leur numéro figure ici. Inversement, pour qu’on vous écrive sans vous suivre, ces personnes doivent avoir importé <strong>votre</strong> numéro chez elles.
                  </p>
                  <textarea
                    className="privacy-contacts-textarea"
                    rows={4}
                    placeholder={'+2376…\n+2376…'}
                    value={contactsText}
                    onChange={(e) => setContactsText(e.target.value)}
                  />
                  <Button variant="outline" fullWidth disabled={syncing} onClick={() => void syncContacts()}>
                    {syncing ? 'Enregistrement…' : 'Enregistrer ces numéros'}
                  </Button>
                  {syncMsg && <p className="privacy-sync-msg">{syncMsg}</p>}
                </div>
              </div>

              <div className="setting-item">
                <div>
                  <label className="setting-label">Groupes</label>
                  <p className="setting-description">
                    Qui peut vous ajouter à un groupe (uniquement parmi les personnes avec qui vous avez déjà discuté en privé).
                  </p>
                </div>
                <select
                  value={privacyGroupInvite}
                  disabled={saving}
                  onChange={(e) => {
                    const v = e.target.value as PrivacyGroupInvite
                    setPrivacyGroupInvite(v)
                    void save({ privacy_group_invite: v })
                  }}
                  className="setting-select"
                >
                  <option value="dm_only">Autoriser si conversation privée existante</option>
                  <option value="none">Personne ne peut m’ajouter à un groupe</option>
                </select>
              </div>

              <div className="setting-item">
                <div>
                  <label className="setting-label">Statut &amp; activité</label>
                  <p className="setting-description">Qui peut voir votre activité (affichage futur)</p>
                </div>
                <select
                  value={privacyStatus}
                  disabled={saving}
                  onChange={(e) => {
                    const v = e.target.value as PrivacyStatusVisibility
                    setPrivacyStatus(v)
                    void save({ privacy_status_visibility: v })
                  }}
                  className="setting-select"
                >
                  <option value="everyone">Tout le monde</option>
                  <option value="followers">Mes abonnés seulement</option>
                  <option value="nobody">Personne</option>
                </select>
              </div>
            </div>

            <div className="privacy-hint-box">
              <strong>Rappel :</strong> pour créer un groupe, vous ne pouvez ajouter que des personnes avec qui vous avez déjà une conversation individuelle.
            </div>
          </>
        )}

        {error && (
          <div className="privacy-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {saved && <div className="privacy-saved-toast">Enregistré</div>}
      </div>
    </ScreenLayout>
  )
}

export default PrivacySettings
