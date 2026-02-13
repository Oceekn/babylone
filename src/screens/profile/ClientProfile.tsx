import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Settings, ChevronRight, Edit, Camera, LogOut } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import { storageService } from '../../services/storage.service'
import { authService } from '../../services/auth.service'
import './ClientProfile.css'

const ClientProfile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      const data = await usersService.getMe()
      setUser(data)
      // Mettre en cache pour les prochaines fois
      localStorage.setItem('user', JSON.stringify(data))
    } catch (err) {
      console.error('Erreur chargement profil:', err)
      // Fallback : utiliser les données en cache localStorage
      const cached = localStorage.getItem('user')
      if (cached) {
        try { setUser(JSON.parse(cached)) } catch {}
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

  const handleLogout = () => {
    authService.logout()
  }

  const menuItems = [
    { label: 'Informations personnelles', icon: <Edit size={20} />, route: '/profile/edit' },
    { label: 'Confidentialite et securite', icon: <ChevronRight size={20} />, route: '/profile/privacy' },
    { label: 'Notifications', icon: <ChevronRight size={20} />, route: '/profile/notifications' },
    { label: 'Favoris', icon: <ChevronRight size={20} />, route: '/profile/favorites' },
    { label: 'Historique des reservations', icon: <ChevronRight size={20} />, route: '/bookings' },
    { label: 'Centre d\'aide', icon: <ChevronRight size={20} />, route: '/profile' },
    { label: 'A propos', icon: <ChevronRight size={20} />, route: '/profile' },
  ]

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.telephone
    : ''

  return (
    <ScreenLayout title="" rightAction={<Settings size={24} />} showBottomNav>
      <div className="client-profile">
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Chargement...</p>
        ) : (
          <>
            <div className="profile-info">
              <div className="profile-avatar-wrapper">
                <button
                  type="button"
                  className="profile-avatar-btn"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Changer la photo de profil"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="profile-avatar-img"
                    />
                  ) : (
                    <div className="profile-avatar">{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</div>
                  )}
                  <span className="profile-avatar-camera">
                    <Camera size={20} />
                  </span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-input"
                  onChange={onAvatarChange}
                />
                {uploadingAvatar && (
                  <span className="profile-avatar-loading">Envoi...</span>
                )}
              </div>
              <h2 className="profile-name">{displayName || 'Mon profil'}</h2>
              {user?.email && <p className="profile-email">{user.email}</p>}
            </div>
            <div className="menu-section">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className="menu-item"
                  onClick={() => navigate(item.route)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button className="menu-item menu-item-logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Deconnexion</span>
              </button>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default ClientProfile
