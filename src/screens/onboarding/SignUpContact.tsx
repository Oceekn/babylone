import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Briefcase } from 'lucide-react'
import './SignUpContact.css'

const SignUpContact = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    accountType: 'Client'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    // Stocker le type de compte dans localStorage pour l'utiliser après vérification
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
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
          />
          <div className="password-strength">
            <label className="input-label">Password Strength</label>
            <div className="strength-bar">
              <div className="strength-fill" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        <h2 className="section-title">Account Type</h2>

        <div className="account-type-selector">
          <button
            className={`account-type-card ${formData.accountType === 'Client' ? 'active' : ''}`}
            onClick={() => handleInputChange('accountType', 'Client')}
          >
            <div className="account-icon">📱</div>
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

        <Button variant="primary" fullWidth onClick={handleNext}>
          Next
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default SignUpContact

