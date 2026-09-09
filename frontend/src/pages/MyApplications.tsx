import { useEffect, useState } from 'react'
import {
  getMyApplications,
  withdrawApplication,
  type Application,
} from '../api/applicationApi'

function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadApplications = async () => {
    try {
      setError('')

      const data = await getMyApplications()
      setApplications(data)
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not load your applications.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleWithdraw = async (id: number) => {
    try {
      setError('')
      setMessage('')

      await withdrawApplication(id)

      await loadApplications()

      setMessage('Application withdrawn successfully.')
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not withdraw the application.',
      )
    }
  }

  if (loading) {
    return <p>Loading your applications...</p>
  }

  return (
    <div>
      <h1>My Applications</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {!applications.length && (
        <p>You haven't applied to any shifts yet.</p>
      )}

      {applications.map((application) => (
        <div
          key={application.id}
          style={{
            border: '1px solid #ccc',
            padding: '16px',
            marginBottom: '12px',
          }}
        >
          <h2>
            {application.shift?.title ||
              `Application #${application.id}`}
          </h2>

          {application.shift && (
            <>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(
                  application.shift.shiftDate,
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong>{' '}
                {application.shift.startTime} -{' '}
                {application.shift.endTime}
              </p>
            </>
          )}

          <p>
            <strong>Status:</strong> {application.status}
          </p>

          {application.message && (
            <p>
              <strong>Your message:</strong>{' '}
              {application.message}
            </p>
          )}

          <p>
            <strong>Applied:</strong>{' '}
            {new Date(
              application.appliedAt,
            ).toLocaleString()}
          </p>

          {application.status === 'PENDING' && (
            <button
              onClick={() =>
                handleWithdraw(application.id)
              }
            >
              Withdraw
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default MyApplications