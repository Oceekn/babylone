import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Eye, EyeOff, HelpCircle } from 'lucide-react'
import './LoginScreen.css'

const LoginScreen = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = () => {
    navigate('/client/home')
  }

  return (
    <ScreenLayout 
      title="Babylone" 
      showBack 
      rightAction={<HelpCircle size={24} />}
    >
      <div className="login-screen">
        <h2 className="welcome-text">Bienvenue</h2>

        <div className="form-section">
          <Input
            label="Email ou téléphone"
            placeholder="Entrez votre email ou téléphone"
            value={formData.emailOrPhone}
            onChange={(e) => handleInputChange('emailOrPhone', e.target.value)}
          />
          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="Entrez votre mot de passe"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>

        <button className="forgot-password" onClick={() => navigate('/password-recovery')}>
          Mot de passe oublié?
        </button>

        <Button variant="primary" fullWidth onClick={handleLogin}>
          Se connecter
        </Button>

        <div className="social-login-section">
          <p className="social-separator">Ou connectez-vous avec</p>
          <p className="social-note">Disponible après première connexion</p>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default LoginScreen



