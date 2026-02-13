import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Loader } from 'lucide-react'
import { usersService, User } from '../../services/users.service'
import './EditPersonalInfo.css'

const EditPersonalInfo = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })

  useEffect(() => { loadUser() }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      const user = await usersService.getMe()
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      })
    } catch (err) {
      // Fallback to localStorage
      const cached = localStorage.getItem('user')
      if (cached) {
        const u = JSON.parse(cached)
        setFormData({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          email: u.email || '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      const updated = await usersService.updateMe({
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
        email: formData.email.trim() || undefined,
      })
      // Mettre a jour le cache
      localStorage.setItem('user', JSON.stringify(updated))
      setSuccess(true)
      setTimeout(() => navigate(-1), 1500)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la sauvegarde'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ScreenLayout title="Modifier le profil" showBack showBottomNav>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Modifier le profil" showBack showBottomNav>
      <div className="edit-personal-info">
        <div className="form-section">
          <Input
            label="Prenom"
            placeholder="Votre prenom"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          />
          <Input
            label="Nom"
            placeholder="Votre nom"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Votre email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        {error && (
          <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#D32F2F', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#2E7D32', fontSize: '14px' }}>
            Profil mis a jour avec succes
          </div>
        )}

        <Button variant="secondary" fullWidth onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default EditPersonalInfo
