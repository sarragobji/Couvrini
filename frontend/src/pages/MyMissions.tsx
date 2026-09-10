import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyMissions,
  startMission,
  completeMission,
  cancelMission,
  type Mission,
} from '../api/missionApi'

function MyMissions() {
  const navigate = useNavigate()

  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMissions = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await getMyMissions()
      setMissions(result)
    } catch (err) {
      console.error(err)
      setError('Could not load your missions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMissions()
  }, [])

  const handleStart = async (id: number) => {
    try {
      await startMission(id)
      await loadMissions()
    } catch (err) {
      console.error(err)
      alert('Could not start the mission.')
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await completeMission(id)
      await loadMissions()
    } catch (err) {
      console.error(err)
      alert('Could not complete the mission.')
    }
  }

  const handleCancel = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this mission?',
    )

    if (!confirmed) return

    try {
      await cancelMission(id)
      await loadMissions()
    } catch (err) {
      console.error(err)
      alert('Could not cancel the mission.')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return <p>Loading missions...</p>
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={loadMissions}>Try again</button>
      </div>
    )
  }

  return (
    <div>
      <h1>My Missions</h1>

      <button onClick={() => navigate('/worker')}>
        ← Back to Dashboard
      </button>

      {missions.length === 0 ? (
        <div>
          <h2>No missions yet</h2>
          <p>
            When a manager accepts one of your applications, the mission will
            appear here.
          </p>

          <button onClick={() => navigate('/worker/shifts')}>
            Find Shifts
          </button>
        </div>
      ) : (
        <div>
          {missions.map((mission) => (
            <div
              key={mission.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px',
              }}
            >
              <h2>
                {mission.shift.title || 'Replacement Mission'}
              </h2>

              <p>
                <strong>Company:</strong> {mission.company.name}
              </p>

              <p>
                <strong>Date:</strong>{' '}
                {formatDate(mission.shift.shiftDate)}
              </p>

              <p>
                <strong>Time:</strong> {mission.shift.startTime} -{' '}
                {mission.shift.endTime}
              </p>

              {mission.shift.location && (
                <p>
                  <strong>Location:</strong> {mission.shift.location}
                </p>
              )}

              <p>
                <strong>Payment:</strong>{' '}
                {mission.shift.paymentAmount}{' '}
                {mission.shift.paymentCurrency}
              </p>

              <p>
                <strong>Status:</strong> {mission.status}
              </p>

              {mission.shift.description && (
                <p>
                  <strong>Description:</strong>{' '}
                  {mission.shift.description}
                </p>
              )}

              <div style={{ marginTop: '12px' }}>
                {mission.status === 'ASSIGNED' && (
                  <>
                    <button
                      onClick={() => handleStart(mission.id)}
                    >
                      Start Mission
                    </button>

                    <button
                      onClick={() => handleCancel(mission.id)}
                      style={{ marginLeft: '8px' }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {mission.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={() => handleComplete(mission.id)}
                    >
                      Complete Mission
                    </button>

                    <button
                      onClick={() => handleCancel(mission.id)}
                      style={{ marginLeft: '8px' }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {mission.status === 'COMPLETED' && (
                  <>
                    <p>✓ Mission completed</p>
                    <button
                      onClick={() =>
                        navigate(`/worker/missions/${mission.id}/review`)
                      }
                    >
                      Leave a Review
                    </button>
                  </>
                )}

                {mission.status === 'CANCELLED' && (
                  <p>Mission cancelled</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyMissions