import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { RotateCcw } from 'lucide-react'
import './AdvancedFilters.css'

interface Filters {
  profession: string
  city: string
  minRating: number
  maxDistance: number // km
  verifiedOnly: boolean
}

const PROFESSIONS = [
  'Tous',
  'Coiffeur',
  'Plombier',
  'Electricien',
  'Mecanicien',
  'Peintre',
  'Couturier',
  'Maconnerie',
  'Menuisier',
  'Jardinier',
  'Informaticien',
  'Photographe',
  'Traducteur',
  'Enseignant',
]

const CITIES = [
  'Toutes',
  'Douala',
  'Yaounde',
  'Bafoussam',
  'Garoua',
  'Bamenda',
  'Maroua',
  'Bertoua',
  'Limbe',
  'Kribi',
  'Buea',
]

const AdvancedFilters = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(() => {
    const stored = localStorage.getItem('search_filters')
    return stored ? JSON.parse(stored) : {
      profession: 'Tous',
      city: 'Toutes',
      minRating: 0,
      maxDistance: 50,
      verifiedOnly: false,
    }
  })

  const resetFilters = () => {
    const defaults: Filters = {
      profession: 'Tous',
      city: 'Toutes',
      minRating: 0,
      maxDistance: 50,
      verifiedOnly: false,
    }
    setFilters(defaults)
    localStorage.removeItem('search_filters')
  }

  const applyFilters = () => {
    localStorage.setItem('search_filters', JSON.stringify(filters))

    const params = new URLSearchParams()

    // Recuperer la position GPS stockee ou utiliser Douala par defaut
    const lat = localStorage.getItem('user_lat') || '4.0500'
    const lng = localStorage.getItem('user_lng') || '9.7000'
    params.set('latitude', lat)
    params.set('longitude', lng)

    // Distance en metres
    params.set('radius', String(filters.maxDistance * 1000))

    if (filters.profession !== 'Tous') {
      params.set('query', filters.profession)
    }

    params.set('pays_code', 'CM')

    // Parametres supplementaires pour le filtrage cote frontend
    if (filters.city !== 'Toutes') {
      params.set('city', filters.city)
    }
    if (filters.minRating > 0) {
      params.set('min_rating', String(filters.minRating))
    }
    if (filters.verifiedOnly) {
      params.set('verified', 'true')
    }

    navigate(`/services/results?${params.toString()}`)
  }

  return (
    <ScreenLayout
      title="Filtres avances"
      showBack
      rightAction={
        <button onClick={resetFilters} className="reset-filters-btn">
          <RotateCcw size={16} />
          <span>Reinitialiser</span>
        </button>
      }
    >
      <div className="advanced-filters">

        {/* Profession */}
        <div className="filter-group">
          <h3 className="filter-title">Profession</h3>
          <div className="filter-chips">
            {PROFESSIONS.map((p) => (
              <button
                key={p}
                className={`filter-chip ${filters.profession === p ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, profession: p }))}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Ville */}
        <div className="filter-group">
          <h3 className="filter-title">Ville</h3>
          <div className="filter-chips">
            {CITIES.map((c) => (
              <button
                key={c}
                className={`filter-chip ${filters.city === c ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, city: c }))}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Note minimum */}
        <div className="filter-group">
          <h3 className="filter-title">Note minimum</h3>
          <div className="rating-selector">
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                className={`rating-btn ${filters.minRating === r ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, minRating: r }))}
              >
                {r === 0 ? 'Toutes' : `${r}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Distance maximale */}
        <div className="filter-group">
          <h3 className="filter-title">Distance maximale : {filters.maxDistance} km</h3>
          <input
            type="range"
            min="1"
            max="100"
            value={filters.maxDistance}
            onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
            className="distance-slider"
          />
          <div className="slider-labels">
            <span>1 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>

        {/* Verifies uniquement */}
        <div className="filter-group">
          <div className="verified-filter">
            <div>
              <h3 className="filter-title" style={{ marginBottom: 0 }}>Professionnels verifies uniquement</h3>
              <p className="filter-desc">N'afficher que les professionnels dont l'identite a ete verifiee</p>
            </div>
            <label className="adv-toggle">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
              />
              <span className="adv-toggle-slider" />
            </label>
          </div>
        </div>

        <div className="filter-actions">
          <Button variant="primary" fullWidth onClick={applyFilters}>
            Appliquer les filtres
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default AdvancedFilters
