import React, { useState } from 'react';
import { login, register } from '../services/api';

/**
 * Login & Registration Portal Component
 * Professional, secure authentication portal for Admins and Students
 */
export default function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [roleTab, setRoleTab] = useState('admin'); // 'admin' | 'student'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('3');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Quick fill helper for presentation and demonstration
  const handleQuickFill = (role) => {
    setAuthMode('login');
    setRoleTab(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'admin') {
      setEmail('admin@student360.edu');
      setPassword('Admin@Student360');
    } else {
      setEmail('anu.cse@college.edu');
      setPassword('Student@Student360');
    }
  };

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    if (mode === 'register') {
      setRoleTab('student');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please provide your full student name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let response;
      if (authMode === 'register') {
        response = await register({
          name: name.trim(),
          email: trimmedEmail,
          password,
          department,
          year: parseInt(year, 10)
        });
      } else {
        response = await login(trimmedEmail, password);
      }

      if (response && response.token && response.user) {
        localStorage.setItem('student360_token', response.token);
        localStorage.setItem('student360_user', JSON.stringify(response.user));
        
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }
      } else {
        setErrorMessage('Authentication succeeded but session payload was incomplete.');
      }
    } catch (err) {
      const msg = err.data?.message || err.message || (authMode === 'register' ? 'Registration failed.' : 'Invalid email or password.');
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Decorative background grid and glow */}
      <div className="login-bg-glow login-bg-glow-1"></div>
      <div className="login-bg-glow login-bg-glow-2"></div>

      <div className="login-card-wrapper">
        <div className="login-card">
          {/* Header & Logo */}
          <div className="login-header">
            <div className="login-logo-badge">
              <span className="login-logo-symbol">360°</span>
            </div>
            <h1 className="login-title">Student360</h1>
            <p className="login-subtitle">
              {authMode === 'register' ? 'Student Account Registration' : 'Learning Activity & Performance Analytics'}
            </p>
          </div>

          {/* Login Role Switcher Tabs (Only in Login Mode) */}
          {authMode === 'login' ? (
            <div className="login-role-tabs">
              <button
                type="button"
                className={`login-role-tab ${roleTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleQuickFill('admin')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Faculty Admin</span>
              </button>
              <button
                type="button"
                className={`login-role-tab ${roleTab === 'student' ? 'active' : ''}`}
                onClick={() => handleQuickFill('student')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Student</span>
              </button>
            </div>
          ) : (
            <div className="register-notice-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Enrolling in verified institutional analytics cohort</span>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <svg className="login-error-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="login-error-text">{errorMessage}</span>
              <button 
                type="button" 
                className="login-error-dismiss" 
                onClick={() => setErrorMessage('')}
                aria-label="Dismiss error"
              >
                &times;
              </button>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div className="login-success-alert" role="alert">
              <span>{successMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Name Field (Register Mode Only) */}
            {authMode === 'register' && (
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">
                  Student Full Name
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="auth-email" className="form-label">
                Institutional Email
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  id="auth-email"
                  type="email"
                  className="form-input"
                  placeholder={
                    authMode === 'register' 
                      ? 'yourname.dept@college.edu' 
                      : (roleTab === 'admin' ? 'admin@student360.edu' : 'anu.cse@college.edu')
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Department & Year (Register Mode Only) */}
            {authMode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="reg-dept" className="form-label">
                    Department
                  </label>
                  <select
                    id="reg-dept"
                    className="form-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ paddingLeft: '12px' }}
                  >
                    <option value="CSE">CSE</option>
                    <option value="AI&DS">AI&DS</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-year" className="form-label">
                    Year of Study
                  </label>
                  <select
                    id="reg-year"
                    className="form-input"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ paddingLeft: '12px' }}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="auth-password" className="form-label">
                  Password
                </label>
              </div>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input form-input-password"
                  placeholder={authMode === 'register' ? 'Choose a secure password (min 6 chars)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-spinner"></span>
                  <span>{authMode === 'register' ? 'Creating Account...' : 'Verifying Credentials...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'register' 
                      ? 'Complete Student Registration' 
                      : (roleTab === 'admin' ? 'Sign In as Administrator' : 'Sign In as Student')
                    }
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Registration */}
          <div className="auth-switch-section">
            {authMode === 'login' ? (
              <p className="auth-switch-text">
                Enrolled student without an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => handleModeSwitch('register')}
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="auth-switch-text">
                Already registered?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => handleModeSwitch('login')}
                >
                  Sign in to your account
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Credentials Assistant (Only in Login Mode) */}
          {authMode === 'login' && (
            <div className="login-demo-assistant">
              <span className="demo-assistant-label">1-Click Demo Fill:</span>
              <div className="demo-chips">
                <button 
                  type="button" 
                  className="demo-chip"
                  onClick={() => handleQuickFill('admin')}
                >
                  <span className="demo-chip-role">Admin</span>
                  <span className="demo-chip-name">Dr. Malavika</span>
                </button>
                <button 
                  type="button" 
                  className="demo-chip"
                  onClick={() => handleQuickFill('student')}
                >
                  <span className="demo-chip-role">Student</span>
                  <span className="demo-chip-name">Anu (CSE)</span>
                </button>
              </div>
            </div>
          )}

          {/* Security Footer Note */}
          <div className="login-footer">
            <span className="login-security-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              JWT Session Signed &bull; Bcrypt Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
