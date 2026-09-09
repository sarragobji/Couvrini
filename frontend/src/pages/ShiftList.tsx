import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getShifts,
  type Shift,
} from '../api/shiftApi'

function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const loadShifts = async () => {
      try {
        const data = await getShifts({
          status: 'OPEN',
        })

        setShifts(data)
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            'Could not load available shifts.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadShifts()
  }, [])

  if (loading) {
    return <p>Loading available shifts...</p>
  }

  return (
    <div>
      <h1>Available Shifts</h1>

      {error && <p>{error}</p>}

      {!shifts.length && (
        <p>No replacement requests are currently available.</p>
      )}

      {shifts.map((shift) => (
        <div
          key={shift.id}
          style={{
            border: '1px solid #ccc',
            padding: '16px',
            marginBottom: '12px',
          }}
        >
          <h2>{shift.title || 'Replacement request'}</h2>

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

          <p>
            <strong>Status:</strong> {shift.status}
          </p>

          <button
            onClick={() => navigate(`/worker/shifts/${shift.id}`)}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  )
}

export default ShiftList