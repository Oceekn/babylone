import { useRef, useState } from 'react'
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
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const codeRefs = useRef<Array<HTMLInputElement | null>>([])
  const digitsOnly = (s: string) => (s || '').replace(/\D/g, '')
  const code = codeDigits.join('')

  const focusCode = (idx: number) => {
    const el = codeRefs.current[idx]
    el?.focus()
    el?.select?.()
  }

  const handleCodeChange = (index: number, value: string) => {
    const v = digitsOnly(value).slice(0, 1)
    const next = [...codeDigits]
    next[index] = v
    setCodeDigits(next)
    setError(null)
    if (v && index < next.length - 1) focusCode(index + 1)
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (codeDigits[index]) {
        const next = [...codeDigits]
        next[index] = ''
        setCodeDigits(next)
        setError(null)
        e.preventDefault()
        return
      }
      if (index > 0) {
        focusCode(index - 1)
        e.preventDefault()
      }
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = digitsOnly(e.clipboardData.getData('text'))
    if (!text) return
    e.preventDefault()
    const next = [...codeDigits]
    for (let i = 0; i < next.length; i++) next[i] = text[i] ?? ''
    setCodeDigits(next)
    setError(null)
    const lastFilled = Math.min(text.length, next.length) - 1
    focusCode(Math.max(0, Math.min(next.length - 1, lastFilled >= 0 ? lastFilled : 0)))
  }

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
    if (!code.trim() || code.length !== 6) {
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

            <div className="code-section">
              <label className="code-label">Code de verification</label>
              <div className="code-inputs">
                {codeDigits.map((d, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="code-input"
                    value={d}
                    ref={(el) => { codeRefs.current[i] = el }}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    onPaste={i === 0 ? handleCodePaste : undefined}
                  />
                ))}
              </div>
              <div className="code-hint" style={{ marginTop: 10 }}>
                Astuce : vous pouvez coller le code d'un seul coup.
              </div>
            </div>

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
