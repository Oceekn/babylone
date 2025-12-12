import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star } from 'lucide-react'
import './SearchResults.css'

const SearchResults = () => {
  const navigate = useNavigate()

  const professionals = [
    {
      id: 1,
      name: 'Nathalie Dubois',
      profession: 'Hair Stylist',
      rating: 4.6,
      reviews: 133,
      distance: '1.2 km',
      price: '10,000 - 20,000 FCFA',
      available: true,
      avatar: '👤'
    },
    {
      id: 2,
      name: 'Jean-Pierre Kouassi',
      profession: 'Electrician',
      rating: 4.6,
      reviews: 87,
      distance: '2.5 km',
      price: '5,000 - 15,000 FCFA',
      available: true,
      avatar: '👤'
    },
    {
      id: 3,
      name: 'Fatou N\'Diaye',
      profession: 'Plumber',
      rating: 4.7,
      reviews: 95,
      distance: '1.8 km',
      price: '8,000 - 18,000 FCFA',
      available: true,
      avatar: '👤'
    }
  ]

  return (
    <ScreenLayout title="Résultats de recherche" showBack showBottomNav>
      <div className="search-results">
        <div className="sort-bar">
          <button className="sort-btn active">Pertinence</button>
          <button className="sort-btn">Distance</button>
          <button className="sort-btn">Note</button>
          <button className="sort-btn">Prix</button>
        </div>
        <div className="results-list">
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className="professional-card"
              onClick={() => navigate(`/services/professional/${prof.id}`)}
            >
              <div className="prof-image">{prof.avatar}</div>
              <div className="prof-details">
                <h3>{prof.name}</h3>
                <p className="prof-type">{prof.profession}</p>
                <div className="prof-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{prof.rating}</span>
                  <span className="reviews">({prof.reviews} avis)</span>
                </div>
                <div className="prof-info">
                  <span>{prof.distance}</span>
                  <span>•</span>
                  <span>{prof.price}</span>
                </div>
                {prof.available && <span className="available-badge">Available Now</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default SearchResults

