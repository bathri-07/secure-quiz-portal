import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 🌟 FIXED: Correctly imported from 'axios' now!

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [adminTab, setAdminTab] = useState('configure'); 
  
  const [round, setRound] = useState(1);
  const [roundDurationMinutes, setRoundDurationMinutes] = useState(20);
  const [questionCount, setQuestionCount] = useState(1);
  const [questionsList, setQuestionsList] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);

  const [candidateLogs, setCandidateLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || 'https://secure-quiz-backend-mkfv.onrender.com/api';

  useEffect(() => {
    const count = Math.max(1, questionCount);
    setQuestionsList(prev => {
      const updated = [...prev];
      if (updated.length < count) {
        while (updated.length < count) {
          updated.push({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
        }
      } else if (updated.length > count) {
        return updated.slice(0, count);
      }
      return updated;
    });
  }, [questionCount]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passphrase === 'AdminIT@2026') {
      sessionStorage.setItem('secure_admin_session', 'verified_token_99');
      setIsAuthenticated(true);
    } else {
      alert('INVALID ANCHOR AUTHENTICATION PASSPHRASE.');
    }
  };

  useEffect(() => {
    const sessionToken = sessionStorage.getItem('secure_admin_session');
    if (sessionToken === 'verified_token_99') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchCandidateLogs = () => {
    setLoadingLogs(true);
    axios.get(`${BASE_URL}/submissions?t=${new Date().getTime()}`)
      .then(res => {
        setCandidateLogs(res.data);
        setLoadingLogs(false);
      })
      .catch(err => {
        console.error("Dashboard Fetch Log Error:", err);
        setLoadingLogs(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated && adminTab === 'monitoring') {
      fetchCandidateLogs();
    }
  }, [isAuthenticated, adminTab]);

  const handleQuestionFieldChange = (qIdx, field, value) => {
    const updated = [...questionsList];
    updated[qIdx][field] = value;
    setQuestionsList(updated);
  };

  const handleOptionFieldChange = (qIdx, optIdx, value) => {
    const updated = [...questionsList];
    updated[qIdx].options[optIdx] = value;
    setQuestionsList(updated);
  };

  const handleSubmitBulkQuestions = (e) => {
    e.preventDefault();
    const validatedQuestions = questionsList.filter(q => 
      q.questionText.trim() !== '' && 
      q.correctAnswer.trim() !== ''
    );

    if (validatedQuestions.length === 0) {
      alert("Please fill out the forms before submitting.");
      return;
    }

    const payload = {
      round: Number(round),
      roundDurationSeconds: Number(roundDurationMinutes) * 60,
      questions: validatedQuestions
    };

    axios.post(`${BASE_URL}/questions/add-bulk`, payload)
      .then(() => {
        alert(`Round ${round} Configuration Replaced and Saved Successfully!`);
        setQuestionCount(1);
        setQuestionsList([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
      })
      .catch(err => console.error("Dashboard Bulk Submit Error:", err));
  };

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', textAlign: 'center', background: '#1e293b' }}>
        <h3>Control Center Access</h3>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            type="password" 
            className="quiz-vertical-box" 
            placeholder="Enter Administrative Passphrase"
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            required
          />
          <button type="submit" className="primary-action-button">Authenticate Identity</button>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '20px auto', padding: '25px', background: '#1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#fff' }}>System Control Center</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #3b82f6', background: adminTab === 'configure' ? '#3b82f6' : 'transparent', color: '#fff' }}
            onClick={() => setAdminTab('configure')}
          >
            ⚙️ Configure Question Matrix
          </button>
          <button 
            style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #10b981', background: adminTab === 'monitoring' ? '#10b981' : 'transparent', color: '#fff' }}
            onClick={() => setAdminTab('monitoring')}
          >
            📋 Candidate Live Metrics
          </button>
        </div>
      </div>

      {adminTab === 'configure' && (
        <form onSubmit={handleSubmitBulkQuestions} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target Allocation Tier</label>
              <select className="quiz-vertical-box" value={round} onChange={e => setRound(parseInt(e.target.value, 10))}>
                <option value="1">Round 1 — Technical Screening</option>
                <option value="2">Round 2 — Logic &amp; Architecture</option>
                <option value="3">Round 3 — Dynamic Systems Code</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Round Duration (Minutes)</label>
              <input type="number" className="quiz-vertical-box" min="1" value={roundDurationMinutes} onChange={e => setRoundDurationMinutes(parseInt(e.target.value, 10))} />
            </div>
            <div>
              <label style={{ color: '#60a5fa', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Number of Questions</label>
              <input type="number" className="quiz-vertical-box" min="1" value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value, 10))} />
            </div>
          </div>

          {questionsList.map((q, qIdx) => (
            <div key={qIdx} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '16px', marginTop: '10px' }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.85rem' }}>QUESTION NODE BLOCK #{qIdx + 1}</span>
              <textarea 
                className="quiz-vertical-box" style={{ marginTop: '8px', minHeight: '50px' }}
                value={q.questionText} onChange={e => handleQuestionFieldChange(qIdx, 'questionText', e.target.value)}
                placeholder="Enter question definition details..." required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {q.options.map((option, optIdx) => (
                  <input 
                    key={optIdx} 
                    type="text" 
                    className="quiz-vertical-box"
                    placeholder={`Option Reference Token ${String.fromCharCode(65 + optIdx)}`}
                    value={option} 
                    onChange={(e) => handleOptionFieldChange(qIdx, optIdx, e.target.value)} 
                    required
                  />
                ))}
              </div>
              <input 
                type="text" className="quiz-vertical-box" style={{ marginTop: '10px' }}
                placeholder="Must perfectly match option string value..."
                value={q.correctAnswer} onChange={e => handleQuestionFieldChange(qIdx, 'correctAnswer', e.target.value)} required
              />
            </div>
          ))}
          <button type="submit" className="primary-action-button" style={{ padding: '12px' }}>Save Layout and Replace Active Round Collection</button>
        </form>
      )}

      {adminTab === 'monitoring' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>Submitted Candidate Inventories</h3>
            <button className="primary-action-button" style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }} onClick={fetchCandidateLogs}>🔄 Refresh Logs</button>
          </div>

          {loadingLogs ? (
            <p style={{ color: '#94a3b8' }}>Syncing telemetry fields...</p>
          ) : candidateLogs.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No recorded candidate attempts found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                    <th style={{ padding: '12px' }}>Candidate Profile</th>
                    <th style={{ padding: '12px' }}>Assessment Stage</th>
                    <th style={{ padding: '12px' }}>Time Taken</th>
                    <th style={{ padding: '12px' }}>Security Warnings</th>
                    <th style={{ padding: '12px' }}>Final Score</th>
                    <th style={{ padding: '12px' }}>Detailed Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateLogs.map((log, index) => (
                    <tr key={log._id || index} style={{ borderBottom: '1px solid #334155', background: 'transparent' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{log.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.email}</div>
                      </td>
                      <td style={{ padding: '12px' }}>Round {log.round}</td>
                      <td style={{ padding: '12px', color: '#60a5fa' }}>⏱ {log.timeTakenMinutes || '0:00'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', background: log.violationsCount >= 3 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: log.violationsCount >= 3 ? '#ef4444' : '#10b981' }}>
                          {log.violationsCount} / 3 Warnings
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>{log.score} / 100</td>
                      <td style={{ padding: '12px' }}>
                        <details style={{ cursor: 'pointer', color: '#3b82f6' }}>
                          <summary style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>View Response Nodes</summary>
                          <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', marginTop: '6px', color: '#fff', fontSize: '0.8rem', maxWidth: '400px' }}>
                            {log.answers && log.answers.map((ans, aIdx) => (
                              <div key={aIdx} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #1e293b' }}>
                                <div style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px', background: ans.isCorrect ? '#10b981' : '#ef4444' }}></div>
                                <span style={{ color: '#94a3b8' }}>Selected Answer string:</span> <strong style={{ color: ans.isCorrect ? '#10b981' : '#ef4444' }}>{ans.selectedAnswer || '[Blank/No Selection]'}</strong>
                              </div>
                            ))}
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}