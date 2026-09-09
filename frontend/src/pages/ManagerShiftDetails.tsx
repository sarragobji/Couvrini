import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getShiftById,
  type Shift,
} from '../api/shiftApi'
import {
  getShiftApplications,
  updateApplicationStatus,
  type Application,
} from '../api/applicationApi'

function ManagerShiftDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [shift, setShift] = useState<Shift | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    if (!id) return

    try {
      setError('')

      const [shiftResult, shiftApplications] = await Promise.all([
        getShiftById(Number(id)),
        getShiftApplications(Number(id)),
      ])

      setShift(shiftResult)
      setApplications(shiftApplications)
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not load this shift.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleStatus = async (
    applicationId: number,
    status: 'ACCEPTED' | 'REJECTED',
  ) => {
    try {
      setError('')

      await updateApplicationStatus(
        applicationId,
        status,
      )

      await loadData()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not update the application.',
      )
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (!shift) {
    return <p>Shift not found.</p>
  }

  return (
    <div>
      <button onClick={() => navigate('/dashboard/shifts')}>
        ← Back to My Shifts
      </button>

      <h1>
        {shift.title || 'Replacement shift'}
      </h1>

      <p>
        {shift.company?.name}
      </p>

      <p>
        Date: {shift.shiftDate.slice(0, 10)}
      </p>

      <p>
        Time: {shift.startTime} - {shift.endTime}
      </p>

      <p>
        Category: {shift.category?.name}
      </p>

      <p>
        Payment: {shift.paymentAmount}{' '}
        {shift.paymentCurrency}
      </p>

      {shift.description && (
        <p>{shift.description}</p>
      )}

      <hr />

      <h2>Required Skills</h2>

      {!shift.requiredSkills?.length ? (
        <p>No specific skills required.</p>
      ) : (
        <ul>
          {shift.requiredSkills.map((requiredSkill) => (
            <li key={requiredSkill.id}>
              {requiredSkill.skill.name}
              {requiredSkill.requiredLevel
                ? ` — ${requiredSkill.requiredLevel}`
                : ''}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h2>Applications</h2>

      {error && <p>{error}</p>}

      {!applications.length ? (
        <p>No workers have applied yet.</p>
      ) : (
        applications.map((application) => (
          <div key={application.id}>
            <h3>
              {application.worker?.firstName}{' '}
              {application.worker?.lastName}
            </h3>

            <p>
              Status: {application.status}
            </p>

            {application.message && (
              <p>
                Message: {application.message}
              </p>
            )}

            <p>
              Applied:{' '}
              {new Date(
                application.appliedAt,
              ).toLocaleString()}
            </p>

            {application.status === 'PENDING' && (
              <>
                <button
                  onClick={() =>
                    handleStatus(
                      application.id,
                      'ACCEPTED',
                    )
                  }
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    handleStatus(
                      application.id,
                      'REJECTED',
                    )
                  }
                >
                  Reject
                </button>
              </>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  )
}

export default ManagerShiftDetails