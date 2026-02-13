import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { X, Star } from 'lucide-react'
import './Favorites.css'

interface FavoriteItem {
  id: string
  name: string
  type: 'professional' | 'post'
  subtitle?: string
}

const Favorites = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'professionals' | 'posts'>('professionals')
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const stored = localStorage.getItem('user_favorites')
    return stored ? JSON.parse(stored) : []
  })

  const saveFavorites = (items: FavoriteItem[]) => {
    setFavorites(items)
    localStorage.setItem('user_favorites', JSON.stringify(items))
  }

  const removeFavorite = (id: string) => {
    saveFavorites(favorites.filter(f => f.id !== id))
  }

  const filtered = favorites.filter(f => {
    if (activeTab === 'professionals') return f.type === 'professional'
    return f.type === 'post'
  })

  return (
    <ScreenLayout title="Favoris" showBack showBottomNav>
      <div className="favorites">
        <div className="favorites-tabs">
          <button className={`tab ${activeTab === 'professionals' ? 'active' : ''}`} onClick={() => setActiveTab('professionals')}>
            Professionnels
          </button>
          <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Publications
          </button>
        </div>

        <div className="favorites-list">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
              <Star size={32} color="#ddd" />
              <p style={{ marginTop: '12px' }}>Aucun favori</p>
              <p style={{ fontSize: '13px' }}>Vos favoris apparaitront ici</p>
            </div>
          ) : (
            filtered.map((fav) => (
              <div key={fav.id} className="favorite-item" onClick={() => {
                if (fav.type === 'professional') navigate(`/services/professional/${fav.id}`)
              }}>
                <div className="favorite-avatar">{fav.name.charAt(0)}</div>
                <div className="favorite-info">
                  <h3>{fav.name}</h3>
                  {fav.subtitle && <p>{fav.subtitle}</p>}
                </div>
                <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id) }}>
                  <X size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default Favorites
