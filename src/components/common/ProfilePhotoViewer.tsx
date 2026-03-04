import { X } from 'lucide-react'
import './ProfilePhotoViewer.css'

interface ProfilePhotoViewerProps {
  imageUrl: string
  isOpen: boolean
  onClose: () => void
  alt?: string
}

export default function ProfilePhotoViewer({ imageUrl, isOpen, onClose, alt = 'Photo de profil' }: ProfilePhotoViewerProps) {
  if (!isOpen) return null

  return (
    <div
      className="profile-photo-viewer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Voir la photo de profil"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="profile-photo-viewer-close" onClick={onClose} aria-label="Fermer">
        <X size={28} />
      </button>
      <div className="profile-photo-viewer-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt={alt} className="profile-photo-viewer-img" />
      </div>
    </div>
  )
}
