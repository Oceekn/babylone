import ScreenLayout from '../../components/common/ScreenLayout'
import { X } from 'lucide-react'
import './Favorites.css'

const Favorites = () => {
  const favorites = [
    { id: 1, name: 'Dr. Njoya', location: 'Douala', avatar: '👤' },
    { id: 2, name: 'Dr. Njoya', location: 'Douala', avatar: '👤' },
    { id: 3, name: 'Dr. Njoya', location: 'Douala', avatar: '👤' }
  ]

  return (
    <ScreenLayout title="Favorites" showBack showBottomNav>
      <div className="favorites">
        <div className="favorites-tabs">
          <button className="tab active">Professionnels</button>
          <button className="tab">Posts</button>
          <button className="tab">Groupes</button>
        </div>
        <div className="favorites-list">
          {favorites.map((fav) => (
            <div key={fav.id} className="favorite-item">
              <div className="favorite-avatar">{fav.avatar}</div>
              <div className="favorite-info">
                <h3>{fav.name}</h3>
                <p>{fav.location}</p>
              </div>
              <button className="remove-btn">
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default Favorites



