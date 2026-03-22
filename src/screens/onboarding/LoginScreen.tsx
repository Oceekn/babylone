import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Eye, EyeOff, HelpCircle, AlertCircle } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { API_CONFIG } from '../../config/api'
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
  const [showServerConfig, setShowServerConfig] = useState(false)
  const [serverUrl, setServerUrl] = useState(() => {
    const base = API_CONFIG.getApiBaseUrl()
    return base.replace(/\/api\/v1\/?$/, '') || 'http://localhost:3000'
  })

  // Nettoyer un éventuel vieux token invalide quand on arrive sur login
  useEffect(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null) // Effacer l'erreur quand l'utilisateur tape
  }

  const normalizeIdentifier = (raw: string) => {
    let identifier = raw.trim()
    if (!identifier) return ''
    // Si c'est un numero de telephone (pas un email), normaliser avec indicatif
    if (!identifier.includes('@')) {
      if (!identifier.startsWith('+')) {
        identifier = identifier.startsWith('237') ? `+${identifier}` : `+237${identifier}`
      }
    }
    return identifier
  }

  const handleLogin = async () => {
    const identifier = normalizeIdentifier(formData.emailOrPhone)
    if (!identifier || !formData.password) {
      if (!identifier && !formData.password) setError('Veuillez remplir votre email/téléphone et votre mot de passe')
      else if (!identifier) setError('Veuillez entrer votre email ou numéro de téléphone')
      else setError('Veuillez entrer votre mot de passe')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const loginResponse = await authService.login({
        telephone: identifier, // Le backend accepte email ou telephone dans ce champ
        password: formData.password
      })

      const user = loginResponse?.user ?? authService.getUserFromToken()
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Rediriger selon le rôle (comparaison insensible à la casse)
      const role = (user?.role ?? '').toString().toLowerCase()
      if (role === 'professional') {
        navigate('/professional/dashboard')
      } else {
        navigate('/client/home')
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      const status = err.response?.status
      const serverMessage = (err.response?.data?.message ?? '').toString()
      if (status === 401) {
        if (serverMessage === 'USER_NOT_FOUND') {
          setError('Email ou numéro de téléphone introuvable. Veuillez créer un compte.')
        } else if (serverMessage === 'BAD_PASSWORD') {
          setError('Mauvais mot de passe.')
        } else {
          setError('Identifiants incorrects.')
        }
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
      title="Connexion" 
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
            disabled={loading}
          />
          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="Entrez votre mot de passe"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={loading}
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
          <div className="login-error">
            <div className="login-error-text">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            {error.includes('joindre le serveur') && (
              <button
                type="button"
                className="server-config-toggle"
                onClick={() => setShowServerConfig((v) => !v)}
              >
                {showServerConfig ? 'Masquer' : "Configurer l'adresse du serveur"}
              </button>
            )}
          </div>
        )}

        {showServerConfig && (
          <div className="server-config-box">
            <Input
              label="Adresse du backend"
              placeholder="http://192.168.1.10:3000"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <p className="server-config-hint">Indiquez l&apos;IP de votre PC (ipconfig) et le port 3000. Téléphone et PC sur le même Wi‑Fi.</p>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                const url = serverUrl.trim() || 'http://localhost:3000'
                if (!url.startsWith('http')) {
                  setError('URL doit commencer par http:// ou https://')
                  return
                }
                API_CONFIG.setBackendUrl(url)
                setError(null)
                setShowServerConfig(false)
              }}
            >
              Enregistrer et réessayer
            </Button>
          </div>
        )}

        <Button variant="primary" fullWidth onClick={handleLogin} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>

        <p className="signup-prompt">
          Pas encore de compte ?{' '}
          <button type="button" className="signup-link" onClick={() => navigate('/signup/personal')}>
            S'inscrire
          </button>
        </p>
      </div>
    </ScreenLayout>
  )
}

export default LoginScreen




