import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Loader, Edit, Trash2 } from 'lucide-react'
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
      title="Services"
      rightAction={<Button variant="primary" onClick={() => navigate('/professional/services/create')}>Ajouter</Button>}
      showBottomNav
    >
      <div className="manage-services">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={32} className="spin" />
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#888', marginBottom: '16px' }}>Aucun service. Ajoutez votre premier service.</p>
            <Button variant="primary" onClick={() => navigate('/professional/services/create')}>Ajouter un service</Button>
          </div>
        ) : (
          <div className="services-list">
            {services.map((service) => (
              <div key={service.id} className={`service-item ${!service.is_active ? 'inactive' : ''}`}>
                <div className="service-info">
                  <h3>{service.title}</h3>
                  <p>{Number(service.price).toLocaleString('fr-FR')} {service.currency || 'XAF'}</p>
                  {service.estimated_duration && <span className="duration">{service.estimated_duration} min</span>}
                </div>
                <div className="service-actions">
                  <button className="icon-btn" onClick={() => navigate(`/professional/services/create?edit=${service.id}`)}>
                    <Edit size={16} />
                  </button>
                  <button
                    className={`icon-btn danger ${confirmDeleteId === service.id ? 'confirming' : ''}`}
                    onClick={() => handleDelete(service.id)}
                    onBlur={() => setConfirmDeleteId(null)}
                    title={confirmDeleteId === service.id ? 'Cliquer pour confirmer' : 'Supprimer'}
                  >
                    {confirmDeleteId === service.id ? <span style={{ fontSize: '11px' }}>OK?</span> : <Trash2 size={16} />}
                  </button>
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      className="toggle-switch"
                      checked={service.is_active}
                      onChange={() => toggleActive(service)}
                    />
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
