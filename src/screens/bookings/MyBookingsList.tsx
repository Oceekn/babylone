import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import './MyBookingsList.css'

const MyBookingsList = () => {
  const navigate = useNavigate()

  const bookings = [
    { id: 1, professional: 'Marie Dubois', service: 'Coiffure à domicile', status: 'En attente', avatar: '👤' },
    { id: 2, professional: 'Jean-Pierre', service: 'Réparation de téléphone', status: 'En attente', avatar: '👤' }
  ]

  return (
    <ScreenLayout title="Mes réservations" showBack showBottomNav>
      <div className="my-bookings">
        <div className="booking-tabs">
          <button className="tab">En attente</button>
          <button className="tab active">Confirmées</button>
          <button className="tab">En cours</button>
          <button className="tab">Terminées</button>
        </div>
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card" onClick={() => navigate(`/bookings/${booking.id}`)}>
              <div className="booking-info">
                <span className="booking-status">{booking.status}</span>
                <h3>{booking.professional}</h3>
                <p>{booking.service}</p>
                <Button variant="outline" className="contact-btn">Contacter</Button>
              </div>
              <div className="booking-avatar">{booking.avatar}</div>
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default MyBookingsList



