import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Camera, X, Loader, Image as ImageIcon, Circle } from 'lucide-react'
import Button from '../../components/common/Button'
import { api } from '../../services/api'
import './CreateStory.css'

const MAX_VIDEO_S = 60

const CreateStory = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'camera' | 'gallery'>('gallery')
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordChunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (mode !== 'camera') return
    let stream: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true }).then((s) => {
      stream = s
      streamRef.current = s
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = s
    }).catch(() => setError('Accès caméra refusé'))
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [mode])

  const stopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    recordTimerRef.current = null
    setRecording(false)
    setRecordSeconds(0)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const capturePhoto = () => {
    const video = videoPreviewRef.current
    if (!video || !streamRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'story-photo.jpg', { type: 'image/jpeg' })
      setImageFile(file)
      setImagePreview(URL.createObjectURL(blob))
      setMode('gallery')
    }, 'image/jpeg', 0.9)
  }

  const startVideoRecord = () => {
    if (!streamRef.current) return
    recordChunksRef.current = []
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp9' })
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => { if (e.data.size) recordChunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(recordChunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'story-video.webm', { type: 'video/webm' })
      setImageFile(file)
      setImagePreview(URL.createObjectURL(blob))
      setMode('gallery')
    }
    recorder.start(500)
    setRecording(true)
    setRecordSeconds(0)
    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((s) => {
        if (s >= MAX_VIDEO_S - 1) stopRecording()
        return s + 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (recording) return
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
  }, [recording])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const handlePublish = async () => {
    if (!text.trim() && !imageFile) {
      setError('Ajoutez du texte ou un média')
      return
    }
    try {
      setPublishing(true)
      setError(null)
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        if (text.trim()) formData.append('text', text.trim())
        await api.post('/social/stories/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
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
    <ScreenLayout title="Nouvelle story" showBack>
      <div className="create-story">
        <p className="create-story-hint">Visible 24h · Glisser bas pour fermer</p>

        {!imagePreview ? (
          <>
            <div className="create-story-tabs">
              <button type="button" className={mode === 'gallery' ? 'active' : ''} onClick={() => setMode('gallery')}>
                <ImageIcon size={20} /> Galerie
              </button>
              <button type="button" className={mode === 'camera' ? 'active' : ''} onClick={() => setMode('camera')}>
                <Camera size={20} /> Caméra
              </button>
            </div>

            {mode === 'gallery' && (
              <label className="story-upload-zone">
                <input type="file" accept="image/*,video/*" onChange={handleImageChange} className="story-file-input" />
                <div className="story-upload-icon">
                  <ImageIcon size={40} />
                </div>
                <span className="story-upload-title">Photo ou vidéo</span>
                <span className="story-upload-sub">Importer depuis la galerie</span>
              </label>
            )}

            {mode === 'camera' && (
              <div className="story-camera-wrap">
                <video ref={videoPreviewRef} autoPlay playsInline muted className="story-camera-preview" />
                {recording && (
                  <div className="story-record-badge">
                    <span className="story-record-dot" /> {recordSeconds}s / {MAX_VIDEO_S}s
                  </div>
                )}
                <div className="story-camera-actions">
                  {!recording ? (
                    <>
                      <button type="button" className="story-cam-btn story-cam-btn-photo" onClick={capturePhoto}>
                        Photo
                      </button>
                      <button type="button" className="story-cam-btn story-cam-btn-record" onClick={startVideoRecord}>
                        <Circle size={28} fill="currentColor" /> Vidéo (max 60s)
                      </button>
                    </>
                  ) : (
                    <button type="button" className="story-cam-btn story-cam-btn-stop" onClick={stopRecording}>
                      Arrêter
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="story-content">
            <div className="story-preview-wrap">
              {imageFile?.type.startsWith('video/') ? (
                <video src={imagePreview || ''} controls className="story-preview story-preview-video" />
              ) : (
                <div className="story-preview">
                  <img src={imagePreview || ''} alt="" />
                </div>
              )}
              <button type="button" className="story-remove-media" onClick={removeImage} aria-label="Retirer">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="story-text-section">
          <textarea
            placeholder="Ajoutez un texte à votre story..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="story-text-input"
          />
        </div>

        {error && <div className="story-error">{error}</div>}

        <div className="story-actions">
          <Button
            variant="primary"
            fullWidth
            onClick={handlePublish}
            disabled={publishing || (!text.trim() && !imageFile)}
            className="story-publish-btn"
          >
            {publishing ? (
              <span className="story-publish-label">
                <Loader size={18} className="spin" /> Publication...
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
