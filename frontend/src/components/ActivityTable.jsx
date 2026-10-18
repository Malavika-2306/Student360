import { ActivityIcon } from './Icons';

/**
 * ActivityTable Component
 * Displays recent student activities across platforms (LeetCode, CodeChef, GitHub, Poll).
 */
export default function ActivityTable({ activities = [], limit }) {
  const displayedActivities = limit ? activities.slice(0, limit) : activities;

  const getPlatformBadgeClass = (platform) => {
    switch ((platform || '').toLowerCase()) {
      case 'leetcode':
        return 'platform-badge platform-leetcode';
      case 'codechef':
        return 'platform-badge platform-codechef';
      case 'github':
        return 'platform-badge platform-github';
      case 'poll':
        return 'platform-badge platform-poll';
      default:
        return 'platform-badge';
    }
  };

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Department</th>
            <th>Platform</th>
            <th>Activity Details</th>
            <th>Source</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {displayedActivities.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    <ActivityIcon size={22} />
                  </div>
                  <span className="font-semibold text-dark text-sm">No Recent Learning Activity</span>
                  <span className="text-muted text-xs">Trigger platform sync or select a wider timeframe to inspect student submissions.</span>
                </div>
              </td>
            </tr>
          ) : (
            displayedActivities.map((act) => (
              <tr key={act.id || act._id}>
                <td className="font-medium text-dark">
                  <div className="student-cell">
                    <span className="student-avatar-small">{(act.student || 'S').charAt(0)}</span>
                    <span>{act.student || 'Student'}</span>
                  </div>
                </td>
                <td>
                  <span className="department-tag">{act.department}</span>
                </td>
                <td>
                  <span className={getPlatformBadgeClass(act.platform)}>
                    {act.platform}
                  </span>
                </td>
                <td className="text-secondary">{act.activity}</td>
                <td>
                  {act.dataSource === 'Real' ? (
                    <span className="badge-pill-green" style={{ fontSize: '11px', padding: '2px 8px' }}>Real</span>
                  ) : (
                    <span className="badge-tag tag-slate" style={{ fontSize: '11px', padding: '2px 8px' }}>Sample</span>
                  )}
                </td>
                <td className="text-muted text-nowrap">{act.time}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
