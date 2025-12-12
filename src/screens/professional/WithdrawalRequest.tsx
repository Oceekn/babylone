import ScreenLayout from '../../components/common/ScreenLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { ArrowDownLeft } from 'lucide-react'
import './WithdrawalRequest.css'

const WithdrawalRequest = () => {
  return (
    <ScreenLayout title="Demande de retrait" showBack showBottomNav>
      <div className="withdrawal-request">
        <div className="available-balance">
          <p className="balance-label">Solde disponible</p>
          <p className="balance-amount">12 500 XAF</p>
        </div>
        <div className="amount-input-section">
          <Input
            label="Montant"
            type="number"
            placeholder="0 XAF"
          />
          <Button variant="outline" className="max-btn">Max</Button>
        </div>
        <div className="withdrawal-method">
          <h3>Méthode de retrait</h3>
          <label className="method-option">
            <input type="radio" name="method" value="mobile" defaultChecked />
            <span>Mobile Money</span>
          </label>
          <Input
            label="Numéro de téléphone"
            type="tel"
            placeholder="Enter phone number"
          />
        </div>
        <div className="fees-section">
          <div className="fee-row">
            <span>Frais de retrait</span>
            <span>250 XAF</span>
          </div>
          <div className="net-amount">
            <span>Montant net</span>
            <span className="net-value">12 250 XAF</span>
          </div>
        </div>
        <Button variant="primary" fullWidth>Demander le retrait</Button>
        <div className="withdrawal-history">
          <h3>Historique des retraits</h3>
          <div className="history-item">
            <ArrowDownLeft size={20} />
            <div>
              <p>Mobile Money</p>
              <p className="history-amount">12 250 XAF</p>
            </div>
            <p className="history-date">12/05/2024</p>
          </div>
          <div className="history-item">
            <ArrowDownLeft size={20} />
            <div>
              <p>Mobile Money</p>
              <p className="history-amount">12 250 XAF</p>
            </div>
            <p className="history-date">12/05/2024</p>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default WithdrawalRequest



