import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Phone, PhoneOff } from 'lucide-react'
import './CallScreen.css'

const CallScreen = () => {
  const navigate = useNavigate()

  return (
    <ScreenLayout>
      <div className="call-screen">
        <div className="call-top-section">
          <div className="call-video-frame">
            <div className="video-placeholder">👤</div>
          </div>
          <div className="call-controls-top">
            <button className="call-btn answer">
              <Phone size={24} />
            </button>
            <button className="call-btn hangup" onClick={() => navigate(-1)}>
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
        <div className="call-bottom-section">
          <div className="caller-info">
            <h2 className="caller-name">Aisha Njoya</h2>
            <p className="call-duration">00:05</p>
          </div>
          <div className="call-controls-bottom">
            <button className="control-btn">Mute</button>
            <button className="control-btn">Video</button>
            <button className="control-btn active">Speaker</button>
            <button className="control-btn hangup-btn">End Call</button>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default CallScreen



