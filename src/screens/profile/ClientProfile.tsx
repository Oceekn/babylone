import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfilePhotoViewer from '../../components/common/ProfilePhotoViewer'
import { Settings, ChevronRight, Edit, Camera, LogOut, Image } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import { storageService } from '../../services/storage.service'
import { authService } from '../../services/auth.service'
import { chatSocketService } from '../../services/chat-socket.service'
import { socialService } from '../../services/social.service'
import './ClientProfile.css'

const ClientProfile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [postsCount, setPostsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [showPhotoViewer, setShowPhotoViewer] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      socialService.getUserPosts(user.id).then((p) => setPostsCount(p?.length ?? 0)).catch(() => setPostsCount(0)),
      socialService.getFollowCounts(user.id)
        .then((c) => {
          setFollowersCount(c.followers ?? 0)
          setFollowingCount(c.following ?? 0)
        })
        .catch(() => {
          setFollowersCount(0)
          setFollowingCount(0)
        }),
    ]).catch(() => {})
  }, [user?.id])

  const loadUser = async () => {
    try {
      setLoading(true)
      const data = await usersService.getMe()
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
    } catch (err) {
      console.error('Erreur chargement profil:', err)
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
    chatSocketService.disconnect()
    authService.logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    { label: 'Informations personnelles', icon: <Edit size={20} />, route: '/profile/edit' },
    { label: 'Stories archivées', icon: <ChevronRight size={20} />, route: '/profile/stories-archive' },
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

  // Vérifier si c'est bien un compte client (pas pro)
  const isClientAccount = user && user.role !== 'PROFESSIONAL' && user.role !== 'ADMIN'

  return (
    <ScreenLayout title="" rightAction={<Settings size={24} />} showBottomNav>
      <div className="client-profile">
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Chargement...</p>
        ) : (
          <>
            {!isClientAccount && user && (
              <div style={{ 
                padding: '12px 16px', 
                margin: '16px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px',
                color: '#856404'
              }}>
                <strong>Attention:</strong> Vous êtes connecté avec un compte professionnel ({user.email || user.telephone}). 
                Pour accéder au profil client, veuillez vous déconnecter et vous reconnecter avec un compte client.
              </div>
            )}
            <div className="profile-info">
              <div className="profile-avatar-wrapper">
                <button
                  type="button"
                  className="profile-avatar-btn"
                  onClick={() => {
                    if (user?.avatar_url) setShowPhotoViewer(true)
                    else avatarInputRef.current?.click()
                  }}
                  disabled={uploadingAvatar}
                  title={user?.avatar_url ? 'Voir la photo de profil' : 'Changer la photo de profil'}
                >
                  {user?.avatar_url && (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="profile-avatar-img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const placeholder = e.currentTarget.nextElementSibling
                        if (placeholder instanceof HTMLElement) placeholder.style.display = 'flex'
                      }}
                    />
                  )}
                  <div
                    className="profile-avatar-placeholder"
                    style={{ display: user?.avatar_url ? 'none' : 'flex' }}
                  >
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
                </button>
                <button
                  type="button"
                  className="profile-avatar-camera"
                  onClick={(e) => { e.stopPropagation(); setShowPhotoViewer(false); avatarInputRef.current?.click(); }}
                  disabled={uploadingAvatar}
                  title="Changer la photo"
                  aria-label="Changer la photo"
                >
                  <Camera size={18} color="#1d0c0c" strokeWidth={2.5} />
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
              <div className="profile-social-stats">
                <button type="button" className="profile-stat" onClick={() => user?.id && navigate(`/social/profile/${user.id}`)}>
                  <Image size={18} />
                  <span>{postsCount} publications</span>
                </button>
                <div className="profile-social-follow">
                  <button 
                    type="button" 
                    className="profile-stat profile-stat-clickable" 
                    onClick={() => user?.id && navigate(`/social/profile/${user.id}/followers`)}
                  >
                    <span className="profile-stat-number">{followersCount}</span>
                    <span className="profile-stat-label">abonnés</span>
                  </button>
                  <button 
                    type="button" 
                    className="profile-stat profile-stat-clickable" 
                    onClick={() => user?.id && navigate(`/social/profile/${user.id}/following`)}
                  >
                    <span className="profile-stat-number">{followingCount}</span>
                    <span className="profile-stat-label">abonnements</span>
                  </button>
                </div>
              </div>
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
      {user?.avatar_url && (
        <ProfilePhotoViewer
          imageUrl={user.avatar_url}
          isOpen={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          alt={displayName}
        />
      )}
    </ScreenLayout>
  )
}

export default ClientProfile
