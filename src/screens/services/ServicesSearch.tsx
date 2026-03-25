import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search, MapPin, Clock } from 'lucide-react'
import { servicesService, ServiceWithProfessional } from '../../services/services.service'
import { DEFAULT_SERVICE_CATEGORIES } from '../../constants/categories'
import { readGeoFromCache } from '../../utils/geolocationSession'
import GeoLocationBlocked from '../../components/services/GeoLocationBlocked'
import './ServicesSearch.css'

function matchService(s: ServiceWithProfessional, query: string): boolean {
  if (!query || !query.trim()) return true
  const q = query.trim().toLowerCase()
  const title = (s.title || '').toLowerCase()
  const desc = (s.description || '').toLowerCase()
  const category = (s.category || '').toLowerCase()
  const profession = (s.professional?.profession || '').toLowerCase()
  const business = (s.professional?.business_name || '').toLowerCase()
  const firstName = (s.professional?.user?.first_name || '').toLowerCase()
  const lastName = (s.professional?.user?.last_name || '').toLowerCase()
  return (
    title.includes(q) ||
    desc.includes(q) ||
    category.includes(q) ||
    profession.includes(q) ||
    business.includes(q) ||
    firstName.includes(q) ||
    lastName.includes(q)
  )
}

const ServicesSearch = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const initialGeo = readGeoFromCache()
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => initialGeo.coords)
  const [geoStatus, setGeoStatus] = useState<'granted' | 'denied'>(() => initialGeo.status)
  const [services, setServices] = useState<ServiceWithProfessional[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [categories, setCategories] = useState<{ name: string; count: number }[]>(
    () => DEFAULT_SERVICE_CATEGORIES.map((name) => ({ name, count: 0 }))
  )

  const filteredServices = useMemo(() => {
    return services.filter((s) => matchService(s, searchQuery))
  }, [services, searchQuery])

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingServices(true)
        const [list, cats] = await Promise.all([
          servicesService.getAvailableList(),
          servicesService.getTopCategories().catch(() => []),
        ])
        setServices(Array.isArray(list) ? list : [])
        setCategories(Array.isArray(cats) && cats.length > 0 ? cats : DEFAULT_SERVICE_CATEGORIES.map((name) => ({ name, count: 0 })))
      } catch {
        setServices([])
      } finally {
        setLoadingServices(false)
      }
    }
    load()
  }, [])

  const runSearchFromBackend = async () => {
    if (!searchQuery.trim()) return
    try {
      setLoadingServices(true)
      const term = searchQuery.trim()
      await servicesService.useCategory(term).catch(() => {})
      const list = await servicesService.getAvailableList(term)
      setServices(Array.isArray(list) ? list : [])
      const cats = await servicesService.getTopCategories().catch(() => [])
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : DEFAULT_SERVICE_CATEGORIES.map((name) => ({ name, count: 0 })))
    } catch {
      setServices([])
    } finally {
      setLoadingServices(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      runSearchFromBackend()
      return
    }
    const params = new URLSearchParams()
    params.set('latitude', String(coords.lat))
    params.set('longitude', String(coords.lng))
    params.set('radius', '10000')
    params.set('pays_code', 'CM')
    navigate(`/services/results?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getProName = (s: ServiceWithProfessional) => {
    const p = s.professional
    if (!p) return 'Professionnel'
    if (p.user) {
      const name = `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim()
      return name || p.business_name || 'Pro'
    }
    return p.business_name || 'Professionnel'
  }

  const formatPrice = (price: number, currency: string = 'XAF') =>
    `${Number(price).toLocaleString('fr-FR')} ${currency}`

  const handleCategoryClick = async (name: string) => {
    setSearchQuery(name)
    try {
      setLoadingServices(true)
      await servicesService.useCategory(name).catch(() => {})
      const list = await servicesService.getAvailableList(name)
      setServices(Array.isArray(list) ? list : [])
      const cats = await servicesService.getTopCategories().catch(() => [])
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : DEFAULT_SERVICE_CATEGORIES.map((n) => ({ name: n, count: 0 })))
    } catch {
      setServices([])
    } finally {
      setLoadingServices(false)
    }
  }

  const categoryIcons: Record<string, string> = {
    maison: '&#127968;',
    beauté: '&#128133;',
    education: '&#128218;',
    'éducation': '&#128218;',
    evenements: '&#127881;',
    'événements': '&#127881;',
    sante: '&#9861;',
    santé: '&#9861;',
    transport: '&#128663;',
    plomberie: '&#128701;',
    dessin: '&#128396;',
    coiffure: '&#128135;',
  }
  const getCategoryIcon = (name: string) => categoryIcons[name.toLowerCase()] || '&#128230;'

  if (geoStatus === 'denied') {
    return (
      <ScreenLayout title="Services" showBottomNav>
        <GeoLocationBlocked
          onGranted={(c) => {
            setCoords(c)
            setGeoStatus('granted')
          }}
        />
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Services" showBottomNav>
      <div className="services-search">
        {/* Statut GPS (cache uniquement — plus de nouvelle demande ici) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', marginBottom: '8px', fontSize: '13px', color: geoStatus === 'granted' ? '#22c55e' : '#999' }}>
          <MapPin size={14} />
          <span>Position GPS active</span>
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
          <h2 className="section-title">Catégories</h2>
          <div className="categories-scroll">
            {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  className="category-card"
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <div className="category-icon" dangerouslySetInnerHTML={{ __html: getCategoryIcon(cat.name) }} />
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

        <div className="services-list-section">
          <h2 className="section-title">Services disponibles</h2>
          {loadingServices ? (
            <p className="services-list-loading">Chargement...</p>
          ) : filteredServices.length === 0 ? (
            <p className="services-list-empty">
              {services.length === 0
                ? 'Aucun service disponible pour le moment.'
                : `Aucun résultat pour « ${searchQuery} ». Essayez un autre mot-clé.`}
            </p>
          ) : (
            <div className="services-list">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className="service-list-card"
                  onClick={() => navigate(`/services/detail/${service.id}`)}
                >
                  {service.image_url ? (
                    <div className="service-list-image">
                      <img src={service.image_url} alt="" />
                    </div>
                  ) : (
                    <div className="service-list-image service-list-image-placeholder">
                      <span>{service.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="service-list-info">
                    {service.category && (
                      <span className="service-list-category">{service.category}</span>
                    )}
                    <span className="service-list-title">{service.title}</span>
                    <span className="service-list-price">{formatPrice(Number(service.price), service.currency)}</span>
                    {service.estimated_duration != null && service.estimated_duration > 0 && (
                      <span className="service-list-duration">
                        <Clock size={12} /> {service.estimated_duration} min
                      </span>
                    )}
                    <span className="service-list-pro">par {getProName(service)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ServicesSearch
