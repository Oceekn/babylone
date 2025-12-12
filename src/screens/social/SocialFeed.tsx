import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Settings, Heart, MessageCircle, Share2, Camera, Search } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import './SocialFeed.css'

const SocialFeed = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'pour-vous' | 'amis' | 'groupes'>('pour-vous')
  const [searchQuery, setSearchQuery] = useState('')

  const stories = [
    { name: 'Mireille', avatar: '👤' },
    { name: 'Jean', avatar: '👤' },
    { name: 'Aicha', avatar: '👤' },
    { name: 'Pierre', avatar: '👤' },
    { name: 'Fati', avatar: '👤' }
  ]

  const groups = [
    { id: 1, name: 'Cercle des Amis', members: 123, description: 'Un groupe pour les amis pour partager des moments et planifier des activités.', image: '👥', isMember: false },
    { id: 2, name: 'Entrepreneurs du Cameroun', members: 456, description: 'Un réseau pour les entrepreneurs camerounais pour se connecter et collaborer.', image: '💼', isMember: true },
    { id: 3, name: 'Yaoundé City Life', members: 789, description: 'Un groupe communautaire pour les résidents de Yaoundé pour discuter des événements locaux et services.', image: '🏙️', isMember: false },
    { id: 4, name: 'Artistes Locaux', members: 234, description: 'Une communauté pour les artistes locaux.', image: '🎨', isMember: false },
    { id: 5, name: 'Fitness Douala', members: 567, description: 'Groupe de fitness pour les habitants de Douala.', image: '💪', isMember: true }
  ]

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ScreenLayout
      title="Babylone"
      rightAction={<Settings size={24} />}
      showBottomNav
    >
      <div className="social-feed">
        <div className="stories-section">
          <div className="stories-scroll">
            <div className="story-item" onClick={() => navigate('/social/create-story')}>
              <div className="story-avatar add-story">
                <span className="plus-icon">+</span>
              </div>
              <span className="story-name">Ma story</span>
            </div>
            {stories.map((story, index) => (
              <div key={index} className="story-item">
                <div className="story-avatar">{story.avatar}</div>
                <span className="story-name">{story.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pour-vous' ? 'active' : ''}`}
            onClick={() => setActiveTab('pour-vous')}
          >
            Pour vous
          </button>
          <button 
            className={`tab ${activeTab === 'amis' ? 'active' : ''}`}
            onClick={() => setActiveTab('amis')}
          >
            Amis
          </button>
          <button 
            className={`tab ${activeTab === 'groupes' ? 'active' : ''}`}
            onClick={() => setActiveTab('groupes')}
          >
            Groupes
          </button>
        </div>

        {activeTab === 'groupes' ? (
          <div className="groups-section">
            <div className="groups-search">
              <Input
                placeholder="Rechercher un groupe..."
                icon={<Search size={20} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="groups-list">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="group-card"
                    onClick={() => navigate(`/social/group/${group.id}`)}
                  >
                    <div className="group-image">{group.image}</div>
                    <div className="group-info">
                      <h3 className="group-name">{group.name}</h3>
                      <p className="group-members">{group.members} membres</p>
                      <p className="group-description">{group.description}</p>
                      <Button
                        variant={group.isMember ? 'outline' : 'secondary'}
                        className="join-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle join/leave group logic here
                        }}
                      >
                        {group.isMember ? 'Membre' : 'Rejoindre'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>Aucun groupe trouvé</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="create-post-section">
              <div className="create-post-input" onClick={() => navigate('/social/create-post')}>
                <div className="create-avatar">👤</div>
                <span>Créer une publication...</span>
                <div className="create-post-icons">
                  <Search 
                    size={20} 
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/social/search-users')
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <Camera size={20} />
                </div>
              </div>
            </div>

            <div className="feed-posts">
          <div className="post-card">
            <div className="post-image">🏪</div>
            <div className="post-content">
              <div className="post-header">
                <span className="post-author">Mireille</span>
                <span className="post-time">1d</span>
              </div>
              <p className="post-text">
                Discovering the vibrant markets of Douala! The colors, the sounds, the energy - it is an experience like no other. #DoualaVibes #MarketLife
              </p>
              <div className="post-engagement">
                <button><Heart size={18} /> 23</button>
                <button><MessageCircle size={18} /> 12</button>
                <button><Share2 size={18} /> 6</button>
              </div>
            </div>
          </div>

          <div className="post-card">
            <div className="post-image">⚽</div>
            <div className="post-content">
              <div className="post-header">
                <span className="post-author">Jean</span>
                <span className="post-time">2d</span>
              </div>
              <p className="post-text">
                Just finished a great game of football with the guys. Nothing beats the camaraderie and the thrill of the game. #FootballLife #Cameroon
              </p>
              <div className="post-engagement">
                <button><Heart size={18} /> 45</button>
                <button><MessageCircle size={18} /> 20</button>
                <button><Share2 size={18} /> 10</button>
              </div>
            </div>
          </div>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  )
}

export default SocialFeed

