import { useState, useEffect } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import './PrivacySettings.css'

interface PrivacyState {
  profileVisibility: 'public' | 'friends' | 'private'
  contactPermission: 'everyone' | 'friends' | 'nobody'
  allowTagging: boolean
}

const PrivacySettings = () => {
  const [settings, setSettings] = useState<PrivacyState>(() => {
    const stored = localStorage.getItem('privacy_settings')
    return stored ? JSON.parse(stored) : {
      profileVisibility: 'public',
      contactPermission: 'everyone',
      allowTagging: true,
    }
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (key: keyof PrivacyState, value: any) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    localStorage.setItem('privacy_settings', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ScreenLayout title="Confidentialite" showBack showBottomNav>
      <div className="privacy-settings">
        <div className="settings-section">
          <div className="setting-item">
            <div>
              <label className="setting-label">Visibilite du profil</label>
              <p className="setting-description">Qui peut voir votre profil</p>
            </div>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleChange('profileVisibility', e.target.value)}
              className="setting-select"
            >
              <option value="public">Tout le monde</option>
              <option value="friends">Amis uniquement</option>
              <option value="private">Prive</option>
            </select>
          </div>

          <div className="setting-item">
            <div>
              <label className="setting-label">Qui peut me contacter</label>
              <p className="setting-description">Controler qui peut vous envoyer des messages</p>
            </div>
            <select
              value={settings.contactPermission}
              onChange={(e) => handleChange('contactPermission', e.target.value)}
              className="setting-select"
            >
              <option value="everyone">Tout le monde</option>
              <option value="friends">Amis uniquement</option>
              <option value="nobody">Personne</option>
            </select>
          </div>

          <div className="setting-item">
            <div>
              <label className="setting-label">Autoriser le taggage</label>
              <p className="setting-description">Permettre aux autres de vous identifier</p>
            </div>
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={settings.allowTagging}
                onChange={() => handleChange('allowTagging', !settings.allowTagging)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {saved && (
          <div style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: '8px', padding: '12px', margin: '16px 0', color: '#2E7D32', fontSize: '14px', textAlign: 'center' }}>
            Parametres sauvegardes
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default PrivacySettings
