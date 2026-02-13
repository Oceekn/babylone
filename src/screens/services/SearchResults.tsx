import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star } from 'lucide-react'
import { professionalsService, Professional } from '../../services/professionals.service'
import './SearchResults.css'

type SortKey = 'pertinence' | 'distance' | 'note' | 'prix'

const SearchResults = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('pertinence')

  useEffect(() => {
    const searchProfessionals = async () => {
      const latitude = parseFloat(searchParams.get('latitude') || '4.0500')
      const longitude = parseFloat(searchParams.get('longitude') || '9.7000')
      const radius = parseInt(searchParams.get('radius') || '10000')
      const paysCode = searchParams.get('pays_code') || 'CM'
      const profession = searchParams.get('query') || undefined

      // Filtres avances
      const cityFilter = searchParams.get('city') || undefined
      const minRating = parseFloat(searchParams.get('min_rating') || '0')
      const verifiedOnly = searchParams.get('verified') === 'true'

      setLoading(true)
      setError(null)

      try {
        let results = await professionalsService.search({
          latitude,
          longitude,
          radius,
          pays_code: paysCode,
          profession,
        })

        // Appliquer les filtres supplementaires cote frontend
        if (cityFilter) {
          results = results.filter(p => p.city?.toLowerCase() === cityFilter.toLowerCase())
        }
        if (minRating > 0) {
          results = results.filter(p => parseFloat(String(p.rating)) >= minRating)
        }
        if (verifiedOnly) {
          results = results.filter(p => p.is_verified)
        }

        setProfessionals(results)
      } catch (err: any) {
        console.error('Erreur de recherche:', err)
        setError('Erreur lors de la recherche. Veuillez reessayer.')
      } finally {
        setLoading(false)
      }
    }

    searchProfessionals()
  }, [searchParams])

  // Fonction pour calculer la distance (approximative)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    // Formule de Haversine simplifiée
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }

  const getCurrentLocation = () => {
    const lat = parseFloat(searchParams.get('latitude') || '4.0500')
    const lon = parseFloat(searchParams.get('longitude') || '9.7000')
    return { lat, lon }
  }

  const currentLocation = getCurrentLocation()

  return (
    <ScreenLayout title="Résultats de recherche" showBack showBottomNav>
      <div className="search-results">
        <div className="sort-bar">
          {(['pertinence', 'distance', 'note', 'prix'] as SortKey[]).map((key) => (
            <button
              key={key}
              className={`sort-btn ${sortBy === key ? 'active' : ''}`}
              onClick={() => {
                setSortBy(key)
                const sorted = [...professionals]
                if (key === 'note') sorted.sort((a, b) => parseFloat(String(b.rating)) - parseFloat(String(a.rating)))
                else if (key === 'distance' && currentLocation) {
                  sorted.sort((a, b) => {
                    const dA = a.position_gps?.coordinates ? Math.hypot(a.position_gps.coordinates[1] - currentLocation.lat, a.position_gps.coordinates[0] - currentLocation.lon) : 999
                    const dB = b.position_gps?.coordinates ? Math.hypot(b.position_gps.coordinates[1] - currentLocation.lat, b.position_gps.coordinates[0] - currentLocation.lon) : 999
                    return dA - dB
                  })
                }
                setProfessionals(sorted)
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Chargement...
          </div>
        )}

        {error && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#FF3131' }}>
            {error}
          </div>
        )}

        {!loading && !error && professionals.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Aucun professionnel trouvé
          </div>
        )}

        <div className="results-list">
          {professionals.map((prof) => {
            const distance = prof.position_gps?.coordinates
              ? calculateDistance(
                  currentLocation.lat,
                  currentLocation.lon,
                  prof.position_gps.coordinates[1],
                  prof.position_gps.coordinates[0]
                )
              : 'N/A'

            const name = prof.user
              ? `${prof.user.first_name || ''} ${prof.user.last_name || ''}`.trim() || prof.business_name || 'Professionnel'
              : prof.business_name || 'Professionnel'

            return (
              <div
                key={prof.id}
                className="professional-card"
                onClick={() => navigate(`/services/professional/${prof.id}`)}
              >
                <div className="prof-image">
                  {prof.user?.avatar_url ? (
                    <img src={prof.user.avatar_url} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="prof-details">
                  <h3>{name}</h3>
                  <p className="prof-type">{prof.profession || 'Professionnel'}</p>
                  <div className="prof-rating">
                    <Star size={16} fill="currentColor" />
                    <span>{prof.rating.toFixed(1)}</span>
                    <span className="reviews">({prof.total_reviews} avis)</span>
                  </div>
                  <div className="prof-info">
                    <span>{distance}</span>
                    {prof.city && (
                      <>
                        <span>•</span>
                        <span>{prof.city}</span>
                      </>
                    )}
                  </div>
                  {prof.is_active && <span className="available-badge">Disponible</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default SearchResults

