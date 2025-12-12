import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star, Camera, X } from 'lucide-react'
import './RateReview.css'

const RateReview = () => {
  return (
    <ScreenLayout title="Rate & Review" showClose>
      <div className="rate-review">
        <div className="review-header">
          <div className="review-avatar">👤</div>
          <div>
            <h3>Marie Dubois</h3>
            <p>Photographer</p>
          </div>
        </div>
        <div className="rating-display">
          <div className="rating-number">5</div>
          <div className="stars-large">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={32} fill="currentColor" />
            ))}
          </div>
          <p>1 review</p>
        </div>
        <div className="rating-breakdown">
          <div className="breakdown-item">
            <span>Ponctualité</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="breakdown-item">
            <span>Qualité</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="breakdown-item">
            <span>Rapport qualité-prix</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
        <textarea
          className="review-textarea"
          placeholder="Write your review..."
          rows={6}
        />
        <div className="add-photos">
          <Camera size={48} />
          <p>Add photos</p>
        </div>
        <Button variant="secondary" fullWidth>Submit Review</Button>
      </div>
    </ScreenLayout>
  )
}

export default RateReview



