import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Star } from 'lucide-react'
import './ReviewsManagement.css'

const ReviewsManagement = () => {
  const reviews = [
    { id: 1, author: 'Nadia', rating: 5, text: 'Excellent service!', images: ['🖼️', '🖼️'], hasReply: false },
    { id: 2, author: 'Jean', rating: 5, text: 'Thank you for your kind words!', hasReply: true, isReply: true },
    { id: 3, author: 'Marie', rating: 5, text: 'Very professional and high quality work.', hasReply: false }
  ]

  return (
    <ScreenLayout title="Reviews" showBack showBottomNav>
      <div className="reviews-management">
        <div className="overall-rating">
          <div className="rating-display">
            <span className="rating-number">4.8</span>
            <div className="stars-large">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill={i < 4 ? 'currentColor' : 'none'} />
              ))}
            </div>
            <p>124 reviews</p>
          </div>
          <div className="rating-breakdown">
            <div className="breakdown-bar">
              <span>5</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '75%' }}></div>
              </div>
              <span>75%</span>
            </div>
            <div className="breakdown-bar">
              <span>4</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '15%' }}></div>
              </div>
              <span>15%</span>
            </div>
            <div className="breakdown-bar">
              <span>3</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '5%' }}></div>
              </div>
              <span>5%</span>
            </div>
            <div className="breakdown-bar">
              <span>2</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '3%' }}></div>
              </div>
              <span>3%</span>
            </div>
            <div className="breakdown-bar">
              <span>1</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: '2%' }}></div>
              </div>
              <span>2%</span>
            </div>
          </div>
        </div>
        <div className="filter-buttons">
          <button className="filter-btn active">Tout</button>
          <button className="filter-btn">5 ★</button>
          <button className="filter-btn">4 ★</button>
          <button className="filter-btn">3 ★</button>
          <button className="filter-btn">2 ★</button>
          <button className="filter-btn">1 ★</button>
        </div>
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className={`review-item ${review.isReply ? 'reply' : ''}`}>
              <div className="review-avatar">👤</div>
              <div className="review-content">
                <div className="review-header">
                  <span className="review-author">{review.author}</span>
                  {!review.isReply && (
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="review-text">{review.text}</p>
                {review.images && (
                  <div className="review-images">
                    {review.images.map((img, i) => (
                      <div key={i} className="review-image">{img}</div>
                    ))}
                  </div>
                )}
                {!review.hasReply && !review.isReply && (
                  <Button variant="outline" className="reply-btn">Reply</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export default ReviewsManagement



