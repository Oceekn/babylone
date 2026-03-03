import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Clock, MapPin, Star, User, Loader, Calendar } from 'lucide-react'
import { servicesService, ServiceWithProfessional } from '../../services/services.service'
import { professionalsService, Professional } from '../../services/professionals.service'
import './ServiceDetail.css'

const ServiceDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<ServiceWithProfessional | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadServiceData()
    } else {
      setError('Service introuvable')
      setLoading(false)
    }
  }, [id])

  const loadServiceData = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Charger le service avec les infos du professionnel
      const serviceData = await servicesService.getById(id)
      // Le backend renvoie déjà les relations professional et professional.user
      setService(serviceData as ServiceWithProfessional)

      // Charger les infos complètes du professionnel
      if (serviceData.professional_id) {
        try {
          const profData = await professionalsService.getById(serviceData.professional_id)
          setProfessional(profData)
        } catch (profErr) {
          // Si erreur, utiliser les infos du service si disponibles
          const dataWithProf = serviceData as ServiceWithProfessional
          if (dataWithProf.professional) {
            const prof = dataWithProf.professional
            setProfessional({
              id: serviceData.professional_id,
              user_id: serviceData.professional_id, // fallback
              profession: prof.profession,
              business_name: prof.business_name,
              pays_code: 'CM', // fallback
              is_verified: false,
              rating: 0,
              total_reviews: 0,
              is_active: true,
              user: prof.user ? {
                id: serviceData.professional_id,
                telephone: '',
                first_name: prof.user.first_name,
                last_name: prof.user.last_name,
              } : undefined,
            } as Professional)
          }
        }
      }
    } catch (err: any) {
      console.error('Erreur chargement service:', err)
      setError('Impossible de charger le service')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string = 'XAF') => {
    return `${Number(price).toLocaleString('fr-FR')} ${currency}`
  }

  const getProName = (prof: Professional | null) => {
    if (!prof) return 'Professionnel'
    if (prof.user) {
      const name = `${prof.user.first_name || ''} ${prof.user.last_name || ''}`.trim()
      return name || prof.business_name || 'Pro'
    }
    return prof.business_name || 'Professionnel'
  }

  const handleReserve = () => {
    if (!service || !professional) return

    // Stocker les données pour le flux de réservation
    localStorage.setItem('bookingFlow_professionalId', service.professional_id)
    localStorage.setItem('bookingFlow_professionalName', getProName(professional))
    
    const bookingFlow = {
      professionalId: service.professional_id,
      professionalName: getProName(professional),
      serviceId: service.id,
      serviceName: service.title,
      servicePrice: Number(service.price) || 0,
      serviceDuration: service.estimated_duration || 60,
      currency: service.currency || 'XAF',
    }
    localStorage.setItem('bookingFlow', JSON.stringify(bookingFlow))
    
    navigate('/services/booking')
  }

  const handleViewProfessional = () => {
    if (service && service.professional_id) {
      navigate(`/services/professional/${service.professional_id}`)
    }
  }

  if (loading) {
    return (
      <ScreenLayout title="Service" showBack showBottomNav>
        <div className="service-detail-loading">
          <Loader size={36} className="spin" />
          <p>Chargement...</p>
        </div>
      </ScreenLayout>
    )
  }

  if (error || !service) {
    return (
      <ScreenLayout title="Service" showBack showBottomNav>
        <div className="service-detail-error">
          <p>{error || 'Service introuvable'}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Détails du service" showBack showBottomNav>
      <div className="service-detail">
        {/* Image du service */}
        {service.image_url ? (
          <div className="service-detail-image">
            <img src={service.image_url} alt={service.title} />
          </div>
        ) : (
          <div className="service-detail-image service-detail-image-placeholder">
            <span>{service.title.charAt(0).toUpperCase()}</span>
          </div>
        )}

        {/* Informations principales */}
        <div className="service-detail-content">
          {service.category && (
            <span className="service-detail-category">{service.category}</span>
          )}
          <h1 className="service-detail-title">{service.title}</h1>
          
          <div className="service-detail-price">
            {formatPrice(Number(service.price) || 0, service.currency || 'XAF')}
          </div>

          {service.estimated_duration && (
            <div className="service-detail-meta">
              <Clock size={18} />
              <span>Durée : {service.estimated_duration} minutes</span>
            </div>
          )}

          {/* Professionnel */}
          {professional && (
            <button
              type="button"
              className="service-detail-professional"
              onClick={handleViewProfessional}
            >
              <div className="service-detail-pro-avatar">
                {professional.user?.avatar_url ? (
                  <img src={professional.user.avatar_url} alt="" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="service-detail-pro-info">
                <span className="service-detail-pro-name">{getProName(professional)}</span>
                {professional.profession && (
                  <span className="service-detail-pro-profession">{professional.profession}</span>
                )}
                {professional.rating != null && (
                  <span className="service-detail-pro-rating">
                    <Star size={14} fill="currentColor" /> {Number(professional.rating).toFixed(1)}
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Description */}
          {service.description && (
            <div className="service-detail-description">
              <h3>Description</h3>
              <p>{service.description}</p>
            </div>
          )}

          {/* Localisation si disponible */}
          {professional && (professional.address || professional.city) && (
            <div className="service-detail-location">
              <MapPin size={18} />
              <span>{professional.address || ''}{professional.address && professional.city ? ', ' : ''}{professional.city || ''}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="service-detail-actions">
          {professional && (
            <Button variant="outline" fullWidth onClick={handleViewProfessional}>
              Voir le profil
            </Button>
          )}
          <Button variant="secondary" fullWidth onClick={handleReserve} disabled={!service || !professional}>
            <Calendar size={18} /> Réserver maintenant
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ServiceDetail
