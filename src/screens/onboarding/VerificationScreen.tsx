import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import './VerificationScreen.css'

const VerificationScreen = () => {
  const navigate = useNavigate()
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', ''])
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(59)

  const handleCodeChange = (index: number, value: string, type: 'sms' | 'email') => {
    if (value.length > 1) return
    const newCode = type === 'sms' ? [...smsCode] : [...emailCode]
    newCode[index] = value
    if (type === 'sms') {
      setSmsCode(newCode)
    } else {
      setEmailCode(newCode)
    }
  }

  const handleVerify = () => {
    // Vérifier le type de compte et rediriger vers la bonne interface
    const accountType = localStorage.getItem('accountType')
    if (accountType === 'Professionnel') {
      navigate('/signup/professional')
    } else {
      navigate('/client/home')
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

        <Button variant="primary" fullWidth onClick={handleVerify}>
          Vérifier
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default VerificationScreen

