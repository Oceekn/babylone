import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { authService } from '../../services/auth.service'
import './PasswordRecoveryScreen.css'

type Step = 'request' | 'verify' | 'newPassword' | 'success'

const PasswordRecoveryScreen = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')
  const [method, setMethod] = useState<'SMS' | 'Email'>('SMS')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestReset = async () => {
    if (!identifier.trim()) {
      setError(method === 'SMS' ? 'Veuillez entrer votre numero de telephone' : 'Veuillez entrer votre email')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await authService.requestPasswordReset(identifier.trim())
      if (result.reset_token) {
        setResetToken(result.reset_token)
      }
      setStep('verify')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la demande de reinitialisation'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = () => {
    if (!code.trim() || code.length < 4) {
      setError('Veuillez entrer le code de verification')
      return
    }
    setError(null)
    setStep('newPassword')
  }

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('Veuillez entrer un nouveau mot de passe')
      return
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authService.resetPassword(resetToken, code, newPassword)
      setStep('success')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la reinitialisation'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenLayout title="Reinitialiser le mot de passe" showBack>
      <div className="password-recovery">

        {/* ETAPE 1 : Choisir la methode et entrer l'identifiant */}
        {step === 'request' && (
          <>
            <p className="recovery-description">
              Entrez votre numero de telephone ou email pour recevoir un code de verification.
            </p>

            <div className="method-selector">
              <label className={`method-option ${method === 'SMS' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="method"
                  value="SMS"
                  checked={method === 'SMS'}
                  onChange={() => { setMethod('SMS'); setIdentifier(''); setError(null) }}
                />
                <span>SMS</span>
              </label>
              <label className={`method-option ${method === 'Email' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="method"
                  value="Email"
                  checked={method === 'Email'}
                  onChange={() => { setMethod('Email'); setIdentifier(''); setError(null) }}
                />
                <span>Email</span>
              </label>
            </div>

            {method === 'SMS' ? (
              <Input
                label="Numero de telephone"
                type="tel"
                placeholder="+237XXXXXXXXX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            ) : (
              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            )}

            {error && (
              <div className="recovery-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button variant="primary" fullWidth onClick={handleRequestReset} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader size={16} className="spin" /> Envoi en cours...
                </span>
              ) : (
                'Envoyer le code'
              )}
            </Button>

            <div style={{ textAlign: 'center' }}>
              <button className="link-btn" onClick={() => navigate('/login')}>
                Retour a la connexion
              </button>
            </div>
          </>
        )}

        {/* ETAPE 2 : Entrer le code de verification */}
        {step === 'verify' && (
          <>
            <p className="recovery-description">
              Un code de verification a ete envoye. Entrez-le ci-dessous.
            </p>

            <div className="code-hint">
              Code MVP : 123456
            </div>

            <Input
              label="Code de verification"
              type="text"
              placeholder="Entrez le code a 6 chiffres"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            {error && (
              <div className="recovery-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button variant="primary" fullWidth onClick={handleVerifyCode}>
              Verifier le code
            </Button>

            <div style={{ textAlign: 'center' }}>
              <button className="link-btn" onClick={() => { setStep('request'); setError(null) }}>
                Renvoyer le code
              </button>
            </div>
          </>
        )}

        {/* ETAPE 3 : Nouveau mot de passe */}
        {step === 'newPassword' && (
          <>
            <p className="recovery-description">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>

            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="Au moins 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Retapez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <div className="recovery-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button variant="primary" fullWidth onClick={handleResetPassword} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader size={16} className="spin" /> Reinitialisation...
                </span>
              ) : (
                'Reinitialiser le mot de passe'
              )}
            </Button>
          </>
        )}

        {/* ETAPE 4 : Succes */}
        {step === 'success' && (
          <div className="recovery-success">
            <CheckCircle size={48} color="#4CAF50" />
            <h2>Mot de passe reinitialise</h2>
            <p>Votre mot de passe a ete modifie avec succes. Vous etes maintenant connecte.</p>
            <Button variant="primary" fullWidth onClick={() => navigate('/client/home')}>
              Aller a l'accueil
            </Button>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default PasswordRecoveryScreen
