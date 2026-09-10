import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createPayment,
  getPayments,
  updatePaymentStatus,
  type Payment,
} from '../api/paymentApi'
import { getMyMissions, type Mission } from '../api/missionApi'

function ManagerPayments() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState<Payment[]>([])
  const [missions, setMissions] = useState<Mission[]>([])

  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [currency, setCurrency] = useState('TND')

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [paymentResult, missionResult] = await Promise.all([
        getPayments(),
        getMyMissions(),
      ])

      setPayments(paymentResult)

      const completedMissions = missionResult.filter(
        (mission) => mission.status === 'COMPLETED',
      )

      setMissions(completedMissions)
    } catch {
      setError('Could not load payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreatePayment = async () => {
    if (!selectedMissionId) {
      setError('Please select a mission.')
      return
    }

    try {
      setCreating(true)
      setError('')

      await createPayment(Number(selectedMissionId), currency)

      setSelectedMissionId('')
      await loadData()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not create the payment.',
      )
    } finally {
      setCreating(false)
    }
  }

  const handleMarkAsPaid = async (paymentId: number) => {
    try {
      setError('')

      await updatePaymentStatus(paymentId, 'COMPLETED')

      await loadData()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not update the payment.',
      )
    }
  }

  if (loading) {
    return <p>Loading payments...</p>
  }

  return (
    <div>
      <h1>Payments</h1>

      <button onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>

      {error && <p>{error}</p>}

      <hr />

      <h2>Create Payment</h2>

      {missions.length === 0 ? (
        <p>No completed missions available for payment.</p>
      ) : (
        <div>
          <label>
            Completed Mission:
            <select
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
            >
              <option value="">Select a mission</option>

              {missions.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  Mission #{mission.id} -{' '}
                  {mission.shift.title || 'Untitled'} -{' '}
                  {mission.shift.paymentAmount}{' '}
                  {mission.shift.paymentCurrency}
                </option>
              ))}
            </select>
          </label>

          <br />
          <br />

          <label>
            Currency:
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              maxLength={10}
            />
          </label>

          <br />
          <br />

          <button
            onClick={handleCreatePayment}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Payment'}
          </button>
        </div>
      )}

      <hr />

      <h2>Payment History</h2>

      {payments.length === 0 ? (
        <p>No payments yet.</p>
      ) : (
        payments.map((payment) => (
          <div
            key={payment.id}
            style={{
              border: '1px solid #ccc',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <h3>
              {payment.mission?.shift?.title ||
                `Payment #${payment.id}`}
            </h3>

            <p>
              <strong>Payment ID:</strong> {payment.id}
            </p>

            <p>
              <strong>Mission ID:</strong> {payment.missionId}
            </p>

            <p>
              <strong>Company:</strong>{' '}
              {payment.mission?.company?.name || 'Unknown'}
            </p>

            <p>
              <strong>Amount:</strong> {payment.amount}{' '}
              {payment.currency}
            </p>

            <p>
              <strong>Status:</strong> {payment.status}
            </p>

            {payment.status === 'PENDING' && (
              <button
                onClick={() => handleMarkAsPaid(payment.id)}
              >
                Mark as Paid
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default ManagerPayments