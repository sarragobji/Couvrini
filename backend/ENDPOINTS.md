# Couvrini Backend REST API Endpoints

Complete list of all available REST endpoints grouped by module. All endpoints require JWT authentication via Bearer token in the Authorization header (except public endpoints if any).

## Authentication Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Register a new user account |
| POST | `/auth/login` | Public | Login with email and password, returns JWT token |
| GET | `/auth/me` | Any | Get current authenticated user profile |

**Notes:**
- `accountStatus` must be `ACTIVE` to login
- JWT tokens are issued by login endpoint
- All other endpoints require valid JWT token in Authorization header

---

## Users Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/users` | ADMIN | List all users in the system |
| GET | `/users/:id` | ADMIN | Get specific user by ID |
| PATCH | `/users/:id/status` | ADMIN | Update user account status (ACTIVE/INACTIVE/SUSPENDED) |

**Notes:**
- All endpoints exclude sensitive `passwordHash` field
- Status updates affect user login ability
- INACTIVE or SUSPENDED users cannot login

---

## Workers Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/workers/profile` | Any | Get authenticated worker's profile |
| GET | `/workers/profile/:userId` | Any | Get specific worker profile by user ID |
| POST | `/workers/profile` | WORKER | Create worker profile |
| PATCH | `/workers/profile` | WORKER | Update authenticated worker's profile |
| DELETE | `/workers/profile` | WORKER | Delete authenticated worker's profile |
| GET | `/workers/skills` | Any | List authenticated worker's skills |
| POST | `/workers/skills` | WORKER | Add skill to authenticated worker |
| DELETE | `/workers/skills/:skillId` | WORKER | Remove skill from authenticated worker |
| GET | `/workers/categories` | Any | List authenticated worker's preferred categories |
| PATCH | `/workers/categories` | WORKER | Update authenticated worker's preferred categories |
| POST | `/workers/availability` | WORKER | Set worker availability schedule |
| GET | `/workers/availability` | Any | Get authenticated worker's availability |

**Notes:**
- WORKER role required for create/update/delete operations
- Skills and categories are optional
- Availability is used for shift matching

---

## Categories Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/categories` | Any | List all categories |
| GET | `/categories/:id` | Any | Get specific category by ID |
| POST | `/categories` | ADMIN | Create new category |
| PATCH | `/categories/:id` | ADMIN | Update category |
| DELETE | `/categories/:id` | ADMIN | Delete category |

**Notes:**
- Categories are used to classify shifts and worker skills
- Deletion cascades to related shifts and skills

---

## Skills Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/skills` | Any | List all skills |
| GET | `/skills/:id` | Any | Get specific skill by ID |
| POST | `/skills` | ADMIN | Create new skill |
| PATCH | `/skills/:id` | ADMIN | Update skill |
| DELETE | `/skills/:id` | ADMIN | Delete skill |

**Notes:**
- Skills are categorized and can be marked as required for shifts
- Deletion cascades to worker skills and shift requirements

---

## Companies Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/companies` | EMPLOYEE, MANAGER | Create new company |
| GET | `/companies/my` | EMPLOYEE, MANAGER | List companies where user is a member |
| GET | `/companies/:id` | EMPLOYEE, MANAGER, ADMIN | Get specific company by ID |
| PATCH | `/companies/:id` | EMPLOYEE, MANAGER | Update company details |
| DELETE | `/companies/:id` | EMPLOYEE, MANAGER | Delete company |
| GET | `/companies/:id/members` | EMPLOYEE, MANAGER, ADMIN | List company members |
| POST | `/companies/:id/members` | EMPLOYEE, MANAGER | Add member to company |
| DELETE | `/companies/:id/members/:userId` | EMPLOYEE, MANAGER | Remove member from company |

**Notes:**
- Company creation requires EMPLOYEE or MANAGER role
- Only company members can access company details
- Manager role required for member management

---

## Shifts Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/shifts` | EMPLOYEE, MANAGER | Create new shift |
| GET | `/shifts` | Any | List shifts (filtered by role: WORKER sees OPEN only, EMPLOYEE/MANAGER see their company's shifts) |
| GET | `/shifts/:id` | Any | Get specific shift by ID |
| PATCH | `/shifts/:id` | EMPLOYEE, MANAGER | Update shift details |
| DELETE | `/shifts/:id` | EMPLOYEE, MANAGER | Cancel/delete shift |
| POST | `/shifts/:shiftId/skills` | EMPLOYEE, MANAGER | Add required skill to shift |
| DELETE | `/shifts/:shiftId/skills/:skillId` | EMPLOYEE, MANAGER | Remove required skill from shift |
| GET | `/shifts/:shiftId/skills` | Any | List required skills for shift |

**Notes:**
- Shift status transitions: OPEN → ASSIGNED/APPLICATIONS_REVIEW/CANCELLED → IN_PROGRESS/CANCELLED → COMPLETED/CANCELLED
- Time window validation: start < end
- Future date requirement enforced
- Required skills track skill requirements and optional required levels

---

## Applications Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/applications` | WORKER | Apply to a shift |
| GET | `/applications` | EMPLOYEE, MANAGER, ADMIN | List applications (filtered by role: WORKER n/a, EMPLOYEE/MANAGER see company's, ADMIN sees all) |
| GET | `/applications/my` | WORKER | List authenticated worker's applications |
| GET | `/applications/shift/:shiftId` | EMPLOYEE, MANAGER, ADMIN | List applications for specific shift |
| GET | `/applications/:id` | Any | Get specific application by ID |
| PATCH | `/applications/:id/status` | EMPLOYEE, MANAGER, ADMIN | Update application status (PENDING/APPROVED/REJECTED/WITHDRAWN) |
| PATCH | `/applications/:id/withdraw` | WORKER | Withdraw own application |

**Notes:**
- Workers can only apply to OPEN shifts
- Approving application creates Mission and updates shift status
- One application per worker per shift (enforced via unique constraint)
- Security fix: Employees/Managers can only see applications for their company's shifts

---

## Missions Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/missions/my` | Any | List authenticated user's missions (role-filtered: WORKER sees own, EMPLOYEE/MANAGER see company's) |
| GET | `/missions/:id` | Any | Get specific mission by ID |
| PATCH | `/missions/:id/status` | Any | Update mission status (ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED) |
| POST | `/missions/:id/start` | Any | Start mission (transitions to IN_PROGRESS) |
| POST | `/missions/:id/complete` | Any | Complete mission (transitions to COMPLETED) |
| POST | `/missions/:id/cancel` | Any | Cancel mission (transitions to CANCELLED) |

**Notes:**
- Missions created automatically when application is approved
- Status transitions: ASSIGNED → IN_PROGRESS/CANCELLED → COMPLETED/CANCELLED
- Completing mission updates shift status to COMPLETED and enables reviews
- Only mission participants (worker) and company members can access/modify
- startedAt and completedAt timestamps set automatically

---

## Reviews Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/reviews` | Any | Create review for completed mission |
| GET | `/reviews` | Any | List authenticated user's reviews (as reviewer or reviewed) |
| GET | `/reviews/:id` | Any | Get specific review by ID |
| GET | `/reviews/users/:id` | Any | Get reviews for specific user (public endpoint) |

**Notes:**
- Reviews only allowed for COMPLETED missions
- Only mission participants can leave reviews
- Cannot review yourself
- One review per person per mission
- Automatic WorkerProfile rating calculation when worker is reviewed
- Reviews scoped to ensure users only see reviews they're involved in

---

## Payments Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/payments` | Any | Create payment for mission |
| GET | `/payments` | Any | List authenticated user's payments (as payer or recipient) |
| GET | `/payments/:id` | Any | Get specific payment by ID |
| PATCH | `/payments/:id/status` | Any | Update payment status (PENDING/COMPLETED/FAILED/CANCELLED) |

**Notes:**
- Payments are simulated (no real payment provider integration)
- One payment per mission
- Only payer can update payment status
- Only payer and recipient can access payment details
- Used for financial tracking and mission completion workflow

---

## Notifications Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Any | List authenticated user's notifications |
| GET | `/notifications/:id` | Any | Get specific notification by ID |
| PATCH | `/notifications/:id/read` | Any | Mark notification as read |
| PATCH | `/notifications/read-all` | Any | Mark all notifications as read |

**Notes:**
- Notifications are user-scoped (users only see their own)
- isRead and readAt fields track read status
- Related shift/application/mission IDs available for deep linking
- Typically triggered by system events (application, mission, etc.)

---

## Verifications Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/verifications` | Any | Submit user or company verification |
| GET | `/verifications` | ADMIN | List all pending/completed verifications |
| PATCH | `/verifications/:id/status` | ADMIN | Update verification status (PENDING/VERIFIED/REJECTED) |

**Notes:**
- Verifications for user identity and company legitimacy
- ADMIN only can approve/reject
- Worker profile isVerified flag updated when status = VERIFIED
- Verification documents and details stored in verification record

---

## Matching Module

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/matching/shifts/:shiftId` | Any | Get matched workers for specific shift |
| POST | `/matching/shifts/compute` | ADMIN | Recompute all matching scores (batch operation) |

**Notes:**
- Algorithm-based (rule-based, not AI):
  - Category match: 30%
  - Skill match: 40%
  - Required skills completion: 30%
- Scores stored in WorkerMatchScore model
- Designed for future AI service integration
- Results used to recommend workers or prioritize applications
- Scoring considers worker availability and preferences

---

## Security Features

### Authentication & Authorization
- JWT-based authentication with HS256 algorithm
- Role-based access control (RBAC): ADMIN, EMPLOYEE, MANAGER, WORKER
- Roles decorator for endpoint-level authorization
- JwtAuthGuard validates tokens
- RolesGuard enforces role requirements

### Data Protection
- Password hashing with bcrypt (salt rounds: 10)
- No sensitive data in API responses (passwordHash excluded)
- User field filtering based on context
- Notification/Payment/Review scoped to authenticated user

### Validation
- Global ValidationPipe with whitelist: true, transform: true
- DTO class-validator decorators for input validation
- Enum validation for status fields
- Range validation for numeric fields (e.g., payment amounts)

### Error Handling
- Standard HTTP error codes (400, 403, 404, 409, etc.)
- Descriptive error messages
- Proper exception types (BadRequestException, ForbiddenException, NotFoundException, ConflictException)

---

## Database Transactions

The following operations use Prisma transactions for atomicity:

1. **Create Mission from Application**: Application approval creates mission and updates shift status atomically
2. **Update Mission Status**: Mission status update + shift status update + worker profile update (if completing mission)
3. **Create Review**: Review creation + worker profile rating recalculation (atomic)

---

## Pagination & Sorting

Most list endpoints return items sorted by:
- Shifts: `shiftDate ASC`
- Applications: `appliedAt DESC`
- Missions: `createdAt DESC`
- Reviews: `createdAt DESC`
- Payments: `createdAt DESC`
- Notifications: `createdAt DESC`

Pagination can be added via query parameters if needed.

---

## Status Enums

### User Status
- ACTIVE
- INACTIVE
- SUSPENDED

### Shift Status
- OPEN
- APPLICATIONS_REVIEW
- ASSIGNED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- EXPIRED

### Application Status
- PENDING
- APPROVED
- REJECTED
- WITHDRAWN

### Mission Status
- ASSIGNED
- IN_PROGRESS
- COMPLETED
- CANCELLED

### Payment Status
- PENDING
- COMPLETED
- FAILED
- CANCELLED

### Review Rating
- ONE (1 star)
- TWO (2 stars)
- THREE (3 stars)
- FOUR (4 stars)
- FIVE (5 stars)

### Verification Status
- PENDING
- VERIFIED
- REJECTED

### Notification Type
- APPLICATION_RECEIVED
- APPLICATION_STATUS_CHANGED
- MISSION_ASSIGNED
- MISSION_STATUS_CHANGED
- PAYMENT_RECEIVED
- VERIFICATION_STATUS_CHANGED
- REVIEW_RECEIVED

---

## Endpoint Count by Module

- **Authentication**: 3 endpoints
- **Users**: 3 endpoints
- **Workers**: 12 endpoints
- **Categories**: 5 endpoints
- **Skills**: 5 endpoints
- **Companies**: 8 endpoints
- **Shifts**: 8 endpoints
- **Applications**: 7 endpoints
- **Missions**: 6 endpoints
- **Reviews**: 4 endpoints
- **Payments**: 4 endpoints
- **Notifications**: 4 endpoints
- **Verifications**: 3 endpoints
- **Matching**: 2 endpoints

**Total: 74 REST endpoints**

---

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (must be set, no defaults)
- `NODE_ENV`: Set to production/development/test

---

## Testing

- Unit tests configured with Jest
- Tests can be run with `npm test`
- E2E tests available in `test/` directory
- Run E2E tests with `npm run test:e2e`
