import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search } from 'lucide-react'
import './ServicesSearch.css'

const ServicesSearch = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    navigate('/services/results')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const categories = [
    { name: 'Maison', icon: '🏠', active: true },
    { name: 'Beauté', icon: '💅' },
    { name: 'Éducation', icon: '📚' },
    { name: 'Événements', icon: '🎉' }
  ]

  return (
    <ScreenLayout title="Services" showBottomNav>
      <div className="services-search">
        <div className="search-bar-container">
          <div style={{ position: 'relative', width: '100%' }}>
            <Input
              placeholder="Q Plombier, Coiffeur, Cours..."
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
            Filtres avancés
          </Button>
        </div>

        <div className="categories-section">
          <h2 className="section-title">Catégories</h2>
          <div className="categories-scroll">
            {categories.map((cat, index) => (
              <button
                key={index}
                className={`category-card ${cat.active ? 'active' : ''}`}
              >
                <div className="category-icon">{cat.icon}</div>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="verified-section">
          <label className="toggle-label">
            <span>Professionnels vérifiés</span>
            <input type="checkbox" className="toggle-switch" defaultChecked />
          </label>
        </div>

      </div>
    </ScreenLayout>
  )
}

export default ServicesSearch

