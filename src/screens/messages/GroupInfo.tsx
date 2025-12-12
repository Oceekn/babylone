import { useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Bell, Image, DoorOpen, Archive, ChevronRight } from 'lucide-react'
import './GroupInfo.css'

const GroupInfo = () => {
  const navigate = useNavigate()

  const members = [
    { id: 1, name: 'Nadia', isAdmin: true, avatar: '👤' },
    { id: 2, name: 'Jean-Pierre', isAdmin: true, avatar: '👤' },
    { id: 3, name: 'Aisha', isAdmin: false, avatar: '👤' },
    { id: 4, name: 'Fatou', isAdmin: false, avatar: '👤' },
    { id: 5, name: 'Moussa', isAdmin: false, avatar: '👤' }
  ]

  return (
    <ScreenLayout title="Group Info" showBack showBottomNav>
      <div className="group-info">
        <div className="group-profile">
          <div className="group-avatars">
            <div className="group-avatar">👥</div>
            <div className="group-avatar">👥</div>
          </div>
          <h2 className="group-name">Les Amis</h2>
          <p className="member-count">12 members</p>
        </div>

        <Button variant="secondary" fullWidth>
          Ajouter des participants
        </Button>

        <div className="members-section">
          <h3 className="section-title">Members</h3>
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">{member.avatar}</div>
                <span className="member-name">{member.name}</span>
                {member.isAdmin && <span className="admin-badge">Admin</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="options-section">
          <div className="option-item">
            <Bell size={20} />
            <span>Notifications</span>
            <input type="checkbox" className="toggle" />
          </div>
          <div className="option-item">
            <Image size={20} />
            <span>Media/files</span>
            <ChevronRight size={20} />
          </div>
          <div className="option-item">
            <DoorOpen size={20} />
            <span>Quitter le group...</span>
            <ChevronRight size={20} />
          </div>
          <div className="option-item">
            <Archive size={20} />
            <span>Archiver</span>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default GroupInfo



