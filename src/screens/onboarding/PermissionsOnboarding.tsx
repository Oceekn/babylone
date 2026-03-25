import { Navigate } from 'react-router-dom'

/**
 * Ancienne page plein écran : les autorisations sont désormais en popup sur l’accueil.
 * Les anciens liens / bookmarks sont redirigés vers l’accueil.
 */
const PermissionsOnboarding = () => {
  return <Navigate to="/client/home" replace />
}

export default PermissionsOnboarding
