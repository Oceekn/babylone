import { useState } from 'react'
import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import './EditPersonalInfo.css'

const EditPersonalInfo = () => {
  const interests = ['Football', 'Musi c', 'Travel', 'Read ing', 'Cooking']
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Football'])

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  return (
    <ScreenLayout title="Edit Personal Info" showBack showBottomNav>
      <div className="edit-personal-info">
        <div className="form-section">
          <Input label="Name" placeholder="Enter your name" />
          <Input label="Email" type="email" placeholder="Enter your email" />
          <Input label="Phone Number" type="tel" placeholder="Enter your phone" />
          <Input label="City" placeholder="Enter your city" />
          <Input label="Gender" placeholder="Select gender" />
          <Input label="Date of Birth" type="date" />
        </div>
        <div className="interests-section">
          <label className="section-label">Centres d'intérêt</label>
          <div className="interests-list">
            {interests.map((interest) => (
              <button
                key={interest}
                className={`interest-tag ${selectedInterests.includes(interest) ? 'active' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        <Button variant="secondary" fullWidth>Enregistrer les modifications</Button>
      </div>
    </ScreenLayout>
  )
}

export default EditPersonalInfo

