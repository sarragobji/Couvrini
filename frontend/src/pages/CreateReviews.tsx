import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMissionById, type Mission } from '../api/missionApi'
import {
  createReview,
  type ReviewRating,
} from '../api/reviewApi'

function CreateReview() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [mission, setMission] = useState<Mission | null>(null)

  const [rating, setRating] = useState<ReviewRating>('FIVE')
  const [comment, setComment] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadMission = async () => {
      try {
        if (!id) return

        const result = await getMissionById(Number(id))
        setMission(result)
      } catch {
        setError('Could not load mission.')
      } finally {
        setLoading(false)
      }
    }

    loadMission()
  }, [id])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!mission) return

    try {
      setSaving(true)
      setError('')

      /*
       * For now we use the mission's worker/company relationship.
       * The backend will verify that this is actually the correct
       * participant to review.
       */
      await createReview({
          missionId: mission.id,
          rating,
          comment: comment.trim() || undefined,
      })

      navigate('/worker/reviews')
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not create review.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading mission...</p>
  }

  if (!mission) {
    return <p>{error || 'Mission not found.'}</p>
  }

  return (
    <div>
      <h1>Leave a Review</h1>

      <button onClick={() => navigate('/worker/missions')}>
        Back to Missions
      </button>

      {error && <p>{error}</p>}

      <div>
        <h3>
          {mission.shift.title || 'Completed Mission'}
        </h3>

        <p>
          <strong>Company:</strong> {mission.company.name}
        </p>

        <p>
          <strong>Status:</strong> {mission.status}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Rating:
            <select
              value={rating}
              onChange={(e) =>
                setRating(e.target.value as ReviewRating)
              }
            >
              <option value="FIVE">⭐⭐⭐⭐⭐ 5 - Excellent</option>
              <option value="FOUR">⭐⭐⭐⭐ 4 - Good</option>
              <option value="THREE">⭐⭐⭐ 3 - Average</option>
              <option value="TWO">⭐⭐ 2 - Poor</option>
              <option value="ONE">⭐ 1 - Very Poor</option>
            </select>
          </label>
        </div>

        <br />

        <div>
          <label>
            Comment:
            <br />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="Share your experience..."
            />
          </label>
        </div>

        <br />

        <button type="submit" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

export default CreateReview