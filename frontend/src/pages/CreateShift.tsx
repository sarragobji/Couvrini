import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createShift,
  type CreateShiftData,
} from '../api/workerApi'
import {
  getMyCompanies,
  type CompanyMembership,
} from '../api/companyApi'
import {
  getCategories,
  getSkills,
  type Category,
  type Skill,
} from '../api/workerApi'

function CreateShift() {
  const navigate = useNavigate()

  const [companies, setCompanies] = useState<CompanyMembership[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [skills, setSkills] = useState<Skill[]>([])

  const [form, setForm] = useState<CreateShiftData>({
    companyId: 0,
    categoryId: 0,
    title: '',
    description: '',
    shiftDate: '',
    startTime: '',
    endTime: '',
    location: '',
    paymentAmount: 0,
    paymentCurrency: 'TND',
    notes: '',
    requiredSkillIds: [],
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [myCompanies, allCategories, allSkills] =
          await Promise.all([
            getMyCompanies(),
            getCategories(),
            getSkills(),
          ])

        setCompanies(myCompanies)
        setCategories(allCategories)
        setSkills(allSkills)

        if (myCompanies.length > 0) {
          setForm((current) => ({
            ...current,
            companyId: myCompanies[0].companyId,
          }))
        }

        if (allCategories.length > 0) {
          setForm((current) => ({
            ...current,
            categoryId: allCategories[0].id,
          }))
        }
      } catch {
        setError('Could not load the data needed to create a shift.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateField = (
    field: keyof CreateShiftData,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const toggleSkill = (skillId: number) => {
    setForm((current) => {
      const currentSkills = current.requiredSkillIds || []

      const exists = currentSkills.includes(skillId)

      return {
        ...current,
        requiredSkillIds: exists
          ? currentSkills.filter((id) => id !== skillId)
          : [...currentSkills, skillId],
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setError('')
      setSaving(true)

      await createShift(form)

      navigate('/dashboard/shifts')
    } catch (error: any) {
      const message = error.response?.data?.message

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Could not create the shift.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h1>Create Replacement Shift</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Company</label>
          <br />

          <select
            value={form.companyId}
            onChange={(event) =>
              updateField(
                'companyId',
                Number(event.target.value),
              )
            }
          >
            <option value={0}>Select company</option>

            {companies.map((membership) => (
              <option
                key={membership.companyId}
                value={membership.companyId}
              >
                {membership.company.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>Category</label>
          <br />

          <select
            value={form.categoryId}
            onChange={(event) =>
              updateField(
                'categoryId',
                Number(event.target.value),
              )
            }
          >
            <option value={0}>Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>Title</label>
          <br />

          <input
            value={form.title}
            onChange={(event) =>
              updateField('title', event.target.value)
            }
            placeholder="Example: Morning receptionist replacement"
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <br />

          <textarea
            value={form.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Date</label>
          <br />

          <input
            type="date"
            value={form.shiftDate}
            onChange={(event) =>
              updateField('shiftDate', event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Start time</label>
          <br />

          <input
            type="time"
            value={form.startTime}
            onChange={(event) =>
              updateField('startTime', event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>End time</label>
          <br />

          <input
            type="time"
            value={form.endTime}
            onChange={(event) =>
              updateField('endTime', event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Location</label>
          <br />

          <input
            value={form.location}
            onChange={(event) =>
              updateField('location', event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Payment amount</label>
          <br />

          <input
            type="number"
            min="0"
            value={form.paymentAmount}
            onChange={(event) =>
              updateField(
                'paymentAmount',
                Number(event.target.value),
              )
            }
          />
        </div>

        <br />

        <div>
          <label>Currency</label>
          <br />

          <input
            value={form.paymentCurrency}
            onChange={(event) =>
              updateField(
                'paymentCurrency',
                event.target.value,
              )
            }
          />
        </div>

        <br />

        <h3>Required skills</h3>

        {skills.map((skill) => (
          <label key={skill.id} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={form.requiredSkillIds?.includes(skill.id)}
              onChange={() => toggleSkill(skill.id)}
            />

            {' '}
            {skill.name}
          </label>
        ))}

        <br />

        <div>
          <label>Notes</label>
          <br />

          <textarea
            value={form.notes}
            onChange={(event) =>
              updateField('notes', event.target.value)
            }
          />
        </div>

        <br />

        <button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create Shift'}
        </button>
      </form>
    </div>
  )
}

export default CreateShift