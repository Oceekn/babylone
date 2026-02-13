import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { CheckCircle, ChevronRight, Camera, User, Image } from 'lucide-react'
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

  useEffect(() => {
    loadProfessionalData()
  }, [])

  const loadProfessionalData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger le profil professionnel
      const profData = await professionalsService.getMyProfile()
      setProfessional(profData)

      // Charger les services
      const servicesData = await servicesService.getMyServices()
      setServices(servicesData)
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err)
      setError('Erreur lors du chargement des données')
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `Rejoint ${date.getFullYear()}`
  }

  const formatPrice = (price: number, currency: string = 'XAF') => {
    return `À partir de ${price.toLocaleString('fr-FR')} ${currency}`
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
      setProfessional(profData)
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
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Chargement...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#FF3131' }}>
            <p>{error}</p>
            <Button variant="outline" onClick={loadProfessionalData} style={{ marginTop: '10px' }}>
              Réessayer
            </Button>
          </div>
        ) : professional ? (
          <>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
              onChange={onAvatarChange}
            />
            <div className="profile-header">
              <button
                type="button"
                className="prof-avatar-large prof-avatar-btn"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Changer la photo de profil"
              >
                {professional.user?.avatar_url ? (
                  <img
                    src={professional.user.avatar_url}
                    alt={getUserName(professional)}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={40} />
                )}
                <span className="prof-avatar-camera"><Camera size={20} /></span>
              </button>
              {uploadingAvatar && <span className="prof-avatar-loading">Envoi...</span>}
              <div className="prof-details">
                <h2>{getUserName(professional)}</h2>
                <p>@{professional.city || professional.pays_code}</p>
                <p className="join-date">{formatDate(professional.created_at)}</p>
              </div>
            </div>
          </>
        ) : null}
        <div className="business-info">
          <h3>Informations professionnelles</h3>
          {professional && (
            <div className="business-details">
              {professional.profession && <p><strong>Metier :</strong> {professional.profession}</p>}
              {professional.business_name && <p><strong>Nom commercial :</strong> {professional.business_name}</p>}
              {professional.address && <p><strong>Adresse :</strong> {professional.address}{professional.city ? `, ${professional.city}` : ''}</p>}
              {professional.description && <p><strong>Description :</strong> {professional.description}</p>}
            </div>
          )}
        </div>
            <div className="documents-section">
              <h3>Documents</h3>
              <div className="document-item">
                <span>CNI</span>
                <div className={`doc-status ${professional?.cni_document_url && professional?.is_verified ? 'verified' : 'pending'}`}>
                  {professional?.cni_document_url && professional?.is_verified ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Vérifié</span>
                    </>
                  ) : (
                    <>
                      <span className="status-dot"></span>
                      <span>{professional?.cni_document_url ? 'En attente' : 'Non uploadé'}</span>
                    </>
                  )}
                </div>
              </div>
              <input
                ref={cniInputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                onChange={onCniChange}
              />
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => cniInputRef.current?.click()}
                disabled={uploadingCni}
              >
                {uploadingCni ? 'Envoi en cours...' : professional?.cni_document_url ? 'Mettre a jour le document' : 'Uploader le document'}
              </Button>
            </div>
        <div className="gallery-section">
          <h3>Galerie</h3>
          <div className="gallery-grid">
            {services.filter(s => s.image_url).length > 0 ? (
              services.filter(s => s.image_url).map((s) => (
                <div key={s.id} className="gallery-item">
                  <img src={s.image_url!} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#999' }}>
                <Image size={32} />
                <p style={{ marginTop: '8px', fontSize: '14px' }}>Ajoutez des photos de vos services</p>
              </div>
            )}
          </div>
          <Button variant="outline" fullWidth onClick={() => navigate('/professional/services')}>
            Gerer les photos
          </Button>
        </div>
            <input
              ref={serviceImageInputRef}
              type="file"
              accept="image/*"
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
              onChange={onServiceImageChange}
            />
            <div className="pricing-section">
              <h3>Tarification / Photos de vos prestations</h3>
              {services.length > 0 ? (
                services.slice(0, 3).map((service) => (
                  <div
                    key={service.id}
                    className="pricing-item pricing-item-with-photo"
                  >
                    <div className="pricing-item-photo" onClick={() => navigate(`/professional/services?serviceId=${service.id}`)}>
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.title} />
                      ) : (
                        <div className="pricing-item-photo-placeholder">
                          <Camera size={24} />
                        </div>
                      )}
                    </div>
                    <div
                      className="pricing-item-info"
                      onClick={() => navigate(`/professional/services?serviceId=${service.id}`)}
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      <p className="service-name">{service.title}</p>
                      <p className="service-price">
                        {formatPrice(Number(service.price), service.currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="pricing-item-upload-btn"
                      onClick={(e) => { e.stopPropagation(); openServiceImageUpload(service.id); }}
                      disabled={uploadingServiceId === service.id}
                      title="Ajouter / changer la photo du service"
                    >
                      {uploadingServiceId === service.id ? '...' : <Camera size={18} />}
                    </button>
                    <ChevronRight size={20} />
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ color: '#666', marginBottom: '12px' }}>Aucun service configuré</p>
                  <Button 
                    variant="outline" 
                    fullWidth
                    onClick={() => navigate('/professional/services/create')}
                  >
                    Créer un service
                  </Button>
                </div>
              )}
              {services.length > 3 && (
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={() => navigate('/professional/services')}
                >
                  Voir tous les services
                </Button>
              )}
            </div>
        <div className="settings-section" style={{ marginTop: '24px' }}>
          <div 
            className="setting-item"
            onClick={() => navigate('/professional/reviews')}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'transparent', borderRadius: '0', border: 'none', marginBottom: '12px' }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-dark)' }}>Avis et commentaires</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--dark-grey)' }}>Gérer vos avis clients</p>
            </div>
            <ChevronRight size={20} />
          </div>
          <div 
            className="setting-item"
            onClick={() => navigate('/professional/settings')}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'transparent', borderRadius: '0', border: 'none' }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-dark)' }}>Paramètres</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--dark-grey)' }}>Paramètres professionnels</p>
            </div>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalProfileScreen

