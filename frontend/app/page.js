'use client';

import { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch applications from backend API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle updating application status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedApplication = await response.json();
      setApplications(applications.map(app =>
        app.id === id ? updatedApplication : app
      ));
      return updatedApplication;
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'radial-gradient(1200px 600px at 50% -200px, #3b82f6 0%, transparent 60%), linear-gradient(180deg, #020617 0%, #020617 100%)',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#e5e7eb',
        padding: '48px',
        minHeight: '100vh'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
            Loading your job applications...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'radial-gradient(1200px 600px at 50% -200px, #3b82f6 0%, transparent 60%), linear-gradient(180deg, #020617 0%, #020617 100%)',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#e5e7eb',
        padding: '48px',
        minHeight: '100vh'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
            Connection Error
          </p>
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(14px)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '32px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <p style={{ color: '#f8fafc' }}>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#020617',
                color: '#e5e7eb',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.2)'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'radial-gradient(1200px 600px at 50% -200px, #3b82f6 0%, transparent 60%), linear-gradient(180deg, #020617 0%, #020617 100%)',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#e5e7eb',
      padding: '48px',
      minHeight: '100vh'
    }}>
      <Dashboard applications={applications} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
}