import React, { useState, useEffect } from 'react';
import PollCard from '../components/PollCard';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { 
  PlusIcon, 
  SearchIcon, 
  AlertCircleIcon, 
  DownloadIcon,
  BellIcon,
  RefreshIcon
} from '../components/Icons';
import { 
  getPolls, 
  getPollResponses, 
  getPollNotResponded, 
  createPoll 
} from '../services/api';

/**
 * Polls Page - CORE FEATURE
 * Track responses and clearly identify students who have not participated vs students who answered 'Not Interested'.
 * Connected to live database endpoints:
 * - GET /api/polls
 * - GET /api/polls/:pollId/responses
 * - GET /api/polls/:pollId/not-responded
 * - POST /api/polls
 */
export default function Polls({ polls: propPolls, setPolls: setPropPolls, students: _students, onTriggerToast }) {
  const [polls, setPolls] = useState(propPolls || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal states for Student lists
  const [activePoll, setActivePoll] = useState(null);
  const [modalType, setModalType] = useState(null); // 'responded' or 'not_responded'
  const [modalStudents, setModalStudents] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalDeptFilter, setModalDeptFilter] = useState('ALL');

  // Create Poll Modal
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollCategory, setNewPollCategory] = useState('Technical Workshop');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Fetch real polls from MongoDB
  const fetchPollsList = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPolls();
      const rawPolls = response.data || [];
      const normalized = rawPolls.map((p) => {
        const id = p._id || p.id;
        const total = p.totalStudents !== undefined ? p.totalStudents : 22;
        const resp = p.responded !== undefined ? p.responded : 0;
        const notResp = p.notResponded !== undefined ? p.notResponded : Math.max(0, total - resp);
        return {
          ...p,
          id,
          _id: id,
          title: p.title,
          description: p.description || '',
          category: p.category || 'Technical Workshop',
          status: p.active !== false ? 'Active' : 'Closed',
          totalStudents: total,
          responded: resp,
          notResponded: notResp,
          participationPercentage: p.participationPercentage !== undefined ? p.participationPercentage : (total > 0 ? Math.round((resp / total) * 100) : 0),
          createdDate: p.createdDate ? new Date(p.createdDate).toLocaleDateString() : 'Recently'
        };
      });

      setPolls(normalized);
      if (setPropPolls) {
        setPropPolls(normalized);
      }
    } catch (err) {
      console.error('Failed to load polls:', err);
      setError(err.message || 'Could not fetch polls from backend');
    } finally {
      setLoading(false);
    }
  }, [setPropPolls]);

  useEffect(() => {
    fetchPollsList();
  }, [fetchPollsList]);

  // Filter polls
  const filteredPolls = polls.filter((p) => {
    const titleMatch = (p.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'ALL' || p.category === selectedCategory;
    return titleMatch && categoryMatch;
  });

  // Handler when clicking "View Responded Students"
  const handleOpenResponded = async (poll) => {
    setActivePoll(poll);
    setModalType('responded');
    setModalSearch('');
    setModalDeptFilter('ALL');
    setModalLoading(true);
    setModalError(null);

    const pollId = poll._id || poll.id;
    try {
      const response = await getPollResponses(pollId);
      const list = (response.data || []).map((r) => {
        const stu = r.studentId || {};
        const stuId = stu._id || stu.id || r._id;
        const roll = stu.rollNo || (stu.email ? stu.email.split('@')[0].toUpperCase() : `STU-${String(stuId).slice(-4).toUpperCase()}`);
        return {
          id: stuId,
          _id: stuId,
          name: stu.name || 'Student',
          rollNo: roll,
          email: stu.email || '',
          department: stu.department || 'CSE',
          pollStatus: 'responded',
          answer: r.answer || 'Interested',
          respondedAt: r.respondedAt ? new Date(r.respondedAt).toLocaleDateString() : 'Recently'
        };
      });
      setModalStudents(list);
    } catch (err) {
      console.error('Failed to load responded students:', err);
      setModalError(err.message || 'Could not load responses for this poll');
    } finally {
      setModalLoading(false);
    }
  };

  // Handler when clicking "View Not Responded Students"
  const handleOpenNotResponded = async (poll) => {
    setActivePoll(poll);
    setModalType('not_responded');
    setModalSearch('');
    setModalDeptFilter('ALL');
    setModalLoading(true);
    setModalError(null);

    const pollId = poll._id || poll.id;
    try {
      const response = await getPollNotResponded(pollId);
      const list = (response.data || []).map((r) => {
        const stu = r.student || {};
        const stuId = stu._id || stu.id;
        const roll = stu.rollNo || (stu.email ? stu.email.split('@')[0].toUpperCase() : `STU-${String(stuId).slice(-4).toUpperCase()}`);
        return {
          id: stuId,
          _id: stuId,
          name: stu.name || 'Student',
          rollNo: roll,
          email: stu.email || '',
          department: stu.department || 'CSE',
          pollStatus: 'not_responded',
          answer: null,
          respondedAt: null
        };
      });
      setModalStudents(list);
    } catch (err) {
      console.error('Failed to load not-responded students:', err);
      setModalError(err.message || 'Could not load unengaged students for this poll');
    } finally {
      setModalLoading(false);
    }
  };

  // Filter the current modal student list
  const currentModalList = modalStudents.filter((s) => {
    const sName = s.name || '';
    const sRoll = s.rollNo || '';
    const sDept = s.department || '';

    const matchesSearch = 
      sName.toLowerCase().includes(modalSearch.toLowerCase()) ||
      sRoll.toLowerCase().includes(modalSearch.toLowerCase());

    const matchesDept = modalDeptFilter === 'ALL' || sDept === modalDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPollTitle.trim()) {
      setCreateError("Please enter a poll title");
      return;
    }

    setCreateSubmitting(true);
    setCreateError(null);
    try {
      await createPoll({
        title: newPollTitle.trim(),
        description: newPollDesc.trim() || 'Department survey regarding learning opportunities.',
        category: newPollCategory,
        active: true
      });

      await fetchPollsList();
      setIsCreatePollOpen(false);
      setNewPollTitle('');
      setNewPollDesc('');
      if (onTriggerToast) {
        onTriggerToast(`Poll "${newPollTitle.trim()}" published to database successfully!`);
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create poll in database');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleSendReminderToAllNotResponded = () => {
    if (onTriggerToast && activePoll) {
      onTriggerToast(`Reminder notification dispatched to ${activePoll.notResponded} students who haven't responded!`);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Poll Management</h1>
          <p className="page-subtitle">Track responses and identify students who have not participated.</p>
        </div>
        <div className="page-header-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchPollsList}
            disabled={loading}
            title="Refresh poll list from database"
          >
            <RefreshIcon size={16} className={loading ? "spin" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              setCreateError(null);
              setIsCreatePollOpen(true);
            }}
          >
            <PlusIcon size={16} />
            <span>Create Poll</span>
          </button>
        </div>
      </div>

      {/* Critical project distinction explanation banner */}
      <div className="alert-card-info">
        <div className="alert-card-icon">
          <AlertCircleIcon size={20} />
        </div>
        <div className="alert-card-text">
          <h4 className="alert-card-title">Unique Analytical Feature: Response Tracking</h4>
          <p>
            Student360 strictly distinguishes between students who <strong>participated and voted "Not Interested"</strong> versus students who <strong>"Not Responded" (zero participation)</strong>. This helps faculty direct follow-ups precisely to unengaged students.
          </p>
        </div>
      </div>

      {/* Error alert banner if API request fails */}
      {error && (
        <div className="alert-banner alert-banner-danger mt-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircleIcon size={18} />
            <span><strong>Connection Error:</strong> {error}</span>
          </div>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-danger"
            onClick={fetchPollsList}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card table-filter-card mt-4">
        <div className="filter-row">
          <div className="filter-search-box">
            <span className="search-icon-wrapper">
              <SearchIcon size={16} />
            </span>
            <input 
              type="text" 
              className="filter-search-input"
              placeholder="Search polls by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                &times;
              </button>
            )}
          </div>

          <div className="filter-group">
            <label className="filter-label">Category:</label>
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Technical Workshop">Technical Workshop</option>
              <option value="Career & Placements">Career & Placements</option>
              <option value="Competition">Competition</option>
              <option value="Academic Feedback">Academic Feedback</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && polls.length === 0 ? (
        <div className="table-loading-container mt-6">
          <RefreshIcon size={28} className="spin text-primary" />
          <p>Loading polls from database...</p>
        </div>
      ) : (
        /* Poll Cards Grid */
        <div className="polls-grid mt-6">
          {filteredPolls.length === 0 ? (
            <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '48px 16px' }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                  <SearchIcon size={20} />
                </div>
                <span className="font-semibold text-dark text-sm">No Surveys Found</span>
                <span className="text-muted text-xs">No active polls match your current category filter or search keyword.</span>
                {(searchTerm || selectedCategory !== 'ALL') && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs mt-2"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('ALL');
                    }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredPolls.map((poll) => (
              <PollCard 
                key={poll.id || poll._id} 
                poll={poll}
                onViewResponded={handleOpenResponded}
                onViewNotResponded={handleOpenNotResponded}
              />
            ))
          )}
        </div>
      )}

      {/* Detail Modal: Responded OR Not Responded Students */}
      <Modal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        size="large"
        title={
          modalType === 'responded' ? (
            <div className="modal-title-flex">
              <span className="badge-pill-green">Responded ({activePoll?.responded})</span>
              <span>{activePoll?.title}</span>
            </div>
          ) : (
            <div className="modal-title-flex">
              <span className="badge-pill-red">Not Responded ({activePoll?.notResponded})</span>
              <span>{activePoll?.title}</span>
            </div>
          )
        }
        footer={
          <div className="modal-footer-flex">
            {modalType === 'not_responded' && (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleSendReminderToAllNotResponded}
              >
                <BellIcon size={16} />
                <span>Send Reminder to All {activePoll?.notResponded} Students</span>
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => {
                if (onTriggerToast) onTriggerToast(`Exporting ${modalType} list to CSV...`);
              }}
            >
              <DownloadIcon size={16} />
              <span>Export CSV</span>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setModalType(null)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="poll-modal-body">
          {/* Informational banner based on modal type */}
          {modalType === 'responded' ? (
            <div className="modal-sub-info info-green">
              <span>Showing students who actively submitted the poll. Note how <strong>"Not Interested"</strong> is recorded as a valid submitted response.</span>
            </div>
          ) : (
            <div className="modal-sub-info info-red">
              <span>These students <strong>never opened or submitted</strong> the poll. They require faculty follow-up or portal reminders.</span>
            </div>
          )}

          {/* Error inside modal */}
          {modalError && (
            <div className="alert-banner alert-banner-danger mt-2 mb-2">
              <AlertCircleIcon size={16} />
              <span>{modalError}</span>
            </div>
          )}

          {/* Quick Filter Bar within Modal */}
          <div className="modal-search-row">
            <div className="filter-search-box modal-search-flex">
              <span className="search-icon-wrapper">
                <SearchIcon size={14} />
              </span>
              <input 
                type="text" 
                className="filter-search-input"
                placeholder="Search students in this list..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
              />
            </div>

            <select 
              className="filter-select"
              value={modalDeptFilter}
              onChange={(e) => setModalDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="AI&DS">AI&DS</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>

          {/* Table of Students in this state */}
          <div className="table-responsive modal-table-scroll">
            {modalLoading ? (
              <div className="table-loading-container py-6">
                <RefreshIcon size={24} className="spin text-primary" />
                <p>Loading students from database...</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Submission Status</th>
                    <th>Answer / Option</th>
                    <th>Submitted At</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentModalList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-empty">
                        No students found in this category.
                      </td>
                    </tr>
                  ) : (
                    currentModalList.map((stu) => (
                      <tr key={stu.id || stu._id}>
                        <td className="font-semibold text-dark">
                          <div className="student-profile-cell">
                            <span className="student-avatar-small">{(stu.name || 'S').charAt(0)}</span>
                            <div>
                              <div>{stu.name}</div>
                              <span className="text-muted font-mono text-xs">{stu.rollNo}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="department-tag">{stu.department}</span>
                        </td>
                        <td>
                          {stu.pollStatus === 'responded' ? (
                            <span className="badge-pill-green">Submitted</span>
                          ) : (
                            <span className="badge-pill-red">Not Submitted</span>
                          )}
                        </td>
                        <td>
                          {stu.pollStatus === 'responded' ? (
                            <StatusBadge 
                              type="pollAnswer" 
                              status={stu.answer} 
                              text={stu.answer} 
                            />
                          ) : (
                            <span className="text-danger font-medium">No Response</span>
                          )}
                        </td>
                        <td className="text-muted text-sm">
                          {stu.respondedAt || '—'}
                        </td>
                        <td className="text-right">
                          {stu.pollStatus === 'not_responded' ? (
                            <button 
                              type="button" 
                              className="btn btn-outline-danger btn-xs"
                              onClick={() => {
                                if (onTriggerToast) onTriggerToast(`Sent reminder alert to ${stu.name} (${stu.email})`);
                              }}
                            >
                              Send Alert
                            </button>
                          ) : (
                            <span className="text-muted text-xs">Logged</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal: Create New Poll */}
      <Modal
        isOpen={isCreatePollOpen}
        onClose={() => !createSubmitting && setIsCreatePollOpen(false)}
        title="Create New Student Poll"
      >
        <form onSubmit={handleCreatePoll} className="simple-form">
          {createError && (
            <div className="alert-banner alert-banner-danger mb-4">
              <AlertCircleIcon size={16} />
              <span>{createError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Poll Title *</label>
            <input 
              type="text" 
              required
              className="form-input" 
              placeholder="e.g. Cloud Certification Training Survey"
              value={newPollTitle}
              onChange={(e) => setNewPollTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-input"
              value={newPollCategory}
              onChange={(e) => setNewPollCategory(e.target.value)}
            >
              <option value="Technical Workshop">Technical Workshop</option>
              <option value="Career & Placements">Career & Placements</option>
              <option value="Competition">Competition</option>
              <option value="Academic Feedback">Academic Feedback</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Poll Description</label>
            <textarea 
              className="form-textarea" 
              rows="3"
              placeholder="Describe the objective of this survey..."
              value={newPollDesc}
              onChange={(e) => setNewPollDesc(e.target.value)}
            />
          </div>

          <div className="modal-footer-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setIsCreatePollOpen(false)}
              disabled={createSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={createSubmitting}
            >
              {createSubmitting ? "Publishing..." : "Publish Poll"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
