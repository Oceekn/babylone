import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search, Users } from 'lucide-react'
import './GroupsDiscovery.css'

interface Group {
  id: string
  name: string
  members: number
  description: string
  category: string
  joined: boolean
}

const defaultGroups: Group[] = [
  { id: 'g1', name: 'Cercle des Amis', members: 123, description: 'Un groupe pour les amis pour partager des moments et planifier des activites.', category: 'Loisirs', joined: false },
  { id: 'g2', name: 'Entrepreneurs du Cameroun', members: 456, description: 'Un reseau pour les entrepreneurs camerounais.', category: 'Professionnels', joined: false },
  { id: 'g3', name: 'Douala City Life', members: 789, description: 'Une communaute pour les residents de Douala.', category: 'Locaux', joined: true },
  { id: 'g4', name: 'Tech Cameroon', members: 234, description: 'Developpeurs et tech enthusiasts au Cameroun.', category: 'Professionnels', joined: false },
]

const GroupsDiscovery = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [groups, setGroups] = useState<Group[]>(() => {
    const stored = localStorage.getItem('social_groups')
    return stored ? JSON.parse(stored) : defaultGroups
  })

  const categories = ['Tous', 'Loisirs', 'Professionnels', 'Locaux']

  const filteredGroups = groups.filter(g => {
    const matchSearch = !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = activeCategory === 'Tous' || g.category === activeCategory
    return matchSearch && matchCategory
  })

  const handleJoin = (groupId: string) => {
    const updated = groups.map(g => g.id === groupId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g)
    setGroups(updated)
    localStorage.setItem('social_groups', JSON.stringify(updated))
  }

  return (
    <ScreenLayout title="Groupes" showBack showBottomNav>
      <div className="groups-discovery">
        <div className="search-section">
          <Input
            placeholder="Rechercher un groupe..."
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button key={cat} className={`filter-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="groups-list">
          {filteredGroups.map((group) => (
            <div key={group.id} className="group-card" onClick={() => navigate(`/social/group/${group.id}`)}>
              <div className="group-image">
                <Users size={24} />
              </div>
              <div className="group-info">
                <h3>{group.name}</h3>
                <p className="group-members">{group.members} membres</p>
                <p className="group-description">{group.description}</p>
                <Button
                  variant={group.joined ? 'outline' : 'secondary'}
                  className="join-btn"
                  onClick={() => handleJoin(group.id)}
                >
                  {group.joined ? 'Membre' : 'Rejoindre'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default GroupsDiscovery
