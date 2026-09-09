import { useEffect, useState } from 'react'
import {
  createWorkerProfile,
  getWorkerProfile,
  updateWorkerProfile,
  type WorkerProfile as WorkerProfileType,
} from '../api/workerApi'

function WorkerProfile() {
  const [profile, setProfile] = useState<WorkerProfileType | null>(null)

  const [bio, setBio] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState(0)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await getWorkerProfile()

      setProfile(data)
      setBio(data.bio || '')
      setResumeUrl(data.resumeUrl || '')
      setYearsOfExperience(data.yearsOfExperience || 0)
    } catch (error: any) {
      // 404 means the worker doesn't have a profile yet.
      if (error.response?.status !== 404) {
        setError('Could not load your profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setSuccess('')
    setSaving(true)

    const data = {
      bio,
      resumeUrl,
      yearsOfExperience,
    }

    try {
      if (profile) {
        await updateWorkerProfile(data)
        setSuccess('Profile updated successfully.')
      } else {
        const newProfile = await createWorkerProfile(data)
        setProfile(newProfile)
        setSuccess('Profile created successfully.')
      }
    } catch (error: any) {
      const message = error.response?.data?.message

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Could not save your profile.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading profile...</p>
  }

  return (
    <div>
      <h1>My Profile</h1>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Bio</label>
          <br />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
          />
        </div>

        <br />

        <div>
          <label>Resume URL</label>
          <br />
          <input
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Years of experience</label>
          <br />
          <input
            type="number"
            min="0"
            value={yearsOfExperience}
            onChange={(e) =>
              setYearsOfExperience(Number(e.target.value))
            }
          />
        </div>

        <br />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>

      {profile && (
        <>
          <hr />

          <h3>Profile information</h3>

          <p>Average rating: {profile.averageRating}</p>
          <p>Total reviews: {profile.totalReviews}</p>
          <p>
            Verified: {profile.isVerified ? 'Yes' : 'No'}
          </p>
        </>
      )}
    </div>
  )
}

export default WorkerProfile