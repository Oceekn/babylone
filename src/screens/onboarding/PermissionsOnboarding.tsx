import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { MapPin, Bell, AlertTriangle } from 'lucide-react'
import { setOnboardingComplete } from '../../utils/onboarding'
import { setGeoSession } from '../../utils/geolocationSession'
import './PermissionsOnboarding.css'

const PermissionsOnboarding = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<'notif' | 'geo' | 'geo_confirm_deny'>('notif')

  const goHome = useCallback(() => {
    setOnboardingComplete()
    try {
      localStorage.setItem('babylon_notif_prompt_done', '1')
    } catch {
      /* ignore */
    }
    navigate('/client/home', { replace: true })
  }, [navigate])

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

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setGeoSession({ lat: 4.05, lng: 9.7, status: 'denied' })
      goHome()
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoSession({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          status: 'granted',
        })
        goHome()
      },
      () => {
        setGeoSession({ lat: 4.05, lng: 9.7, status: 'denied' })
        goHome()
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  }

  const skipNotif = () => {
    try {
      localStorage.setItem('babylon_notif_prompt_done', '1')
    } catch {
      /* ignore */
    }
    setStep('geo')
  }

  const clickDenyGeo = () => {
    setStep('geo_confirm_deny')
  }

  const confirmDenyGeo = () => {
    setGeoSession({ lat: 4.05, lng: 9.7, status: 'denied' })
    goHome()
  }

  const backToGeo = () => {
    setStep('geo')
  }

  return (
    <ScreenLayout title="Autorisations" showBack={false}>
      <div className="perm-onboarding">
        {step === 'notif' && (
          <div className="perm-card">
            <Bell size={40} className="perm-icon" />
            <h2>Notifications</h2>
            <p>
              L’application vous envoie des notifications pour les messages, rappels et mises à jour importantes. Cette
              demande n’apparaît qu’une fois.
            </p>
            <Button variant="primary" fullWidth onClick={requestNotif}>
              Autoriser les notifications
            </Button>
            <button type="button" className="perm-skip" onClick={skipNotif}>
              Plus tard
            </button>
          </div>
        )}

        {step === 'geo' && (
          <div className="perm-card">
            <MapPin size={40} className="perm-icon" />
            <h2>Position</h2>
            <p>
              La localisation est demandée <strong>une seule fois</strong> ici. Sur le téléphone, vous pourrez choisir :
              ne pas autoriser, autoriser lorsque l’app est active, ou toujours autoriser.
            </p>
            <div className="perm-actions">
              <Button variant="primary" fullWidth onClick={requestGeo}>
                Autoriser la position
              </Button>
              <Button variant="outline" fullWidth onClick={clickDenyGeo}>
                Ne pas autoriser
              </Button>
            </div>
            <div className="perm-warn">
              <AlertTriangle size={18} />
              <span>Sans position, la section Services (recherche à proximité, carte) sera bloquée jusqu’à autorisation.</span>
            </div>
          </div>
        )}

        {step === 'geo_confirm_deny' && (
          <div className="perm-card">
            <AlertTriangle size={40} className="perm-icon" style={{ color: '#b8860b' }} />
            <h2>Confirmer le refus</h2>
            <p>
              Sans accès à la position, <strong>vous ne pourrez pas utiliser la section Services</strong> correctement
              (recherche locale, carte, distances). Vous pourrez réessayer plus tard depuis Services.
            </p>
            <div className="perm-actions">
              <Button variant="primary" fullWidth onClick={backToGeo}>
                Retour — autoriser la position
              </Button>
              <Button variant="outline" fullWidth onClick={confirmDenyGeo}>
                J’ai compris, continuer sans Services
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default PermissionsOnboarding
