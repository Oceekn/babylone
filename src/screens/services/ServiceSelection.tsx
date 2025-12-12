import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Plus, Check } from 'lucide-react'
import './ServiceSelection.css'

const ServiceSelection = () => {
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState(0)
  const [addons, setAddons] = useState<number[]>([])

  const services = [
    {
      id: 1,
      name: 'Massage relaxant',
      duration: '60 min',
      description: 'Massage relaxant pour soulager le stress et la tension',
      price: '15 000 XAF'
    }
  ]

  const addonServices = [
    { id: 1, name: 'Huile essentielle', price: '5 000 XAF' },
    { id: 2, name: 'Massage des pieds', price: '10 000 XAF' }
  ]

  return (
    <ScreenLayout title="Select a service" showBack showBottomNav>
      <div className="service-selection">
        {services.map((service) => (
          <div key={service.id} className="service-item">
            <div className="service-header">
              <div>
                <h3>{service.name}</h3>
                <span className="service-duration">{service.duration}</span>
              </div>
              <button
                className={`select-btn ${selectedService === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {selectedService === service.id ? <Check size={20} /> : <Plus size={20} />}
              </button>
            </div>
            <p className="service-description">{service.description}</p>
            <p className="service-price">{service.price}</p>
          </div>
        ))}
        <div className="addons-section">
          <h3>Add-ons</h3>
          {addonServices.map((addon) => (
            <label key={addon.id} className="addon-item">
              <input
                type="checkbox"
                checked={addons.includes(addon.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAddons([...addons, addon.id])
                  } else {
                    setAddons(addons.filter(id => id !== addon.id))
                  }
                }}
              />
              <div className="addon-info">
                <span>{addon.name}</span>
                <span className="addon-price">({addon.price})</span>
              </div>
            </label>
          ))}
        </div>
        <Button variant="secondary" fullWidth onClick={() => navigate('/services/booking')}>
          Continuer
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default ServiceSelection

