import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Camera, Image as ImageIcon, AtSign, X } from 'lucide-react'
import { socialService } from '../../services/social.service'
import { storageService } from '../../services/storage.service'
import './CreatePost.css'

const ACCEPT_IMAGE = 'image/*'
const ACCEPT_VIDEO = 'video/*'
const MAX_IMAGE_SIZE_MB = 10
const MAX_VIDEO_SIZE_MB = 100

const CreatePost = () => {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File, type: 'image' | 'video') => {
    const maxMB = type === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxMB} Mo).`)
      return
    }
    setError(null)
    setUploading(true)
    try {
      const url = await storageService.uploadFile(file)
      if (type === 'image') {
        setSelectedImages((prev) => [...prev, url])
      } else {
        setSelectedVideo(url)
      }
    } catch (err) {
      console.error('Erreur upload:', err)
      setError('Impossible d\'envoyer le fichier. Réessayez.')
    } finally {
      setUploading(false)
    }
  }

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file, 'image')
    e.target.value = ''
  }

  const onVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file, 'video')
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => setSelectedVideo(null)

  const handlePublish = async () => {
    const hasContent = content.trim().length > 0
    const hasMedia = selectedImages.length > 0 || selectedVideo !== null
    if (!hasContent && !hasMedia) {
      setError('Écrivez un texte ou ajoutez une photo/vidéo.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await socialService.createPost({
        content: content.trim() || undefined,
        image_url: selectedImages[0],
        video_url: selectedVideo ?? undefined,
        pays_code: 'CM',
      })
      navigate('/social')
    } catch (err) {
      console.error('Erreur publication:', err)
      setError('Impossible de publier. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenLayout title="Créer une publication" showBack>
      <div className="create-post">
        <div className="post-header-section">
          <div className="post-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#667eea', color: '#fff', fontWeight: 700 }}>
            {(() => { const u = JSON.parse(localStorage.getItem('user') || '{}'); return (u.first_name || 'V').charAt(0).toUpperCase() })()}
          </div>
          <div className="post-author-info">
            <span className="post-author-name">Vous</span>
          </div>
        </div>

        <div className="post-content-section">
          <textarea
            className="post-textarea"
            placeholder="Qu'est-ce qui vous passe par la tête ?"
            rows={6}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setError(null)
            }}
          />
        </div>

        <div className="post-media-section">
          <h3 className="section-title">Ajouter à votre publication</h3>
          <input
            ref={imageInputRef}
            type="file"
            accept={ACCEPT_IMAGE}
            className="hidden-input"
            onChange={onImageChange}
            disabled={uploading}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept={ACCEPT_VIDEO}
            className="hidden-input"
            onChange={onVideoChange}
            disabled={uploading}
          />
          <div className="media-options">
            <button
              type="button"
              className="media-option-btn"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
            >
              <ImageIcon size={24} />
              <span>Photo</span>
            </button>
            <button
              type="button"
              className="media-option-btn"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera size={24} />
              <span>Vidéo</span>
            </button>
          </div>
          {uploading && (
            <p className="uploading-text">Envoi du fichier...</p>
          )}
          {selectedImages.length > 0 && (
            <div className="media-grid">
              {selectedImages.map((url, index) => (
                <div key={url} className="media-item">
                  <img src={url} alt={`Photo ${index + 1}`} />
                  <button
                    type="button"
                    className="media-remove"
                    onClick={() => removeImage(index)}
                    aria-label="Retirer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {selectedVideo && (
            <div className="media-item video-item">
              <video src={selectedVideo} controls />
              <button
                type="button"
                className="media-remove"
                onClick={removeVideo}
                aria-label="Retirer la vidéo"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="post-mention-section">
          <div className="mention-input-wrapper">
            <AtSign size={20} className="mention-icon" />
            <Input placeholder="@mentionner" className="mention-input" />
          </div>
        </div>

        {error && (
          <p style={{ color: '#FF3131', fontSize: '14px', marginBottom: '8px' }}>{error}</p>
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={handlePublish}
          disabled={loading || uploading}
        >
          {loading ? 'Publication...' : uploading ? 'Envoi en cours...' : 'Publier'}
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default CreatePost
