import React from 'react';

interface ParticleBackgroundProps {
  particleCount?: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ particleCount = 30 }) => {
  return (
    <div 
      className="particle-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Animated background gradient */}
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />
      
      {/* Floating particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${20 + Math.random() * 20}s`
          }}
        />
      ))}
      
      <style>{`
        .particle-background {
          background: radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(6, 255, 165, 0.1) 0%, transparent 50%);
        }
        
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          animation: float 20s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%);
          top: 60%;
          right: 10%;
          animation-delay: -7s;
        }
        
        .orb-3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(6, 255, 165, 0.3) 0%, transparent 70%);
          bottom: 20%;
          left: 60%;
          animation-delay: -14s;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: float-particle linear infinite;
          box-shadow: 0 0 6px var(--accent-primary);
        }
        
        .particle:nth-child(even) {
          background: var(--accent-secondary);
          box-shadow: 0 0 6px var(--accent-secondary);
        }
        
        .particle:nth-child(3n) {
          background: var(--accent-tertiary);
          box-shadow: 0 0 6px var(--accent-tertiary);
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
        
        @keyframes float-particle {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ParticleBackground;
