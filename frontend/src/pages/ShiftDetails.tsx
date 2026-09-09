import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getShiftById,
  type Shift,
} from '../api/shiftApi'
import {
  createApplication,
} from '../api/applicationApi'

function ShiftDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [shift, setShift] = useState<Shift | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadShift = async () => {
      try {
        if (!id) return

        const data = await getShiftById(Number(id))
        setShift(data)
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            'Could not load this shift.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadShift()
  }, [id])

  const handleApply = async () => {
    if (!shift) return

    try {
      setApplying(true)
      setError('')
      setSuccess('')

      await createApplication(
        shift.id,
        message.trim() || undefined,
      )

      setSuccess('Your application was submitted successfully.')
      setMessage('')
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not submit your application.',
      )
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <p>Loading shift...</p>
  }

  if (error && !shift) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate('/worker/shifts')}>
          Back to shifts
        </button>
      </div>
    )
  }

  if (!shift) {
    return <p>Shift not found.</p>
  }

  return (
    <div>
      <button onClick={() => navigate('/worker/shifts')}>
        ← Back
      </button>

      <h1>{shift.title || 'Replacement request'}</h1>

      <p>
        <strong>Date:</strong>{' '}
        {new Date(shift.shiftDate).toLocaleDateString()}
      </p>

      <p>
        <strong>Time:</strong>{' '}
        {shift.startTime} - {shift.endTime}
      </p>

      {shift.location && (
        <p>
          <strong>Location:</strong> {shift.location}
        </p>
      )}

      {shift.paymentAmount !== undefined && (
        <p>
          <strong>Payment:</strong>{' '}
          {shift.paymentAmount} {shift.paymentCurrency}
        </p>
      )}

      {shift.description && (
        <>
          <h2>Description</h2>
          <p>{shift.description}</p>
        </>
      )}

      {shift.notes && (
        <>
          <h2>Notes</h2>
          <p>{shift.notes}</p>
        </>
      )}

      {shift.requiredSkills &&
        shift.requiredSkills.length > 0 && (
          <>
            <h2>Required Skills</h2>

            <ul>
              {shift.requiredSkills.map((requiredSkill) => (
                <li key={requiredSkill.skillId}>
                  {requiredSkill.skill.name}
                </li>
              ))}
            </ul>
          </>
        )}

      <hr />

      <h2>Apply for this shift</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a short message to the manager..."
        rows={5}
        cols={50}
        maxLength={2000}
      />

      <br />

      <button
        onClick={handleApply}
        disabled={applying || shift.status !== 'OPEN'}
      >
        {applying ? 'Applying...' : 'Apply'}
      </button>

      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
    </div>
  )
}

export default ShiftDetails