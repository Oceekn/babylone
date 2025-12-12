import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Plus } from 'lucide-react'
import './ProfessionalSignUp.css'

const ProfessionalSignUp = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    expertise: '',
    experience: '',
    documents: [] as File[],
    photos: [] as File[]
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    navigate('/professional/dashboard')
  }

  return (
    <ScreenLayout title="Inscription" showBack>
      <div className="professional-signup">
        <h2 className="section-title">Informations supplémentaires</h2>
        
        <div className="form-section">
          <Input
            label="Domaine d'expertise"
            placeholder="Entrez votre domaine d'expertise"
            value={formData.expertise}
            onChange={(e) => handleInputChange('expertise', e.target.value)}
          />
          <Input
            label="Années d'expérience"
            type="number"
            placeholder="Nombre d'années"
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
          />
        </div>

        <h2 className="section-title">Documents</h2>
        
        <div className="document-section">
          <div className="document-item">
            <span>Diplômes/Certifications</span>
            <button className="add-button">
              <Plus size={20} />
              Ajouter
            </button>
          </div>
        </div>

        <h2 className="section-title">Photos</h2>
        
        <div className="photos-grid">
          <div className="photo-placeholder"></div>
          <div className="photo-placeholder"></div>
          <div className="photo-placeholder"></div>
        </div>

        <Button variant="primary" fullWidth onClick={handleContinue}>
          Continuer
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalSignUp



