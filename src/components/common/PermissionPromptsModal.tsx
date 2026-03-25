import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'
import { MapPin, Bell, AlertTriangle, X } from 'lucide-react'
import { setOnboardingComplete } from '../../utils/onboarding'
import { setGeoSession } from '../../utils/geolocationSession'
import './PermissionPromptsModal.css'

const STORAGE_DONE = 'babylon_permissions_popup_v1'

export function isPermissionPopupDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_DONE) === '1'
  } catch {
    return true
  }
}

export function markPermissionPopupDone(): void {
  try {
    localStorage.setItem(STORAGE_DONE, '1')
  } catch {
    /* ignore */
  }
  setOnboardingComplete()
}

type Step = 'notif' | 'geo' | 'geo_confirm_deny'

interface PermissionPromptsModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Popups d’autorisations (notifications + position) comme sur les apps mobiles,
 * sans page plein écran.
 */
const PermissionPromptsModal = ({ open, onClose }: PermissionPromptsModalProps) => {
  const [step, setStep] = useState<Step>('notif')

  const finish = useCallback(() => {
    markPermissionPopupDone()
    try {
      localStorage.setItem('babylon_notif_prompt_done', '1')
    } catch {
      /* ignore */
    }
    onClose()
  }, [onClose])

  const requestNotif = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch {
        /* ignore */
      }
    }
    try {
      localStorage.setItem('babylon_notif_prompt_done', '1')
    } catch {
      /* ignore */
    }
    setStep('geo')
  }

  const skipNotif = () => {
    try {
      localStorage.setItem('babylon_notif_prompt_done', '1')
    } catch {
      /* ignore */
    }
    setStep('geo')
  }

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setGeoSession({ lat: 4.05, lng: 9.7, status: 'denied' })
      finish()
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoSession({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          status: 'granted',
        })
        finish()
      },
      () => {
        setGeoSession({ lat: 4.05, lng: 9.7, status: 'denied' })
        finish()
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  }

  const clickDenyGeo = () => {
    setStep('geo_confirm_deny')
  }

  const confirmDenyGeo = () => {
    setGeoSession({ lat: 4.05, lng: 9.7, status: 'denied' })
    finish()
  }

  const backToGeo = () => {
    setStep('geo')
  }

  if (!open) return null

  return createPortal(
    <div className="perm-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="perm-modal-title">
      <div className="perm-modal-backdrop" onClick={step === 'geo_confirm_deny' ? undefined : undefined} aria-hidden />
      <div className="perm-modal-sheet">
        <div className="perm-modal-handle" aria-hidden />
        {step !== 'geo_confirm_deny' && (
          <button
            type="button"
            className="perm-modal-close"
            onClick={() => {
              if (step === 'notif') skipNotif()
              else if (step === 'geo') clickDenyGeo()
            }}
            aria-label={step === 'notif' ? 'Passer' : 'Refuser la position'}
          >
            <X size={22} />
          </button>
        )}

        {step === 'notif' && (
          <div className="perm-modal-card">
            <Bell size={36} className="perm-modal-icon" />
            <h2 id="perm-modal-title">Notifications</h2>
            <p>
              Recevoir des alertes pour les messages, rappels et mises à jour. Vous pouvez refuser ou choisir « Plus tard ».
            </p>
            <Button variant="primary" fullWidth onClick={requestNotif}>
              Autoriser les notifications
            </Button>
            <button type="button" className="perm-modal-skip" onClick={skipNotif}>
              Plus tard
            </button>
          </div>
        )}

        {step === 'geo' && (
          <div className="perm-modal-card">
            <MapPin size={36} className="perm-modal-icon" />
            <h2 id="perm-modal-title">Position</h2>
            <p>
              La localisation sert à la recherche de services à proximité et à la carte. Le système vous proposera les options
              habituelles (ne pas autoriser, lorsque l’app est active, toujours).
            </p>
            <div className="perm-modal-actions">
              <Button variant="primary" fullWidth onClick={requestGeo}>
                Autoriser la position
              </Button>
              <Button variant="outline" fullWidth onClick={clickDenyGeo}>
                Ne pas autoriser
              </Button>
            </div>
            <div className="perm-modal-warn">
              <AlertTriangle size={16} />
              <span>Sans position, la section Services peut rester limitée jusqu’à ce que vous autorisiez.</span>
            </div>
          </div>
        )}

        {step === 'geo_confirm_deny' && (
          <div className="perm-modal-card">
            <AlertTriangle size={36} className="perm-modal-icon" style={{ color: '#b8860b' }} />
            <h2 id="perm-modal-title">Confirmer le refus</h2>
            <p>
              Sans accès à la position, <strong>la section Services</strong> (recherche locale, carte) ne fonctionnera pas
              correctement. Vous pourrez réessayer depuis Services.
            </p>
            <div className="perm-modal-actions">
              <Button variant="primary" fullWidth onClick={backToGeo}>
                Retour — autoriser la position
              </Button>
              <Button variant="outline" fullWidth onClick={confirmDenyGeo}>
                Continuer sans Services complets
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default PermissionPromptsModal
