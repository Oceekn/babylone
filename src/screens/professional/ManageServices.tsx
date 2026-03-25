import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Edit, Trash2, Plus, Briefcase, Clock, ImageIcon } from 'lucide-react'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
import { servicesService, Service } from '../../services/services.service'
import './ManageServices.css'

const ManageServices = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await servicesService.getMyServices()
      setServices(data)
    } catch (err) {
      console.error('Erreur chargement services:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (service: Service) => {
    try {
      await servicesService.update(service.id, { is_active: !service.is_active } as any)
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s))
    } catch (err) {
      console.error('Erreur toggle service:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    try {
      await servicesService.delete(id)
      setServices(prev => prev.filter(s => s.id !== id))
      setConfirmDeleteId(null)
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  return (
    <ScreenLayout
      title="Mes services"
      rightAction={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ProfessionalInboxBell />
          <button type="button" className="manage-services-header-btn" onClick={() => navigate('/professional/services/create')}>
            <Plus size={20} strokeWidth={2.5} /> Nouveau
          </button>
        </div>
      }
      showBottomNav
    >
      <div className="manage-services">
        {loading ? (
          <div className="manage-services-loading">
            <div className="loading-dots"><span /><span /><span /></div>
            <p>Chargement...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="manage-services-empty">
            <div className="empty-illus"><Briefcase size={56} strokeWidth={1.2} /></div>
            <h2>Pas encore de service</h2>
            <p>Créez votre premier service pour apparaître dans les recherches et recevoir des réservations.</p>
            <button type="button" className="empty-cta" onClick={() => navigate('/professional/services/create')}>
              <Plus size={20} /> Créer un service
            </button>
          </div>
        ) : (
          <div className="services-list">
            {services.map((service) => (
              <div key={service.id} className={`service-item ${!service.is_active ? 'inactive' : ''}`}>
                {service.image_url ? (
                  <div className="service-thumb">
                    <img src={service.image_url} alt="" />
                  </div>
                ) : (
                  <div className="service-thumb service-thumb-placeholder">
                    <ImageIcon size={24} />
                  </div>
                )}
                <div className="service-info">
                  <h3>{service.title}</h3>
                  {service.description && <p className="service-desc">{service.description}</p>}
                  <div className="service-meta">
                    <span className="service-price">{Number(service.price).toLocaleString('fr-FR')} {service.currency || 'XAF'}</span>
                    {service.estimated_duration != null && service.estimated_duration > 0 && (
                      <span className="service-duration"><Clock size={12} /> {service.estimated_duration} min</span>
                    )}
                  </div>
                </div>
                <div className="service-actions">
                  <button
                    type="button"
                    className="action-btn action-btn-edit"
                    onClick={() => navigate(`/professional/services/create?edit=${service.id}`)}
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    className={`action-btn action-btn-delete ${confirmDeleteId === service.id ? 'confirming' : ''}`}
                    onClick={() => handleDelete(service.id)}
                    onBlur={() => setTimeout(() => setConfirmDeleteId(null), 200)}
                    title={confirmDeleteId === service.id ? 'Confirmer' : 'Supprimer'}
                  >
                    {confirmDeleteId === service.id ? 'OK?' : <Trash2 size={16} />}
                  </button>
                  <label className="toggle-wrapper">
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={service.is_active}
                      onChange={() => toggleActive(service)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default ManageServices
