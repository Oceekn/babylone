import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import { Camera, Send, Users } from 'lucide-react'
import './GroupPage.css'

interface GroupPost {
  id: string
  author: string
  text: string
  time: string
}

const GroupPage = () => {
  const { id } = useParams<{ id: string }>()
  const [group, setGroup] = useState<any>(null)
  const [posts, setPosts] = useState<GroupPost[]>([])
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    // Charger depuis localStorage
    const stored = localStorage.getItem('social_groups')
    const groups = stored ? JSON.parse(stored) : []
    const found = groups.find((g: any) => g.id === id)
    setGroup(found || { id, name: 'Groupe', members: 0, description: '' })

    // Posts du groupe
    const storedPosts = localStorage.getItem(`group_posts_${id}`)
    setPosts(storedPosts ? JSON.parse(storedPosts) : [
      { id: '1', author: 'Membre', text: 'Bienvenue dans le groupe !', time: 'hier' },
    ])
  }, [id])

  const handlePost = () => {
    if (!newPost.trim()) return
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const post: GroupPost = {
      id: Date.now().toString(),
      author: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Vous',
      text: newPost.trim(),
      time: 'maintenant',
    }
    const updated = [post, ...posts]
    setPosts(updated)
    localStorage.setItem(`group_posts_${id}`, JSON.stringify(updated))
    setNewPost('')
  }

  if (!group) return null

  return (
    <ScreenLayout title="Groupe" showBack showBottomNav>
      <div className="group-page">
        <div className="group-cover">
          <Users size={40} />
        </div>

        <div className="group-header-info">
          <h2>{group.name}</h2>
          <p className="group-member-count">{group.members} membres</p>
        </div>

        {group.description && (
          <div className="group-description">
            <p>{group.description}</p>
          </div>
        )}

        <div className="publications-section">
          <h3>Publications</h3>

          <div className="create-post-mini">
            <input
              type="text"
              placeholder="Ecrire quelque chose..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              className="mini-input"
            />
            <button className="send-btn" onClick={handlePost} disabled={!newPost.trim()}>
              <Send size={18} />
            </button>
          </div>

          <div className="publications-list">
            {posts.map((post) => (
              <div key={post.id} className="publication-item">
                <div className="pub-avatar">{post.author.charAt(0)}</div>
                <div className="pub-content">
                  <div className="pub-header">
                    <span className="pub-author">{post.author}</span>
                    <span className="pub-time">{post.time}</span>
                  </div>
                  <p className="pub-text">{post.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default GroupPage
