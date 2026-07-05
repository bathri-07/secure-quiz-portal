import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Leaderboard() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const fetchLeaderboardData = () => {
  setLoading(true);
  setError(null);
  
  // 🔥 DYNAMIC BINDING: Safely uses the live environment url variable instead of localhost
  const BASE_URL = import.meta.env.VITE_API_URL || 'https://secure-quiz-backend-mkfv.onrender.com/api';
  
  axios.get(`${BASE_URL}/leaderboard?t=${new Date().getTime()}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  })
    .then(res => {
      setStandings(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Leaderboard Sync Error: ", err);
      setError("Failed to synchronize academic standing matrices.");
      setLoading(false);
    });
};

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '20px auto', padding: '25px', background: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.75rem' }}>Performance Analytics Board</h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Official verified rankings ordered by target score matrices and execution efficiency.</p>
        </div>
        <button 
          className="primary-action-button" 
          style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto', background: '#3b82f6' }}
          onClick={fetchLeaderboardData}
        >
          🔄 Refresh Standings
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.1rem', animate: 'pulse 2s infinite' }}>Syncing academic standings matrix...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
          <p>{error}</p>
          <button onClick={fetchLeaderboardData} style={{ background: 'transparent', border: 'none', color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer' }}>Try Again</button>
        </div>
      ) : standings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.1rem' }}>No evaluation records found inside this cohort yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#cbd5e1' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                <th style={{ padding: '14px', width: '80px', textAlign: 'center', color: '#94a3b8' }}>Rank</th>
                <th style={{ padding: '14px' }}>Candidate</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>Stage Tier</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>Time Taken</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>Infractions</th>
                <th style={{ padding: '14px', textAlign: 'right', color: '#10b981' }}>Final Score</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((candidate, index) => {
                const isTopThree = index < 3;
                const rankColors = ['#f59e0b', '#94a3b8', '#b45309']; // Gold, Silver, Bronze indices
                
                return (
                  <tr 
                    key={candidate._id || index} 
                    style={{ 
                      borderBottom: '1px solid #334155', 
                      background: index % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'transparent'}
                  >
                    <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold' }}>
                      {isTopThree ? (
                        <span style={{ 
                          display: 'inline-block', 
                          width: '24px', 
                          height: '24px', 
                          lineHeight: '24px', 
                          borderRadius: '50%', 
                          background: rankColors[index], 
                          color: '#0f172a',
                          fontSize: '0.85rem'
                        }}>
                          {index + 1}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>{index + 1}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 'bold', color: '#fff' }}>{candidate.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{candidate.email}</div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        Round {candidate.round}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#60a5fa' }}>
                      ⏱ {candidate.timeTakenMinutes || '0:00'}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '0.85rem',
                        color: candidate.violationsCount >= 3 ? '#ef4444' : '#94a3b8' 
                      }}>
                        {candidate.violationsCount} Warning{candidate.violationsCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>
                      {candidate.score} / 100
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}