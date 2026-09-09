import { useEffect, useState } from 'react'
import {
  addWorkerSkill,
  getSkills,
  getWorkerProfile,
  removeWorkerSkill,
  type Skill,
  type WorkerProfile,
} from '../api/workerApi'

function WorkerSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [profile, setProfile] = useState<WorkerProfile | null>(null)

  const [selectedSkill, setSelectedSkill] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadData = async () => {
    try {
      const [allSkills, workerProfile] = await Promise.all([
        getSkills(),
        getWorkerProfile(),
      ])

      setSkills(allSkills)
      setProfile(workerProfile)
    } catch {
      setError('Could not load your skills.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async () => {
    if (!selectedSkill) return

    try {
      setError('')
      setMessage('')

      await addWorkerSkill(Number(selectedSkill))

      setSelectedSkill('')
      await loadData()

      setMessage('Skill added successfully.')
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not add this skill.',
      )
    }
  }

  const handleRemove = async (skillId: number) => {
    try {
      setError('')
      setMessage('')

      await removeWorkerSkill(skillId)
      await loadData()

      setMessage('Skill removed successfully.')
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Could not remove this skill.',
      )
    }
  }

  if (loading) {
    return <p>Loading skills...</p>
  }

  const mySkillIds =
    profile?.skills.map((workerSkill) => workerSkill.skillId) || []

  const availableSkills = skills.filter(
    (skill) => !mySkillIds.includes(skill.id),
  )

  return (
    <div>
      <h1>My Skills</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <h2>My current skills</h2>

      {!profile?.skills.length ? (
        <p>You haven't added any skills yet.</p>
      ) : (
        <ul>
          {profile.skills.map((workerSkill) => (
            <li key={workerSkill.skillId}>
              {workerSkill.skill.name}

              {' '}

              <button
                onClick={() =>
                  handleRemove(workerSkill.skillId)
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h2>Add a skill</h2>

      <select
        value={selectedSkill}
        onChange={(e) => setSelectedSkill(e.target.value)}
      >
        <option value="">Select a skill</option>

        {availableSkills.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleAdd}
        disabled={!selectedSkill}
      >
        Add Skill
      </button>
    </div>
  )
}

export default WorkerSkills