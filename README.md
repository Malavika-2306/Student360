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

2. **Student Directory & CRUD Management (`/students`)**
   - Full CRUD operations connected to MongoDB (`GET`, `POST`, `PUT`, `DELETE /api/students`).
   - Search by name, roll number, or email.
   - Department filters (CSE, AI&DS, ECE, EEE, MECH, IT, CIVIL) and Active Today toggles.
   - Detailed Student Profile modal displaying platform connections, streaks, and account linking controls.

3. **Authorized GitHub Platform Integration**
   - Secure student-level authorization using Personal Access Tokens (PAT) with `read:user` scope.
   - Official GitHub REST API integration pulling public repositories, public push events, and commit counts.
   - **Zero Client Token Exposure:** Schema field `accessToken` uses `{ select: false }`; tokens are stored on the backend and are never returned in React API responses.
   - **Deduplication:** MongoDB compound unique index `{ studentId: 1, externalId: 1 }` (`gh-event-<event-id>`) prevents duplicate activity entries during repeated synchronizations.
   - One-click credential wiping via **Disconnect**.

4. **Date-Filtered Daily Student Roster (`GET /api/activity/daily-roster?date=YYYY-MM-DD`)**
   - Queries active learners who completed tasks on any specific calendar date.
   - Identifies inactive students with zero recorded activity on that date.
   - Computes daily participation rate and platform distribution.

5. **Surveys & Polls System (`/polls`)**
   - Real-time survey responses linked to students (`/api/polls`).
   - Vote options with percentage bar visualizations.
   - Faculty can track responders vs. non-responders.

6. **Periodic Reports & Accreditation Data (`/reports`)**
   - Daily, Weekly, and Monthly aggregated reports.
   - Departmental engagement comparison tables.
   - Report download spreadsheet (.CSV) triggers.

7. **Platform & Department Analytics (`/analytics`)**
   - Platform adoption metrics across LeetCode, CodeChef, and GitHub.
   - Automated actionable insights highlighting high-performing and at-risk student cohorts.

---

### ⚠️ Partially Completed / Audited Features
- **LeetCode Integration:**
  - *Status:* Public profile handle linking with public problem-solve statistics.
  - *Limitation:* LeetCode does not offer an official 3rd-party developer OAuth 2.0 program. Cloudflare bot detection and session locks prevent programmatic login. Unverified entries are preserved and labeled as **Sample Mode**.
- **CodeChef Integration:**
  - *Status:* Public handle linking with star ratings and divisions.
  - *Limitation:* CodeChef's developer portal is restricted for open 3rd-party apps. Existing contest performance is maintained as **Sample Benchmark**.

---

### ⏳ Pending Work (Roadmap)
- Background scheduled cron job for automated periodic GitHub event sync.
- SMTP email notifications for sending real faculty inactivity alerts to students.
- Automated server-side PDF generator for accreditation compliance binders.
- Registered GitHub OAuth application client ID for web browser single-click authorization.

---

## 3. Security & Credential Hygiene

- **Backend Token Isolation:** Platform credentials never reach the browser. Mongoose schema excludes tokens by default.
- **Least Privilege:** GitHub integration only requests read-only public identity (`read:user`). No write access or private code access is requested.
- **Git Protection:** Environment files (`.env`, `.env.*`), dependencies (`node_modules/`), and build artifacts (`dist/`) are strictly excluded from version control via `.gitignore`.
- **Credential Storage:** Template environment variable names are documented in `backend/.env.example`. Real secrets must never be committed.

---

## 4. Setup Instructions & Run Commands

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB running locally on port 27017 (`mongodb://127.0.0.1:27017/student360`)

### Step 1: Clone Repository
```bash
git clone <your-repository-url>
cd Student360
```

### Step 2: Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
*(Optionally configure `PORT` and `MONGO_URI` in `backend/.env`. Defaults work out of the box).*

### Step 3: Seed Database (Initial Setup)
```bash
# In backend directory
npm install
npm run seed
```
*Seeds 21 sample students, department allocations, polls, and benchmark activity.*

### Step 4: Run the Backend Server
```bash
# In backend directory
npm start
# Server runs on http://localhost:5000
```

### Step 5: Run the Frontend Dev Server
```bash
# In a separate terminal, from repository root
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Open your browser at **`http://localhost:5173`** to access the Student360 dashboard.

---

## 5. Verification & Testing

To execute automated integration tests against the running backend:
```bash
cd backend
node tests/integrationE2ETest.js
# Runs 31 end-to-end assertions verifying auth, security, and endpoints

node tests/dedupTest.js
# Verifies MongoDB unique compound index preventing duplicate activity events

node tests/dailyRosterTest.js
# Verifies the date-filtered daily active/inactive student roster API
```

To run frontend lint and production build checks:
```bash
cd frontend
npm run lint    # Runs oxlint
npm run build   # Validates Vite production bundle compilation
```
