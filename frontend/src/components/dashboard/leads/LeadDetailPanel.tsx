import type { Lead, AuditLog, CampaignSummary, ScoreBreakdown } from '@/types/api';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { StatBadge } from '@/components/ui/StatBadge';
import { getStatusColors } from '@/lib/statusColors';
import { getPlatformLabel } from '@/components/ui/PlatformBadge';

interface LeadDetailPanelProps {
    lead: Lead | null;
    auditLogs: AuditLog[];
    leadCampaigns: CampaignSummary[];
    scoreBreakdown: ScoreBreakdown | null;
    scoreLoading: boolean;
    scoringInProgress: boolean;
    onRefreshScores: () => void;
}

function formatRelativeTime(dateString: string | null) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function getSystemNotice(lead: Lead) {
    if (lead.validation_status && lead.validation_status === 'invalid') {
        return { type: 'danger', title: 'Invalid Email', msg: lead.is_disposable ? 'This lead was blocked because the email address uses a disposable/temporary domain.' : 'This lead was blocked because email validation determined the address is invalid (no MX records or failed verification). It will not be routed to any campaign.' };
    }
    if (lead.status === 'blocked' || lead.status === 'failed') {
        return { type: 'danger', title: 'Blocked', msg: 'This lead has been blocked by the health gate or email validation. It will not be routed to any campaign.' };
    }
    if (lead.status === 'paused') {
        return { type: 'danger', title: 'System Pause', msg: 'Lead processing has been halted. This typically occurs when the associated mailbox or domain triggers a "Warning" or "Paused" health state due to bounce rates exceeding 2%.' };
    }
    if (lead.status === 'held') {
        return { type: 'warning', title: 'Holding Pool', msg: 'Lead is currently in the Holding Pool. It is waiting for the "Execution Gate" to verify mailbox capacity and domain health before transitioning to Active.' };
    }
    if (lead.status === 'active') {
        return { type: 'success', title: 'Active Execution', msg: `Lead has passed all health checks and routed to a campaign. It is currently available for outreach by the external sender (${getPlatformLabel(lead.source_platform)}).` };
    }
    return null;
}

function StatusBadge({ status }: { status: string }) {
    const colors = getStatusColors(status);

    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[0.8rem] font-bold uppercase tracking-wide shadow-sm" style={colors}>
            {status}
        </span>
    );
}

function getEventStyle(action: string) {
    if (action.includes('email_sent') || action === 'email_sent') {
        return { icon: '📧', bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF' };
    }
    if (action.includes('email_opened') || action.includes('opened')) {
        return { icon: '👁️', bg: '#F0F9FF', border: '#BAE6FD', color: '#0369A1' };
    }
    if (action.includes('email_clicked') || action.includes('clicked')) {
        return { icon: '🔗', bg: '#F0FDFA', border: '#99F6E4', color: '#0F766E' };
    }
    if (action.includes('email_replied') || action.includes('replied')) {
        return { icon: '💬', bg: '#F0FDF4', border: '#BBF7D0', color: '#166534' };
    }
    if (action.includes('bounced') || action.includes('pause') || action.includes('block')) {
        return { icon: '❌', bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B' };
    }
    if (action.includes('route') || action.includes('assign')) {
        return { icon: '🎯', bg: '#FAF5FF', border: '#E9D5FF', color: '#7C3AED' };
    }
    if (action.includes('created') || action.includes('ingest')) {
        return { icon: '✨', bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' };
    }
    return { icon: '📋', bg: '#F8FAFC', border: '#E2E8F0', color: '#475569' };
}

export default function LeadDetailPanel({
    lead,
    auditLogs,
    leadCampaigns,
    scoreBreakdown,
    scoreLoading,
    scoringInProgress,
    onRefreshScores,
}: LeadDetailPanelProps) {
    if (!lead) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                    <div className="text-[3rem]">👈</div>
                    <div className="text-xl font-medium">Select a lead to view full details</div>
                </div>
            </div>
        );
    }

    const notice = getSystemNotice(lead);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="pr-4 pb-2 shrink-0">
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-1">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight m-0">{lead.email}</h1>
                        <StatusBadge status={lead.status} />
                    </div>
                    <div className="text-gray-500 text-sm font-mono">ID: {lead.id}</div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="scrollbar-hide flex-1 overflow-y-auto pr-4 pb-8">
                <div className="animate-fade-in">
                    {/* SYSTEM STATUS EXPLANATION */}
                    {notice && (
                        <div className="premium-card mb-8" style={{
                            borderLeft: `6px solid ${notice.type === 'danger' ? '#EF4444' : (notice.type === 'warning' ? '#EAB308' : '#3B82F6')}`,
                            background: notice.type === 'danger' ? '#FEF2F2' : (notice.type === 'warning' ? '#FFFBEB' : '#EFF6FF'),
                        }}>
                            <h3 className="font-bold mb-2 text-[1.1rem]" style={{ color: notice.type === 'danger' ? '#B91C1C' : (notice.type === 'warning' ? '#B45309' : '#1E40AF') }}>
                                {notice.title}
                            </h3>
                            <p className="text-[0.95rem] leading-relaxed" style={{ color: notice.type === 'danger' ? '#7F1D1D' : (notice.type === 'warning' ? '#78350F' : '#1E3A8A') }}>
                                {notice.msg}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="premium-card">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Lead Profile</h3>
                            <div className="mb-4">
                                <div className="text-sm text-slate-500 mb-1">Persona</div>
                                <div className="text-lg font-semibold text-slate-800">{lead.persona}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500 mb-1">
                                    Engagement Score
                                    <span className="text-xs text-gray-400 ml-2">
                                        {lead.lead_score >= 80 ? 'Top Performer' :
                                            lead.lead_score >= 60 ? 'Engaged' :
                                                lead.lead_score >= 40 ? 'Moderate' : 'Low Activity'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold" style={{
                                    color: lead.lead_score >= 80 ? '#16A34A' :
                                        lead.lead_score >= 60 ? '#D97706' :
                                            lead.lead_score >= 40 ? '#F97316' : '#DC2626'
                                }}>
                                    {lead.lead_score} <span className="text-sm text-gray-400 font-normal">/ 100</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-2 italic">
                                    Based on opens, clicks, replies &amp; bounces
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500 mb-1">Source</div>
                                <div className="text-base font-medium text-slate-800">{lead.source}</div>
                            </div>
                        </div>

                        {/* Activity Stats Section */}
                        <div className="premium-card">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Email Activity</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Sent</div>
                                    <div className="text-2xl font-bold text-slate-800">{lead.emails_sent || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Opens</div>
                                    <div className="text-2xl font-bold text-emerald-500">{lead.emails_opened || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Clicks</div>
                                    <div className="text-2xl font-bold text-blue-500">{lead.emails_clicked || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Replies</div>
                                    <div className="text-2xl font-bold text-violet-500">{lead.emails_replied || 0}</div>
                                </div>
                            </div>
                            {lead.last_activity_at && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="text-xs text-slate-500">
                                        Last Activity: {new Date(lead.last_activity_at).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="premium-card">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Execution Context</h3>
                            <div className="mb-4">
                                <div className="text-sm text-slate-500 mb-1">Assigned Campaign</div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {lead.campaign?.name || 'Unassigned'}
                                </div>
                                {lead.campaign && (
                                    <div className="text-xs text-gray-400 font-mono mt-1">
                                        ID: {lead.campaign.id}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-sm text-slate-500 mb-1">Internal Health</div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm" style={{
                                    background: lead.health_state === 'healthy' ? '#DCFCE7' : '#FEE2E2',
                                    color: lead.health_state === 'healthy' ? '#166534' : '#991B1B',
                                }}>
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    {(lead.health_state || 'unknown').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lead Campaign History */}
                    {leadCampaigns.length > 0 && (
                        <div className="premium-card mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
                                Campaign History ({leadCampaigns.length})
                            </h3>
                            <div className="flex flex-col gap-2">
                                {leadCampaigns.map((c: CampaignSummary) => (
                                    <div key={c.id} className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-800">{c.name || c.id}</span>
                                        <span className="status-badge uppercase" style={{
                                            background: c.status === 'active' ? '#DCFCE7' : c.status === 'paused' ? '#FEE2E2' : '#F3F4F6',
                                            color: c.status === 'active' ? '#166534' : c.status === 'paused' ? '#991B1B' : '#6B7280',
                                        }}>
                                            {c.status || 'unknown'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Email Validation Card — only shown for validated leads */}
                    {lead.validation_status && (
                    <div className="premium-card mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">
                            Email Validation
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm" style={{
                                background: lead.validation_status === 'valid' ? '#DCFCE7' :
                                    lead.validation_status === 'risky' ? '#FEF3C7' :
                                    lead.validation_status === 'invalid' ? '#FEE2E2' :
                                    lead.validation_status === 'unknown' ? '#FFF7ED' : '#F3F4F6',
                                color: lead.validation_status === 'valid' ? '#166534' :
                                    lead.validation_status === 'risky' ? '#92400E' :
                                    lead.validation_status === 'invalid' ? '#991B1B' :
                                    lead.validation_status === 'unknown' ? '#C2410C' : '#6B7280',
                            }}>
                                {(lead.validation_status || 'pending').toUpperCase()}
                            </span>
                            {lead.validation_score !== undefined && lead.validation_score >= 0 && (
                                <span className="text-sm font-bold text-gray-700">
                                    {lead.validation_score}/100
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <span className="text-gray-500">Catch-All</span>
                                <span className={`font-semibold ${lead.is_catch_all ? 'text-amber-600' : 'text-green-600'}`}>
                                    {lead.is_catch_all ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <span className="text-gray-500">Disposable</span>
                                <span className={`font-semibold ${lead.is_disposable ? 'text-red-600' : 'text-green-600'}`}>
                                    {lead.is_disposable ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {lead.validation_source && (
                                <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500">Source</span>
                                    <span className="font-semibold text-gray-700 capitalize">{lead.validation_source}</span>
                                </div>
                            )}
                            {lead.validated_at && (
                                <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500">Validated</span>
                                    <span className="font-semibold text-gray-700">{formatRelativeTime(lead.validated_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                    {/* Score Breakdown Section */}
                    {((lead.emails_opened || 0) > 0 || (lead.emails_clicked || 0) > 0 || (lead.emails_replied || 0) > 0) && (
                        <div className="premium-card mb-8 border-2 border-slate-200" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    Score Breakdown
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={onRefreshScores}
                                        disabled={scoringInProgress}
                                        className={`px-3 py-1.5 text-white rounded-lg border-none text-[0.7rem] font-semibold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap ${scoringInProgress ? '' : 'hover:bg-blue-600'}`}
                                        style={{
                                            background: scoringInProgress ? '#E5E7EB' : '#3B82F6',
                                            cursor: scoringInProgress ? 'not-allowed' : 'pointer',
                                            opacity: scoringInProgress ? 0.7 : 1,
                                        }}
                                    >
                                        {scoringInProgress ? 'Scoring...' : 'Refresh'}
                                    </button>
                                    <div className="text-[2rem] font-extrabold" style={{
                                        color: lead.lead_score >= 80 ? '#16A34A' :
                                            lead.lead_score >= 60 ? '#D97706' :
                                                lead.lead_score >= 40 ? '#F97316' : '#DC2626'
                                    }}>
                                        {lead.lead_score || 0}
                                    </div>
                                </div>
                            </div>

                            {scoreLoading ? (
                                <div className="text-center p-8 text-gray-400">
                                    Loading breakdown...
                                </div>
                            ) : scoreBreakdown ? (
                                <>
                                    {/* Visual breakdown bars */}
                                    <div className="flex flex-col gap-4 mb-6">
                                        <ScoreBar
                                            label="Engagement"
                                            value={scoreBreakdown.breakdown?.engagement || 0}
                                            max={50}
                                            color="#3B82F6"
                                        />
                                        <ScoreBar
                                            label="Recency"
                                            value={scoreBreakdown.breakdown?.recency || 0}
                                            max={30}
                                            color="#8B5CF6"
                                        />
                                        <ScoreBar
                                            label="Frequency"
                                            value={scoreBreakdown.breakdown?.frequency || 0}
                                            max={20}
                                            color="#EC4899"
                                        />
                                    </div>

                                    {/* Engagement factors */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatBadge
                                            icon="👁️"
                                            label="Opens"
                                            value={scoreBreakdown.factors?.totalOpens || 0}
                                        />
                                        <StatBadge
                                            icon="🖱️"
                                            label="Clicks"
                                            value={scoreBreakdown.factors?.totalClicks || 0}
                                        />
                                        <StatBadge
                                            icon="💬"
                                            label="Replies"
                                            value={scoreBreakdown.factors?.totalReplies || 0}
                                        />
                                        <StatBadge
                                            icon="🕐"
                                            label="Last Active"
                                            value={formatRelativeTime(scoreBreakdown.factors?.lastEngagement)}
                                        />
                                    </div>

                                    <div className="mt-6 px-4 py-3 bg-white rounded-lg text-xs text-slate-500 italic border border-slate-200">
                                        Score is calculated from engagement data. Higher engagement and recent activity increase the score.
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-8 text-gray-400">
                                    No engagement data available yet. Score will update after first interaction.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="premium-card">
                        <h2 className="text-xl font-bold mb-6 text-gray-900">Activity Timeline</h2>
                        {auditLogs.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {auditLogs.map((log, index) => {
                                    const style = getEventStyle(log.action);
                                    const isFirst = index === 0;

                                    return (
                                        <div
                                            key={log.id}
                                            className="rounded-xl p-4 relative transition-all duration-200 hover:shadow-md"
                                            style={{
                                                background: style.bg,
                                                border: `1px solid ${style.border}`,
                                            }}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="text-2xl shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg" style={{
                                                    border: `2px solid ${style.border}`
                                                }}>
                                                    {style.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-bold text-[0.95rem] mb-1" style={{ color: style.color }}>
                                                                {log.action}
                                                            </div>
                                                            <div className="text-xs text-slate-500 font-medium">
                                                                {log.trigger}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                                            {new Date(log.timestamp).toLocaleString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                    {log.details && (
                                                        <div className="text-sm text-slate-600 px-3 py-2 bg-white rounded-md border border-slate-200 leading-normal">
                                                            {log.details}
                                                        </div>
                                                    )}
                                                    {isFirst && (
                                                        <div className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded mt-2">
                                                            <span>&#x25CF;</span> Latest Activity
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="text-[3rem] mb-4">📭</div>
                                <div className="text-base font-medium mb-2">No activity yet</div>
                                <div className="text-sm">Events will appear here once the lead is processed</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
