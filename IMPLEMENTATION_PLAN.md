# Student360 — Implementation Plan & Project Roadmap

This document outlines the architectural roadmap and implementation plan for the remaining phases of the **Student360 – Learning Activity & Performance Analytics** platform.

---

## 1. Project Current Status Overview

- **Core System:** Fully operational with live MongoDB database, Express API, and React frontend.
- **Students Management:** Complete CRUD functionality with live filtering and status badges.
- **Platform Integrations:**
  - **GitHub:** Verified live integration using Personal Access Tokens (`read:user`) and official REST API. Deduplication and token security enforced.
  - **LeetCode & CodeChef:** Public handle linking with limitation documentation and preserved benchmark indicators.
- **Reports & Analytics:** Aggregated period summaries and department breakdowns operational.
- **Daily Roster API:** `GET /api/activity/daily-roster?date=YYYY-MM-DD` implemented and tested.

---

## 2. Remaining Work & Technical Milestones

### Milestone 1: Daily Activity Roster UI Component ✅ [COMPLETED]
- **Status:** Fully implemented and verified in `frontend/src/pages/Activity.jsx`.
- **Deliverables:**
  1. Interactive date-picker with shortcuts (*Today*, *Oct 9 Benchmark*, *Oct 8*).
  2. Live summary chips displaying total, active, and inactive student counts.
  3. Dual-tab roster view:
     - **Active Learners:** Student details, department, solved task breakdown, and **Real** vs **Sample** badges.
     - **Inactive Learners:** Clear table of disengaged learners with "Send Inactivity Alert" trigger button.
  4. Zero lint errors and passed all daily roster E2E tests (`backend/tests/dailyRosterTest.js`).

---

### Milestone 2: Automated Background Sync Service ✅ [COMPLETED]
- **Status:** Fully implemented in `backend/services/schedulerService.js` and verified.
- **Deliverables:**
  1. Background sync engine running on a configurable interval (default every 6 hours).
  2. Batch endpoint: `POST /api/integrations/sync-all` synchronizing all connected GitHub, LeetCode, and CodeChef accounts.
  3. Interactive UI: "Sync Platforms" header button on Dashboard with spinning indicator and toast feedback.
  4. Tested and verified in `backend/tests/integrationE2ETest.js` (Step 12 passing 100%).

---

### Milestone 3: Faculty Inactivity Alert Delivery ✅ [COMPLETED]
- **Status:** Fully implemented and verified across frontend and backend.
- **Deliverables:**
  1. `NotificationLog` MongoDB model persisting student identity, alert type, target date, channel, status, and timestamp.
  2. Endpoints: `POST /api/activity/alerts/send` (single student and batch dispatch) and `GET /api/activity/alerts/history`.
  3. Interactive UI in `Activity.jsx`: individual "Send Inactivity Alert" and batch "Dispatch Alert to All" buttons with live feedback and state update.
  4. Covered in `integrationE2ETest.js` (Step 11 passing 100%).

---

### Milestone 4: PDF & Comprehensive Accreditation Export ✅ [COMPLETED]
- **Status:** Fully implemented and verified in `Reports.jsx` and `App.css`.
- **Deliverables:**
  1. RFC 4180 CSV spreadsheet generator downloading structured executive summaries, departmental comparison tables, and full student rosters via client-side Blob generation.
  2. Built-in `@media print` academic print/PDF stylesheet that strips navigation, controls, and widgets, rendering pristine A4/letter binders.
  3. "Print / Save PDF" header action calling native browser print & PDF compilation dialog.

---

### Milestone 5: GitHub OAuth App Registration Guide
- **Objective:** Transition from Personal Access Tokens to 1-click OAuth web authorization.
- **Tasks:**
  1. Create a GitHub OAuth App in GitHub Developer Settings.
  2. Set Authorization callback URL to `http://localhost:5000/api/integrations/github/callback`.
  3. Supply `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `backend/.env`.

---

## 3. Recommended Schedule for Project Report

| Phase | Milestone Description | Target Deliverables |
| :---: | :--- | :--- |
| **Phase 1** | Daily Activity Roster UI | Interactive date selector & dual-tab roster in `Activity.jsx` |
| **Phase 2** | Scheduled Sync Engine | Background cron job refreshing GitHub public activity |
| **Phase 3** | Email Alerting System | SMTP integration for student inactivity reminders |
| **Phase 4** | PDF Accreditation Reports | Downloadable formal department compliance digests |
| **Phase 5** | GitHub OAuth Web Flow | Full OAuth 2.0 web flow with client secret configuration |

---

## 4. Verification & Testing Protocol

Before deploying or submitting any milestone:
1. Run backend automated test suites:
   - `node backend/tests/integrationE2ETest.js` (31 assertions)
   - `node backend/tests/dedupTest.js` (E11000 deduplication check)
   - `node backend/tests/dailyRosterTest.js` (Active vs Inactive breakdown)
2. Run frontend build and linter:
   - `npm run lint` in `frontend/` (0 errors)
   - `npm run build` in `frontend/` (validates production bundle)
