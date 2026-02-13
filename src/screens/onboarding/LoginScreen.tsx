import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Eye, EyeOff, HelpCircle } from 'lucide-react'
import { authService } from '../../services/auth.service'
import './LoginScreen.css'

const LoginScreen = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Nettoyer un éventuel vieux token invalide quand on arrive sur login
  useEffect(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null) // Effacer l'erreur quand l'utilisateur tape
  }

  const handleLogin = async () => {
    if (!formData.emailOrPhone || !formData.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let identifier = formData.emailOrPhone.trim()

      // Si c'est un numero de telephone (pas un email), normaliser avec indicatif
      if (!identifier.includes('@')) {
        if (!identifier.startsWith('+')) {
          identifier = identifier.startsWith('237') ? `+${identifier}` : `+237${identifier}`
        }
      }

      const response = await authService.login({
        telephone: identifier, // Le backend accepte email ou telephone dans ce champ
        password: formData.password
      })

      // Stocker les infos utilisateur
      const user = authService.getUserFromToken()
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Rediriger selon le rôle
      if (user?.role === 'professional') {
        navigate('/professional/dashboard')
      } else {
        navigate('/client/home')
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      const status = err.response?.status
      if (status === 401) {
        setError('Identifiants incorrects. Vérifiez votre numéro et mot de passe.')
      } else if (!err.response) {
        setError('Impossible de joindre le serveur. Vérifiez que le backend est démarré (port 3000).')
      } else {
        setError(err.response?.data?.message || 'Erreur de connexion. Réessayez.')
      }
    } finally {
      setLoading(false)
    }
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

        {error && (
          <div style={{ 
            color: '#FF3131', 
            fontSize: '14px', 
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <Button 
          variant="primary" 
          fullWidth 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
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




