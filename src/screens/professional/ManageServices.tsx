import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import './ManageServices.css'

const ManageServices = () => {
  const navigate = useNavigate()

  const services = [
    { id: 1, name: 'Coiffure', price: '1000 XAF', active: true },
    { id: 2, name: 'Maquillage', price: '3000 XAF', active: true },
    { id: 3, name: 'Manucure', price: '2000 XAF', active: true },
    { id: 4, name: 'Pédicure', price: '2000 XAF', active: true },
    { id: 5, name: 'Massage', price: '5000 XAF', active: true },
    { id: 6, name: 'Soin du visage', price: '7000 XAF', active: true }
  ]

  return (
    <ScreenLayout
      title="Services"
      rightAction={<Button variant="primary" onClick={() => navigate('/professional/services/create')}>Ajouter un service</Button>}
      showBottomNav
    >
      <div className="manage-services">
        <div className="services-list">
          {services.map((service) => (
            <div key={service.id} className="service-item">
              <div className="service-info">
                <h3>{service.name}</h3>
                <p>{service.price}</p>
              </div>
              <input type="checkbox" className="toggle-switch" defaultChecked={service.active} />
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ManageServices



