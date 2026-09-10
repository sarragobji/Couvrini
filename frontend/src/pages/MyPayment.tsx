import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPayments, type Payment } from '../api/paymentApi'

function MyPayments() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await getPayments()
      setPayments(result)
    } catch {
      setError('Could not load your payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  if (loading) {
    return <p>Loading payments...</p>
  }

  return (
    <div>
      <h1>My Payments</h1>

      <button onClick={() => navigate('/worker')}>
        Back to Dashboard
      </button>

      {error && <p>{error}</p>}

      {!error && payments.length === 0 && (
        <p>You don't have any payments yet.</p>
      )}

      {payments.map((payment) => (
        <div
          key={payment.id}
          style={{
            border: '1px solid #ccc',
            padding: '16px',
            marginTop: '16px',
          }}
        >
          <h3>
            {payment.mission?.shift?.title || `Payment #${payment.id}`}
          </h3>

          <p>
            <strong>Company:</strong>{' '}
            {payment.mission?.company?.name || 'Unknown'}
          </p>

          <p>
            <strong>Amount:</strong> {payment.amount} {payment.currency}
          </p>

          <p>
            <strong>Status:</strong> {payment.status}
          </p>

          <p>
            <strong>Payment ID:</strong> {payment.id}
          </p>

          <p>
            <strong>Mission ID:</strong> {payment.missionId}
          </p>

          {payment.createdAt && (
            <p>
              <strong>Created:</strong>{' '}
              {new Date(payment.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default MyPayments