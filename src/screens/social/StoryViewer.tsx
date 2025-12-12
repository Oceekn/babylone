import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import { Eye } from 'lucide-react'
import './StoryViewer.css'

const StoryViewer = () => {
  return (
    <ScreenLayout>
      <div className="story-viewer">
        <div className="story-progress">
          <div className="progress-bar active"></div>
          <div className="progress-bar"></div>
          <div className="progress-bar"></div>
          <div className="progress-bar"></div>
          <div className="progress-bar"></div>
        </div>
        <div className="story-content">
          <div className="story-image">👤</div>
          <div className="story-views">
            <Eye size={20} />
            <span>1234</span>
          </div>
        </div>
        <div className="story-reply">
          <Input placeholder="Répondre à la story..." />
        </div>
      </div>
    </ScreenLayout>
  )
}

export default StoryViewer



