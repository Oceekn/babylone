import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import './CalendarManagement.css'

const CalendarManagement = () => {
  return (
    <ScreenLayout title="Calendar" showBack showBottomNav>
      <div className="calendar-management">
        <div className="month-selector">
          <button><ChevronLeft size={20} /></button>
          <h3>October 2024</h3>
          <button><ChevronRight size={20} /></button>
        </div>
        <div className="calendar-view">
          <div className="calendar-header">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="day-header">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {[...Array(31)].map((_, i) => (
              <div key={i} className={`calendar-day ${i === 3 ? 'selected' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="appointments-section">
          <h3>October 22, 2024</h3>
          <div className="appointment-item">
            <div>
              <p className="appointment-service">Haircut</p>
              <p className="appointment-time">10:00 AM - 11:00 AM</p>
            </div>
            <div className="appointment-status confirmed">
              <CheckCircle size={16} />
              <span>Confirmed</span>
            </div>
          </div>
          <div className="appointment-item">
            <div>
              <p className="appointment-service">Manicure</p>
              <p className="appointment-time">1:00 PM - 2:00 PM</p>
            </div>
            <div className="appointment-status pending">
              <span className="status-dot"></span>
              <span>Pending</span>
            </div>
          </div>
          <div className="appointment-item">
            <div>
              <p className="appointment-service">Massage</p>
              <p className="appointment-time">3:00 PM - 4:00 PM</p>
            </div>
            <div className="appointment-status completed">
              <CheckCircle size={16} />
              <span>Completed</span>
            </div>
          </div>
        </div>
        <Button variant="primary" fullWidth>Block a time slot</Button>
      </div>
    </ScreenLayout>
  )
}

export default CalendarManagement



