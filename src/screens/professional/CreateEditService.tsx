import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Camera } from 'lucide-react'
import './CreateEditService.css'

const CreateEditService = () => {
  return (
    <ScreenLayout title="Create/Edit Service" showClose>
      <div className="create-edit-service">
        <div className="form-section">
          <Input label="Service Name" placeholder="Enter service name" />
          <Input label="Category" placeholder="Select category" />
          <Input label="Estimated Duration" placeholder="Enter duration" />
          <Input label="Price (FCFA)" type="number" placeholder="Enter price" />
        </div>
        <div className="photos-section">
          <div className="photo-upload-area">
            <Camera size={48} />
            <p>Upload up to 5 photos</p>
            <p className="upload-hint">Showcase your service with high-quality images</p>
          </div>
        </div>
        <Button variant="primary" fullWidth>Save</Button>
      </div>
    </ScreenLayout>
  )
}

export default CreateEditService

