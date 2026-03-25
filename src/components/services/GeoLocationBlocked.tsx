import { MapPin, AlertTriangle } from 'lucide-react'
import Button from '../common/Button'
import { retryGeolocationPermission } from '../../utils/geolocationSession'
import './GeoLocationBlocked.css'

type Props = {
  onGranted: (coords: { lat: number; lng: number }) => void
}

/**
 * Affiché lorsque la position a été refusée : pas de contournement silencieux (Douala).
 */
const GeoLocationBlocked = ({ onGranted }: Props) => {
  const handleRetry = async () => {
    const r = await retryGeolocationPermission()
    if (r.ok && r.coords) onGranted(r.coords)
  }

  return (
    <div className="geo-blocked">
      <div className="geo-blocked-inner">
        <MapPin size={48} className="geo-blocked-icon" />
        <h2 className="geo-blocked-title">Localisation nécessaire</h2>
        <p className="geo-blocked-text">
          Sans accès à votre position, la recherche de services à proximité, la carte, les distances et les résultats
          « près de vous » ne peuvent pas fonctionner correctement.
        </p>
        <div className="geo-blocked-warn">
          <AlertTriangle size={20} />
          <span>
            Vous avez refusé la localisation au premier lancement. Autorisez-la ci-dessous ou dans les réglages du
            téléphone / du navigateur (autoriser pendant l’utilisation de l’app, ou toujours).
          </span>
        </div>
        <Button variant="primary" fullWidth onClick={() => void handleRetry()}>
          Réessayer — autoriser la position
        </Button>
      </div>
    </div>
  )
}

export default GeoLocationBlocked
