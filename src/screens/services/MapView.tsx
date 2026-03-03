import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, MapPin, Navigation, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { professionalsService, Professional } from '../../services/professionals.service'
import './MapView.css'

const MapView = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: parseFloat(searchParams.get('latitude') || '4.0500'),
    lng: parseFloat(searchParams.get('longitude') || '9.7000'),
  })

  useEffect(() => {
    // Essayer d'obtenir la position reelle
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          // Position par defaut
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    setLoading(true)
    try {
      // Essayer la recherche geographique
      const results = await professionalsService.search({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: 50000,
        pays_code: 'CM',
      })
      if (results.length > 0) {
        setProfessionals(results)
      } else {
        // Fallback: recuperer les populaires
        const popular = await professionalsService.getPopular()
        setProfessionals(popular)
      }
    } catch (err) {
      console.error('Erreur chargement map:', err)
      try {
        const popular = await professionalsService.getPopular()
        setProfessionals(popular)
      } catch {
        setProfessionals([])
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat2: number, lon2: number): string => {
    const R = 6371
    const dLat = (lat2 - userCoords.lat) * Math.PI / 180
    const dLon = (lon2 - userCoords.lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`
  }

  const getName = (prof: Professional): string => {
    if (prof.user) {
      const name = `${prof.user.first_name || ''} ${prof.user.last_name || ''}`.trim()
      if (name) return name
    }
    return prof.business_name || 'Professionnel'
  }

  const selected = professionals[selectedIndex]

  const navigatePrev = () => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : professionals.length - 1)
  }

  const navigateNext = () => {
    setSelectedIndex(prev => prev < professionals.length - 1 ? prev + 1 : 0)
  }

  return (
    <ScreenLayout showBottomNav>
      <div className="map-view">
        {/* Map area */}
        <div className="map-container">
          <div className="map-visual">
            {/* Vue carte simulee avec les positions */}
            <div className="map-bg">
              {/* Position utilisateur */}
              <div className="user-marker" style={{ left: '50%', top: '50%' }}>
                <Navigation size={16} />
              </div>

              {/* Marqueurs professionnels */}
              {professionals.map((prof, idx) => {
                // Distribuer les marqueurs autour du centre
                const angle = (idx / Math.max(professionals.length, 1)) * 2 * Math.PI
                const radius = 20 + (idx % 3) * 12 // Varier la distance
                const x = 50 + Math.cos(angle) * radius
                const y = 50 + Math.sin(angle) * radius

                return (
                  <button
                    key={prof.id}
                    className={`prof-marker ${idx === selectedIndex ? 'active' : ''}`}
                    style={{ left: `${Math.max(8, Math.min(92, x))}%`, top: `${Math.max(8, Math.min(92, y))}%` }}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <MapPin size={idx === selectedIndex ? 24 : 18} />
                  </button>
                )
              })}

              {loading && (
                <div className="map-loading">Chargement des professionnels...</div>
              )}

              {!loading && professionals.length === 0 && (
                <div className="map-loading">Aucun professionnel trouve dans cette zone</div>
              )}
            </div>
          </div>

          {/* Controles carte */}
          <div className="map-controls">
            <button className="map-ctrl-btn" onClick={() => navigate('/services/results?' + searchParams.toString())}>
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Carte du professionnel selectionne */}
        {selected && (
          <div className="service-card-overlay">
            <div className="card-nav">
              <button className="nav-arrow" onClick={navigatePrev}>
                <ChevronLeft size={20} />
              </button>
              <span className="card-counter">{selectedIndex + 1} / {professionals.length}</span>
              <button className="nav-arrow" onClick={navigateNext}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="service-card" onClick={() => navigate(`/services/professional/${selected.id}`)}>
              <div className="service-image">
                {getName(selected).charAt(0).toUpperCase()}
              </div>
              <div className="service-info">
                <h3>{getName(selected)}</h3>
                <p className="prof-profession">{selected.profession || 'Professionnel'}</p>
                <div className="service-rating">
                  <Star size={14} fill="currentColor" />
                  <span>{parseFloat(String(selected.rating)).toFixed(1)}</span>
                  <span className="review-count">({selected.total_reviews} avis)</span>
                </div>
                <div className="card-meta">
                  {selected.position_gps?.coordinates && (
                    <span className="distance-tag">
                      <MapPin size={12} />
                      {calculateDistance(selected.position_gps.coordinates[1], selected.position_gps.coordinates[0])}
                    </span>
                  )}
                  {selected.city && <span className="city-tag">{selected.city}</span>}
                  {selected.is_verified && <span className="verified-tag">Verifie</span>}
                </div>
                <div className="service-actions">
                  <Button variant="secondary" onClick={() => navigate(`/services/professional/${selected.id}`)}>
                    Voir le profil
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}

export default MapView
