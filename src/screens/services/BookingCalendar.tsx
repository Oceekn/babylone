import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import './BookingCalendar.css'

const BookingCalendar = () => {
  const navigate = useNavigate()

  const timeSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']

  return (
    <ScreenLayout title="Réserver" showBack showBottomNav>
      <div className="booking-calendar">
        <div className="calendar-tabs">
          <button className="tab active">Mois</button>
          <button className="tab">Semaine</button>
        </div>
        <div className="calendar-months">
          <div className="month-calendar">
            <h3>Mars 2024</h3>
            <div className="calendar-grid">
              {[...Array(31)].map((_, i) => (
                <div key={i} className={`calendar-day ${i === 14 ? 'selected' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="month-calendar">
            <h3>Juin 2024</h3>
            <div className="calendar-grid">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="calendar-day">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="time-selection">
          <h3>Choisissez une heure</h3>
          <div className="time-slots">
            {timeSlots.map((time, index) => (
              <button key={index} className={`time-slot ${time === '14:00' ? 'selected' : ''}`}>
                {time}
              </button>
            ))}
          </div>
        </div>
        <div className="duration-selection">
          <h3>Durée</h3>
          <div className="duration-buttons">
            <button className="duration-btn">30 min</button>
            <button className="duration-btn active">60 min</button>
          </div>
        </div>
        <div className="booking-confirmation">
          <div className="confirmation-avatar">👤</div>
          <Button variant="secondary" fullWidth onClick={() => navigate('/services/payment')}>
            Confirmer la réservation
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default BookingCalendar



