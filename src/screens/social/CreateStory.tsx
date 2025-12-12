import ScreenLayout from '../../components/common/ScreenLayout'
import { Camera, Video, Image as ImageIcon, Type, Smile, Edit3, Share } from 'lucide-react'
import Button from '../../components/common/Button'
import './CreateStory.css'

const CreateStory = () => {
  return (
    <ScreenLayout>
      <div className="create-story">
        <div className="story-header">
          <Camera size={24} />
          <Video size={24} />
          <ImageIcon size={24} />
        </div>
        <div className="story-content">
          <div className="story-canvas">
            {/* Story content area */}
          </div>
        </div>
        <div className="story-toolbar">
          <button className="tool-btn"><Type size={24} /></button>
          <button className="tool-btn"><Smile size={24} /></button>
          <button className="tool-btn"><Edit3 size={24} /></button>
          <Button variant="primary" className="share-btn">
            <Share size={20} />
            Partager dans la story
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default CreateStory

