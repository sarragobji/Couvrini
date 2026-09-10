import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyReviews, type Review } from '../api/reviewApi'

function ratingToNumber(rating: Review['rating']) {
  const values = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  }

  return values[rating]
}

function MyReviews() {
  const navigate = useNavigate()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReviews = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await getMyReviews()
      setReviews(result)
    } catch {
      setError('Could not load reviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  if (loading) {
    return <p>Loading reviews...</p>
  }

  return (
    <div>
      <h1>My Reviews</h1>

      <button onClick={() => navigate('/worker')}>
        Back to Dashboard
      </button>

      {error && <p>{error}</p>}

      {!error && reviews.length === 0 && (
        <p>You don't have any reviews yet.</p>
      )}

      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            border: '1px solid #ccc',
            padding: '16px',
            marginTop: '16px',
          }}
        >
          <h3>
            {review.reviewerId === review.reviewedUserId
              ? 'Review'
              : review.reviewer
                ? `Review by ${review.reviewer.firstName} ${review.reviewer.lastName}`
                : 'Review'}
          </h3>

          <p>
            <strong>Rating:</strong>{' '}
            {'⭐'.repeat(ratingToNumber(review.rating))}
          </p>

          <p>
            <strong>Rating value:</strong>{' '}
            {ratingToNumber(review.rating)}/5
          </p>

          <p>
            <strong>Comment:</strong>{' '}
            {review.comment || 'No comment'}
          </p>

          <p>
            <strong>Mission:</strong> #{review.missionId}
          </p>

          {review.mission?.shift?.title && (
            <p>
              <strong>Shift:</strong>{' '}
              {review.mission.shift.title}
            </p>
          )}

          {review.createdAt && (
            <p>
              <strong>Date:</strong>{' '}
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default MyReviews