import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search, MapPin } from 'lucide-react'
import './ServicesSearch.css'

const ServicesSearch = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle')

  useEffect(() => {
    // Demander la geolocation au chargement
    requestGeolocation()
  }, [])

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      // Fallback Douala
      setCoords({ lat: 4.0500, lng: 9.7000 })
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoStatus('granted')
      },
      () => {
        // Fallback Douala
        setCoords({ lat: 4.0500, lng: 9.7000 })
        setGeoStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set('query', searchQuery)
    }
    params.set('latitude', String(coords?.lat || 4.0500))
    params.set('longitude', String(coords?.lng || 9.7000))
    params.set('radius', '10000')
    params.set('pays_code', 'CM')
    
    navigate(`/services/results?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const categories = [
    { name: 'Maison', icon: '&#127968;' },
    { name: 'Beaute', icon: '&#128133;' },
    { name: 'Education', icon: '&#128218;' },
    { name: 'Evenements', icon: '&#127881;' },
    { name: 'Sante', icon: '&#9861;' },
    { name: 'Transport', icon: '&#128663;' },
  ]

  return (
    <ScreenLayout title="Services" showBottomNav>
      <div className="services-search">
        {/* Geolocation status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', marginBottom: '8px', fontSize: '13px', color: geoStatus === 'granted' ? '#22c55e' : '#999' }}>
          <MapPin size={14} />
          {geoStatus === 'loading' && <span>Localisation en cours...</span>}
          {geoStatus === 'granted' && <span>Position GPS active</span>}
          {geoStatus === 'denied' && <span>Position par defaut (Douala)</span>}
          {geoStatus === 'idle' && <span>Localisation...</span>}
        </div>

        <div className="search-bar-container">
          <div style={{ position: 'relative', width: '100%' }}>
            <Input
              placeholder="Plombier, Coiffeur, Cours..."
              icon={<Search size={20} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              onClick={handleSearch}
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1
              }}
            >
              <Search size={20} />
            </button>
          </div>
          <Button variant="outline" onClick={() => navigate('/services/filters')}>
            Filtres avances
          </Button>
        </div>

        <div className="categories-section">
          <h2 className="section-title">Categories</h2>
          <div className="categories-scroll">
            {categories.map((cat, index) => (
              <button
                key={index}
                className="category-card"
                onClick={() => {
                  setSearchQuery(cat.name)
                  handleSearch()
                }}
              >
                <div className="category-icon" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="verified-section">
          <label className="toggle-label">
            <span>Professionnels verifies</span>
            <input type="checkbox" className="toggle-switch" defaultChecked />
          </label>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ServicesSearch
