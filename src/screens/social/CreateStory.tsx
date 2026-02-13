import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Camera, X, Loader } from 'lucide-react'
import Button from '../../components/common/Button'
import { api } from '../../services/api'
import './CreateStory.css'

const CreateStory = () => {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handlePublish = async () => {
    if (!text.trim() && !imageFile) {
      setError('Ajoutez du texte ou une image')
      return
    }
    try {
      setPublishing(true)
      setError(null)

      if (imageFile) {
        // Upload avec fichier
        const formData = new FormData()
        formData.append('file', imageFile)
        if (text.trim()) formData.append('text', text.trim())
        await api.post('/social/stories/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        // Texte seul
        await api.post('/social/stories', { text: text.trim() })
      }
      navigate('/social')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la publication')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <ScreenLayout title="Nouvelle story" showClose>
      <div className="create-story">
        <div className="story-content">
          {imagePreview ? (
            <div className="story-preview">
              <img src={imagePreview} alt="" />
              <button className="remove-image" onClick={removeImage}><X size={20} /></button>
            </div>
          ) : (
            <label className="image-upload-area">
              <input type="file" accept="image/*,video/*" onChange={handleImageChange} style={{ display: 'none' }} />
              <Camera size={48} color="#888" />
              <p>Ajouter une photo ou video</p>
            </label>
          )}
        </div>

        <div className="story-text-section">
          <textarea
            placeholder="Ajouter du texte a votre story..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="story-text-input"
          />
        </div>

        {error && (
          <div style={{ background: '#FFF3F3', border: '1px solid #FF5252', borderRadius: '8px', padding: '12px', margin: '0 16px 16px', color: '#D32F2F', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '0 16px 16px' }}>
          <Button
            variant="primary"
            fullWidth
            onClick={handlePublish}
            disabled={publishing || (!text.trim() && !imageFile)}
          >
            {publishing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader size={16} className="spin" /> Publication...
              </span>
            ) : (
              'Partager la story'
            )}
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default CreateStory
