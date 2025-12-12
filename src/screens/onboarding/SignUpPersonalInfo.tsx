import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Calendar, Camera } from 'lucide-react'
import './SignUpPersonalInfo.css'

const SignUpPersonalInfo = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    birthDate: '',
    city: '',
    gender: 'Homme',
    photo: null as File | null
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    navigate('/signup/contact')
  }

  return (
    <ScreenLayout title="Créer votre compte" showBack>
      <div className="signup-personal">
        <div className="form-section">
          <Input
            label="Nom(s)"
            placeholder="Entrez votre nom"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
          <Input
            label="Prénom(s)"
            placeholder="Entrez votre prénom"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
          <Input
            label="Date de naissance"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            rightIcon={<Calendar size={20} />}
          />
          <Input
            label="Ville"
            placeholder="Entrez votre ville"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>

        <div className="gender-section">
          <label className="section-label">Genre</label>
          <div className="gender-selector">
            <div 
              className="gender-slider"
              style={{
                transform: formData.gender === 'Homme' 
                  ? 'translateX(0)' 
                  : formData.gender === 'Femme' 
                  ? 'translateX(100%)' 
                  : 'translateX(200%)'
              }}
            ></div>
            {['Homme', 'Femme', 'Autre'].map((gender) => (
              <button
                key={gender}
                className={`gender-option ${formData.gender === gender ? 'active' : ''}`}
                onClick={() => handleInputChange('gender', gender)}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        <div className="photo-section">
          <label className="section-label">Photo</label>
          <button className="photo-upload">
            <Camera size={24} />
            <span>Ajouter une photo</span>
          </button>
        </div>

        <div className="progress-indicator">
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>

        <Button variant="primary" fullWidth onClick={handleNext}>
          Suivant
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default SignUpPersonalInfo

