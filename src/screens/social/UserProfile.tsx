import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Share } from 'lucide-react'
import './UserProfile.css'

const UserProfile = () => {
  return (
    <ScreenLayout title="" showBack rightAction={<Share size={24} />} showBottomNav>
      <div className="user-profile">
        <div className="cover-image">🏔️</div>
        <div className="profile-info">
          <div className="profile-avatar">👤</div>
          <h2 className="profile-name">Aisha N.</h2>
          <p className="profile-title">Digital Artist</p>
          <p className="profile-bio">
            Passionate about art and design. Exploring the vibrant culture of Cameroon through my creations.
          </p>
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-number">234</span>
              <span className="stat-label">Friends</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">120</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>
          <div className="profile-actions">
            <Button variant="secondary">Message</Button>
            <Button variant="outline">Add Friend</Button>
          </div>
        </div>
        <div className="profile-tabs">
          <button className="tab active">Posts</button>
          <button className="tab">About</button>
          <button className="tab">Reviews</button>
        </div>
        <div className="posts-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="post-thumbnail">🖼️</div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default UserProfile



