import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Camera, Loader } from 'lucide-react'
import { professionalsService } from '../../services/professionals.service'
import { authService } from '../../services/auth.service'
import './ProfessionalSignUp.css'

const ProfessionalSignUp = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    business_name: '',
    profession: '',
    description: '',
    experience_years: '',
    address: '',
    city: 'Douala',
  })
  const [cniFile, setCniFile] = useState<File | null>(null)
  const [cniPreview, setCniPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCniFile(file)
    const reader = new FileReader()
    reader.onload = () => setCniPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!formData.profession.trim()) {
      setError('Le domaine d\'expertise est requis')
      return
    }
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Creer le profil professionnel
      const prof = await professionalsService.create({
        business_name: formData.business_name.trim() || undefined,
        profession: formData.profession.trim(),
        description: formData.description.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || 'Douala',
        pays_code: 'CM',
      })

      // Upload CNI si fourni
      if (cniFile && prof.id) {
        try {
          await professionalsService.uploadCNI(prof.id, cniFile)
        } catch (cniErr) {
          console.warn('Erreur upload CNI:', cniErr)
        }
      }

      navigate('/professional/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScreenLayout title="Inscription Professionnel" showBack>
      <div className="professional-signup">
        <h2 className="section-title">Informations professionnelles</h2>

        <div className="form-section">
          <Input
            label="Nom commercial (optionnel)"
            placeholder="Ex: Salon Beaute Plus"
            value={formData.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
          />
          <Input
            label="Domaine d'expertise"
            placeholder="Ex: Coiffure, Massage, Plomberie..."
            value={formData.profession}
            onChange={(e) => handleChange('profession', e.target.value)}
          />
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Description</label>
            <textarea
              placeholder="Decrivez votre activite..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <Input
            label="Annees d'experience"
            type="number"
            placeholder="Ex: 5"
            value={formData.experience_years}
            onChange={(e) => handleChange('experience_years', e.target.value)}
          />
          <Input
            label="Adresse"
            placeholder="Votre adresse"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
          <Input
            label="Ville"
            placeholder="Douala"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>

        <h2 className="section-title">Document d'identite (CNI)</h2>
        <div className="document-section">
          <label className="document-upload">
            <input type="file" accept="image/*,.pdf" onChange={handleCniChange} style={{ display: 'none' }} />
            {cniPreview ? (
              <img src={cniPreview} alt="CNI" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }} />
            ) : (
              <div className="upload-placeholder">
                <Camera size={32} />
                <p>Ajouter votre CNI</p>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#D32F2F', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <Button variant="primary" fullWidth onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader size={16} className="spin" /> Inscription...
            </span>
          ) : (
            'Devenir professionnel'
          )}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default ProfessionalSignUp
