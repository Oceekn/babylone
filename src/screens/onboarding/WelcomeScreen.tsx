import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import './WelcomeScreen.css'

const WelcomeScreen = () => {
  const navigate = useNavigate()

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo-container">
          <div className="babylone-logo">
            <img src="/logo.png" alt="BABYLONE Logo" className="logo-image" />
          </div>
          <h1 className="app-title">BABYLONE</h1>
          <p className="app-subtitle">Messagerie Social Services</p>
        </div>

        <div className="welcome-actions">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Se connecter
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/signup/personal')}
            className="create-account-btn"
          >
            Créer un compte
          </Button>
        </div>

        <div className="language-selector">
          <button className="lang-button">FR/EN</button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

