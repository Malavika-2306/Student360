# Student360 – Learning Activity & Performance Analytics

A modern, responsive React + Vite frontend prototype designed for college project demonstrations. It tracks, aggregates, and visualizes student learning activity across competitive programming platforms, version control systems, and institutional polls.

---

## 🌟 Key Project Features

1. **Active vs Inactive Student Tracking**:
   - Real-time classification of students who are active or inactive today.
   - Platform-by-platform tracking for **LeetCode**, **CodeChef**, and **GitHub**.

2. **Poll Management (Core Feature)**:
   - Tracks institutional polls and participation rates.
   - **Crucial Analytical Distinction**:
     - **Responded**: Students who actively submitted the poll (including options like *"Interested"* or *"Not Interested"*).
     - **Not Responded**: Students who never opened or completed the poll (identifies unengaged students needing follow-up).
   - Direct modal inspectors for both *Responded* and *Not Responded* student rosters.
   - One-click reminder notification action to alert non-participating students.

3. **Multi-Timeframe Activity Analytics**:
   - Filter activity trends by **Today**, **This Week**, and **This Month**.
   - CSS-powered column/bar chart showing daily and weekly engagement peaks.

4. **Institutional Reports**:
   - Generates Daily, Weekly, and Monthly compliance reports.
   - Interactive report preview with department-wise performance breakdown and CSV export triggers.

5. **Department & Platform Analytics**:
   - Cross-department comparison (**CSE**, **AI&DS**, **ECE**, **EEE**, **MECH**).
   - Automated actionable insights generated from activity trends.

---

## 📁 Project Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # Navy sidebar with navigation & admin profile
│   │   ├── Header.jsx         # Breadcrumb, global search, notifications, & term tag
│   │   ├── StatCard.jsx       # Reusable KPI metric card
│   │   ├── StatusBadge.jsx    # Status pills (Active/Inactive, Interested, Not Responded)
│   │   ├── ActivityTable.jsx  # Student platform activity log table
│   │   ├── PollCard.jsx       # Poll card with progress bar & action triggers
│   │   ├── Modal.jsx          # Accessible modal dialog
│   │   └── Icons.jsx          # Lightweight SVG icons
│   ├── pages/
│   │   ├── Dashboard.jsx      # Overview KPIs, platform progress bars, & poll donut
│   │   ├── Students.jsx       # Student roster, search, department filter, & modal
│   │   ├── Polls.jsx          # Poll cards, distinction banner, & response modals
│   │   ├── Activity.jsx       # Timeframe filters & weekly activity CSS chart
│   │   ├── Reports.jsx        # Daily/Weekly/Monthly cards & report preview modal
│   │   ├── Analytics.jsx      # Department & platform metrics with AI-style insights
│   │   └── Settings.jsx       # Admin profile, notification toggles, & preferences
│   ├── data/
│   │   └── mockData.js        # Structured mock data models
│   ├── App.jsx                # Main layout, page routing, and toast system
│   ├── App.css                # Plain Vanilla CSS component styling
│   ├── index.css              # Reset, typography, and CSS design variables
│   └── main.jsx               # React 19 entry point
└── package.json
```

---

## 🚀 Running the Project

In the `frontend` directory:

```bash
# Start development server
npm run dev
```

Visit the local URL shown in terminal (typically `http://localhost:5173` or `http://localhost:5174`).

To build for production:
```bash
npm run build
```
