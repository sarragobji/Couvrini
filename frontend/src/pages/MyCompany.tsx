import { useEffect, useState } from 'react'
import {
  getMyCompanies,
  getCompanyMembers,
  type CompanyMembership,
  type CompanyMember,
} from '../api/companyApi'

function MyCompany() {
  const [companies, setCompanies] = useState<CompanyMembership[]>([])
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyMembership | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const result = await getMyCompanies()

        setCompanies(result)

        if (result.length > 0) {
          setSelectedCompany(result[0])

          setMembers(await getCompanyMembers(result[0].companyId))
        }
      } catch {
        setError('Could not load your company.')
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [])

  if (loading) {
    return <p>Loading company...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!companies.length) {
    return (
      <div>
        <h1>My Company</h1>
        <p>You don't belong to a company yet.</p>
      </div>
    )
  }

  const company = selectedCompany?.company

  return (
    <div>
      <h1>My Company</h1>

      {companies.length > 1 && (
        <select
          value={selectedCompany?.companyId}
          onChange={async (event) => {
            const companyId = Number(event.target.value)

            const selected = companies.find(
              (item) => item.companyId === companyId,
            )

            if (!selected) return

            setSelectedCompany(selected)

            try {
              setMembers(await getCompanyMembers(companyId))
            } catch {
              setError('Could not load company members.')
            }
          }}
        >
          {companies.map((item) => (
            <option key={item.companyId} value={item.companyId}>
              {item.company.name}
            </option>
          ))}
        </select>
      )}

      {company && (
        <>
          <h2>{company.name}</h2>

          {company.description && (
            <p>{company.description}</p>
          )}

          {company.address && <p>Address: {company.address}</p>}
          {company.city && <p>City: {company.city}</p>}
          {company.phone && <p>Phone: {company.phone}</p>}
          {company.email && <p>Email: {company.email}</p>}
          {company.websiteUrl && (
            <p>Website: {company.websiteUrl}</p>
          )}
        </>
      )}

      <hr />

      <h2>Members</h2>

      {!members.length ? (
        <p>No members.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.user.firstName} {member.user.lastName}
              {' — '}
              {member.role}
              {' — '}
              {member.user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyCompany