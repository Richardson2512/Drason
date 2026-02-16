'use client';

interface Finding {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  entity: string;
  entityName: string;
}

interface AssessmentConfirmationModalProps {
  isOpen: boolean;
  findings: Finding[];
  onConfirm: () => void;
  onReview: () => void;
}

export default function AssessmentConfirmationModal({
  isOpen,
  findings,
  onConfirm,
  onReview
}: AssessmentConfirmationModalProps) {
  if (!isOpen) return null;

  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const warningFindings = findings.filter(f => f.severity === 'warning');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: '1px solid #F1F5F9'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            ⚠️ Infrastructure Assessment Complete
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#64748B',
            lineHeight: 1.6
          }}>
            We've detected infrastructure health issues that could damage your domain reputation.
          </div>
        </div>

        {/* Findings */}
        <div style={{ padding: '1.5rem 2rem' }}>
          {criticalFindings.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#DC2626',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}>
                🚨 Critical Issues ({criticalFindings.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {criticalFindings.map((finding, i) => (
                  <div key={i} style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ fontWeight: 600, color: '#991B1B', marginBottom: '0.25rem' }}>
                      {finding.title}
                    </div>
                    <div style={{ color: '#B91C1C', fontSize: '0.8rem' }}>
                      {finding.entity}: {finding.entityName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warningFindings.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#D97706',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}>
                ⚠️ Warnings ({warningFindings.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {warningFindings.slice(0, 3).map((finding, i) => (
                  <div key={i} style={{
                    background: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ fontWeight: 600, color: '#92400E', marginBottom: '0.25rem' }}>
                      {finding.title}
                    </div>
                    <div style={{ color: '#B45309', fontSize: '0.8rem' }}>
                      {finding.entity}: {finding.entityName}
                    </div>
                  </div>
                ))}
                {warningFindings.length > 3 && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#64748B',
                    textAlign: 'center',
                    padding: '0.5rem'
                  }}>
                    + {warningFindings.length - 3} more warnings
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div style={{
          background: '#F8FAFC',
          padding: '1.5rem 2rem',
          borderTop: '1px solid #E2E8F0'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#1E293B',
            marginBottom: '0.75rem'
          }}>
            🛡️ Recommended Action
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#475569',
            lineHeight: 1.6,
            marginBottom: '1rem'
          }}>
            To protect your domain reputation, we recommend immediately pausing affected campaigns
            in Smartlead until these issues are resolved. This prevents further reputation damage.
          </div>
          <ul style={{
            fontSize: '0.875rem',
            color: '#475569',
            lineHeight: 1.8,
            paddingLeft: '1.5rem',
            margin: 0
          }}>
            <li>Affected campaigns will be paused in Smartlead</li>
            <li>No new leads will be pushed to paused campaigns</li>
            <li>You can resume campaigns after fixing the issues</li>
            <li>All actions will be logged in your audit trail</li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onReview}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: '2px solid #E2E8F0',
              background: 'white',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.background = '#F8FAFC';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.background = 'white';
            }}
          >
            Let Me Review First
          </button>
          <button
            onClick={onConfirm}
            className="premium-btn"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            ✅ Pause Now (Recommended)
          </button>
        </div>
      </div>
    </div>
  );
}
