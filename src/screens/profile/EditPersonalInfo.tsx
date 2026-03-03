import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Loader, Camera, Mail, Phone } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import { storageService } from '../../services/storage.service'
import './EditPersonalInfo.css'

const EditPersonalInfo = () => {
  const navigate = useNavigate()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })

  useEffect(() => { loadUser() }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      const data = await usersService.getMe()
      setUser(data)
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
      })
    } catch (err) {
      const cached = localStorage.getItem('user')
      if (cached) {
        try {
          const u = JSON.parse(cached)
          setUser(u)
          setFormData({
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            email: u.email || '',
          })
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setUploadingAvatar(true)
    try {
      const url = await storageService.uploadFile(file)
      const updated = await usersService.updateMe({ avatar_url: url })
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
    } catch (err) {
      console.error('Erreur upload photo:', err)
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      const updated = await usersService.updateMe({
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
        email: formData.email.trim() || undefined,
      })
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      setSuccess(true)
      setTimeout(() => navigate(-1), 1500)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la sauvegarde'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.telephone || 'Mon profil'
    : 'Mon profil'

  if (loading) {
    return (
      <ScreenLayout title="Informations personnelles" showBack showBottomNav>
        <div className="edit-profile-loading">
          <Loader size={32} className="spin" />
          <p>Chargement du profil...</p>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Informations personnelles" showBack showBottomNav contentClassName="edit-profile-page">
      <div className="edit-personal-info edit-profile-banner">
        {/* Bannière rouge comme sur la maquette */}
        <div className="profile-cover-bar" />

        {/* Bloc identité qui chevauche la bannière */}
        <div className="profile-identity-block">
          <div className="profile-avatar-wrap">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Changer la photo"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={displayName} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <svg viewBox="0 0 100 100" className="profile-avatar-octagon" xmlns="http://www.w3.org/2000/svg">
                    {/* Octagon: light blue lines */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                      const a1 = (i * Math.PI) / 4 - Math.PI / 2
                      const a2 = ((i + 1) * Math.PI) / 4 - Math.PI / 2
                      const r = 38
                      const x1 = 50 + r * Math.cos(a1)
                      const y1 = 50 + r * Math.sin(a1)
                      const x2 = 50 + r * Math.cos(a2)
                      const y2 = 50 + r * Math.sin(a2)
                      return (
                        <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#87CEEB" strokeWidth="1.5" />
                      )
                    })}
                    {/* Red dots at vertices */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                      const a = (i * Math.PI) / 4 - Math.PI / 2
                      const r = 38
                      const cx = 50 + r * Math.cos(a)
                      const cy = 50 + r * Math.sin(a)
                      return <circle key={`c-${i}`} cx={cx} cy={cy} r="3" fill="#a14545" />
                    })}
                    {/* Letter b */}
                    <text x="50" y="58" fontSize="44" fontWeight="bold" fill="#87CEEB" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial, sans-serif">b</text>
                  </svg>
                </div>
              )}
            </button>
            <span className="profile-avatar-badge">
              {uploadingAvatar ? (
                <Loader size={16} className="spin" />
              ) : (
                <Camera size={16} />
              )}
            </span>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden-input"
            onChange={onAvatarChange}
          />
          <h2 className="profile-display-name">{displayName.toLowerCase()}</h2>
          {user?.telephone && (
            <p className="profile-handle">
              <Phone size={14} />
              {user.telephone}
            </p>
          )}
        </div>

        {/* Formulaire en carte */}
        <div className="edit-profile-form">
            <Input
              label="Prénom"
              placeholder="Votre prénom"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            />
            <Input
              label="Nom"
              placeholder="Votre nom"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              placeholder="exemple@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              icon={<Mail size={20} color="#a14545" />}
            />
        </div>

        {error && (
          <div className="edit-profile-message edit-profile-error">
            {error}
          </div>
        )}

        {success && (
          <div className="edit-profile-message edit-profile-success">
            Profil mis à jour avec succès
          </div>
        )}

        <Button
          className="edit-profile-save-btn"
          variant="primary"
          fullWidth
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default EditPersonalInfo
