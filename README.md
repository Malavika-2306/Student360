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

2. **Student Directory & Full CRUD Management (`/students`)**
   - Full CRUD operations connected to MongoDB (`GET`, `POST`, `PUT`, `DELETE /api/students`).
   - Search by name, roll number, or email with immediate filter updates.
   - Department filters (CSE, AI&DS, ECE, EEE, MECH, IT, CIVIL) and Active Today toggles.
   - Detailed Student Profile modal displaying platform connections, streaks, and account linking controls.

3. **Authorized GitHub Platform Integration**
   - Secure student-level authorization using Personal Access Tokens (PAT) with least-privilege `read:user` scope.
   - Official GitHub REST API integration pulling public repositories, public push events, and commit counts.
   - **Zero Client Token Exposure:** Schema field `accessToken` uses `{ select: false }`; tokens are stored securely on the backend and never exposed in browser API payloads.
   - **Deduplication:** MongoDB compound unique index `{ studentId: 1, externalId: 1 }` (`gh-event-<event-id>`) prevents duplicate activity entries during repeated synchronizations.
   - One-click credential wiping via **Disconnect Account**.

4. **Interactive Daily Attendance & Activity Roster (`/activity`)**
   - Interactive calendar picker allowing date selection with quick preset shortcuts (*Today*, *Oct 9 Benchmark*, *Oct 8*).
   - High-level metric summary chips: Total Students, Active Learners count & percentage, Inactive Learners count, and platform solve counts.
   - **Active Learners Roster Table:** Displays student identity, department, specific task breakdown, and **Real** vs **Sample** tags.
   - **Inactive Learners Roster Table:** Details disengaged students with zero platform activity on the chosen date, complete with an interactive "Send Inactivity Alert" notification trigger.

5. **Surveys & Polls System (`/polls`)**
   - Real-time survey responses linked to students (`/api/polls`).
   - Vote options with percentage bar visualizations.
   - Faculty can track responders vs. non-responders with dedicated student modals and reminder dispatch.

6. **Periodic Reports & Multi-Format Export (`/reports`)**
   - Daily, Weekly, and Monthly aggregated reports.
   - Departmental engagement comparison tables.
   - **Real Browser CSV Export:** Generates and downloads full spreadsheet reports with executive summary, departmental matrix, and student cohort rosters via client-side Blob generation.
   - **Native Print & PDF Mode:** Built-in `@media print` stylesheet that strips navigation and controls, rendering high-contrast academic accreditation binders via the "Print / Save PDF" trigger.

7. **Platform & Department Analytics (`/analytics`)**
   - Platform adoption metrics across LeetCode, CodeChef, and GitHub.
   - Automated actionable insights highlighting high-performing and at-risk student cohorts.

8. **Faculty Inactivity Alert System & Audit Trail (`/activity`)**
   - Single-student and batch alert dispatch (`POST /api/activity/alerts/send`).
   - MongoDB-backed persistent audit trail (`NotificationLog`) recording student identity, alert type, target date, message, channel, and dispatch timestamp (`GET /api/activity/alerts/history`).
   - One-click "Dispatch Alert to All" batch action for disengaged cohorts.

9. **Automated Background Sync Engine & Multi-Account Scheduler**
   - Background interval scheduler (`schedulerService.js`) automatically updating connected student accounts every 6 hours without blocking server traffic.
   - On-demand batch endpoint (`POST /api/integrations/sync-all`) and "Sync Platforms" header button on Dashboard.
   - Synchronizes public repositories, events, and solves with automatic rate-limit backoff and duplicate prevention.

10. **GitHub OAuth 2.0 Web Authorization & Dual-Mode Flow**
    - Seamless 1-click student account authorization via OAuth 2.0 Web Flow with least-privilege `read:user` scope.
    - Zero-config fallback to Personal Access Tokens (`ghp_...`) when OAuth client credentials are not configured.
    - Anti-tamper base64 state token encoding verifying student identity and preventing cross-session spoofing.
    - Full setup guide documented in [GITHUB_OAUTH_SETUP.md](file:///c:/Student360/docs/GITHUB_OAUTH_SETUP.md).

---

### ⚠️ Platform Capabilities & Verification Transparency
- **GitHub REST API:** Fully integrated with real live authorized sync, automated deduplication, and secure token isolation.
- **LeetCode Integration:** Public profile handle linking with public problem-solve statistics. Since LeetCode does not offer a public developer OAuth API and employs Cloudflare bot shielding, unverified entries are preserved and clearly tagged as **Sample Mode**.
- **CodeChef Integration:** Public handle linking with star ratings and divisions. Standard benchmark performance is maintained as **Sample Benchmark**.

---

### 🔮 Future Enhancements
- Production SMTP relay credentials integration for automated student email delivery.
- Institutional Single Sign-On (SAML / Google Workspace) integration for campus-wide deployment.

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
# Runs 39 end-to-end assertions verifying auth, security, and endpoints

node tests/dedupTest.js
# Verifies MongoDB unique compound index preventing duplicate activity events (E11000)

node tests/dailyRosterTest.js
# Verifies the date-filtered daily active/inactive student roster API

node tests/oauthFlowTest.js
# Verifies GitHub OAuth URL construction, state anti-tamper encoding, and error redirects (11 assertions)
```

To run frontend lint and production build checks:
```bash
cd frontend
npm run lint    # Runs oxlint
npm run build   # Validates Vite production bundle compilation
```
