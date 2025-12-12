import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Search, Plus } from 'lucide-react'
import './GroupsDiscovery.css'

const GroupsDiscovery = () => {
  const navigate = useNavigate()

  const groups = [
    { id: 1, name: 'Cercle des Amis', members: 123, description: 'A group for friends to share moments and plan activities.', image: '👥' },
    { id: 2, name: 'Entrepreneurs du Cameroun', members: 456, description: 'A network for Cameroonian entrepreneurs to connect and collaborate.', image: '💼' },
    { id: 3, name: 'Yaoundé City Life', members: 789, description: 'A community group for residents of Yaoundé to discuss local events and services.', image: '🏙️' }
  ]

  return (
    <ScreenLayout title="Groups" showBack showBottomNav>
      <div className="groups-discovery">
        <div className="search-section">
          <Input placeholder="Search groups" icon={<Search size={20} />} />
        </div>
        <div className="category-filters">
          <button className="filter-btn active">Loisirs</button>
          <button className="filter-btn">Professionnels</button>
          <button className="filter-btn">Locaux</button>
          <button className="filter-btn">Autres</button>
        </div>
        <div className="groups-list">
          {groups.map((group) => (
            <div key={group.id} className="group-card" onClick={() => navigate(`/social/group/${group.id}`)}>
              <div className="group-image">{group.image}</div>
              <div className="group-info">
                <h3>{group.name}</h3>
                <p className="group-members">{group.members} members</p>
                <p className="group-description">{group.description}</p>
                <Button variant="outline" className="join-btn">Rejoindre</Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" fullWidth className="create-group-btn">
          <Plus size={20} />
          Créer un groupe
        </Button>
      </div>
    </ScreenLayout>
  )
}

export default GroupsDiscovery



