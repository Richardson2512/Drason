'use client';
import { useEffect, useRef } from 'react';

interface Finding {
    title: string;
    severity: string;
    description?: string;
    details?: string;
    message?: string;
}

interface HealthEnforcementModalProps {
    isOpen: boolean;
    onClose: () => void;
    criticalCount: number;
    findings: Finding[];
    overallScore?: number;
    onPauseCampaigns: () => void;
    onViewDetails: () => void;
}

export default function HealthEnforcementModal({
    isOpen,
    onClose,
    criticalCount,
    findings,
    overallScore,
    onPauseCampaigns,
    onViewDetails
}: HealthEnforcementModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
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
                padding: '1rem'
            }}
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                className="animate-fade-in"
            >
                {/* Header */}
                <div style={{
                    padding: '2rem',
                    borderBottom: '1px solid #F3F4F6',
                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0
                        }}>
                            ⚠️
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: '#991B1B',
                                marginBottom: '0.5rem',
                                letterSpacing: '-0.025em'
                            }}>
                                Critical Infrastructure Issues Detected
                            </h2>
                            <p style={{
                                color: '#7F1D1D',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                margin: 0
                            }}>
                                We found <strong>{criticalCount} critical {criticalCount === 1 ? 'issue' : 'issues'}</strong> that may harm your email deliverability and sender reputation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '2rem' }}>
                    {overallScore !== null && overallScore !== undefined && (
                        <div style={{
                            background: overallScore < 50 ? '#FEF2F2' : overallScore < 70 ? '#FFFBEB' : '#F0FDF4',
                            border: `2px solid ${overallScore < 50 ? '#FCA5A5' : overallScore < 70 ? '#FCD34D' : '#BBF7D0'}`,
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '800',
                                    color: overallScore < 50 ? '#991B1B' : overallScore < 70 ? '#B45309' : '#166534'
                                }}>
                                    {overallScore}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: overallScore < 50 ? '#7F1D1D' : overallScore < 70 ? '#92400E' : '#14532D',
                                    textTransform: 'uppercase',
                                    fontWeight: '700',
                                    letterSpacing: '0.05em'
                                }}>
                                    Health Score
                                </div>
                            </div>
                            <div style={{ flex: 1, fontSize: '0.875rem', lineHeight: '1.5' }}>
                                <strong style={{ color: '#111827' }}>
                                    {overallScore < 50 ? 'Poor Health' : overallScore < 70 ? 'Fair Health' : 'Good Health'}
                                </strong>
                                <p style={{
                                    margin: '0.25rem 0 0 0',
                                    color: '#6B7280'
                                }}>
                                    Your infrastructure health score is based on bounce rates, domain reputation, and mailbox configuration.
                                </p>
                            </div>
                        </div>
                    )}

                    <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#6B7280',
                        marginBottom: '1rem'
                    }}>
                        Top Issues
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                        {findings.map((finding, index) => (
                            <div
                                key={index}
                                style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FCA5A5',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    display: 'flex',
                                    gap: '0.75rem'
                                }}
                            >
                                <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>🔴</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: '700',
                                        color: '#991B1B',
                                        marginBottom: '0.25rem',
                                        fontSize: '0.9rem'
                                    }}>
                                        {finding.title}
                                    </div>
                                    <div style={{
                                        color: '#7F1D1D',
                                        fontSize: '0.85rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {finding.description || finding.details || finding.message}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        background: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>💡</div>
                            <div>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    color: '#92400E',
                                    marginBottom: '0.5rem'
                                }}>
                                    Recommended Action
                                </h4>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#78350F',
                                    lineHeight: '1.6',
                                    margin: 0
                                }}>
                                    We recommend <strong>pausing your campaigns immediately</strong> to prevent further damage to your sender reputation. Once paused, you can review the issues and take corrective action.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onPauseCampaigns}
                            className="premium-btn"
                            style={{
                                flex: 1,
                                background: '#EF4444',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '0.875rem 1.5rem',
                                fontWeight: '700'
                            }}
                        >
                            ⏸️ Pause Campaigns Now
                        </button>
                        <button
                            onClick={onViewDetails}
                            className="premium-btn"
                            style={{
                                flex: 1,
                                background: '#FFFFFF',
                                color: '#1E293B',
                                border: '1px solid #E2E8F0',
                                padding: '0.875rem 1.5rem',
                                fontWeight: '600'
                            }}
                        >
                            View Full Report
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#6B7280',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                        }}
                        className="hover:text-gray-900"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
