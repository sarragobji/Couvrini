import { useEffect, useState } from 'react'
import {
  getAvailability,
  updateAvailability,
  type Availability,
} from '../api/workerApi'

const days = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
]

function WorkerAvailability() {
  const [availability, setAvailability] = useState<
    Availability[]
  >([])

  const [loading, setLoading] = useState(true)
  const [savingDay, setSavingDay] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const data = await getAvailability()

        const week = days.map((day) => {
          const existing = data.find(
            (item) => item.dayOfWeek === day.id,
          )

          return (
            existing || {
              dayOfWeek: day.id,
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: false,
            }
          )
        })

        setAvailability(week)
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            'Could not load availability.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadAvailability()
  }, [])

  const updateDay = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime' | 'isAvailable',
    value: string | boolean,
  ) => {
    setAvailability((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, [field]: value }
          : day,
      ),
    )
  }

  const saveDay = async (day: Availability) => {
    try {
      setSavingDay(day.dayOfWeek)
      setError('')
      setMessage('')

      await updateAvailability(day)

      setMessage(
        `${days.find((d) => d.id === day.dayOfWeek)?.name} saved successfully.`,
      )
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not save availability.',
      )
    } finally {
      setSavingDay(null)
    }
  }

  if (loading) {
    return <p>Loading availability...</p>
  }

  return (
    <div>
      <h1>My Availability</h1>

      <p>
        Choose when you are available to work.
      </p>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {availability.map((day) => {
        const dayName = days.find(
          (d) => d.id === day.dayOfWeek,
        )?.name

        return (
          <div key={day.dayOfWeek}>
            <label>
              <input
                type="checkbox"
                checked={day.isAvailable}
                onChange={(e) =>
                  updateDay(
                    day.dayOfWeek,
                    'isAvailable',
                    e.target.checked,
                  )
                }
              />

              {' '}

              <strong>{dayName}</strong>
            </label>

            {' '}

            <input
              type="time"
              value={day.startTime}
              disabled={!day.isAvailable}
              onChange={(e) =>
                updateDay(
                  day.dayOfWeek,
                  'startTime',
                  e.target.value,
                )
              }
            />

            {' - '}

            <input
              type="time"
              value={day.endTime}
              disabled={!day.isAvailable}
              onChange={(e) =>
                updateDay(
                  day.dayOfWeek,
                  'endTime',
                  e.target.value,
                )
              }
            />

            {' '}

            <button
              onClick={() => saveDay(day)}
              disabled={savingDay === day.dayOfWeek}
            >
              {savingDay === day.dayOfWeek
                ? 'Saving...'
                : 'Save'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default WorkerAvailability