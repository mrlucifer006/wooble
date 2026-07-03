import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, PieChart, Calendar, Headset, TrendingUp, 
  MapPin, Bell, Clock, Plane, Star, ListChecks, 
  CheckCircle2, Circle, Wand2, Send, Bot, User, Check
} from 'lucide-react';
import './index.css';

const DashboardView = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello Jane! I can help you with company policies, leave requests, or IT support. What do you need help with?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    try {
      const response = await fetch(`/api/helpdesk?query=${encodeURIComponent(userMsg.text)}`, {
        method: 'POST'
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now(), text: data.response, isUser: false }]);
    } catch (error) {
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
            <h3>Attendance</h3>
            <p className="stat-value">98%</p>
            <p className="stat-trend positive"><TrendingUp size={14} /> 2% this month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
            <Plane size={24} />
          </div>
          <div className="stat-details">
            <h3>Leave Balance</h3>
            <p className="stat-value">12 Days</p>
            <p className="stat-trend neutral">Annual limit: 20</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Star size={24} />
          </div>
          <div className="stat-details">
            <h3>Performance</h3>
            <p className="stat-value">Outstanding</p>
            <p className="stat-trend positive">Q2 Review Completed</p>
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

const GenericView = ({ title, description }) => (
  <div className="content-wrapper">
    <h2>{title}</h2>
    <div className="widget">
      <p>{description}</p>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      setIsCheckingIn(false);
      setIsCheckedIn(true);
      setTimeout(() => setIsCheckedIn(false), 3000);
    }, 1500);
  };

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
                "Checking In..." // basic loading state text
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

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leaves' && <GenericView title="Leaves Management" description="Submit and track your leave requests. (Integration pending)" />}
        {activeTab === 'helpdesk' && <GenericView title="AI Helpdesk" description="Powered by local Llama 3 models via Ollama. (Full interface pending)" />}
        {activeTab === 'performance' && <GenericView title="Performance Dashboard" description="Continuous feedback and review cycles. (Integration pending)" />}
      </main>
    </div>
  );
}

export default App;
