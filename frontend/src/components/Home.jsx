import React, { useState } from 'react';

export default function Home({ setView }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const cardData = [
    {
      id: 0,
      tabKey: 'quiz',
      icon: '📝',
      color: '#3b82f6',
      rgbaColor: '59, 130, 246',
      title: 'Examination Console',
      desc: 'Register candidate metrics, verify credentials, and initialize the secure multi-stage assessment environment.',
      actionText: 'Access Console →'
    },
    {
      id: 1,
      tabKey: 'leaderboard',
      icon: '📊',
      color: '#f59e0b',
      rgbaColor: '245, 158, 11',
      title: 'Performance Analytics',
      desc: 'Review verified merit listings and cross-examine cohort outcomes compiled transparently by score matrices.',
      actionText: 'View Analytics →'
    },
    {
      id: 2,
      tabKey: 'admin',
      icon: '🔐',
      color: '#10b981',
      rgbaColor: '16, 185, 129',
      title: 'Control Center',
      desc: 'Authorized terminal for evaluators to construct matrices, review integrity logs, and audit real-time telemetry.',
      actionText: 'Authenticate Terminal →'
    }
  ];

  return (
    <div className="card" style={{ padding: '40px 30px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{ 
          background: 'rgba(59, 130, 246, 0.15)', 
          color: '#60a5fa', 
          padding: '6px 16px', 
          borderRadius: '20px', 
          fontSize: '0.85rem', 
          fontWeight: 'bold',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          INFORMATION TECHNOLOGY
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '16px', marginBottom: '12px', background: 'linear-gradient(90deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Department-level Technical Quiz Portal
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Secure, real-time assessment architecture engineered for advanced academic evaluations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {cardData.map((card) => {
          const isHovered = hoveredIndex === card.id;

          const standardCardStyle = {
            background: isHovered ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.4)',
            border: isHovered ? `1px solid ${card.color}` : '1px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
            boxShadow: isHovered ? `0 10px 20px rgba(${card.rgbaColor}, 0.15)` : 'none',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          };

          return (
            <div 
              key={card.id}
              style={standardCardStyle} 
              onClick={() => setView(card.tabKey)} 
              onMouseEnter={() => setHoveredIndex(card.id)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div>
                <div style={{
                  fontSize: '1.5rem',
                  background: `rgba(${card.rgbaColor}, 0.15)`,
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  border: `1px solid rgba(${card.rgbaColor}, 0.3)`
                }}>
                  {card.icon}
                </div>
                <h3 style={{ margin: '12px 0 8px 0', color: '#fff', fontSize: '1.2rem' }}>{card.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                  {card.desc}
                </p>
              </div>
              <span style={{
                color: card.color,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                marginTop: '16px',
                display: 'inline-block',
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.2s ease'
              }}>
                {card.actionText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}