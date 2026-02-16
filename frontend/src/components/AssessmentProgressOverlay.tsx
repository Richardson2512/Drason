'use client';

interface AssessmentProgressOverlayProps {
  isVisible: boolean;
  stage?: 'syncing' | 'assessing' | 'finalizing';
}

export default function AssessmentProgressOverlay({ isVisible, stage = 'syncing' }: AssessmentProgressOverlayProps) {
  if (!isVisible) return null;

  const stageInfo = {
    syncing: {
      title: 'Syncing with Smartlead',
      description: 'Fetching campaigns, mailboxes, domains, and leads...',
      icon: '🔄',
      progress: 33
    },
    assessing: {
      title: 'Assessing Infrastructure Health',
      description: 'Checking DNS records, blacklists, and historical metrics...',
      icon: '🔍',
      progress: 66
    },
    finalizing: {
      title: 'Finalizing Assessment',
      description: 'Generating findings and recommendations...',
      icon: '✨',
      progress: 90
    }
  };

  const current = stageInfo[stage];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9998,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '3rem',
        textAlign: 'center'
      }}>
        {/* Animated Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {current.icon}
        </div>

        {/* Title */}
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#111827',
          marginBottom: '0.75rem'
        }}>
          {current.title}
        </div>

        {/* Description */}
        <div style={{
          fontSize: '1rem',
          color: '#64748B',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          {current.description}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#F1F5F9',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: `${current.progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
            borderRadius: '999px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>

        {/* Progress Percentage */}
        <div style={{
          fontSize: '0.875rem',
          color: '#94A3B8',
          fontWeight: 600
        }}>
          {current.progress}% Complete
        </div>

        {/* Info Message */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: '12px',
          fontSize: '0.875rem',
          color: '#1E40AF',
          lineHeight: 1.6
        }}>
          <strong>🛡️ Protecting Your Infrastructure</strong>
          <br />
          This assessment ensures your domain reputation is safe before sending emails.
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
