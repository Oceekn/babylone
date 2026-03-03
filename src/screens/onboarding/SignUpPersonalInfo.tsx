import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Camera } from 'lucide-react'
import './SignUpPersonalInfo.css'

const SignUpPersonalInfo = () => {
  const navigate = useNavigate()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    birthDate: '',
    city: '',
    gender: 'Homme',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    // Juste un apercu local — pas d'upload serveur ici (pas de token)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPhotoPreview(dataUrl)
      // Stocker le base64 pour l'uploader apres inscription
      localStorage.setItem('signupPhoto', dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleNext = () => {
    const personalInfo = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate,
      city: formData.city,
      gender: formData.gender,
    }
    localStorage.setItem('personalInfo', JSON.stringify(personalInfo))
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
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            className="photo-upload"
            onClick={() => photoInputRef.current?.click()}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Apercu"
                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <Camera size={24} />
            )}
            <span>{photoPreview ? 'Changer la photo' : 'Ajouter une photo'}</span>
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
