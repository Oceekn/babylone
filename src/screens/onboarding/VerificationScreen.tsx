import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { authService } from '../../services/auth.service'
import { usersService } from '../../services/users.service'
import { storageService } from '../../services/storage.service'
import './VerificationScreen.css'

type VerificationMethod = 'SMS' | 'Email'

const VerificationScreen = () => {
  const navigate = useNavigate()
  const [method, setMethod] = useState<VerificationMethod>('Email')
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', ''])
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(59)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!codeSent || countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [codeSent, countdown])

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

  const handleSendCode = async () => {
    const signupData = localStorage.getItem('signupData')
    if (!signupData) {
      setError('Données d\'inscription non trouvées. Retournez à l\'étape précédente.')
      return
    }
    const data = JSON.parse(signupData)
    const telephone = data.telephone || ''
    const email = data.email || ''

    if (method === 'SMS' && !telephone) {
      setError('Numéro de téléphone manquant.')
      return
    }
    if (method === 'Email' && !email) {
      setError('Adresse email manquante.')
      return
    }

    setSendingCode(true)
    setError(null)
    try {
      await authService.sendSignupCode(method, telephone, method === 'Email' ? email : undefined)
      setCodeSent(true)
      setCountdown(59)
    } catch (err: any) {
      const msg = err.response?.data?.message
      const noResponse = !err.response
      setError(
        msg ||
        (noResponse
          ? 'Impossible de joindre le serveur. Vérifiez votre connexion et que le backend est démarré (port 3000).'
          : 'Impossible d\'envoyer le code. Réessayez.')
      )
    } finally {
      setSendingCode(false)
    }
  }

  const handleResendCode = () => {
    if (countdown > 0) return
    handleSendCode()
  }

  const handleVerify = async () => {
    const code = method === 'SMS' ? smsCode.join('') : emailCode.join('')
    if (code.length !== 6) {
      setError(`Veuillez entrer le code ${method === 'SMS' ? 'SMS' : 'email'} complet (6 chiffres)`)
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
      const code = method === 'SMS' ? smsCode.join('') : emailCode.join('')

      // Inscription réelle auprès du backend (avec code de vérification si email)
      await authService.register({
        telephone: data.telephone,
        password: data.password,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        pays_code: data.pays_code || 'CM',
        role: data.accountType === 'Professionnel' ? 'professional' : 'client',
        ...(method === 'Email' && code ? { verification_code: code } : {}),
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

        <div className="method-selector">
          <label className={`method-option ${method === 'SMS' ? 'active' : ''}`}>
            <input
              type="radio"
              name="verif-method"
              value="SMS"
              checked={method === 'SMS'}
              onChange={() => { setMethod('SMS'); setCodeSent(false); setError(null) }}
            />
            <span>Par SMS</span>
          </label>
          <label className={`method-option ${method === 'Email' ? 'active' : ''}`}>
            <input
              type="radio"
              name="verif-method"
              value="Email"
              checked={method === 'Email'}
              onChange={() => { setMethod('Email'); setCodeSent(false); setError(null) }}
            />
            <span>Par email</span>
          </label>
        </div>

        {!codeSent ? (
          <Button
            variant="primary"
            fullWidth
            onClick={handleSendCode}
            disabled={sendingCode}
          >
            {sendingCode ? 'Envoi en cours...' : 'Envoyer le code'}
          </Button>
        ) : (
          <>
            {method === 'SMS' && (
              <div className="code-section">
                <label className="code-label">Code SMS</label>
                <div className="code-inputs">
                  {smsCode.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="code-input"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''), 'sms')}
                    />
                  ))}
                </div>
              </div>
            )}

            {method === 'Email' && (
              <div className="code-section">
                <label className="code-label">Code email</label>
                <div className="code-inputs">
                  {emailCode.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="code-input"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''), 'email')}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="resend-text">
              {countdown > 0 ? (
                <>Renvoyer dans 0:{countdown.toString().padStart(2, '0')}</>
              ) : (
                <button type="button" className="resend-link" onClick={handleResendCode}>
                  Renvoyer le code
                </button>
              )}
            </p>
          </>
        )}

        {error && (
          <div className="verification-error">
            {error}
          </div>
        )}

        {codeSent && (
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </Button>
        )}
      </div>
    </ScreenLayout>
  )
}

export default VerificationScreen

