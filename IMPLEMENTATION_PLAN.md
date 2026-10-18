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

### Milestone 2: Automated Background Sync Service
- **Objective:** Automatically refresh student GitHub public contributions at regular intervals without requiring manual "Sync Now" button clicks.
- **Tasks:**
  1. Install lightweight cron runner in backend (`node-cron`).
  2. Implement job runner in `backend/services/schedulerService.js`:
     ```javascript
     cron.schedule('0 */6 * * *', async () => {
       // Refresh public events for connected GitHub accounts every 6 hours
     });
     ```
  3. Handle GitHub API rate limits gracefully with exponential backoff.

---

### Milestone 3: Faculty Inactivity Alert Delivery
- **Objective:** Connect the "Send Inactivity Alert" button in `Students.jsx` and `Activity.jsx` to a real email delivery service.
- **Tasks:**
  1. Configure `nodemailer` with institution SMTP or transactional email provider (SendGrid / AWS SES).
  2. Add email template for students with 3+ days of zero platform activity.
  3. Add audit log recording when alerts are dispatched.

---

### Milestone 4: PDF & Comprehensive Accreditation Export
- **Objective:** Enable one-click generation of PDF compliance binders for NAAC / NBA accreditation committees.
- **Tasks:**
  1. Add PDF generation route (`GET /api/reports/:period/pdf`) using `pdfkit` or `puppeteer-core`.
  2. Include departmental participation tables, active student rosters, and signature lines.

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
