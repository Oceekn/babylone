import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Briefcase, User } from 'lucide-react'
import './SignUpContact.css'

// Fonction pour calculer la force du mot de passe
const calculatePasswordStrength = (password: string): { score: number; level: 'weak' | 'medium' | 'strong' | 'very-strong'; label: string; color: string } => {
  if (!password) {
    return { score: 0, level: 'weak', label: '', color: '#E0E0E0' }
  }

  let score = 0
  const checks = {
    length: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  // Calcul du score
  if (checks.length) score += 20
  if (checks.hasLowercase) score += 20
  if (checks.hasUppercase) score += 20
  if (checks.hasNumber) score += 20
  if (checks.hasSpecial) score += 20

  // Bonus pour longueur supplémentaire
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  // Limiter à 100
  score = Math.min(score, 100)

  // Déterminer le niveau
  let level: 'weak' | 'medium' | 'strong' | 'very-strong'
  let label: string
  let color: string

  if (score < 40) {
    level = 'weak'
    label = 'Faible'
    color = '#FF3131'
  } else if (score < 60) {
    level = 'medium'
    label = 'Moyen'
    color = '#FFA500'
  } else if (score < 80) {
    level = 'strong'
    label = 'Fort'
    color = '#4CAF50'
  } else {
    level = 'very-strong'
    label = 'Très fort'
    color = '#125CED'
  }

  return { score, level, label, color }
}

const SignUpContact = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'Client'
  })
  const [error, setError] = useState<string | null>(null)

  // Calculer la force du mot de passe
  const passwordStrength = useMemo(() => calculatePasswordStrength(formData.password), [formData.password])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    // Valider les champs
    if (!formData.phone || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    // Stocker les données d'inscription pour l'utiliser après vérification
    const signupData: {
      telephone: string
      password: string
      email?: string
      accountType: string
      pays_code: string
      first_name?: string
      last_name?: string
    } = {
      telephone: `+237${formData.phone}`,
      password: formData.password,
      email: formData.email || undefined,
      accountType: formData.accountType,
      pays_code: 'CM',
      first_name: undefined,
      last_name: undefined,
    }

    const personalInfo = localStorage.getItem('personalInfo')
    if (personalInfo) {
      try {
        const personal = JSON.parse(personalInfo) as { firstName?: string; lastName?: string }
        signupData.first_name = personal.firstName
        signupData.last_name = personal.lastName
      } catch {
        // ignore invalid JSON
      }
    }

    localStorage.setItem('signupData', JSON.stringify(signupData))
    localStorage.setItem('accountType', formData.accountType)
    
    navigate('/signup/verification')
  }

  return (
    <ScreenLayout title="Sign Up" showBack>
      <div className="signup-contact">
        <div className="progress-indicator">
          <div className="progress-dot"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
        </div>

        <h2 className="section-title">Contact & Account Type</h2>

        <div className="form-section">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          <div className="phone-input-wrapper">
            <label className="input-label">Phone</label>
            <div className="phone-input-container">
              <span className="phone-prefix">+237</span>
              <input
                type="tel"
                className="input phone-input"
                placeholder="Enter your phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
          <Input
            label="Mot de passe"
            type="password"
            placeholder="Entrez votre mot de passe"
            value={formData.password}
            onChange={(e) => { handleInputChange('password', e.target.value); setError(null) }}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChange={(e) => { handleInputChange('confirmPassword', e.target.value); setError(null) }}
          />
          {formData.password && (
            <div className="password-strength">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="input-label">Force du mot de passe</label>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: passwordStrength.color 
                }}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="strength-bar" style={{ 
                backgroundColor: '#E0E0E0',
                borderRadius: '4px',
                height: '6px',
                overflow: 'hidden'
              }}>
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${passwordStrength.score}%`,
                    height: '100%',
                    backgroundColor: passwordStrength.color,
                    transition: 'all 0.3s ease',
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
              {formData.password.length > 0 && (
                <div style={{ 
                  fontSize: '11px', 
                  marginTop: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{ 
                    color: formData.password.length >= 8 ? '#4CAF50' : '#FF3131',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s ease'
                  }}>
                    {formData.password.length >= 8 ? '✓' : '•'} Minimum 8 caractères
                  </span>
                  <span style={{ 
                    color: /[a-z]/.test(formData.password) ? '#4CAF50' : '#FF3131',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s ease'
                  }}>
                    {/[a-z]/.test(formData.password) ? '✓' : '•'} Au moins une minuscule
                  </span>
                  <span style={{ 
                    color: /[A-Z]/.test(formData.password) ? '#4CAF50' : '#FF3131',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s ease'
                  }}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '•'} Au moins une majuscule
                  </span>
                  <span style={{ 
                    color: /[0-9]/.test(formData.password) ? '#4CAF50' : '#FF3131',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s ease'
                  }}>
                    {/[0-9]/.test(formData.password) ? '✓' : '•'} Au moins un chiffre
                  </span>
                  <span style={{ 
                    color: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '#4CAF50' : '#FF3131',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s ease'
                  }}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '•'} Au moins un caractère spécial
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <h2 className="section-title">Account Type</h2>

        <div className="account-type-selector">
          <button
            className={`account-type-card ${formData.accountType === 'Client' ? 'active' : ''}`}
            onClick={() => handleInputChange('accountType', 'Client')}
          >
            <div className="account-icon">
              <User size={48} color="#87CEEB" />
            </div>
            <div className="account-info">
              <h3>Client</h3>
              <p>I want to book services</p>
            </div>
          </button>
          <button
            className={`account-type-card ${formData.accountType === 'Professionnel' ? 'active' : ''}`}
            onClick={() => handleInputChange('accountType', 'Professionnel')}
          >
            <div className="account-icon">
              <Briefcase size={48} color="#87CEEB" />
            </div>
            <div className="account-info">
              <h3>Professionnel</h3>
              <p>I want to offer my services</p>
            </div>
          </button>
        </div>

        {error && (
          <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#D32F2F', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <Button variant="primary" fullWidth onClick={handleNext}>
          Suivant
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default SignUpContact

