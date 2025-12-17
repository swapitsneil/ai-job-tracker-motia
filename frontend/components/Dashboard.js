'use client';

import { useState, useEffect } from 'react';

export default function Dashboard({
  applications,
  onUpdateStatus
}) {
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [error, setError] = useState(null);

  // Fetch insights from backend
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/applications/insights');
        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError(err.message);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchInsights();
  }, [applications]);

  // Get status count statistics
  const getStatusCounts = () => {
    const counts = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    applications.forEach(app => {
      if (counts.hasOwnProperty(app.status)) {
        counts[app.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalApplications = applications.length;

  // Get status accent color for left bar
  const getStatusAccentColor = (status) => {
    switch (status) {
      case 'Applied': return '#38bdf8';
      case 'Interview': return '#facc15';
      case 'Offer': return '#22c55e';
      case 'Rejected': return '#ef4444';
      case 'Withdrawn': return '#64748b';
      default: return '#64748b';
    }
  };

  // Helper function to map resume version to file URL
  function getResumeUrl(resumeVersion) {
    const versionMap = {
      '1.0': '/resumes/resume_v1.pdf',
      '2.0': '/resumes/resume_v2.pdf'
    };
    return versionMap[resumeVersion] || null;
  }

  // Global smooth transitions
  const globalTransition = 'color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease';

  // Helper function to clean insights text
  function formatInsights(text) {
    if (!text) return '';

    return text
      // remove markdown bold markers
      .replace(/\*\*/g, '')
      // remove long divider lines
      .replace(/={3,}/g, '')
      // normalize spacing
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '52px',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, #a78bfa, #38bdf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px'
        }}>
          AI Job Tracker
        </h1>
        <p style={{ fontSize: '16px', color: '#9ca3af', marginTop: '8px' }}>
          Intelligent job application analytics and tracking system
        </p>
      </div>

      {/* Application Status Section */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(14px)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '32px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#f8fafc'
        }}>
          Application Status Overview
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px'
        }}>
          {/* Total */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
            transition: globalTransition,
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.12), 0 10px 30px rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.background = 'rgba(2, 6, 23, 0.6)';
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#f8fafc',
              letterSpacing: '-0.02em'
            }}>
              {totalApplications}
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              Total
            </div>
          </div>

          {/* Applied */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
            transition: globalTransition,
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.12), 0 10px 30px rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.background = 'rgba(2, 6, 23, 0.6)';
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#f8fafc',
              letterSpacing: '-0.02em'
            }}>
              {statusCounts.Applied}
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              Applied
            </div>
          </div>

          {/* Interviews */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
            transition: globalTransition,
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.12), 0 10px 30px rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.background = 'rgba(2, 6, 23, 0.6)';
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#f8fafc',
              letterSpacing: '-0.02em'
            }}>
              {statusCounts.Interview}
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              Interviews
            </div>
          </div>

          {/* Offers */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
            transition: globalTransition,
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.12), 0 10px 30px rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.background = 'rgba(2, 6, 23, 0.6)';
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#f8fafc',
              letterSpacing: '-0.02em'
            }}>
              {statusCounts.Offer}
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              Offers
            </div>
          </div>

          {/* Rejected */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
            transition: globalTransition,
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.12), 0 10px 30px rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.background = 'rgba(2, 6, 23, 0.6)';
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#f8fafc',
              letterSpacing: '-0.02em'
            }}>
              {statusCounts.Rejected}
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              Rejected
            </div>
          </div>
        </div>
      </div>

      {/* Job Applications Section */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(14px)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '32px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#f8fafc'
        }}>
          Job Applications
        </h2>

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
            No applications found
          </div>
        ) : (
          <div>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  background: 'rgba(2, 6, 23, 0.6)',
                  borderRadius: '14px',
                  padding: '20px',
                  marginBottom: '16px',
                  border: '1px solid rgba(148, 163, 184, 0.08)',
                  position: 'relative',
                  transition: globalTransition
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.12), 0 10px 30px rgba(0,0,0,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Status accent bar */}
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '4px',
                  height: '100%',
                  borderRadius: '4px',
                  background: getStatusAccentColor(app.status)
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '12px' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>
                      {app.company}
                    </div>
                    <div style={{ fontSize: '15px', color: '#cbd5f5', marginTop: '4px' }}>
                      {app.role}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                      📅 {new Date(app.applied_at).toLocaleDateString()} | 🔗 {app.source} | 📄 Resume v{app.resume_version}
                      {getResumeUrl(app.resume_version) && (
                        <span style={{ marginLeft: '8px' }}>
                          <button
                            onClick={() => window.open(getResumeUrl(app.resume_version), '_blank')}
                            style={{
                              fontSize: '12px',
                              padding: '2px 8px',
                              background: 'transparent',
                              color: '#9ca3af',
                              border: '1px solid rgba(148, 163, 184, 0.3)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#e5e7eb';
                              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#9ca3af';
                              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                            }}
                          >
                            View Resume
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                      style={{
                        background: 'rgba(2, 6, 23, 0.8)',
                        color: '#e5e7eb',
                        borderRadius: '999px',
                        padding: '6px 12px',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        transition: globalTransition,
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#38bdf8';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.25)';
                        e.currentTarget.style.outline = 'none';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))',
        border: '1px solid rgba(168,85,247,0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '32px',
        lineHeight: '1.75',
        fontSize: '14px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#f8fafc'
        }}>
          AI-Powered Insights
        </h2>

        {loadingInsights ? (
          <div style={{ color: '#9ca3af' }}>Loading insights...</div>
        ) : error ? (
          <div style={{ color: '#ef4444' }}>Error: {error}</div>
        ) : insights ? (
          <pre className="insights-text">
            {formatInsights(insights.comprehensiveSummary)}
          </pre>
        ) : (
          <div style={{ color: '#9ca3af' }}>No insights available</div>
        )}
      </div>
    </div>
  );
}