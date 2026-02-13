import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './BookingCalendar.css'

interface BookingFlow {
  professionalId: string
  professionalName: string
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  currency: string
}

const BookingCalendar = () => {
  const navigate = useNavigate()
  const [bookingFlow, setBookingFlow] = useState<BookingFlow | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('bookingFlow')
    if (stored) {
      setBookingFlow(JSON.parse(stored))
    } else {
      navigate('/services')
    }
  }, [])

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1 // Lundi = 0
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const handleDayClick = (day: number) => {
    if (isPast(day)) return
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const monthNames = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ]

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !bookingFlow) return

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const scheduledAt = new Date(selectedDate)
    scheduledAt.setHours(hours, minutes, 0, 0)

    const updatedFlow = {
      ...bookingFlow,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: bookingFlow.serviceDuration,
      notes,
      address,
    }
    localStorage.setItem('bookingFlow', JSON.stringify(updatedFlow))
    navigate('/services/payment')
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)

  return (
    <ScreenLayout title="Reserver" showBack showBottomNav>
      <div className="booking-calendar">
        {bookingFlow && (
          <div className="booking-service-info">
            <h3>{bookingFlow.serviceName}</h3>
            <p>{bookingFlow.serviceDuration} min - {Number(bookingFlow.servicePrice).toLocaleString('fr-FR')} {bookingFlow.currency}</p>
          </div>
        )}

        <div className="calendar-navigation">
          <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
          <span className="month-label">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={nextMonth} className="nav-btn"><ChevronRight size={20} /></button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(d => (
            <div key={d} className="day-header">{d}</div>
          ))}
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty" />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1
            return (
              <div
                key={day}
                className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${isPast(day) ? 'past' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </div>
            )
          })}
        </div>

        {selectedDate && (
          <>
            <div className="time-selection">
              <h3>Choisissez une heure</h3>
              <div className="time-slots">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-extras">
              <div className="form-group">
                <label>Adresse (optionnel)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Lieu du rendez-vous"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informations supplementaires..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>
          </>
        )}

        <div className="booking-confirmation">
          {selectedDate && selectedTime && (
            <div className="selected-datetime">
              <p>
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' a '}{selectedTime}
              </p>
            </div>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            Confirmer la reservation
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default BookingCalendar
