import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="screen">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 2rem' }}></div>
        <h2>Loading Rami...</h2>
        <p style={{ marginTop: '1rem', opacity: 0.8 }}>
          Connecting to game server
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
