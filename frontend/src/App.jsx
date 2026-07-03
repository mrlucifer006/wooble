import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, PieChart, Calendar, Headset, TrendingUp, 
  MapPin, Bell, Clock, Plane, Star, ListChecks, 
  CheckCircle2, Circle, Wand2, Send, Bot, User, Check,
  Plus, FileText, AlertCircle, XCircle, CheckCircle,
  MessageSquare, Target, Award, Loader2
} from 'lucide-react';
import './index.css';

const API_BASE = import.meta.env.DEV ? '' : 'https://wooble-88nh.onrender.com';

// ─── Toast Notification ──────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      </div>
      <span>{message}</span>
    </div>
  );
};

// ─── Dashboard View ──────────────────────────────────────────────────────────

const DashboardView = ({ onCheckIn, isCheckedIn, isCheckingIn }) => {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello Jane! I can help you with company policies, leave requests, or IT support. What do you need help with?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [isCheckedIn]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    try {
      const response = await fetch(`${API_BASE}/api/helpdesk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now(), text: data.response, isUser: false }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I am currently unable to reach the AI helpdesk server.", isUser: false }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="content-wrapper" id="dashboard-view">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-accent)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h3>Today's Attendance</h3>
            <p className="stat-value">{stats?.checked_in_today ? '✓ Checked In' : 'Not Yet'}</p>
            <p className="stat-trend neutral">{stats?.today_checkins || 0} check-in(s) today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
            <Plane size={24} />
          </div>
          <div className="stat-details">
            <h3>Leave Balance</h3>
            <p className="stat-value">{stats?.leave_balance ?? 12} Days</p>
            <p className="stat-trend neutral">Annual limit: 20 · {stats?.pending_leaves || 0} pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Star size={24} />
          </div>
          <div className="stat-details">
            <h3>Performance</h3>
            <p className="stat-value">{stats?.latest_review ? `${stats.latest_review.rating}/5` : 'No Reviews'}</p>
            <p className="stat-trend positive">{stats?.total_reviews || 0} review(s) total</p>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget onboarding-widget">
          <div className="widget-header">
            <h3><ListChecks size={20} /> Onboarding Checklist</h3>
            <span className="progress-text">60% Completed</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '60%' }}></div>
          </div>
          <ul className="task-list">
            <li className="task completed">
              <CheckCircle2 size={18} /> Complete Profile Setup
            </li>
            <li className="task completed">
              <CheckCircle2 size={18} /> Submit Tax Forms
            </li>
            <li className="task pending">
              <Circle size={18} /> Review IT Security Policy
            </li>
            <li className="task pending">
              <Circle size={18} /> Meet your Manager
            </li>
          </ul>
        </div>

        <div className="widget ai-helpdesk-widget">
          <div className="widget-header">
            <h3><Wand2 size={20} style={{ color: 'var(--primary-accent)' }} /> Ask AI HR Assistant</h3>
          </div>
          <div className="chat-area">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
                <div className="msg-avatar">
                  {msg.isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="E.g., What is the maternity leave policy?" 
            />
            <button onClick={handleSend}><Send size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Leaves View ─────────────────────────────────────────────────────────────

const LeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leave_type: 'Annual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const fetchLeaves = () => {
    fetch(`${API_BASE}/api/leaves`)
      .then(r => r.json())
      .then(data => { setLeaves(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: 'E123',
          employee_name: 'Jane Doe',
          ...form
        })
      });
      if (res.ok) {
        setToast({ message: 'Leave request submitted!', type: 'success' });
        setForm({ leave_type: 'Annual', start_date: '', end_date: '', reason: '' });
        setShowForm(false);
        fetchLeaves();
      } else {
        setToast({ message: 'Failed to submit leave request.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Server unreachable.', type: 'error' });
    }
    setSubmitting(false);
  };

  const handleAction = async (leaveId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/leaves/${leaveId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setToast({ message: `Leave ${status.toLowerCase()}.`, type: 'success' });
        fetchLeaves();
      }
    } catch {
      setToast({ message: 'Action failed.', type: 'error' });
    }
  };

  const statusClass = (s) => s === 'Approved' ? 'badge-success' : s === 'Rejected' ? 'badge-danger' : 'badge-warning';

  return (
    <div className="content-wrapper">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="view-header">
        <div>
          <h2><Calendar size={24} /> Leave Management</h2>
          <p className="view-subtitle">Submit and track your leave requests</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <div className="widget form-card animate-slide-down">
          <h3><FileText size={18} /> Submit Leave Request</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="leave-type">Leave Type</label>
              <select id="leave-type" value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}>
                <option>Annual</option>
                <option>Sick</option>
                <option>Personal</option>
                <option>Maternity</option>
                <option>Paternity</option>
                <option>Unpaid</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="leave-start">Start Date</label>
              <input id="leave-start" type="date" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="leave-end">End Date</label>
              <input id="leave-end" type="date" required value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="leave-reason">Reason</label>
              <textarea id="leave-reason" rows="3" required placeholder="Describe your reason for leave..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
            </div>
            <div className="form-actions full-width">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="spin" /> Submitting...</> : <><Send size={16} /> Submit Request</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="widget">
        <div className="widget-header">
          <h3><FileText size={18} /> Leave History</h3>
          <span className="record-count">{leaves.length} request(s)</span>
        </div>
        {loading ? (
          <div className="loading-state"><Loader2 size={24} className="spin" /> Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No leave requests yet. Click "New Request" to submit one.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...leaves].reverse().map(leave => (
                  <tr key={leave.id}>
                    <td><span className="type-badge">{leave.leave_type}</span></td>
                    <td>{leave.start_date}</td>
                    <td>{leave.end_date}</td>
                    <td className="reason-cell">{leave.reason}</td>
                    <td><span className={`status-badge ${statusClass(leave.status)}`}>{leave.status}</span></td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <div className="action-btns">
                          <button className="btn-sm btn-approve" onClick={() => handleAction(leave.id, 'Approved')} title="Approve">
                            <CheckCircle size={14} />
                          </button>
                          <button className="btn-sm btn-reject" onClick={() => handleAction(leave.id, 'Rejected')} title="Reject">
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Helpdesk View (Full Page) ───────────────────────────────────────────────

const HelpdeskView = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the AuraHR AI Helpdesk! I can answer questions about company policies, leave, remote work, and more. How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await fetch(`${API_BASE}/api/helpdesk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text })
      });
      const data = await response.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), text: data.response, isUser: false, source: data.source }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I'm unable to reach the helpdesk server right now.", isUser: false }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = [
    "What is the leave policy?",
    "How does remote work policy work?",
    "When is my performance review?",
    "How do I request sick leave?"
  ];

  return (
    <div className="content-wrapper helpdesk-fullpage">
      <div className="widget helpdesk-container">
        <div className="helpdesk-header">
          <div className="helpdesk-title">
            <div className="ai-badge"><Bot size={20} /></div>
            <div>
              <h3>AuraHR AI Assistant</h3>
              <span className="online-status">● Online — Powered by Policy KB</span>
            </div>
          </div>
        </div>

        <div className="helpdesk-chat-area">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
              <div className="msg-avatar">
                {msg.isUser ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="msg-content">
                <div className="msg-bubble">{msg.text}</div>
                {msg.source && <span className="msg-source">Source: {msg.source}</span>}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="msg-avatar"><Bot size={16} /></div>
              <div className="msg-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="quick-questions">
            {quickQuestions.map((q, i) => (
              <button key={i} className="quick-q-btn" onClick={() => { setInput(q); }}>
                <MessageSquare size={14} /> {q}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-area helpdesk-input">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about HR policies..." 
          />
          <button onClick={handleSend} disabled={!input.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Performance View ────────────────────────────────────────────────────────

const PerformanceView = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    reviewer_name: '',
    rating: 4,
    feedback: '',
    goals: '',
    quarter: ''
  });

  const fetchReviews = () => {
    fetch(`${API_BASE}/api/performance`)
      .then(r => r.json())
      .then(data => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: 'E123',
          employee_name: 'Jane Doe',
          ...form,
          rating: parseInt(form.rating)
        })
      });
      if (res.ok) {
        setToast({ message: 'Performance review submitted!', type: 'success' });
        setForm({ reviewer_name: '', rating: 4, feedback: '', goals: '', quarter: '' });
        setShowForm(false);
        fetchReviews();
      } else {
        setToast({ message: 'Failed to submit review.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Server unreachable.', type: 'error' });
    }
    setSubmitting(false);
  };

  const ratingStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const ratingColor = (n) => n >= 4 ? 'var(--success-color)' : n >= 3 ? '#F59E0B' : '#EF4444';

  return (
    <div className="content-wrapper">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="view-header">
        <div>
          <h2><TrendingUp size={24} /> Performance Reviews</h2>
          <p className="view-subtitle">Track feedback and growth across review cycles</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Review'}
        </button>
      </div>

      {showForm && (
        <div className="widget form-card animate-slide-down">
          <h3><Award size={18} /> Submit Performance Review</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="reviewer">Reviewer Name</label>
              <input id="reviewer" type="text" required placeholder="e.g. John Smith" value={form.reviewer_name} onChange={e => setForm({...form, reviewer_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="quarter">Review Period</label>
              <input id="quarter" type="text" placeholder="e.g. Q2 2026" value={form.quarter} onChange={e => setForm({...form, quarter: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="rating">Rating (1-5)</label>
              <div className="rating-input">
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n} className={`star-btn ${form.rating >= n ? 'active' : ''}`} onClick={() => setForm({...form, rating: n})}>
                    ★
                  </button>
                ))}
                <span className="rating-label">{form.rating}/5</span>
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="feedback">Feedback</label>
              <textarea id="feedback" rows="3" required placeholder="Provide detailed performance feedback..." value={form.feedback} onChange={e => setForm({...form, feedback: e.target.value})} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="goals">Goals for Next Quarter</label>
              <textarea id="goals" rows="2" placeholder="Set goals and growth areas..." value={form.goals} onChange={e => setForm({...form, goals: e.target.value})} />
            </div>
            <div className="form-actions full-width">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="spin" /> Submitting...</> : <><Send size={16} /> Submit Review</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><Loader2 size={24} className="spin" /> Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="widget empty-state">
          <Award size={48} />
          <p>No performance reviews yet. Click "New Review" to add one.</p>
        </div>
      ) : (
        <div className="review-cards">
          {[...reviews].reverse().map(review => (
            <div key={review.id} className="widget review-card">
              <div className="review-card-header">
                <div>
                  <h4>{review.quarter}</h4>
                  <span className="text-muted">by {review.reviewer_name}</span>
                </div>
                <div className="review-rating" style={{ color: ratingColor(review.rating) }}>
                  <span className="rating-stars">{ratingStars(review.rating)}</span>
                  <span className="rating-number">{review.rating}/5</span>
                </div>
              </div>
              <div className="review-section">
                <h5><MessageSquare size={14} /> Feedback</h5>
                <p>{review.feedback}</p>
              </div>
              {review.goals && (
                <div className="review-section">
                  <h5><Target size={14} /> Goals</h5>
                  <p>{review.goals}</p>
                </div>
              )}
              <div className="review-footer">
                <span className="text-muted">Submitted {new Date(review.submitted_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────────────────

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [toast, setToast] = useState(null);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: 'E123',
          employee_name: 'Jane Doe',
          check_type: 'check_in'
        })
      });
      if (res.ok) {
        setIsCheckedIn(true);
        setToast({ message: 'Checked in successfully!', type: 'success' });
        setTimeout(() => setIsCheckedIn(false), 5000);
      }
    } catch {
      setToast({ message: 'Check-in failed — server unreachable.', type: 'error' });
    }
    setIsCheckingIn(false);
  };

  useEffect(() => {
    // Log visit when the app loads
    fetch(`${API_BASE}/api/track_visit`, { method: 'POST' })
      .catch(err => console.log('Tracking not available or backend offline.', err));
  }, []);

  const navItems = [
    { id: 'dashboard', icon: PieChart, label: 'Dashboard' },
    { id: 'leaves', icon: Calendar, label: 'Leaves' },
    { id: 'helpdesk', icon: Headset, label: 'AI Helpdesk' },
    { id: 'performance', icon: TrendingUp, label: 'Performance' },
  ];

  const viewTitles = {
    'dashboard': 'Welcome back, Jane! 👋',
    'leaves': 'Leave Management',
    'helpdesk': 'AI HR Helpdesk',
    'performance': 'Performance Review'
  };

  return (
    <div className="app-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><Layers size={20} /></div>
          <h1>AuraHR</h1>
        </div>
        <nav className="nav-menu">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} /> {item.label}
            </div>
          ))}
        </nav>
        <div className="user-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="avatar" />
          <div className="user-info">
            <span className="user-name">Jane Doe</span>
            <span className="user-role">Product Designer</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h2>{viewTitles[activeTab]}</h2>
          <div className="header-actions">
            <button 
              className="btn-check-in" 
              onClick={handleCheckIn}
              style={isCheckedIn ? { backgroundColor: '#059669' } : {}}
            >
              {isCheckingIn ? (
                <><Loader2 size={16} className="spin" /> Checking In...</>
              ) : isCheckedIn ? (
                <><Check size={16} /> Checked In</>
              ) : (
                <><MapPin size={16} /> Check In</>
              )}
            </button>
            <div className="notification-bell">
              <Bell size={24} />
              <span className="badge">3</span>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView onCheckIn={handleCheckIn} isCheckedIn={isCheckedIn} isCheckingIn={isCheckingIn} />}
        {activeTab === 'leaves' && <LeavesView />}
        {activeTab === 'helpdesk' && <HelpdeskView />}
        {activeTab === 'performance' && <PerformanceView />}
      </main>
    </div>
  );
}

export default App;
