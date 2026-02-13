import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Plus, Check, Loader } from 'lucide-react'
import { servicesService, Service } from '../../services/services.service'
import './ServiceSelection.css'

const ServiceSelection = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const professionalId = searchParams.get('professionalId') || localStorage.getItem('bookingFlow_professionalId') || ''
  const preSelectedServiceId = searchParams.get('serviceId') || ''

  const [services, setServices] = useState<Service[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preSelectedServiceId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (professionalId) {
      loadServices()
    } else {
      setError('Aucun professionnel selectionne')
      setLoading(false)
    }
  }, [professionalId])

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await servicesService.getByProfessional(professionalId)
      setServices(data.filter(s => s.is_active))
      if (preSelectedServiceId) {
        setSelectedServiceId(preSelectedServiceId)
      }
    } catch (err: any) {
      console.error('Erreur chargement services:', err)
      setError('Impossible de charger les services')
    } finally {
      setLoading(false)
    }
  }

  const selectedService = services.find(s => s.id === selectedServiceId)

  const formatPrice = (price: number, currency: string = 'XAF') => {
    return `${Number(price).toLocaleString('fr-FR')} ${currency}`
  }

  const handleContinue = () => {
    if (!selectedService) return

    // Stocker les donnees du flux de reservation
    const bookingFlow = {
      professionalId,
      professionalName: localStorage.getItem('bookingFlow_professionalName') || 'Professionnel',
      serviceId: selectedService.id,
      serviceName: selectedService.title,
      servicePrice: Number(selectedService.price),
      serviceDuration: selectedService.estimated_duration || 60,
      currency: selectedService.currency || 'XAF',
    }
    localStorage.setItem('bookingFlow', JSON.stringify(bookingFlow))
    navigate('/services/booking')
  }

  return (
    <ScreenLayout title="Choisir un service" showBack showBottomNav>
      <div className="service-selection">
        {loading ? (
          <div className="loading-state">
            <Loader size={32} className="spin" />
            <p>Chargement des services...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>Aucun service disponible pour ce professionnel</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          </div>
        ) : (
          <>
            {services.map((service) => (
              <div
                key={service.id}
                className={`service-item ${selectedServiceId === service.id ? 'active' : ''}`}
                onClick={() => setSelectedServiceId(service.id)}
              >
                <div className="service-header">
                  <div>
                    <h3>{service.title}</h3>
                    {service.estimated_duration && (
                      <span className="service-duration">{service.estimated_duration} min</span>
                    )}
                  </div>
                  <button
                    className={`select-btn ${selectedServiceId === service.id ? 'selected' : ''}`}
                  >
                    {selectedServiceId === service.id ? <Check size={20} /> : <Plus size={20} />}
                  </button>
                </div>
                {service.description && (
                  <p className="service-description">{service.description}</p>
                )}
                <p className="service-price">{formatPrice(Number(service.price), service.currency)}</p>
              </div>
            ))}

            <div className="selection-footer">
              {selectedService && (
                <div className="selected-summary">
                  <span>{selectedService.title}</span>
                  <span className="summary-price">
                    {formatPrice(Number(selectedService.price), selectedService.currency)}
                  </span>
                </div>
              )}
              <Button
                variant="secondary"
                fullWidth
                onClick={handleContinue}
                disabled={!selectedServiceId}
              >
                Continuer
              </Button>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default ServiceSelection
