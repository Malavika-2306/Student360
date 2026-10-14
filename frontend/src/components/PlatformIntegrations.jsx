import React, { useState, useEffect } from 'react';
import { 
  GitHubIcon, 
  RefreshIcon, 
  AlertCircleIcon, 
  CheckCircleIcon, 
  ExternalLinkIcon, 
  KeyIcon 
} from './Icons';
import {
  getStudentIntegrations,
  connectGitHubToken,
  connectLeetCode,
  connectCodeChef,
  syncPlatform,
  disconnectPlatform,
  getGitHubAuthUrl
} from '../services/api';

/**
 * PlatformIntegrations Component
 * Allows individual students/instructors to securely connect and synchronize
 * real activity across GitHub, LeetCode, and CodeChef with full token isolation.
 */
export default function PlatformIntegrations({ student, onUpdate }) {
  const studentId = student?._id || student?.id;

  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [notice, setNotice] = useState(null);

  // Form inputs
  const [ghToken, setGhToken] = useState('');
  const [showGhToken, setShowGhToken] = useState(false);
  const [lcUsername, setLcUsername] = useState('');
  const [ccUsername, setCcUsername] = useState('');
  const [oauthUrl, setOauthUrl] = useState(null);

  const fetchIntegrations = React.useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await getStudentIntegrations(studentId);
      if (res && res.data) {
        setIntegrations(res.data);
      }
    } catch (err) {
      console.error('Failed to load student integrations:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to fetch platform accounts.' });
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchIntegrations();
    // Check if OAuth URL is configured
    if (studentId) {
      getGitHubAuthUrl(studentId)
        .then(res => {
          if (res?.oauthConfigured && res?.authUrl) {
            setOauthUrl(res.authUrl);
          }
        })
        .catch(() => {});
    }
  }, [studentId, fetchIntegrations]);

  const handleConnectGitHub = async (e) => {
    e.preventDefault();
    if (!ghToken.trim()) return;

    setActionLoading(prev => ({ ...prev, github: true }));
    setNotice(null);
    try {
      const res = await connectGitHubToken(studentId, ghToken.trim());
      setNotice({ 
        type: 'success', 
        text: res.message || 'GitHub successfully connected and verified!' 
      });
      setGhToken('');
      await fetchIntegrations();
      if (onUpdate) onUpdate();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to authenticate GitHub token.' });
    } finally {
      setActionLoading(prev => ({ ...prev, github: false }));
    }
  };

  const handleConnectLeetCode = async (e) => {
    e.preventDefault();
    if (!lcUsername.trim()) return;

    setActionLoading(prev => ({ ...prev, leetcode: true }));
    setNotice(null);
    try {
      const res = await connectLeetCode(studentId, lcUsername.trim());
      setNotice({ 
        type: 'success', 
        text: res.message || 'LeetCode profile linked and verified!' 
      });
      setLcUsername('');
      await fetchIntegrations();
      if (onUpdate) onUpdate();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to link LeetCode profile.' });
    } finally {
      setActionLoading(prev => ({ ...prev, leetcode: false }));
    }
  };

  const handleConnectCodeChef = async (e) => {
    e.preventDefault();
    if (!ccUsername.trim()) return;

    setActionLoading(prev => ({ ...prev, codechef: true }));
    setNotice(null);
    try {
      const res = await connectCodeChef(studentId, ccUsername.trim());
      setNotice({ 
        type: 'success', 
        text: res.message || 'CodeChef handle linked!' 
      });
      setCcUsername('');
      await fetchIntegrations();
      if (onUpdate) onUpdate();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to link CodeChef handle.' });
    } finally {
      setActionLoading(prev => ({ ...prev, codechef: false }));
    }
  };

  const handleSync = async (platform) => {
    setActionLoading(prev => ({ ...prev, [`sync_${platform}`]: true }));
    setNotice(null);
    try {
      const res = await syncPlatform(studentId, platform);
      setNotice({ 
        type: 'success', 
        text: res.message || `${platform.toUpperCase()} activity synced successfully!` 
      });
      await fetchIntegrations();
      if (onUpdate) onUpdate();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || `Sync failed for ${platform}.` });
    } finally {
      setActionLoading(prev => ({ ...prev, [`sync_${platform}`]: false }));
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Disconnect ${platform.toUpperCase()} for ${student?.name}? All stored credentials will be securely wiped.`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [`disconnect_${platform}`]: true }));
    setNotice(null);
    try {
      const res = await disconnectPlatform(studentId, platform);
      setNotice({ 
        type: 'success', 
        text: res.message || `${platform.toUpperCase()} disconnected successfully.` 
      });
      await fetchIntegrations();
      if (onUpdate) onUpdate();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || `Failed to disconnect ${platform}.` });
    } finally {
      setActionLoading(prev => ({ ...prev, [`disconnect_${platform}`]: false }));
    }
  };

  const formatLastSync = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const ghAccount = integrations?.github || { connected: false, dataSource: 'Not connected' };
  const lcAccount = integrations?.leetcode || { connected: false, dataSource: 'Sample' };
  const ccAccount = integrations?.codechef || { connected: false, dataSource: 'Sample' };

  return (
    <div className="integration-container">
      <div className="integration-header-bar">
        <div>
          <h4 className="integration-header-title">
            <KeyIcon size={18} />
            Platform Integrations & Real-Time Sync
          </h4>
          <p className="text-muted text-sm mt-1">
            Connect verified coding accounts. Personal access tokens are stored securely with <code style={{ fontSize: '0.75rem' }}>select: false</code> backend isolation and are never exposed to the browser.
          </p>
        </div>
        <div className="integration-security-badge">
          <CheckCircleIcon size={14} />
          <span>Least Privilege (read:user)</span>
        </div>
      </div>

      {notice && (
        <div className={`alert-banner ${notice.type === 'error' ? 'alert-banner-danger' : 'alert-banner-success'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notice.type === 'error' ? <AlertCircleIcon size={16} /> : <CheckCircleIcon size={16} />}
            <span>{notice.text}</span>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            style={{ padding: '2px 8px', fontSize: '0.75rem' }} 
            onClick={() => setNotice(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="table-loading-container" style={{ padding: '20px' }}>
          <RefreshIcon size={20} className="spin" />
          <span>Loading platform connections...</span>
        </div>
      ) : (
        <div className="integration-cards-stack">
          {/* ================================================================= */}
          {/* 1. GITHUB INTEGRATION CARD                                        */}
          {/* ================================================================= */}
          <div className="integration-card">
            <div className="integration-card-top">
              <div className="integration-platform-identity">
                <div className="integration-icon-circle icon-github">
                  <GitHubIcon size={20} />
                </div>
                <div>
                  <div className="integration-platform-title">GitHub (Official REST API)</div>
                  <div className="text-muted text-xs">Public commits, push events & repository contributions</div>
                </div>
              </div>

              <div className="integration-badge-group">
                {ghAccount.connected ? (
                  <span className="badge-source-real">
                    <CheckCircleIcon size={12} />
                    Real (Authorized)
                  </span>
                ) : (
                  <span className="badge-source-sample">Not Connected</span>
                )}
              </div>
            </div>

            {ghAccount.connected ? (
              <div className="integration-details-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {ghAccount.avatarUrl && (
                      <img 
                        src={ghAccount.avatarUrl} 
                        alt={ghAccount.username} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
                      />
                    )}
                    <div>
                      <div className="font-semibold text-dark">
                        <a 
                          href={ghAccount.profileUrl || `https://github.com/${ghAccount.username}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          @{ghAccount.username}
                          <ExternalLinkIcon size={12} />
                        </a>
                      </div>
                      <div className="integration-sync-meta">
                        Last synchronized: {formatLastSync(ghAccount.lastSyncedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="action-btn-group">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSync('github')}
                      disabled={actionLoading['sync_github']}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshIcon size={14} className={actionLoading['sync_github'] ? 'spin' : ''} />
                      {actionLoading['sync_github'] ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDisconnect('github')}
                      disabled={actionLoading['disconnect_github']}
                      style={{ color: '#dc2626' }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div className="integration-stats-grid">
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Public Repos</span>
                    <span className="integration-stat-value">{ghAccount.metrics?.publicRepos ?? 0}</span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Commits Tracked</span>
                    <span className="integration-stat-value">{ghAccount.metrics?.totalCommits ?? 0}</span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Recent Events</span>
                    <span className="integration-stat-value">{ghAccount.metrics?.totalEvents ?? 0}</span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Followers</span>
                    <span className="integration-stat-value">{ghAccount.metrics?.followers ?? 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectGitHub} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="integration-form-row">
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type={showGhToken ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Paste GitHub Personal Access Token (ghp_...)"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      disabled={actionLoading.github}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGhToken(!showGhToken)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showGhToken ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={actionLoading.github || !ghToken.trim()}
                  >
                    {actionLoading.github ? 'Verifying...' : 'Connect GitHub Token'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span className="text-muted">
                    Required scope: <strong>read:user</strong> only. Tokens are never exposed to the frontend.
                  </span>
                  {oauthUrl && (
                    <a 
                      href={oauthUrl} 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    >
                      Connect with OAuth
                    </a>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* ================================================================= */}
          {/* 2. LEETCODE INTEGRATION CARD                                      */}
          {/* ================================================================= */}
          <div className="integration-card">
            <div className="integration-card-top">
              <div className="integration-platform-identity">
                <div className="integration-icon-circle icon-leetcode">
                  LC
                </div>
                <div>
                  <div className="integration-platform-title">LeetCode</div>
                  <div className="text-muted text-xs">Problem solving submissions & difficulty distribution</div>
                </div>
              </div>

              <div className="integration-badge-group">
                {lcAccount.connected ? (
                  <span className="badge-source-limited">
                    Public Profile Verified
                  </span>
                ) : (
                  <span className="badge-source-sample">Sample Mode</span>
                )}
              </div>
            </div>

            <div className="integration-audit-box">
              <strong>Integration Notice:</strong> LeetCode does not offer an open 3rd-party OAuth developer API. Profiles are verified via read-only public endpoints without bypassing platform protections. Historical data without a verified handle is labeled <em>Sample</em>.
            </div>

            {lcAccount.connected ? (
              <div className="integration-details-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="font-semibold text-dark">
                      <a 
                        href={`https://leetcode.com/${lcAccount.username}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        leetcode.com/{lcAccount.username}
                        <ExternalLinkIcon size={12} />
                      </a>
                    </div>
                    <div className="integration-sync-meta">
                      Last verified: {formatLastSync(lcAccount.lastSyncedAt)}
                    </div>
                  </div>

                  <div className="action-btn-group">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSync('leetcode')}
                      disabled={actionLoading['sync_leetcode']}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshIcon size={14} className={actionLoading['sync_leetcode'] ? 'spin' : ''} />
                      {actionLoading['sync_leetcode'] ? 'Checking...' : 'Refresh'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDisconnect('leetcode')}
                      disabled={actionLoading['disconnect_leetcode']}
                      style={{ color: '#dc2626' }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div className="integration-stats-grid">
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Total Solved</span>
                    <span className="integration-stat-value font-bold text-primary">
                      {lcAccount.metrics?.totalSolved ?? 0}
                    </span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Easy</span>
                    <span className="integration-stat-value" style={{ color: '#10b981' }}>
                      {lcAccount.metrics?.easySolved ?? 0}
                    </span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Medium</span>
                    <span className="integration-stat-value" style={{ color: '#f59e0b' }}>
                      {lcAccount.metrics?.mediumSolved ?? 0}
                    </span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Hard</span>
                    <span className="integration-stat-value" style={{ color: '#ef4444' }}>
                      {lcAccount.metrics?.hardSolved ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectLeetCode} className="integration-form-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="LeetCode username (e.g. tour_de_code)"
                  value={lcUsername}
                  onChange={(e) => setLcUsername(e.target.value)}
                  disabled={actionLoading.leetcode}
                />
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading.leetcode || !lcUsername.trim()}
                >
                  {actionLoading.leetcode ? 'Verifying...' : 'Link Handle'}
                </button>
              </form>
            )}
          </div>

          {/* ================================================================= */}
          {/* 3. CODECHEF INTEGRATION CARD                                      */}
          {/* ================================================================= */}
          <div className="integration-card">
            <div className="integration-card-top">
              <div className="integration-platform-identity">
                <div className="integration-icon-circle icon-codechef">
                  CC
                </div>
                <div>
                  <div className="integration-platform-title">CodeChef</div>
                  <div className="text-muted text-xs">Contest ratings, global division & star rankings</div>
                </div>
              </div>

              <div className="integration-badge-group">
                {ccAccount.connected ? (
                  <span className="badge-source-limited">
                    Handle Linked
                  </span>
                ) : (
                  <span className="badge-source-sample">Sample Benchmark</span>
                )}
              </div>
            </div>

            <div className="integration-audit-box">
              <strong>Integration Notice:</strong> The CodeChef developer portal has restricted public 3rd-party OAuth registrations. Existing benchmark and contest stats are presented with an explicit <em>Sample</em> or <em>Linked Handle</em> label.
            </div>

            {ccAccount.connected ? (
              <div className="integration-details-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="font-semibold text-dark">
                      <a 
                        href={`https://www.codechef.com/users/${ccAccount.username}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        codechef.com/users/{ccAccount.username}
                        <ExternalLinkIcon size={12} />
                      </a>
                    </div>
                    <div className="integration-sync-meta">
                      Linked: {formatLastSync(ccAccount.lastSyncedAt)}
                    </div>
                  </div>

                  <div className="action-btn-group">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDisconnect('codechef')}
                      disabled={actionLoading['disconnect_codechef']}
                      style={{ color: '#dc2626' }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div className="integration-stats-grid">
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Rating</span>
                    <span className="integration-stat-value font-bold text-primary">
                      {ccAccount.metrics?.rating ? `${ccAccount.metrics.rating}` : 'Unrated'}
                    </span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Stars</span>
                    <span className="integration-stat-value">
                      {ccAccount.metrics?.stars ? `${ccAccount.metrics.stars}★` : '—'}
                    </span>
                  </div>
                  <div className="integration-stat-item">
                    <span className="integration-stat-label">Division</span>
                    <span className="integration-stat-value">
                      {ccAccount.metrics?.division || 'Div 3'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectCodeChef} className="integration-form-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="CodeChef handle (e.g. chef_kavya)"
                  value={ccUsername}
                  onChange={(e) => setCcUsername(e.target.value)}
                  disabled={actionLoading.codechef}
                />
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading.codechef || !ccUsername.trim()}
                >
                  {actionLoading.codechef ? 'Linking...' : 'Link Handle'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
