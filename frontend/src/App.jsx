import React, { useState } from 'react';
import Home from './components/Home.jsx';
import QuizPage from './components/QuizPage.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import Leaderboard from './components/Leaderboard.jsx';

export default function App() {
  const [view, setView] = useState('home');

  return (
    <div className="container">
      <header className="brand-header-strip">
        <div className="brand-title" onClick={() => setView('home')}>
          INSTITUTE EXAMINATION PROCTOR
        </div>
        <nav className="navbar-links">
          <button className={view === 'home' ? 'active-nav' : ''} onClick={() => setView('home')}>
            Dashboard
          </button>
          <button className={view === 'quiz' ? 'active-nav' : ''} onClick={() => setView('quiz')}>
            Examination Console
          </button>
          <button className={view === 'leaderboard' ? 'active-nav' : ''} onClick={() => setView('leaderboard')}>
            Performance Analytics
          </button>
          <button className={view === 'admin' ? 'active-nav' : 'admin-nav'} onClick={() => setView('admin')}>
            Control Center
          </button>
        </nav>
      </header>

      {/* Main Container Viewport (Only one view can occupy this space at a time) */}
      <main className="content-viewport">
        {view === 'home' && <Home setView={setView} />}
        {view === 'quiz' && <QuizPage />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  );
}