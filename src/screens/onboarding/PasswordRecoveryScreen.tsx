import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import './PasswordRecoveryScreen.css'

const PasswordRecoveryScreen = () => {
  const navigate = useNavigate()
  const [method, setMethod] = useState<'SMS' | 'Email'>('SMS')
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleSendCode = () => {
    navigate('/signup/verification')
  }

  return (
    <ScreenLayout title="Réinitialiser le mot de passe" showBack>
      <div className="password-recovery">
        <div className="method-selector">
          <label className={`method-option ${method === 'SMS' ? 'active' : ''}`} style={{ backgroundColor: '#EFF6FF' }}>
            <input
              type="radio"
              name="method"
              value="SMS"
              checked={method === 'SMS'}
              onChange={(e) => setMethod(e.target.value as 'SMS' | 'Email')}
            />
            <span>SMS</span>
          </label>
          <label className={`method-option ${method === 'Email' ? 'active' : ''}`} style={{ backgroundColor: '#EFF6FF' }}>
            <input
              type="radio"
              name="method"
              value="Email"
              checked={method === 'Email'}
              onChange={(e) => setMethod(e.target.value as 'SMS' | 'Email')}
            />
            <span>Email</span>
          </label>
        </div>

        {method === 'SMS' && (
          <Input
            label="Numéro de téléphone"
            type="tel"
            placeholder="Entrez votre numéro de téléphone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        )}

        {method === 'Email' && (
          <Input
            label="Email"
            type="email"
            placeholder="Entrez votre email"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        )}

        <Button variant="primary" fullWidth onClick={handleSendCode}>
          Envoyer le code
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default PasswordRecoveryScreen

