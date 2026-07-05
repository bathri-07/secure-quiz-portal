import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function QuizPage() {
  const [user, setUser] = useState({ name: '', email: '', round: 1 });
  const [isRegistered, setIsRegistered] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200); 
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [violations, setViolations] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState(null);

  const finishedRef = useRef(false);
  const initializedListeners = useRef(false);

  const enterFullscreen = () => {
    if (finishedRef.current || document.fullscreenElement) return;
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleStartQuiz = () => {
    if (user.name && user.email) {
      setIsRegistered(true);
      setTimeout(() => {
        enterFullscreen();
      }, 150);
    }
  };

  // 🔥 FIXED DYNAMIC RESET: Flushes stale views completely before drawing updated datasets
  useEffect(() => {
    if (isRegistered) {
      setLoading(true);
      
      // Explicitly wipe memory vectors instantly to prevent stale UI compounding
      setQuestions([]);
      setAnswers({});
      setElapsedTime(0);
      
      axios.get(`http://localhost:5000/api/questions/${user.round}`, {
        params: {
          timestamp: new Date().getTime() 
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',     
          'Pragma': 'no-cache',            
          'Expires': '0'                   
        }
      })
      .then(res => {
        if (!res.data || res.data.length === 0) {
          setQuestions([]);
          setTimeLeft(1200);
        } else {
          // Direct array replacement cleanly overrides previous iterations
          setQuestions(res.data);
          const cloudConfiguredTime = res.data[0].roundDurationSeconds;
          setTimeLeft(Number(cloudConfiguredTime) || 1200); 
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to query updated cluster indices:", err);
        setLoading(false);
      });
    }
  }, [isRegistered, user.round]);

  useEffect(() => {
    if (!isRegistered || quizFinished) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRegistered, quizFinished]);

  useEffect(() => {
    if (!isRegistered || quizFinished || initializedListeners.current) return;

    initializedListeners.current = true;

    const handleVisibilityChange = () => {
      if (document.hidden && !finishedRef.current) {
        triggerViolation("Tab Switch Intercepted!");
      }
    };
    
    const handleBlur = () => {
      if (!finishedRef.current) {
        triggerViolation("Window focus context lost!");
      }
    };
    
    const preventDefaultAction = (e) => e.preventDefault();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !finishedRef.current) {
        triggerViolation("Exited Fullscreen Environment Restriction!");
        enterFullscreen();
      }
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        triggerViolation("Prohibited hotkey blocked.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('contextmenu', preventDefaultAction);
    window.addEventListener('copy', preventDefaultAction);
    window.addEventListener('paste', preventDefaultAction);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('contextmenu', preventDefaultAction);
      window.removeEventListener('copy', preventDefaultAction);
      window.removeEventListener('paste', preventDefaultAction);
      window.removeEventListener('keydown', handleKeyDown);
      initializedListeners.current = false;
    };
  }, [isRegistered, quizFinished]);

  const triggerViolation = (message) => {
    if (finishedRef.current) return;

    setViolations((prevViolations) => {
      if (prevViolations >= 3) return prevViolations;
      
      const nextViolation = prevViolations + 1;
      
      if (nextViolation >= 3) {
        setSecurityMessage("Maximum security infractions exceeded. Submitting automatically...");
        handleSubmit(nextViolation); 
      } else {
        setSecurityMessage(`SECURITY WARNING: ${message} (${nextViolation}/3 Warnings)`);
        setTimeout(() => setSecurityMessage(null), 4000);
      }

      return nextViolation;
    });
  };

  const handleSubmit = (forcedViolationCount = null) => {
    if (finishedRef.current) return;
    
    finishedRef.current = true;
    setQuizFinished(true);
    exitFullscreen(); 

    const finalViolations = forcedViolationCount !== null ? forcedViolationCount : violations;
    const responses = questions.map(q => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] || ""
    }));

    const currentElapsed = elapsedTime;
    const minStr = Math.floor(currentElapsed / 60);
    const secStr = currentElapsed % 60;
    const timeTakenStr = `${minStr}:${secStr < 10 ? '0' : ''}${secStr}`;

    axios.post('http://localhost:5000/api/submit', {
      name: user.name,
      email: user.email,
      round: user.round,
      responses,
      violationsCount: Number(finalViolations), 
      timeTakenMinutes: timeTakenStr
    })
    .then(() => {
      alert("Assessment data securely saved to MongoDB!");
      setIsRegistered(false);
      finishedRef.current = false;
      setQuizFinished(false);
      setAnswers({});
      setElapsedTime(0);
      setViolations(0);
      setSecurityMessage(null);
      setQuestions([]); // Flush out collection profiles on reset
    })
    .catch(err => {
      console.error(err);
      finishedRef.current = false;
      setQuizFinished(false);
    });
  };

  if (!isRegistered) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
        <h2>Candidate Entrance Profile</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
          ⚠️ Note: Submitting this form will automatically lock your monitor interface into Fullscreen Mode.
        </p>
        <div className="quiz-flex-column">
          <input type="text" className="quiz-vertical-box" placeholder="Full Name" onChange={e => setUser({...user, name: e.target.value})} />
          <input type="email" className="quiz-vertical-box" placeholder="Academic Email Address" onChange={e => setUser({...user, email: e.target.value})} />
          <select className="quiz-vertical-box" onChange={e => setUser({...user, round: parseInt(e.target.value, 10)})}>
            <option value="1">Round 1 — Technical Screening</option>
            <option value="2">Round 2 — Logic &amp; Architecture</option>
            <option value="3">Round 3 — Dynamic Systems Code</option>
          </select>
          <button className="primary-action-button" onClick={handleStartQuiz}>
            Initialize Examination Session
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="card text-center"><h2>Loading dynamic questions live from MongoDB...</h2></div>;

  if (questions.length === 0) {
    return (
      <div className="card text-center">
        <h2>⚠️ No Questions Found</h2>
        <p>The admin has not configured questions for Round {user.round} yet.</p>
        <button className="primary-action-button" style={{marginTop:'20px'}} onClick={() => { exitFullscreen(); setIsRegistered(false); }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {securityMessage && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: '8px',
          fontWeight: 'bold', zIndex: 99999, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          border: '1px solid #dc2626', fontSize: '0.95rem'
        }}>
          {securityMessage}
        </div>
      )}

      <div className="sticky-header">
        <span>Candidate: <strong>{user.name}</strong></span>
        <span className="timer-badge">⏱ Remaining: {Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span>
      </div>
      
      {questions.map((q, index) => (
        <div key={q._id || index} className="card structural-question-card">
          <span className="question-index-tag">Question {index + 1} of {questions.length}</span>
          <p className="question-text">{q.questionText}</p>
          <div className="options-vertical-stack">
            {q.options.map((opt) => (
              <label key={opt} className={`isolated-option-block ${answers[q._id] === opt ? 'selected-styled-border' : ''}`}>
                <input 
                  type="radio" 
                  name={q._id} 
                  value={opt} 
                  checked={answers[q._id] === opt}
                  onChange={() => setAnswers({ ...answers, [q._id]: opt })} 
                />
                <span className="custom-radio-text">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="primary-action-button" onClick={() => handleSubmit()}>Submit Assessment</button>
    </div>
  );
}