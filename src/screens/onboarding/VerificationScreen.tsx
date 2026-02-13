import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { authService } from '../../services/auth.service'
import { usersService } from '../../services/users.service'
import { storageService } from '../../services/storage.service'
import './VerificationScreen.css'

const VerificationScreen = () => {
  const navigate = useNavigate()
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', ''])
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(59)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCodeChange = (index: number, value: string, type: 'sms' | 'email') => {
    if (value.length > 1) return
    const newCode = type === 'sms' ? [...smsCode] : [...emailCode]
    newCode[index] = value
    if (type === 'sms') {
      setSmsCode(newCode)
    } else {
      setEmailCode(newCode)
    }
    setError(null)
  }

  const handleVerify = async () => {
    const smsCodeStr = smsCode.join('')
    const emailCodeStr = emailCode.join('')

    if (smsCodeStr.length !== 6 || emailCodeStr.length !== 6) {
      setError('Veuillez entrer les codes complets')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Récupérer les données d'inscription depuis localStorage
      const signupData = localStorage.getItem('signupData')
      if (!signupData) {
        throw new Error('Données d\'inscription non trouvées')
      }

      const data = JSON.parse(signupData)
      
      // Inscription réelle auprès du backend
      const response = await authService.register({
        telephone: data.telephone,
        password: data.password,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        pays_code: data.pays_code || 'CM',
        role: data.accountType === 'Professionnel' ? 'professional' : 'client',
      })

      // Stocker les infos utilisateur
      const user = authService.getUserFromToken()
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Si une photo a été choisie pendant l'inscription, l'uploader maintenant (on a le token)
      const signupPhoto = localStorage.getItem('signupPhoto')
      if (signupPhoto) {
        try {
          // Convertir le base64 en File
          const res = await fetch(signupPhoto)
          const blob = await res.blob()
          const file = new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' })
          const avatarUrl = await storageService.uploadFile(file)
          await usersService.updateMe({ avatar_url: avatarUrl })
        } catch (photoErr) {
          console.error('Erreur upload photo profil:', photoErr)
          // Non bloquant — l'utilisateur pourra l'ajouter depuis son profil
        }
      }

      // Nettoyer les données temporaires
      localStorage.removeItem('signupData')
      localStorage.removeItem('accountType')
      localStorage.removeItem('personalInfo')
      localStorage.removeItem('signupPhoto')

      // Rediriger selon le type de compte
      if (data.accountType === 'Professionnel') {
        navigate('/signup/professional')
      } else {
        navigate('/client/home')
      }
    } catch (err: any) {
      console.error('Erreur d\'inscription:', err)
      const status = err.response?.status
      const serverMessage = err.response?.data?.message || err.response?.data?.error || ''

      if (status === 409) {
        // Compte déjà existant avec un mot de passe différent
        setError('Un compte avec ce numéro existe déjà. Essayez de vous connecter.')
      } else if (status === 401) {
        setError('Erreur d\'authentification. Vérifiez vos informations.')
      } else if (!err.response) {
        setError('Impossible de joindre le serveur. Vérifiez que le backend est démarré.')
      } else {
        setError(serverMessage || 'Erreur lors de l\'inscription. Veuillez réessayer.')
      }
      
      if (err.response?.data) {
        console.error('Détails de l\'erreur:', err.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenLayout title="Vérification" showBack>
      <div className="verification-screen">
        <div className="progress-indicator">
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot active"></div>
        </div>

        <p className="verification-instruction">Entrez le code de vérification</p>

        <div className="code-section">
          <label className="code-label">Code SMS</label>
          <div className="code-inputs">
            {smsCode.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="code-input"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value, 'sms')}
              />
            ))}
          </div>
        </div>

        <div className="code-section">
          <label className="code-label">Code Email</label>
          <div className="code-inputs">
            {emailCode.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="code-input"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value, 'email')}
              />
            ))}
          </div>
        </div>

        <p className="resend-text">Renvoyer dans 0:{countdown.toString().padStart(2, '0')}</p>

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
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default VerificationScreen

