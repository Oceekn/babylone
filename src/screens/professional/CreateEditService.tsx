import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Camera, Loader } from 'lucide-react'
import { servicesService, Service } from '../../services/services.service'
import './CreateEditService.css'

const CreateEditService = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEdit = !!editId

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editId) loadService()
  }, [editId])

  const loadService = async () => {
    if (!editId) return
    try {
      setLoading(true)
      const service = await servicesService.getById(editId)
      setTitle(service.title)
      setDescription(service.description || '')
      setPrice(String(service.price))
      setDuration(String(service.estimated_duration || ''))
      if (service.image_url) setImagePreview(service.image_url)
    } catch (err) {
      setError('Service introuvable')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!title.trim() || !price.trim()) {
      setError('Le nom et le prix sont requis')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        estimated_duration: duration ? parseInt(duration) : undefined,
        currency: 'XAF',
      }

      let service: Service
      if (isEdit && editId) {
        service = await servicesService.update(editId, data as any)
      } else {
        service = await servicesService.create(data)
      }

      // Upload image si selectionnee
      if (imageFile) {
        try {
          await servicesService.uploadImage(service.id, imageFile)
        } catch (imgErr) {
          console.warn('Image upload failed:', imgErr)
        }
      }

      navigate('/professional/services')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la sauvegarde'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ScreenLayout title={isEdit ? 'Modifier service' : 'Nouveau service'} showClose>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader size={32} className="spin" />
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title={isEdit ? 'Modifier service' : 'Nouveau service'} showClose>
      <div className="create-edit-service">
        <div className="form-section">
          <Input
            label="Nom du service"
            placeholder="Ex: Coiffure, Massage..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Description</label>
            <textarea
              placeholder="Decrivez votre service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <Input
            label="Prix (FCFA)"
            type="number"
            placeholder="Ex: 5000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="Duree estimee (minutes)"
            type="number"
            placeholder="Ex: 60"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div className="photos-section">
          <label className="photo-upload-area">
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <>
                <Camera size={48} />
                <p>Ajouter une photo</p>
              </>
            )}
          </label>
        </div>

        {error && (
          <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#D32F2F', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Creer le service'}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default CreateEditService
