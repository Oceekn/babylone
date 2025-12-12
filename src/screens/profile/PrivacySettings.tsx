import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import './PrivacySettings.css'

const PrivacySettings = () => {
  return (
    <ScreenLayout title="Privacy Settings" showBack showBottomNav>
      <div className="privacy-settings">
        <div className="settings-section">
          <Input label="Profile Visibility" placeholder="Select visibility" />
          <Input label="Who Can Contact Me" placeholder="Select option" />
        </div>
        <div className="settings-section">
          <div className="setting-item">
            <label>Allow Tagging</label>
            <input type="checkbox" className="toggle-switch" />
          </div>
        </div>
        <div className="blocked-contacts">
          <h3>Blocked Contacts</h3>
          <div className="blocked-item">
            <span>Samuel</span>
            <Button variant="outline">Unblock</Button>
          </div>
          <div className="blocked-item">
            <span>Isabelle</span>
            <Button variant="outline">Unblock</Button>
          </div>
        </div>
        <div className="login-history">
          <h3>Login History</h3>
          <div className="history-item">
            <div>
              <p className="device-name">iPhone 13</p>
              <p className="device-location">Yaounde, Cameroon</p>
            </div>
          </div>
          <div className="history-item">
            <div>
              <p className="device-name">Samsung Galaxy S21</p>
              <p className="device-location">Douala, Cameroon</p>
            </div>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default PrivacySettings



