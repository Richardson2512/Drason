/**
 * Drason Type Definitions
 * 
 * Central location for all enums, types, and interfaces used across the application.
 * These provide type safety and explicit state definitions as required by the
 * Infrastructure Architecture Audit.
 */

// ============================================================================
// SYSTEM MODES (Section 10 of Audit)
// ============================================================================

/**
 * System mode controls how Drason responds to detected risks.
 * - OBSERVE: No automated actions, only logging
 * - SUGGEST: Generate recommendations, no auto-actions
 * - ENFORCE: Automated pausing and escalation
 */
export enum SystemMode {
    OBSERVE = 'observe',
    SUGGEST = 'suggest',
    ENFORCE = 'enforce'
}

// ============================================================================
// EVENT TYPES (Section 5 of Audit)
// ============================================================================

/**
 * All event types that can be stored in the raw event store.
 * Events are immutable and append-only.
 */
export enum EventType {
    // Lead lifecycle
    LEAD_INGESTED = 'LeadIngested',
    LEAD_ROUTED = 'LeadRouted',
    LEAD_ACTIVATED = 'LeadActivated',
    LEAD_PAUSED = 'LeadPaused',
    LEAD_COMPLETED = 'LeadCompleted',

    // Email execution events
    EMAIL_SENT = 'EmailSent',
    HARD_BOUNCE = 'HardBounce',
    SOFT_BOUNCE = 'SoftBounce',
    DELIVERY_FAILURE = 'DeliveryFailure',

    // Pause events
    MAILBOX_PAUSED = 'MailboxPaused',
    MAILBOX_RESUMED = 'MailboxResumed',
    DOMAIN_PAUSED = 'DomainPaused',
    DOMAIN_RESUMED = 'DomainResumed',
    CAMPAIGN_PAUSED = 'CampaignPaused',
    CAMPAIGN_RESUMED = 'CampaignResumed',

    // Manual actions
    MANUAL_OVERRIDE = 'ManualOverride',

    // Sync events
    SMARTLEAD_SYNC = 'SmartleadSync'
}

// ============================================================================
// ENTITY STATES (Section 8 of Audit - State Machine Architecture)
// ============================================================================

/**
 * Mailbox states with explicit transition rules.
 * - HEALTHY: Normal operation
 * - WARNING: Elevated bounce rate, monitoring closely
 * - PAUSED: Execution stopped due to threshold breach
 * - RECOVERING: In cooldown period after pause, testing health
 */
export enum MailboxState {
    HEALTHY = 'healthy',
    WARNING = 'warning',
    PAUSED = 'paused',
    RECOVERING = 'recovering'
}

/**
 * Domain states aggregate mailbox health.
 */
export enum DomainState {
    HEALTHY = 'healthy',
    WARNING = 'warning',
    PAUSED = 'paused',
    RECOVERING = 'recovering'
}

/**
 * Lead states track lifecycle through the system.
 * - HELD: Awaiting execution gate clearance
 * - ACTIVE: Pushed to campaign, in execution
 * - PAUSED: Execution halted due to system health issues
 * - COMPLETED: Lead has finished execution (replied, converted, etc.)
 */
export enum LeadState {
    HELD = 'held',
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed'
}

/**
 * Campaign states from Smartlead.
 */
export enum CampaignState {
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed'
}

// ============================================================================
// USER ROLES (Section 14.4 of Audit - Access Control)
// ============================================================================

/**
 * Role-based access control levels.
 * - ADMIN: Full access, can modify settings and users
 * - OPERATOR: Can manage campaigns, leads, routing rules
 * - VIEWER: Read-only access to dashboards and logs
 */
export enum UserRole {
    ADMIN = 'admin',
    OPERATOR = 'operator',
    VIEWER = 'viewer'
}

// ============================================================================
// API KEY SCOPES (Section 14.1 of Audit)
// ============================================================================

/**
 * Granular permission scopes for API keys.
 */
export enum ApiScope {
    LEADS_READ = 'leads:read',
    LEADS_WRITE = 'leads:write',
    CAMPAIGNS_READ = 'campaigns:read',
    CAMPAIGNS_WRITE = 'campaigns:write',
    SETTINGS_READ = 'settings:read',
    SETTINGS_WRITE = 'settings:write',
    AUDIT_READ = 'audit:read',
    WEBHOOKS = 'webhooks'
}

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Entity types for audit logging and event tracking.
 */
export enum EntityType {
    LEAD = 'lead',
    MAILBOX = 'mailbox',
    DOMAIN = 'domain',
    CAMPAIGN = 'campaign',
    ROUTING_RULE = 'routing_rule',
    ORGANIZATION = 'organization',
    USER = 'user'
}

// ============================================================================
// TRIGGER TYPES
// ============================================================================

/**
 * What triggered an action or state change.
 */
export enum TriggerType {
    SYSTEM = 'system',
    MANUAL = 'manual',
    WEBHOOK = 'webhook',
    SCHEDULED = 'scheduled',
    THRESHOLD_BREACH = 'threshold_breach',
    COOLDOWN_COMPLETE = 'cooldown_complete'
}

/**
 * Failure classification for execution gate.
 * Different failure types get different responses.
 */
export enum FailureType {
    HEALTH_ISSUE = 'health_issue',     // Block - bounce threshold breached
    INFRA_ISSUE = 'infra_issue',       // Retry - API timeout, network error
    SYNC_ISSUE = 'sync_issue',         // Defer - missing campaign/mailbox sync
    SOFT_WARNING = 'soft_warning'      // Allow with log - velocity warning
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Execution gate result with detailed reasoning.
 */
export interface GateResult {
    allowed: boolean;
    reason: string;
    riskScore: number;
    recommendations: string[];
    mode: SystemMode;
    checks: {
        campaignActive: boolean;
        domainHealthy: boolean;
        mailboxAvailable: boolean;
        belowCapacity: boolean;
        riskAcceptable: boolean;
    };
    // Failure classification (new)
    failureType?: FailureType;         // Type of failure for response logic
    retryable?: boolean;               // Can this be retried?
    deferrable?: boolean;              // Can this be deferred?
}

/**
 * Risk score calculation components.
 */
export interface RiskComponents {
    // Hard signals (bounce-based) - CAN trigger pause
    bounceRatio: number;         // 0-100, from bounce/sent ratio
    failureRatio: number;        // 0-100, from delivery failures
    hardScore: number;           // Combined bounce + failure (0-100)

    // Soft signals (behavior-based) - LOG only, don't pause
    velocity: number;            // 0-100, send rate acceleration
    escalationFactor: number;    // 0-100, from consecutive pauses
    softScore: number;           // Combined velocity + escalation (0-100)

    // Combined for display
    totalScore: number;          // 0-100, weighted combination
}

/**
 * Rolling window metrics for monitoring.
 */
export interface WindowMetrics {
    sent: number;
    bounces: number;
    failures: number;
    startTime: Date;
}

/**
 * State transition record.
 */
export interface StateTransition {
    entityType: EntityType;
    entityId: string;
    fromState: string;
    toState: string;
    reason: string;
    triggeredBy: TriggerType;
    timestamp: Date;
}

/**
 * Organization context for request scoping.
 */
export interface OrgContext {
    organizationId: string;
    userId?: string;
    role?: UserRole;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const MONITORING_THRESHOLDS = {
    // =========================================================================
    // Mailbox-level thresholds (Tiered: Warning → Pause)
    // =========================================================================

    // WARNING threshold: Early warning before damage
    MAILBOX_WARNING_BOUNCES: 3,       // 3 bounces → WARNING
    MAILBOX_WARNING_WINDOW: 60,       // within 60 sends (5% rate)

    // PAUSE threshold: Hard stop
    MAILBOX_PAUSE_BOUNCES: 5,         // 5 bounces → PAUSE
    MAILBOX_PAUSE_WINDOW: 100,        // within 100 sends (5% rate)

    // =========================================================================
    // Domain-level thresholds (Ratio-based for scale)
    // =========================================================================
    DOMAIN_WARNING_RATIO: 0.3,        // 30% unhealthy → warning
    DOMAIN_PAUSE_RATIO: 0.5,          // 50% unhealthy → pause
    DOMAIN_MINIMUM_MAILBOXES: 3,      // Below this, use absolute (2 unhealthy = pause)

    // =========================================================================
    // Risk score thresholds (Separated: Hard vs Soft signals)
    // =========================================================================
    // Hard signals (bounce/failure-based) - these BLOCK execution
    HARD_RISK_WARNING: 40,            // Enter warning state
    HARD_RISK_CRITICAL: 60,           // Trigger pause (lower since it's pure bounce)

    // Soft signals (velocity/history-based) - these LOG only
    SOFT_RISK_WARNING: 50,            // Log warning
    SOFT_RISK_HIGH: 75,               // Log high alert, don't block

    // Combined (for UI display)
    RISK_SCORE_WARNING: 50,           // Enter warning state
    RISK_SCORE_CRITICAL: 75,          // Display critical

    // =========================================================================
    // Cooldown periods (milliseconds)
    // =========================================================================
    COOLDOWN_MINIMUM_MS: 3600000,     // 1 hour minimum cooldown
    COOLDOWN_MULTIPLIER: 2,           // Exponential backoff multiplier
    COOLDOWN_MAX_MS: 57600000,        // 16 hours maximum

    // =========================================================================
    // Rolling windows (milliseconds) - for event-based queries
    // =========================================================================
    WINDOW_1H_MS: 3600000,
    WINDOW_24H_MS: 86400000,
    WINDOW_7D_MS: 604800000,

    // Rolling window for bounce calculations (event count, not time)
    ROLLING_WINDOW_SIZE: 100          // Last 100 sends for bounce rate
} as const;

/**
 * Valid state transitions for state machine validation.
 */
export const STATE_TRANSITIONS = {
    mailbox: {
        healthy: ['warning', 'paused'],
        warning: ['healthy', 'paused'],
        paused: ['recovering'],
        recovering: ['healthy', 'warning']
    },
    domain: {
        healthy: ['warning', 'paused'],
        warning: ['healthy', 'paused'],
        paused: ['recovering'],
        recovering: ['healthy', 'warning']
    },
    lead: {
        held: ['active', 'paused'],
        active: ['paused', 'completed'],
        paused: ['active', 'completed'],
        completed: []  // Terminal state
    }
} as const;
