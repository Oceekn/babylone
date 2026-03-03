import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import { bookingsService, Booking } from '../../services/bookings.service'
import './RescheduleBooking.css'

const RescheduleBooking = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      bookingsService.getById(id).then(setBooking).catch(() => setBooking(null)).finally(() => setLoading(false))
    }
  }, [id])

  useEffect(() => {
    if (!booking?.professional_id || !selectedDate) {
      setAvailableSlots([])
      return
    }
    setSelectedTime(null)
    const dateStr = selectedDate.getFullYear() + '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(selectedDate.getDate()).padStart(2, '0')
    setLoadingSlots(true)
    bookingsService.getAvailability(booking.professional_id, dateStr)
      .then((slots) => setAvailableSlots(slots.map((s) => s.time)))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [booking?.professional_id, selectedDate])

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return d === 0 ? 6 : d - 1
  }
  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
  }
  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }
  const isSelected = (day: number) =>
    selectedDate
      ? day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear()
      : false

  const monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const handleConfirm = async () => {
    if (!id || !booking || !selectedDate || !selectedTime) return
    const [h, m] = selectedTime.split(':').map(Number)
    const scheduledAt = new Date(selectedDate)
    scheduledAt.setHours(h, m, 0, 0)
    setSubmitting(true)
    setError(null)
    try {
      await bookingsService.reschedule(id, scheduledAt.toISOString())
      navigate(`/bookings/${id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de reporter la reservation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !booking) {
    return (
      <ScreenLayout title="Reporter" showBack showBottomNav>
        <div className="reschedule-loading">
          <Loader size={32} className="spin" />
          <p>Chargement...</p>
        </div>
      </ScreenLayout>
    )
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return (
      <ScreenLayout title="Reporter" showBack showBottomNav>
        <div className="reschedule-error">
          <p>Cette reservation ne peut plus etre reportee.</p>
          <Button variant="outline" onClick={() => navigate(`/bookings/${id}`)}>Retour</Button>
        </div>
      </ScreenLayout>
    )
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)

  return (
    <ScreenLayout title="Reporter la reservation" showBack showBottomNav>
      <div className="reschedule-booking">
        <div className="reschedule-info">
          <p><strong>{booking.service?.title || 'Service'}</strong></p>
          <p className="reschedule-pro">
            {booking.professional?.user
              ? `${booking.professional.user.first_name || ''} ${booking.professional.user.last_name || ''}`.trim() || booking.professional.business_name
              : booking.professional?.business_name || 'Professionnel'}
          </p>
        </div>

        <div className="calendar-navigation">
          <button type="button" className="nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
            <ChevronLeft size={20} />
          </button>
          <span className="month-label">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button type="button" className="nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="reschedule-calendar-grid">
          {dayNames.map((d) => <div key={d} className="day-header">{d}</div>)}
          {[...Array(firstDay)].map((_, i) => <div key={`e-${i}`} className="calendar-day empty" />)}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1
            return (
              <div
                key={day}
                className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${isPast(day) ? 'past' : ''}`}
                onClick={() => !isPast(day) && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              >
                {day}
              </div>
            )
          })}
        </div>

        {selectedDate && (
          <div className="time-selection">
            <h3>Nouvelle heure</h3>
            {loadingSlots ? (
              <div className="time-slots-loading"><Loader size={24} className="spin" /> Chargement...</div>
            ) : availableSlots.length === 0 ? (
              <p className="time-slots-empty">Aucun creneau disponible ce jour.</p>
            ) : (
              <div className="time-slots">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="reschedule-err">{error}</p>}

        <Button
          variant="secondary"
          fullWidth
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || submitting}
        >
          {submitting ? <><Loader size={18} className="spin" /> Enregistrement...</> : 'Confirmer le report'}
        </Button>

        <Button variant="outline" fullWidth onClick={() => navigate(`/bookings/${id}`)}>
          Annuler
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default RescheduleBooking
