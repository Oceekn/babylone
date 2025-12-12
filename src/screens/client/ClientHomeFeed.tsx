import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Menu, Search, Heart, MessageCircle, Send } from 'lucide-react'
import './ClientHomeFeed.css'

const ClientHomeFeed = () => {
  const navigate = useNavigate()

  const stories = [
    { name: 'Nadia', avatar: '👤' },
    { name: 'Jean', avatar: '👤' },
    { name: 'Fatima', avatar: '👤' },
    { name: 'Moussa', avatar: '👤' },
    { name: 'Aisha', avatar: '👤' }
  ]

  const professionals = [
    { name: 'Hair by Amina', type: 'Hair Stylist', avatar: '👤' },
    { name: 'Barber Shop', type: 'Barber', avatar: '👤' },
    { name: 'Make...', type: 'Makeup Artist', avatar: '👤' }
  ]

  const promotions = [
    { name: 'Salon Amina', discount: '20%', image: '💇' },
    { name: 'Fitness with Jean', discount: '15%', image: '💪' },
    { name: 'Cle:', discount: '10%', image: '🧹' }
  ]

  return (
    <ScreenLayout showBottomNav>
      <div className="client-home-feed">
        <header className="feed-header">
          <Menu size={24} />
          <h1 className="feed-title">Babylone</h1>
          <Search size={24} />
        </header>

        <div className="stories-section">
          <div className="stories-scroll">
            {stories.map((story, index) => (
              <div key={index} className="story-item">
                <div className="story-avatar">{story.avatar}</div>
                <span className="story-name">{story.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="feed-posts">
          <div className="post-card">
            <div className="post-image">💍</div>
            <div className="post-content">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">👤</div>
                  <span className="author-name">Aicha Diallo</span>
                </div>
              </div>
              <p className="post-text">
                New collection of handmade jewelry! Each piece is crafted with care and attention to detail. 
                Unique designs that reflect our rich culture. #handmadejewelry #cameroon #supportlocal
              </p>
              <div className="post-engagement">
                <button className="engagement-btn">
                  <Heart size={18} />
                  <span>23</span>
                </button>
                <button className="engagement-btn">
                  <MessageCircle size={18} />
                  <span>5</span>
                </button>
                <button className="engagement-btn">
                  <Send size={18} />
                  <span>2</span>
                </button>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2>Popular Professionals</h2>
          </div>
          <div className="professionals-scroll">
            {professionals.map((prof, index) => (
              <div key={index} className="professional-card">
                <div className="prof-avatar">{prof.avatar}</div>
                <h3>{prof.name}</h3>
                <p>{prof.type}</p>
              </div>
            ))}
          </div>

          <div className="post-card">
            <div className="post-image">👗</div>
            <div className="post-content">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">👤</div>
                  <span className="author-name">Moussa Traore</span>
                </div>
              </div>
              <p className="post-text">
                Fantastic photoshoot! The jewelry by @AichaDiallo is absolutely stunning. 
                #photoshoot #jewelry #cameroon
              </p>
              <div className="post-engagement">
                <button className="engagement-btn">
                  <Heart size={18} />
                  <span>45</span>
                </button>
                <button className="engagement-btn">
                  <MessageCircle size={18} />
                  <span>12</span>
                </button>
                <button className="engagement-btn">
                  <Send size={18} />
                  <span>8</span>
                </button>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2>Promotions</h2>
          </div>
          <div className="promotions-scroll">
            {promotions.map((promo, index) => (
              <div key={index} className="promotion-card">
                <div className="promo-image">{promo.image}</div>
                <h3>{promo.name}</h3>
                <p className="promo-discount">{promo.discount} off</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ClientHomeFeed



