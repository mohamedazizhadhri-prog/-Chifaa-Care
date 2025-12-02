import React from 'react';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="screen">
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#ed4245', marginBottom: '1rem' }}>Oops! Something went wrong</h2>
        <div className="error">
          <p>{message}</p>
        </div>
        <button 
          onClick={handleRefresh}
          style={{ marginTop: '2rem' }}
        >
          Refresh & Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;
