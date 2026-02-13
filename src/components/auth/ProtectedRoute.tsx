import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/auth.service'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Si l'utilisateur n'est pas connecté, affiche un message avec un bouton
 * au lieu de rediriger brutalement vers /login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!authService.isAuthenticated()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        padding: '24px',
        textAlign: 'center',
        gap: '16px',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a2e' }}>
          Connexion requise
        </h2>
        <p style={{ fontSize: '15px', color: '#666' }}>
          Connectez-vous pour accéder à cette page.
        </p>
        <button
          onClick={() => navigate('/login', { state: { from: location } })}
          style={{
            padding: '12px 32px',
            background: '#FF3131',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Se connecter
        </button>
        <button
          onClick={() => navigate('/signup/personal')}
          style={{
            padding: '12px 32px',
            background: 'transparent',
            color: '#FF3131',
            border: '2px solid #FF3131',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Créer un compte
        </button>
      </div>
    )
  }

  return <>{children}</>
}
