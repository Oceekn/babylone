import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Camera, Image as ImageIcon, AtSign } from 'lucide-react'
import './CreatePost.css'

const CreatePost = () => {
  const navigate = useNavigate()
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  return (
    <ScreenLayout title="Créer une publication" showBack>
      <div className="create-post">
        <div className="post-header-section">
          <div className="post-avatar">👤</div>
          <div className="post-author-info">
            <span className="post-author-name">Vous</span>
          </div>
        </div>

        <div className="post-content-section">
          <textarea
            className="post-textarea"
            placeholder="Qu'est-ce qui vous passe par la tête ?"
            rows={6}
          />
        </div>

        <div className="post-media-section">
          <h3 className="section-title">Ajouter à votre publication</h3>
          <div className="media-options">
            <button className="media-option-btn" onClick={() => {/* Ajouter photo */}}>
              <ImageIcon size={24} />
              <span>Photo</span>
            </button>
            <button className="media-option-btn" onClick={() => {/* Ajouter vidéo */}}>
              <Camera size={24} />
              <span>Vidéo</span>
            </button>
          </div>
          {selectedImages.length > 0 && (
            <div className="media-grid">
              {selectedImages.map((img, index) => (
                <div key={index} className="media-item">
                  <img src={img} alt={`Media ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="post-mention-section">
          <div className="mention-input-wrapper">
            <AtSign size={20} className="mention-icon" />
            <Input 
              placeholder="@mentionner" 
              className="mention-input"
            />
          </div>
        </div>

        <Button variant="primary" fullWidth onClick={() => navigate('/social')}>
          Publier
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default CreatePost

