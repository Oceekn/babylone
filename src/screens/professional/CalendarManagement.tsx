import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import ProfessionalInboxBell from '../../components/professional/ProfessionalInboxBell'
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Loader } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './CalendarManagement.css'

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirme',
  in_progress: 'En cours',
  completed: 'Termine',
  cancelled: 'Annule',
  rejected: 'Refuse',
}

const statusClasses: Record<string, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  in_progress: 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
  rejected: 'cancelled',
}

const CalendarManagement = () => {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingsService.getReceivedBookings()
      setBookings(data)
    } catch (err) {
      console.error('Erreur chargement calendrier:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const hasBooking = (day: number) => {
    return bookings.some(b => {
      const d = new Date(b.scheduled_at)
      return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
    })
  }

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear()
  }

  const dayBookings = bookings.filter(b => {
    const d = new Date(b.scheduled_at)
    return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const getClientName = (b: Booking) => {
    if (b.client) return `${b.client.first_name || ''} ${b.client.last_name || ''}`.trim() || 'Client'
    return 'Client'
  }

  return (
    <ScreenLayout title="Calendrier" showBack showBottomNav rightAction={<ProfessionalInboxBell />}>
      <div className="calendar-management">
        <div className="month-selector">
          <button onClick={prevMonth}><ChevronLeft size={20} /></button>
          <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
          <button onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>

        <div className="calendar-view">
          <div className="calendar-header">
            {dayNames.map((d) => (
              <div key={d} className="day-header">{d}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {[...Array(getFirstDayOfMonth(currentMonth))].map((_, i) => (
              <div key={`e-${i}`} className="calendar-day empty" />
            ))}
            {[...Array(getDaysInMonth(currentMonth))].map((_, i) => {
              const day = i + 1
              return (
                <div
                  key={day}
                  className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${hasBooking(day) ? 'has-booking' : ''}`}
                  onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                >
                  {day}
                  {hasBooking(day) && <span className="booking-dot" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="appointments-section">
          <h3>{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Loader size={24} className="spin" />
            </div>
          ) : dayBookings.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>Aucune reservation ce jour</p>
          ) : (
            dayBookings.map((b) => (
              <div
                key={b.id}
                className="appointment-item"
                onClick={() => navigate(`/professional/bookings/active/${b.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <p className="appointment-service">{b.service?.title || 'Service'} - {getClientName(b)}</p>
                  <p className="appointment-time">
                    <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {new Date(b.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {b.duration_minutes && ` (${b.duration_minutes} min)`}
                  </p>
                </div>
                <div className={`appointment-status ${statusClasses[b.status] || ''}`}>
                  {b.status === 'completed' && <CheckCircle size={16} />}
                  <span>{statusLabels[b.status] || b.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default CalendarManagement
