/**
 * Shared TypeScript interfaces for API responses used across the frontend.
 *
 * These types mirror the shapes returned by the backend and consumed
 * by the dashboard pages.  Import from '@/types/api' to replace
 * `apiClient<any>(...)` calls with strongly-typed alternatives.
 */

// ────────────────────────────────────────────────────────────────────
// Generic wrappers
// ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ────────────────────────────────────────────────────────────────────
// Domain
// ────────────────────────────────────────────────────────────────────

export interface Domain {
  id: string;
  domain: string;
  status: string;
  source_platform?: string;
  paused_reason?: string;
  paused_by?: string;
  last_pause_at?: string;

  // Aggregate engagement stats
  total_sent_lifetime?: number;
  total_opens?: number;
  total_clicks?: number;
  total_replies?: number;

  // Bounce / health
  aggregated_bounce_rate_trend?: number;
  warning_count?: number;

  // Recovery pipeline
  recovery_phase?: string;
  resilience_score?: number;
  clean_sends_since_phase?: number;
  consecutive_pauses?: number;
  relapse_count?: number;

  // Nested relations
  mailboxes?: Mailbox[];
}

// ────────────────────────────────────────────────────────────────────
// Mailbox
// ────────────────────────────────────────────────────────────────────

export interface Mailbox {
  id: string;
  email: string;
  status: string;
  source_platform?: string;
  paused_reason?: string;
  paused_at?: string;
  paused_by?: string;

  // Connection health
  smtp_status?: boolean;
  imap_status?: boolean;
  connection_error?: string;

  // Send / bounce counters
  total_sent_count?: number;
  window_sent_count?: number;
  hard_bounce_count?: number;
  delivery_failure_count?: number;

  // Lifetime engagement
  open_count_lifetime?: number;
  click_count_lifetime?: number;
  reply_count_lifetime?: number;
  spam_count?: number;

  // Warmup
  warmup_status?: string;
  warmup_reputation?: string;

  // Recovery pipeline
  recovery_phase?: string;
  resilience_score?: number;
  clean_sends_since_phase?: number;
  consecutive_pauses?: number;
  relapse_count?: number;

  // Nested relations
  domain?: Pick<Domain, 'id' | 'domain' | 'status'>;
  campaigns?: Pick<Campaign, 'id' | 'name' | 'status'>[];
}

// ────────────────────────────────────────────────────────────────────
// Campaign
// ────────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  status: string;
  source_platform?: string;
  paused_reason?: string;
  paused_at?: string;
  paused_by?: string;

  // Engagement stats
  total_sent?: number;
  open_count?: number;
  open_rate?: number;
  click_count?: number;
  click_rate?: number;
  reply_count?: number;
  reply_rate?: number;
  total_bounced?: number;
  bounce_rate?: number;
  unsubscribed_count?: number;

  // Nested relations
  mailboxes?: Mailbox[];
}

// ────────────────────────────────────────────────────────────────────
// Lead
// ────────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  email: string;
  status: string;
  persona?: string;
  source?: string;
  source_platform?: string;
  lead_score: number;
  health_state?: string;
  assigned_campaign_id?: string;

  // Engagement counters
  emails_sent?: number;
  emails_opened?: number;
  emails_clicked?: number;
  emails_replied?: number;

  last_activity_at?: string;

  // Nested relations
  campaign?: Pick<Campaign, 'id' | 'name' | 'status'>;
}

// ────────────────────────────────────────────────────────────────────
// Notification
// ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: 'ERROR' | 'WARNING' | 'SUCCESS' | 'INFO';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ────────────────────────────────────────────────────────────────────
// Audit Log
// ────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  entity: string;
  entity_id: string;
  trigger: string;
  action: string;
  details: string;
  timestamp: string;
}

// ────────────────────────────────────────────────────────────────────
// Dashboard Stats (overview page)
// ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  active: number;
  held: number;
  paused: number;
}

// ────────────────────────────────────────────────────────────────────
// Organization
// ────────────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  system_mode?: string;
}

// ────────────────────────────────────────────────────────────────────
// User / Auth
// ────────────────────────────────────────────────────────────────────

export interface User {
  name: string;
  email: string;
  role: string;
}

export interface UserMeResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  error?: string;
}

// ────────────────────────────────────────────────────────────────────
// Settings
// ────────────────────────────────────────────────────────────────────

export interface SettingEntry {
  key: string;
  value: string;
}

export interface ClayWebhookResponse {
  webhookUrl: string;
  webhookSecret?: string;
}

// ────────────────────────────────────────────────────────────────────
// Billing / Subscription
// ────────────────────────────────────────────────────────────────────

export interface Subscription {
  tier: string;
  status: string;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  subscriptionStartedAt: string | null;
  nextBillingDate: string | null;
}

export interface UsageLimits {
  leads: number;
  domains: number;
  mailboxes: number;
}

export interface SubscriptionData {
  subscription: Subscription;
  usage: UsageLimits;
  limits: UsageLimits;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  url?: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

// ────────────────────────────────────────────────────────────────────
// Infrastructure Findings
// ────────────────────────────────────────────────────────────────────

export interface OrgFinding {
  category: string;
  severity: string;
  title: string;
  details: string;
  entity?: string;
  entityName?: string;
}

export interface FindingsResponse {
  findings: OrgFinding[];
}

// ────────────────────────────────────────────────────────────────────
// Routing Rules (Configuration page)
// ────────────────────────────────────────────────────────────────────

export interface RoutingRule {
  id: string;
  persona: string;
  min_score: number;
  target_campaign_id: string;
  priority: number;
  campaign?: Pick<Campaign, 'id' | 'name' | 'status' | 'source_platform'>;
}

// ────────────────────────────────────────────────────────────────────
// Load Balancing (report page)
// ────────────────────────────────────────────────────────────────────

export interface MailboxLoad {
  id: string;
  email: string;
  status: string;
  campaign_count: number;
  effective_load: number;
  load_category: 'overloaded' | 'optimal' | 'underutilized';
  health_score: number;
  total_sent: number;
  bounce_rate: number;
  engagement_rate: number;
}

export interface LoadBalancingSuggestion {
  type: 'move_mailbox' | 'add_mailbox' | 'remove_mailbox';
  mailbox_id: string;
  mailbox_email: string;
  from_campaign_id?: string;
  from_campaign_name?: string;
  to_campaign_id?: string;
  to_campaign_name?: string;
  reason: string;
  expected_impact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LoadBalancingReport {
  summary: {
    total_mailboxes: number;
    total_campaigns: number;
    overloaded_mailboxes: number;
    underutilized_mailboxes: number;
    optimal_mailboxes: number;
    avg_campaigns_per_mailbox: number;
  };
  mailbox_distribution: MailboxLoad[];
  suggestions: LoadBalancingSuggestion[];
  health_warnings: string[];
}

// ────────────────────────────────────────────────────────────────────
// Predictive Risks (report page)
// ────────────────────────────────────────────────────────────────────

export interface RiskSignal {
  type: 'mailbox_health' | 'domain_health' | 'bounce_rate' | 'mailbox_count' | 'cooldown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  score_impact: number;
}

export interface PredictiveRecommendation {
  action: 'add_mailboxes' | 'remove_unhealthy' | 'wait_cooldown' | 'investigate_bounces' | 'fix_domains' | 'no_action';
  label: string;
  campaign_id: string;
  mailbox_ids?: string[];
  domain_ids?: string[];
}

export interface CampaignRiskScore {
  campaign_id: string;
  campaign_name: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  stall_probability: number;
  time_to_stall_hours: number | null;
  signals: RiskSignal[];
  recommended_actions: string[];
  recommendations: PredictiveRecommendation[];
}

export interface PredictiveReport {
  timestamp: Date;
  campaigns_analyzed: number;
  at_risk_campaigns: number;
  high_risk_campaigns: number;
  critical_risk_campaigns: number;
  campaign_risks: CampaignRiskScore[];
}

// ────────────────────────────────────────────────────────────────────
// Health / Status endpoints
// ────────────────────────────────────────────────────────────────────

export interface AssessmentStatusResponse {
  status: string;
  inProgress?: boolean;
  [key: string]: unknown;
}

export interface UnreadCountResponse {
  count: number;
}

// ────────────────────────────────────────────────────────────────────
// Summary types (lightweight versions for list views)
// ────────────────────────────────────────────────────────────────────

export interface DomainSummary {
  id: string;
  domain: string;
  status: string;
  paused_reason?: string;
}

export interface MailboxSummary {
  id: string;
  email: string;
  status: string;
  paused_reason?: string;
}

export interface CampaignSummary {
  id: string;
  name: string;
  status: string;
  source_platform?: string;
}

export interface ChartEntry {
  name: string;
  count: number;
}

// ────────────────────────────────────────────────────────────────────
// Infrastructure Assessment
// ────────────────────────────────────────────────────────────────────

export interface InfraFinding {
  category: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  details: string;
  entity?: string;
  entityId?: string;
  entityName?: string;
  message?: string;
  remediation?: string;
}

export interface InfraRecommendation {
  priority: number;
  action: string;
  reason: string;
  details?: string;
  link?: string;
  entity?: string;
  entityId?: string;
}

export interface InfraSummaryData {
  domains: { total: number; healthy: number; warning: number; paused: number };
  mailboxes: { total: number; healthy: number; warning: number; paused: number };
  campaigns: { total: number; active: number; warning: number; paused: number };
}

export interface InfraReport {
  id: string;
  report_type: string;
  assessment_version: string;
  overall_score: number;
  summary: InfraSummaryData;
  findings: InfraFinding[];
  recommendations: InfraRecommendation[];
  created_at: string;
}

// ────────────────────────────────────────────────────────────────────
// Analytics
// ────────────────────────────────────────────────────────────────────

export interface DailyData {
  date: string;
  campaign_id: string | null;
  sent_count: number;
  open_count: number;
  click_count: number;
  reply_count: number;
  bounce_count: number;
  unsubscribe_count: number;
}

// ────────────────────────────────────────────────────────────────────
// Billing display
// ────────────────────────────────────────────────────────────────────

export interface TierInfo {
  name: string;
  price: string;
  limits: UsageLimits;
  color: string;
}


// ────────────────────────────────────────────────────────────────────
// Lead scoring
// ────────────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  lead_id: string;
  total_score: number;
  components: Record<string, number>;
  factors: Record<string, any>;
  breakdown?: Record<string, number>;
  [key: string]: any;
}

export interface ScoreRefreshResult {
  success?: boolean;
  processed?: number;
  updated?: number;
  message?: string;
  error?: string;
}

// ────────────────────────────────────────────────────────────────────
// Settings helpers
// ────────────────────────────────────────────────────────────────────

export interface SlackChannel {
  id: string;
  name: string;
}

export interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  campaigns_synced?: number;
  mailboxes_synced?: number;
  leads_synced?: number;
}
