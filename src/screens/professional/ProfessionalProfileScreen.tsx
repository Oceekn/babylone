import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfilePhotoViewer from '../../components/common/ProfilePhotoViewer'
import Button from '../../components/common/Button'
import { CheckCircle, ChevronRight, Camera, User, Image, MapPin, Briefcase, FileText, Star, Settings, Loader } from 'lucide-react'
import { professionalsService, Professional } from '../../services/professionals.service'
import { servicesService, Service } from '../../services/services.service'
import { usersService } from '../../services/users.service'
import { storageService } from '../../services/storage.service'
import './ProfessionalProfileScreen.css'

const ProfessionalProfileScreen = () => {
  const navigate = useNavigate()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingServiceId, setUploadingServiceId] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const serviceImageInputRef = useRef<HTMLInputElement>(null)
  const cniInputRef = useRef<HTMLInputElement>(null)
  const [serviceIdForImage, setServiceIdForImage] = useState<string | null>(null)
  const [uploadingCni, setUploadingCni] = useState(false)
  const [showPhotoViewer, setShowPhotoViewer] = useState(false)

  useEffect(() => {
    loadProfessionalData()
  }, [])

  const loadProfessionalData = async () => {
    try {
      setLoading(true)
      setError(null)

      let profData: Professional | null = null
      try {
        profData = await professionalsService.getMyProfile()
      } catch (err: any) {
        if (err?.response?.status === 404) {
          profData = null
        } else {
          throw err
        }
      }
      setProfessional(profData ?? null)

      const servicesData = await servicesService.getMyServices()
      setServices(Array.isArray(servicesData) ? servicesData : [])
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err)
      const msg = err?.response?.data?.message || err?.message
      setError(typeof msg === 'string' ? msg : 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      await professionalsService.create({ pays_code: 'CM' })
      await loadProfessionalData()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message
      setError(typeof msg === 'string' ? msg : 'Impossible de créer la fiche.')
    } finally {
      setLoading(false)
    }
  }

  const getUserName = (prof: Professional) => {
    if (prof.user) {
      return `${prof.user.first_name || ''} ${prof.user.last_name || ''}`.trim() || prof.business_name || 'Professionnel'
    }
    return prof.business_name || 'Professionnel'
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setUploadingAvatar(true)
    try {
      const url = await storageService.uploadFile(file)
      await usersService.updateMe({ avatar_url: url })
      if (professional?.user) {
        setProfessional({
          ...professional,
          user: { ...professional.user, avatar_url: url },
        })
      }
    } catch (err) {
      console.error('Erreur upload photo profil:', err)
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const onServiceImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const sid = serviceIdForImage
    if (!file || !sid) return
    setUploadingServiceId(sid)
    try {
      await servicesService.uploadImage(sid, file)
      const list = await servicesService.getMyServices()
      setServices(list)
    } catch (err) {
      console.error('Erreur upload photo service:', err)
    } finally {
      setUploadingServiceId(null)
      setServiceIdForImage(null)
      e.target.value = ''
    }
  }

  const onCniChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !professional) return
    setUploadingCni(true)
    try {
      await professionalsService.uploadCNI(professional.id, file)
      // Recharger le profil pour voir le statut mis a jour
      const profData = await professionalsService.getMyProfile()
      setProfessional(profData ?? professional)
    } catch (err) {
      console.error('Erreur upload CNI:', err)
    } finally {
      setUploadingCni(false)
      e.target.value = ''
    }
  }

  const openServiceImageUpload = (id: string) => {
    setServiceIdForImage(id)
    setTimeout(() => serviceImageInputRef.current?.click(), 0)
  }

  return (
    <ScreenLayout title="Profil" showBack showBottomNav>
      <div className="professional-profile-screen">
        {loading ? (
          <div className="profile-loading">
            <Loader size={36} className="spin" />
            <p>Chargement du profil...</p>
          </div>
        ) : error ? (
          <div className="profile-error">
            <p>{error}</p>
            <Button variant="outline" onClick={loadProfessionalData}>Réessayer</Button>
          </div>
        ) : !professional ? (
          <div className="profile-empty">
            <Briefcase size={48} style={{ color: 'var(--dark-grey)', marginBottom: 16 }} />
            <p className="profile-empty-title">Vous n'avez pas encore de fiche professionnelle</p>
            <p className="profile-empty-desc">Créez votre fiche pour apparaître dans les recherches et recevoir des réservations.</p>
            <Button variant="primary" onClick={handleCreateProfile} disabled={loading}>
              Créer ma fiche
            </Button>
          </div>
        ) : (
          <>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
              onChange={onAvatarChange}
            />
            <div className="profile-hero">
              <div className="profile-hero-bg" />
              <div className="profile-hero-content">
                <div className="profile-avatar-wrapper">
                  <button
                    type="button"
                    className="profile-avatar-btn"
                    onClick={() => {
                      if (professional.user?.avatar_url) setShowPhotoViewer(true)
                      else avatarInputRef.current?.click()
                    }}
                    disabled={uploadingAvatar}
                    title={professional.user?.avatar_url ? 'Voir la photo de profil' : 'Changer la photo de profil'}
                  >
                    {professional.user?.avatar_url && (
                      <img
                        src={professional.user.avatar_url}
                        alt={getUserName(professional)}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const placeholder = e.currentTarget.nextElementSibling
                          if (placeholder instanceof HTMLElement) placeholder.style.display = 'flex'
                        }}
                      />
                    )}
                    <div className="profile-avatar-placeholder" style={{ display: professional.user?.avatar_url ? 'none' : 'flex' }}>
                      <User size={48} />
                    </div>
                  </button>
                  <span className="profile-avatar-badge">
                    {uploadingAvatar ? <Loader size={16} className="spin" /> : <Camera size={16} />}
                  </span>
                </div>
                <div className="profile-hero-info">
                  <h1 className="profile-name">{getUserName(professional)}</h1>
                  {professional.profession && (
                    <p className="profile-profession">
                      <Briefcase size={14} /> {professional.profession}
                    </p>
                  )}
                  {professional.city && (
                    <p className="profile-location">
                      <MapPin size={14} /> {professional.city}{professional.pays_code ? `, ${professional.pays_code}` : ''}
                    </p>
                  )}
                  {professional.is_verified && (
                    <div className="profile-verified-badge">
                      <CheckCircle size={16} />
                      <span>Compte vérifié</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {professional && (
          <>
            <div className="profile-section">
              <h3 className="profile-section-title">À propos</h3>
              <div className="profile-card">
                {professional.business_name && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Nom commercial</span>
                    <span className="profile-info-value">{professional.business_name}</span>
                  </div>
                )}
                {professional.address && (
                  <div className="profile-info-row">
                    <span className="profile-info-label">Adresse</span>
                    <span className="profile-info-value">{professional.address}{professional.city ? `, ${professional.city}` : ''}</span>
                  </div>
                )}
                {professional.description && (
                  <div className="profile-info-row profile-info-row-full">
                    <span className="profile-info-label">Description</span>
                    <p className="profile-info-value profile-description-text">{professional.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h3 className="profile-section-title">Vérification</h3>
              <div className="profile-card">
                <div className="document-card">
                  <div className="document-card-header">
                    <FileText size={20} />
                    <span className="document-card-title">Pièce d'identité (CNI)</span>
                  </div>
                  <div className={`document-status ${professional?.cni_document_url && professional?.is_verified ? 'verified' : professional?.cni_document_url ? 'pending' : 'missing'}`}>
                    {professional?.cni_document_url && professional?.is_verified ? (
                      <>
                        <CheckCircle size={18} />
                        <span>Vérifié</span>
                      </>
                    ) : professional?.cni_document_url ? (
                      <>
                        <Loader size={18} className="spin" />
                        <span>En attente de vérification</span>
                      </>
                    ) : (
                      <>
                        <span className="status-dot" />
                        <span>Document non uploadé</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={cniInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                    onChange={onCniChange}
                  />
                  <button
                    type="button"
                    className="document-upload-btn"
                    onClick={() => cniInputRef.current?.click()}
                    disabled={uploadingCni}
                  >
                    {uploadingCni ? (
                      <>
                        <Loader size={16} className="spin" /> Envoi en cours...
                      </>
                    ) : professional?.cni_document_url ? (
                      'Mettre à jour'
                    ) : (
                      'Uploader le document'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {professional && (
          <>
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Galerie</h3>
                {services.filter(s => s.image_url).length > 0 && (
                  <button
                    type="button"
                    className="profile-section-action"
                    onClick={() => navigate('/professional/services')}
                  >
                    Voir tout
                  </button>
                )}
              </div>
              <div className="gallery-grid">
                {services.filter(s => s.image_url).length > 0 ? (
                  services.filter(s => s.image_url).slice(0, 6).map((s) => (
                    <div key={s.id} className="gallery-item">
                      <img src={s.image_url!} alt={s.title} />
                    </div>
                  ))
                ) : (
                  <div className="gallery-empty">
                    <Image size={40} />
                    <p>Ajoutez des photos de vos services</p>
                    <button
                      type="button"
                      className="gallery-empty-btn"
                      onClick={() => navigate('/professional/services')}
                    >
                      Gérer les photos
                    </button>
                  </div>
                )}
              </div>
            </div>
            <input
              ref={serviceImageInputRef}
              type="file"
              accept="image/*"
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
              onChange={onServiceImageChange}
            />
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Mes services</h3>
                {services.length > 0 && (
                  <button
                    type="button"
                    className="profile-section-action"
                    onClick={() => navigate('/professional/services')}
                  >
                    Voir tout ({services.length})
                  </button>
                )}
              </div>
              {services.length > 0 ? (
                <div className="services-preview-list">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="service-preview-card"
                      onClick={() => navigate(`/professional/services/create?edit=${service.id}`)}
                    >
                      <div className="service-preview-thumb">
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.title} />
                        ) : (
                          <div className="service-preview-placeholder">
                            <Image size={24} />
                          </div>
                        )}
                      </div>
                      <div className="service-preview-info">
                        <p className="service-preview-name">{service.title}</p>
                        <p className="service-preview-price">
                          {Number(service.price).toLocaleString('fr-FR')} {service.currency || 'XAF'}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="service-preview-photo-btn"
                        onClick={(e) => { e.stopPropagation(); openServiceImageUpload(service.id); }}
                        disabled={uploadingServiceId === service.id}
                        title="Ajouter une photo"
                      >
                        {uploadingServiceId === service.id ? (
                          <Loader size={16} className="spin" />
                        ) : (
                          <Camera size={18} />
                        )}
                      </button>
                      <ChevronRight size={20} className="service-preview-arrow" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="services-empty">
                  <Briefcase size={40} />
                  <p>Aucun service configuré</p>
                  <button
                    type="button"
                    className="services-empty-btn"
                    onClick={() => navigate('/professional/services/create')}
                  >
                    Créer un service
                  </button>
                </div>
              )}
            </div>
            <div className="profile-section">
              <h3 className="profile-section-title">Paramètres</h3>
              <div className="settings-menu">
                <button
                  type="button"
                  className="settings-menu-item"
                  onClick={() => navigate('/professional/reviews')}
                >
                  <div className="settings-menu-icon settings-menu-icon-reviews">
                    <Star size={20} />
                  </div>
                  <div className="settings-menu-content">
                    <span className="settings-menu-title">Avis et commentaires</span>
                    <span className="settings-menu-subtitle">Gérer vos avis clients</span>
                  </div>
                  <ChevronRight size={20} className="settings-menu-arrow" />
                </button>
                <button
                  type="button"
                  className="settings-menu-item"
                  onClick={() => navigate('/professional/settings')}
                >
                  <div className="settings-menu-icon settings-menu-icon-settings">
                    <Settings size={20} />
                  </div>
                  <div className="settings-menu-content">
                    <span className="settings-menu-title">Paramètres</span>
                    <span className="settings-menu-subtitle">Paramètres professionnels</span>
                  </div>
                  <ChevronRight size={20} className="settings-menu-arrow" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {professional?.user?.avatar_url && (
        <ProfilePhotoViewer
          imageUrl={professional.user.avatar_url}
          isOpen={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          alt={professional ? getUserName(professional) : 'Photo de profil'}
        />
      )}
    </ScreenLayout>
  )
}

export default ProfessionalProfileScreen

