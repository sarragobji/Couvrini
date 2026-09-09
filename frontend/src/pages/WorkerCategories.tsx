import { useEffect, useState } from 'react'
import {
  addWorkerCategory,
  getCategories,
  getWorkerProfile,
  removeWorkerCategory,
  type Category,
  type WorkerProfile,
} from '../api/workerApi'

function WorkerCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [profile, setProfile] = useState<WorkerProfile | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadData = async () => {
    try {
      const [allCategories, workerProfile] =
        await Promise.all([
          getCategories(),
          getWorkerProfile(),
        ])

      setCategories(allCategories)
      setProfile(workerProfile)
    } catch {
      setError('Could not load your categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const myCategoryIds =
    profile?.categories.map(
      (workerCategory) => workerCategory.categoryId,
    ) || []

  const handleToggle = async (categoryId: number) => {
    try {
      setError('')
      setMessage('')

      if (myCategoryIds.includes(categoryId)) {
        await removeWorkerCategory(categoryId)
        setMessage('Category removed.')
      } else {
        await addWorkerCategory(categoryId)
        setMessage('Category added.')
      }

      await loadData()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not update category.',
      )
    }
  }

  if (loading) {
    return <p>Loading categories...</p>
  }

  return (
    <div>
      <h1>My Work Categories</h1>

      <p>
        Select the types of work you are interested in.
      </p>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {categories.map((category) => {
        const selected = myCategoryIds.includes(category.id)

        return (
          <div key={category.id}>
            <label>
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  handleToggle(category.id)
                }
              />

              {' '}

              {category.name}
            </label>

            {category.description && (
              <span> — {category.description}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default WorkerCategories