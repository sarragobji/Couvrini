import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cancelShift,
  getShifts,
  type Shift,
} from '../api/workerApi'

function MyShifts() {
  const navigate = useNavigate()

  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadShifts = async () => {
    try {
      setError('')

      const result = await getShifts()

      setShifts(result)
    } catch {
      setError('Could not load your shifts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShifts()
  }, [])

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this shift?')) {
      return
    }

    try {
      await cancelShift(id)
      await loadShifts()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not cancel this shift.',
      )
    }
  }

  if (loading) {
    return <p>Loading shifts...</p>
  }

  return (
    <div>
      <h1>My Shifts</h1>

      {error && <p>{error}</p>}

      <button
        onClick={() => navigate('/dashboard/shifts/create')}
      >
        Create Replacement Shift
      </button>

      <hr />

      {!shifts.length ? (
        <p>You haven't created any shifts yet.</p>
      ) : (
        <div>
          {shifts.map((shift) => (
            <div key={shift.id}>
              <h2>
                {shift.title || 'Replacement shift'}
              </h2>

              <p>
                {shift.company?.name}
              </p>

              <p>
                {shift.shiftDate.slice(0, 10)}
                {' — '}
                {shift.startTime} - {shift.endTime}
              </p>

              <p>
                Category: {shift.category?.name}
              </p>

              <p>
                Payment: {shift.paymentAmount}{' '}
                {shift.paymentCurrency}
              </p>

              <p>Status: {shift.status}</p>

              <button
                onClick={() =>
                  navigate(`/dashboard/shifts/${shift.id}`)
                }
              >
                View Applications
              </button>

              {shift.status !== 'CANCELLED' &&
                shift.status !== 'COMPLETED' &&
                shift.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleCancel(shift.id)}
                  >
                    Cancel
                  </button>
                )}

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyShifts