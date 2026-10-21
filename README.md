# Student360 — Learning Activity & Performance Analytics

Student360 is a full-stack academic monitoring and learning analytics platform designed for engineering colleges and universities. It allows educators and department heads to monitor student programming milestones across **GitHub**, **LeetCode**, and **CodeChef**, track internal survey responses, identify disengaged learners, and generate departmental accreditation reports.

---

## 1. Technology Stack

- **Frontend:** React 18, Vite, Vanilla CSS design tokens & utilities (no third-party heavy UI bloat).
- **Backend:** Node.js, Express.js (RESTful MVC architecture).
- **Database:** MongoDB, Mongoose 8.
- **External Integrations:**
  - GitHub REST API (`https://api.github.com`, least-privilege `read:user` scope).
  - LeetCode public GraphQL profile stats (read-only verification).
  - CodeChef public handle mapping with benchmark contest data.
- **Code Quality:** Oxlint, Vite production bundler, automated HTTP/Mongoose integration tests.

---

## 2. Feature Implementation Status

### ✅ Completed Features
1. **Interactive Analytics Dashboard (`/`)**
   - Live metrics: Total Students, Active Today, Inactive Today, Poll Responses.
   - Today's Platform Activity breakdown with verified GitHub integration counter.
   - Survey turnout visualization using pure CSS conic gradient donuts.
   - Real-time recent student learning activity feed with explicit **Real** vs. **Sample** data source badges.
   - Global header search with instant keyboard navigation (press Enter to filter students directory).

2. **Authentication & Role-Based Access Control (RBAC)**
   - **Student Registration & Login:** Enrolled students can register via `/api/auth/register` (role is strictly locked to `student`, preventing any privilege escalation) or sign in.
   - **Faculty Administrator Login:** Administrators log in with verified faculty credentials to access institution-wide analytics and student management.
   - **Password Security:** Salted hashes generated via `bcryptjs` (passwords never stored or returned in plaintext; schema enforced `select: false`).
   - **JWT Session Tokens:** Signed Bearer tokens with configurable expiration (`JWT_EXPIRE`).
   - **Backend Route Protection:** Middleware (`protect`, `authorize`, `restrictStudentToSelf`) ensures students can only view/mutate their own profile and records, blocking unauthorized access to administrative features with HTTP 403.
   - **Safe Initial Admin Creation:** Admin accounts cannot be selected during public registration. Initial admin is provisioned securely via `npm run seed:admin` or the one-time `ADMIN_BOOTSTRAP_KEY` bootstrap endpoint (permanently disabled once an admin exists).

3. **Student Directory & Full CRUD Management (`/students`)**
   - Full CRUD operations connected to MongoDB (`GET`, `POST`, `PUT`, `DELETE /api/students`).
   - Search by name, roll number, or email with immediate filter updates.
   - Department filters (CSE, AI&DS, ECE, EEE, MECH, IT, CIVIL) and Active Today toggles.
   - Detailed Student Profile modal displaying platform connections, streaks, and account linking controls.

4. **Authorized GitHub Platform Integration**
   - Secure student-level authorization using Personal Access Tokens (PAT) with least-privilege `read:user` scope.
   - Official GitHub REST API integration pulling public repositories, public push events, and commit counts.
   - **Zero Client Token Exposure:** Schema field `accessToken` uses `{ select: false }`; tokens are stored securely on the backend and never exposed in browser API payloads.
   - **Deduplication:** MongoDB compound unique index `{ studentId: 1, externalId: 1 }` (`gh-event-<event-id>`) prevents duplicate activity entries during repeated synchronizations.
   - One-click credential wiping via **Disconnect Account**.

5. **Interactive Daily Attendance & Activity Roster (`/activity`)**
   - Interactive calendar picker allowing date selection with quick preset shortcuts (*Today*, *Benchmark Days*).
   - High-level metric summary chips: Total Students, Active Learners count & percentage, Inactive Learners count, and platform solve counts.
   - **Active Learners Roster Table:** Displays student identity, department, specific task breakdown, and **Real** vs **Sample** tags.
   - **Inactive Learners Roster Table:** Details disengaged students with zero platform activity on the chosen date, complete with an interactive "Send Inactivity Alert" notification trigger.

6. **Surveys & Polls System (`/polls`)**
   - Real-time survey responses linked to verified student profiles (`/api/polls`).
   - Vote options with percentage bar visualizations.
   - Faculty can track responders vs. non-responders with dedicated student modals and reminder dispatch.
   - In student view, poll submissions automatically enforce the authenticated user's student ID.

7. **Periodic Reports & Multi-Format Export (`/reports`)**
   - Daily, Weekly, and Monthly aggregated reports (Admin-only).
   - Departmental engagement comparison tables.
   - **Real Browser CSV Export:** Generates and downloads full spreadsheet reports with executive summary, departmental matrix, and student cohort rosters via client-side Blob generation.
   - **Native Print & PDF Mode:** Built-in `@media print` stylesheet that strips navigation and controls, rendering high-contrast academic accreditation binders via the "Print / Save PDF" trigger.

8. **Platform & Department Analytics (`/analytics`)**
   - Platform adoption metrics across LeetCode, CodeChef, and GitHub.
   - Automated actionable insights highlighting high-performing and at-risk student cohorts.

9. **Faculty Inactivity Alert System & Audit Trail (`/activity`)**
   - Single-student and batch alert dispatch (`POST /api/activity/alerts/send`).
   - MongoDB-backed persistent audit trail (`NotificationLog`) recording student identity, alert type, target date, message, channel, and dispatch timestamp (`GET /api/activity/alerts/history`).
   - Alerts create verified database audit records in `NotificationLog`.

10. **Automated Background Sync Engine & Multi-Account Scheduler**
    - Background interval scheduler (`schedulerService.js`) automatically updating connected student accounts every 6 hours without blocking server traffic.
    - On-demand batch endpoint (`POST /api/integrations/sync-all`) and "Sync Platforms" header button on Dashboard.
    - Synchronizes public repositories, events, and solves with automatic rate-limit backoff and duplicate prevention.

11. **GitHub OAuth 2.0 Web Authorization & Dual-Mode Flow**
    - Seamless 1-click student account authorization via OAuth 2.0 Web Flow with least-privilege `read:user` scope.
    - Zero-config fallback to Personal Access Tokens (`ghp_...`) when OAuth client credentials are not configured.
    - Anti-tamper base64 state token encoding verifying student identity and preventing cross-session spoofing.

---

### ⚠️ Platform Capabilities & Verification Transparency
- **GitHub REST API:** Fully integrated with real live authorized sync, automated deduplication, and secure token isolation.
- **LeetCode Integration:** Public profile handle linking with public problem-solve statistics. Since LeetCode does not offer a public developer OAuth API and employs Cloudflare bot shielding, unverified entries are preserved and clearly tagged as **Sample Mode**.
- **CodeChef Integration:** Public handle linking with star ratings and divisions. Standard benchmark performance is maintained as **Sample Benchmark**.
- **Inactivity Notifications:** Currently records official audit logs in MongoDB (`NotificationLog`). Connect an SMTP service (e.g. Nodemailer with SendGrid or Amazon SES) for direct outbound student inbox delivery.

---

## 4. Setup Instructions & Run Commands

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB running locally on port 27017 (`mongodb://127.0.0.1:27017/student360`)

### Step 1: Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
*(Ensure `JWT_SECRET`, `JWT_EXPIRE`, and `ADMIN_BOOTSTRAP_KEY` are configured in `backend/.env`).*

### Step 2: Install Dependencies & Setup Admin Account
```bash
# In backend directory
npm install
npm run seed:admin
```
*Creates the initial faculty administrator (`admin@student360.edu` / `Admin@Student360`) and initial student login (`anu.cse@college.edu` / `Student@Student360`) while preserving all existing database records.*

### Step 3: Run the Backend Server
```bash
# In backend directory
npm start
# Server runs on http://localhost:5000
```

### Step 4: Run the Frontend Dev Server
```bash
# In a separate terminal, from frontend directory
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Open your browser at **`http://localhost:5173`** to access the Student360 portal.

---

## 5. Verification & Testing

### Automated Backend Test Suite
To run all 5 test suites (50+ assertions covering Authentication, RBAC, Daily Roster, Deduplication, Platform Integrations, and OAuth):
```bash
cd backend
npm test
```

### Frontend Lint and Build Check
```bash
cd frontend
npm run lint    # Runs oxlint
npm run build   # Validates Vite production bundle compilation
```
