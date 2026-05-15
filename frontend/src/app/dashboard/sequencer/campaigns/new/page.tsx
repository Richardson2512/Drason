'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, ChevronRight, Plus, Trash2, Copy, GripVertical, Clock,
    Check, Rocket, Loader2, Eye, X, Sparkles,
    Mail, Linkedin, UserCheck, MessageCircle, Send, UserPlus, Heart, ChevronDown,
    Search, AlertTriangle,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';
import CustomSelect from '@/components/ui/CustomSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import AIAssistPanel from '@/components/sequencer/AIAssistPanel';
import RecipientPreviewPanel from '@/components/sequencer/RecipientPreviewPanel';
import SuppressionPicker, { type SuppressionRule } from '@/components/sequencer/SuppressionPicker';
import toast from 'react-hot-toast';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';
import TagPicker from '@/components/sequencer/TagPicker';
import { type TagItem } from '@/components/sequencer/TagManagerModal';

// Dynamic import to avoid SSR issues with Tiptap
const RichTextEditor = dynamic(() => import('@/components/sequencer/RichTextEditor'), { ssr: false });

// crypto.randomUUID is only defined in secure contexts (HTTPS / localhost).
// Fall back to a v4-shaped Math.random id for plain-HTTP dev access.
function safeRandomUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// ============================================================================
// TYPES
// ============================================================================

/** Channel step type vocabulary - mirrors backend stepTypeRegistry. */
type WizardStepType =
    | 'email'
    | 'linkedin_view_profile'
    | 'linkedin_follow'
    | 'linkedin_like_post'
    | 'linkedin_connection_request'
    | 'linkedin_message'
    | 'linkedin_inmail'
    | 'find_linkedin_url';

interface SequenceStepData {
    id: string;
    stepNumber: number;
    /** Channel + executor selector. Drives the editor shape and the sender
     *  pool the dispatcher pulls from. */
    stepType: WizardStepType;
    delayDays: number;
    delayHours: number;
    subject: string;
    /** Inbox preview text - see backend SequenceStep.preheader. Empty
     *  string = let the recipient's client derive the snippet from body. */
    preheader: string;
    bodyHtml: string;
    /**
     * Branching: when set, the dispatcher only sends this step if the lead's
     * state matches the condition. If the condition is FALSE the dispatcher
     * jumps to `branchToStepNumber` (or ends the sequence when null).
     * Conditions: if_no_reply | if_replied | if_opened | if_not_opened |
     * if_clicked | if_not_clicked. null = unconditional.
     */
    condition?: string | null;
    branchToStepNumber?: number | null;
    /** Polymorphic per-step payload - note_template for CR, body_template
     *  for DM/InMail, reaction_type for like-post, etc. Backend validates
     *  against stepTypeRegistry.config_schema before persisting. */
    stepConfig?: Record<string, unknown>;
    variants: Array<{
        id: string;
        label: string;
        subject: string;
        preheader: string;
        bodyHtml: string;
        weight: number;
    }>;
}

const STEP_TYPE_META: Record<WizardStepType, {
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    accent: string;
    accentBg: string;
    description: string;
    channel: 'email' | 'linkedin' | 'utility';
}> = {
    email: {
        label: 'Email',
        shortLabel: 'Email',
        icon: <Mail size={11} />, accent: '#2563EB', accentBg: '#EFF6FF',
        description: 'Send an email from the campaign\'s mailbox pool.',
        channel: 'email',
    },
    linkedin_view_profile: {
        label: 'LinkedIn - View profile',
        shortLabel: 'View profile',
        icon: <Eye size={11} />, accent: '#F59E0B', accentBg: '#FFFBEB',
        description: 'Visit the lead\'s profile - they get a "viewed your profile" notification.',
        channel: 'linkedin',
    },
    linkedin_follow: {
        label: 'LinkedIn - Follow',
        shortLabel: 'Follow',
        icon: <UserPlus size={11} />, accent: '#06B6D4', accentBg: '#ECFEFF',
        description: 'Follow the lead. Must precede any connection request in the sequence.',
        channel: 'linkedin',
    },
    linkedin_like_post: {
        label: 'LinkedIn - Like a recent post',
        shortLabel: 'Like post',
        icon: <Heart size={11} />, accent: '#EC4899', accentBg: '#FDF2F8',
        description: 'React to a recent post (warm-up). Skips if no recent post found.',
        channel: 'linkedin',
    },
    linkedin_connection_request: {
        label: 'LinkedIn - Connection request',
        shortLabel: 'Connection',
        icon: <UserCheck size={11} />, accent: '#0A66C2', accentBg: '#EFF6FF',
        description: 'Send a connection request (optional note). Skipped if already 1st-degree.',
        channel: 'linkedin',
    },
    linkedin_message: {
        label: 'LinkedIn - DM',
        shortLabel: 'DM',
        icon: <MessageCircle size={11} />, accent: '#16A34A', accentBg: '#F0FDF4',
        description: 'Direct message - requires 1st-degree connection. Schedule after a CR step.',
        channel: 'linkedin',
    },
    linkedin_inmail: {
        label: 'LinkedIn - InMail',
        shortLabel: 'InMail',
        icon: <Send size={11} />, accent: '#8B5CF6', accentBg: '#F5F3FF',
        description: 'InMail - requires a paid tier (Premium, Sales Navigator, or Recruiter). Credits consumed on closed profiles only. Classic accounts can\'t send InMail.',
        channel: 'linkedin',
    },
    find_linkedin_url: {
        label: 'Find LinkedIn URL',
        shortLabel: 'Find LinkedIn',
        icon: <Search size={11} />, accent: '#0891B2', accentBg: '#ECFEFF',
        description: 'Run the workspace enrichment waterfall to discover the lead\'s LinkedIn URL. Skipped for contacts that already have one. Requires at least one enrichment provider connected.',
        channel: 'utility',
    },
};

const isLinkedInStepType = (t: WizardStepType) =>
    t !== 'email' && t !== 'find_linkedin_url';

interface CampaignLead {
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    company: string;
    website: string;
    [key: string]: string | undefined;
}

interface ColumnMapping {
    [platformField: string]: string; // platformField → csvHeader
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS = ['Basics', 'Leads', 'Sequence', 'Mailboxes', 'Schedule', 'Settings', 'Review'];

const MANDATORY_FIELDS = [
    { key: 'email', label: 'Email', required: true },
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: true },
    { key: 'full_name', label: 'Full Name', required: false },
    { key: 'company', label: 'Company Name', required: true },
    { key: 'website', label: 'Website', required: false },
];

// Auto-detect dictionary for common CSV header names
const FIELD_VARIANTS: Record<string, string[]> = {
    email: ['email', 'e-mail', 'email_address', 'emailaddress', 'work email', 'mail', 'email address'],
    first_name: ['first_name', 'firstname', 'first name', 'fname', 'given_name', 'given name', 'first'],
    last_name: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family_name', 'family name', 'last'],
    full_name: ['full_name', 'fullname', 'full name', 'name', 'contact_name', 'contact name'],
    company: ['company', 'company_name', 'companyname', 'company name', 'organization', 'org', 'employer', 'account', 'account_name'],
    website: ['website', 'url', 'web', 'domain', 'company_url', 'company_website', 'site', 'homepage'],
};

// Standard lead fields + one AI-generated token. signal_icebreaker is
// only populated when the lead was promoted by a LinkedIn engagement
// signal (the supervisor calls signalIcebreakerService after enrichment).
// For leads imported via CSV / manual add, the token resolves to empty
// at send time and the renderer falls back inline.
const PERSONALIZATION_TOKENS = ['first_name', 'last_name', 'full_name', 'company', 'website', 'email', 'signal_icebreaker'];

const TIMEZONES = [
    { value: 'Pacific/Midway', label: '(GMT-11:00) Midway Island, Samoa' },
    { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii' },
    { value: 'America/Anchorage', label: '(GMT-09:00) Alaska' },
    { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time - PST' },
    { value: 'America/Tijuana', label: '(GMT-08:00) Tijuana' },
    { value: 'America/Denver', label: '(GMT-07:00) Mountain Time - MST' },
    { value: 'America/Phoenix', label: '(GMT-07:00) Arizona (no DST)' },
    { value: 'America/Chicago', label: '(GMT-06:00) Central Time - CST' },
    { value: 'America/Mexico_City', label: '(GMT-06:00) Mexico City' },
    { value: 'America/Regina', label: '(GMT-06:00) Saskatchewan' },
    { value: 'America/New_York', label: '(GMT-05:00) Eastern Time - EST' },
    { value: 'America/Bogota', label: '(GMT-05:00) Bogota, Lima' },
    { value: 'America/Indiana/Indianapolis', label: '(GMT-05:00) Indiana (East)' },
    { value: 'America/Halifax', label: '(GMT-04:00) Atlantic Time - AST' },
    { value: 'America/Caracas', label: '(GMT-04:00) Caracas' },
    { value: 'America/Santiago', label: '(GMT-04:00) Santiago' },
    { value: 'America/St_Johns', label: '(GMT-03:30) Newfoundland' },
    { value: 'America/Sao_Paulo', label: '(GMT-03:00) Brasilia' },
    { value: 'America/Argentina/Buenos_Aires', label: '(GMT-03:00) Buenos Aires' },
    { value: 'Atlantic/South_Georgia', label: '(GMT-02:00) Mid-Atlantic' },
    { value: 'Atlantic/Azores', label: '(GMT-01:00) Azores' },
    { value: 'Atlantic/Cape_Verde', label: '(GMT-01:00) Cape Verde' },
    { value: 'UTC', label: '(GMT+00:00) UTC - Coordinated Universal Time' },
    { value: 'Europe/London', label: '(GMT+00:00) London, Dublin - GMT' },
    { value: 'Africa/Casablanca', label: '(GMT+00:00) Casablanca' },
    { value: 'Europe/Paris', label: '(GMT+01:00) Paris, Brussels - CET' },
    { value: 'Europe/Berlin', label: '(GMT+01:00) Berlin, Amsterdam' },
    { value: 'Europe/Madrid', label: '(GMT+01:00) Madrid' },
    { value: 'Africa/Lagos', label: '(GMT+01:00) West Central Africa' },
    { value: 'Europe/Helsinki', label: '(GMT+02:00) Helsinki, Kyiv - EET' },
    { value: 'Europe/Athens', label: '(GMT+02:00) Athens, Bucharest' },
    { value: 'Africa/Cairo', label: '(GMT+02:00) Cairo' },
    { value: 'Africa/Johannesburg', label: '(GMT+02:00) Johannesburg - SAST' },
    { value: 'Asia/Jerusalem', label: '(GMT+02:00) Jerusalem - IST' },
    { value: 'Europe/Istanbul', label: '(GMT+03:00) Istanbul' },
    { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow - MSK' },
    { value: 'Asia/Kuwait', label: '(GMT+03:00) Kuwait, Riyadh' },
    { value: 'Africa/Nairobi', label: '(GMT+03:00) Nairobi - EAT' },
    { value: 'Asia/Tehran', label: '(GMT+03:30) Tehran' },
    { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai, Abu Dhabi - GST' },
    { value: 'Asia/Baku', label: '(GMT+04:00) Baku' },
    { value: 'Asia/Tbilisi', label: '(GMT+04:00) Tbilisi' },
    { value: 'Asia/Kabul', label: '(GMT+04:30) Kabul' },
    { value: 'Asia/Karachi', label: '(GMT+05:00) Karachi - PKT' },
    { value: 'Asia/Tashkent', label: '(GMT+05:00) Tashkent' },
    { value: 'Asia/Kolkata', label: '(GMT+05:30) Mumbai, Delhi, Kolkata - IST' },
    { value: 'Asia/Colombo', label: '(GMT+05:30) Sri Lanka' },
    { value: 'Asia/Kathmandu', label: '(GMT+05:45) Kathmandu' },
    { value: 'Asia/Almaty', label: '(GMT+06:00) Almaty' },
    { value: 'Asia/Dhaka', label: '(GMT+06:00) Dhaka - BST' },
    { value: 'Asia/Yangon', label: '(GMT+06:30) Yangon' },
    { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok, Hanoi - ICT' },
    { value: 'Asia/Jakarta', label: '(GMT+07:00) Jakarta - WIB' },
    { value: 'Asia/Shanghai', label: '(GMT+08:00) Beijing, Shanghai - CST' },
    { value: 'Asia/Hong_Kong', label: '(GMT+08:00) Hong Kong - HKT' },
    { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore - SGT' },
    { value: 'Asia/Taipei', label: '(GMT+08:00) Taipei' },
    { value: 'Australia/Perth', label: '(GMT+08:00) Perth - AWST' },
    { value: 'Asia/Seoul', label: '(GMT+09:00) Seoul - KST' },
    { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo - JST' },
    { value: 'Australia/Adelaide', label: '(GMT+09:30) Adelaide - ACST' },
    { value: 'Australia/Darwin', label: '(GMT+09:30) Darwin' },
    { value: 'Australia/Sydney', label: '(GMT+10:00) Sydney, Melbourne - AEST' },
    { value: 'Australia/Brisbane', label: '(GMT+10:00) Brisbane' },
    { value: 'Pacific/Guam', label: '(GMT+10:00) Guam' },
    { value: 'Asia/Vladivostok', label: '(GMT+10:00) Vladivostok' },
    { value: 'Pacific/Noumea', label: '(GMT+11:00) New Caledonia' },
    { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland, Wellington - NZST' },
    { value: 'Pacific/Fiji', label: '(GMT+12:00) Fiji' },
    { value: 'Pacific/Tongatapu', label: '(GMT+13:00) Tonga' },
];

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function NewCampaignPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Edit mode - populated from ?id=<campaignId> in the URL
    const [editId, setEditId] = useState<string | null>(null);
    const [prefillLoading, setPrefillLoading] = useState(false);
    const [existingLeadCount, setExistingLeadCount] = useState(0);
    const [editStatus, setEditStatus] = useState<string>('');
    const isEditMode = !!editId;
    const isAlreadyLaunched = editStatus === 'active' || editStatus === 'paused';

    // Existing leads (edit mode) - paginated list + remove-by-id tracking
    interface ExistingLead {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        company: string | null;
        title: string | null;
        status: string;
        current_step: number;
        validation_status: string | null;
        validation_score: number | null;
    }
    const [existingLeads, setExistingLeads] = useState<ExistingLead[]>([]);
    const [existingLeadsMeta, setExistingLeadsMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
    const [existingLeadsLoading, setExistingLeadsLoading] = useState(false);
    const [existingLeadsSearch, setExistingLeadsSearch] = useState('');
    const [removeLeadIds, setRemoveLeadIds] = useState<Set<string>>(new Set());
    const existingSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchExistingLeads = useCallback(async (campaignId: string, page = 1, search = '') => {
        setExistingLeadsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '50', search });
            const res = await apiClient<any>(`/api/sequencer/campaigns/${campaignId}/leads?${params}`);
            const list: ExistingLead[] = Array.isArray(res) ? res : (res?.leads || res?.data || []);
            setExistingLeads(list);
            setExistingLeadsMeta(res?.meta || { total: list.length, page: 1, limit: 50, totalPages: 1 });
        } catch {
            setExistingLeads([]);
        } finally {
            setExistingLeadsLoading(false);
        }
    }, []);

    // Fetch existing leads when entering edit mode
    useEffect(() => {
        if (!editId) return;
        fetchExistingLeads(editId, 1, '');
    }, [editId, fetchExistingLeads]);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) setEditId(id);
    }, []);

    // Step 1: Basics
    const [campaignName, setCampaignName] = useState('');
    const [signatures, setSignatures] = useState<Array<{ id: string; name: string; html_content: string; is_default: boolean }>>([]);

    // Mailboxes step
    interface MailboxOption {
        id: string;
        email: string;
        display_name: string | null;
        provider: 'google' | 'microsoft' | 'smtp';
        daily_send_limit: number;
        sends_today: number;
        connection_status: string;
        mailbox_status: string;          // healthy | warning | paused
        recovery_phase: string;          // healthy | paused | quarantine | restricted_send | warm_recovery
        selectable: boolean;
        disabled_reason: string | null;
        utilization: 'underutilized' | 'balanced' | 'overutilized';
        utilization_pct: number;
    }
    const [availableMailboxes, setAvailableMailboxes] = useState<MailboxOption[]>([]);
    const [selectedMailboxIds, setSelectedMailboxIds] = useState<Set<string>>(new Set());
    const [mailboxesLoading, setMailboxesLoading] = useState(false);

    // ── LinkedIn senders (mixed-channel) ──────────────────────────────────
    // Only meaningful when the sequence contains a linkedin_* step. Loaded
    // unconditionally on mount so we have the list ready if the operator
    // adds a LinkedIn step later in the flow.
    interface LinkedInSenderOption {
        id: string;
        display_name: string;
        account_type: string;
        status: string;
    }
    const [availableLinkedInAccounts, setAvailableLinkedInAccounts] = useState<LinkedInSenderOption[]>([]);
    const [selectedLinkedInSenderIds, setSelectedLinkedInSenderIds] = useState<Set<string>>(new Set());
    const [linkedInAccountsLoading, setLinkedInAccountsLoading] = useState(false);
    // Mailbox filters - health/provider/utilization. Empty Set on any axis
    // means "no constraint." Filters apply visually to the list and to
    // the "Select all" action so the operator can scope bulk picks too.
    const [filterHealth, setFilterHealth] = useState<Set<string>>(new Set());
    const [filterProvider, setFilterProvider] = useState<Set<string>>(new Set());
    const [filterUtilization, setFilterUtilization] = useState<Set<string>>(new Set());
    const [mailboxSearch, setMailboxSearch] = useState('');
    const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string; name: string; subject: string; preheader?: string; body_html: string; category: string }>>([]);
    const [templatePickerOpen, setTemplatePickerOpen] = useState<number | null>(null); // step index
    const templatePickerRef = useRef<HTMLDivElement>(null);

    // Fetch signatures + templates + settings + mailboxes on mount
    useEffect(() => {
        apiClient<any>('/api/sequencer/signatures')
            .then(res => setSignatures(Array.isArray(res) ? res : (res?.signatures || res?.data || [])))
            .catch(() => setSignatures([]));

        apiClient<any>('/api/sequencer/templates')
            .then(res => setSavedTemplates(Array.isArray(res) ? res : (res?.templates || res?.data || [])))
            .catch(() => setSavedTemplates([]));

        // Org-level tags - drives the TagPicker dropdown on Step 1.
        fetchOrgTags();

        // Enrichment providers - used to warn the operator when adding a
        // find_linkedin_url step with zero providers configured.
        apiClient<{ count: number; providers: Array<{ id: string; code: string; order_index: number }> }>('/api/sequencer/enrichment-providers/status')
            .then(res => setEnrichmentProviders(res?.providers || []))
            .catch(() => setEnrichmentProviders([]));

        // Fetch connected mailboxes with Protection status + utilization
        setMailboxesLoading(true);
        apiClient<any>('/api/sequencer/accounts')
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.accounts || res?.data || []);
                setAvailableMailboxes(list);
            })
            .catch(() => setAvailableMailboxes([]))
            .finally(() => setMailboxesLoading(false));

        // LinkedIn accounts - surfaced if the operator adds a linkedin_* step.
        setLinkedInAccountsLoading(true);
        apiClient<any>('/api/linkedin/accounts')
            .then(res => {
                const list = Array.isArray(res?.accounts) ? res.accounts : (Array.isArray(res) ? res : (res?.data || []));
                setAvailableLinkedInAccounts(list.map((a: any) => ({
                    id: a.id,
                    display_name: a.display_name || a.name || '(unnamed account)',
                    account_type: a.account_type || 'standard',
                    status: a.status || 'OK',
                })));
            })
            .catch(() => setAvailableLinkedInAccounts([]))
            .finally(() => setLinkedInAccountsLoading(false));

        // Pre-fill Schedule + Settings from the org's Sequencer defaults
        apiClient<any>('/api/sequencer/settings')
            .then(res => {
                const s = res?.settings || res?.data || res;
                if (!s) return;
                if (s.default_timezone) setTimezone(s.default_timezone);
                if (s.default_start_time) setStartTime(s.default_start_time);
                if (s.default_end_time) setEndTime(s.default_end_time);
                if (Array.isArray(s.default_active_days) && s.default_active_days.length) setActiveDays(s.default_active_days);
                if (typeof s.default_daily_limit === 'number') setDailyLimit(s.default_daily_limit);
                // delay_between_emails is now stored in minutes - mirror it into the
                // per-campaign send_gap_minutes default so the Schedule step reflects
                // the org's chosen pace.
                if (typeof s.delay_between_emails === 'number' && s.delay_between_emails > 0) {
                    setSendGapMinutes(s.delay_between_emails);
                }
                if (typeof s.default_track_opens === 'boolean') setTrackOpens(s.default_track_opens);
                if (typeof s.default_track_clicks === 'boolean') setTrackClicks(s.default_track_clicks);
                if (typeof s.default_unsubscribe === 'boolean' || typeof s.default_include_unsubscribe === 'boolean') {
                    setIncludeUnsubscribe(s.default_unsubscribe ?? s.default_include_unsubscribe);
                }
                if (typeof s.stop_on_reply_default === 'boolean') setStopOnReply(s.stop_on_reply_default);
            })
            .catch(() => { /* keep hardcoded fallbacks */ });
    }, []);

    // Close template picker on outside click
    useEffect(() => {
        if (templatePickerOpen === null) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (templatePickerRef.current && !templatePickerRef.current.contains(e.target as Node)) {
                setTemplatePickerOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [templatePickerOpen]);
    const [campaignTags, setCampaignTags] = useState(''); // legacy Smartlead-import string array - preserved on edit-mode roundtrip
    // Org-level tag relation (TagLinks). selectedTagIds drives the picker; allTags is fetched once on mount.
    const [allTags, setAllTags] = useState<TagItem[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    // Enrichment provider waterfall - drives the find_linkedin_url
    // warnings. Loaded once on mount; refreshed only if the operator
    // opens this wizard again after configuring a provider in another tab.
    const [enrichmentProviders, setEnrichmentProviders] = useState<Array<{ id: string; code: string; order_index: number }>>([]);

    const fetchOrgTags = async () => {
        try {
            const res = await apiClient<{ tags: TagItem[] }>('/api/sequencer/tags');
            setAllTags(res?.tags || []);
        } catch { /* non-fatal */ }
    };

    // Step 2: Leads
    const [leads, setLeads] = useState<CampaignLead[]>([]);
    const [leadsFileName, setLeadsFileName] = useState('');
    const [customFields, setCustomFields] = useState<Array<{ key: string; label: string }>>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvRawRows, setCsvRawRows] = useState<Record<string, string>[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
    const [mappingConfirmed, setMappingConfirmed] = useState(false);
    const [newCustomFieldName, setNewCustomFieldName] = useState('');
    const [leadSourceTab, setLeadSourceTab] = useState<'csv' | 'database' | 'manual'>('csv');

    // Cross-campaign deduplication toggle - when on, leads whose email already appears
    // in any OTHER campaign in the org are dropped server-side before insert.
    const [skipDuplicatesAcrossCampaigns, setSkipDuplicatesAcrossCampaigns] = useState(false);
    // Unified suppression rules - see SuppressionPicker. The wizard ALSO
    // keeps `skipDuplicatesAcrossCampaigns` as legacy state so old code
    // paths and saved drafts still work; on submit it folds into the
    // rules array if no all_campaigns rule is already present.
    const [suppressionRules, setSuppressionRules] = useState<SuppressionRule[]>([]);

    // Lead Database import state
    const [dbSearchQuery, setDbSearchQuery] = useState('');
    const [dbStatusFilter, setDbStatusFilter] = useState('');
    const [dbValidationFilter, setDbValidationFilter] = useState('');
    const [dbLeads, setDbLeads] = useState<Array<{
        id: string;
        email: string;
        first_name?: string | null;
        last_name?: string | null;
        full_name?: string | null;
        company?: string | null;
        website?: string | null;
        title?: string | null;
        persona: string;
        source: string;
        lead_score: number;
        validation_status: string | null;
    }>>([]);
    const [dbSelectedIds, setDbSelectedIds] = useState<Set<string>>(new Set());
    const [dbLoading, setDbLoading] = useState(false);
    const [dbSearched, setDbSearched] = useState(false);

    // Manual add state
    const [manualEmail, setManualEmail] = useState('');
    const [manualFirstName, setManualFirstName] = useState('');
    const [manualLastName, setManualLastName] = useState('');
    const [manualCompany, setManualCompany] = useState('');
    const [manualWebsite, setManualWebsite] = useState('');
    const [manualCustomValues, setManualCustomValues] = useState<Record<string, string>>({});
    const [newManualFieldName, setNewManualFieldName] = useState('');
    const [manualCustomFieldDefs, setManualCustomFieldDefs] = useState<Array<{ key: string; label: string }>>([]);

    // Verify-emails state (Leads step). Keyed by lowercased email → {status, score, rejection_reason}.
    // Users click "Verify Emails" to pre-check validity without running it at campaign-create time.
    interface LeadValidationResult {
        status: 'valid' | 'risky' | 'invalid' | 'unknown' | 'error';
        score: number;
        rejection_reason: string | null;
    }
    const [leadValidationResults, setLeadValidationResults] = useState<Record<string, LeadValidationResult>>({});
    const [verifyingEmails, setVerifyingEmails] = useState(false);

    // Step 3: Sequence
    const [sequenceSteps, setSequenceSteps] = useState<SequenceStepData[]>([
        { id: safeRandomUUID(), stepNumber: 1, stepType: 'email', delayDays: 0, delayHours: 0, subject: '', preheader: '', bodyHtml: '', stepConfig: {}, variants: [] },
    ]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [previewStepIndex, setPreviewStepIndex] = useState<number | null>(null);
    const [previewVariantTab, setPreviewVariantTab] = useState(0);
    // Collapse the dashboard sidebar while the preview modal is open so the
    // device replicas have full canvas; restore on close.
    useEffect(() => {
        if (previewStepIndex === null) return;
        window.dispatchEvent(new Event('recipient-preview-open'));
        return () => {
            window.dispatchEvent(new Event('recipient-preview-close'));
        };
    }, [previewStepIndex]);
    const DEMO_LEAD: Record<string, string> = {
        first_name: 'Alex',
        last_name: 'Morgan',
        full_name: 'Alex Morgan',
        company: 'Acme Corp',
        website: 'acme.com',
        email: 'alex@acme.com',
    };
    const [previewLead, setPreviewLead] = useState<Record<string, string>>(DEMO_LEAD);

    // Health bucket derivation - same rules the mailbox card pill uses,
    // surfaced as a single string so the filter chips can map cleanly:
    //   'paused'      - explicit operator pause OR recovery_phase=paused
    //   'in_recovery' - quarantine / restricted_send / warm_recovery
    //   'warning'     - mailbox_status=warning (non-blocking issues)
    //   'healthy'     - everything else
    const mailboxHealth = (m: MailboxOption): 'paused' | 'in_recovery' | 'warning' | 'healthy' => {
        if (m.recovery_phase === 'paused' || m.mailbox_status === 'paused') return 'paused';
        if (m.recovery_phase === 'quarantine' || m.recovery_phase === 'restricted_send' || m.recovery_phase === 'warm_recovery') return 'in_recovery';
        if (m.mailbox_status === 'warning') return 'warning';
        return 'healthy';
    };

    const matchesFilters = (m: MailboxOption): boolean => {
        if (filterHealth.size > 0 && !filterHealth.has(mailboxHealth(m))) return false;
        if (filterProvider.size > 0 && !filterProvider.has(m.provider)) return false;
        if (filterUtilization.size > 0 && !filterUtilization.has(m.utilization)) return false;
        if (mailboxSearch.trim()) {
            const q = mailboxSearch.trim().toLowerCase();
            const hit =
                m.email.toLowerCase().includes(q) ||
                (m.display_name || '').toLowerCase().includes(q);
            if (!hit) return false;
        }
        return true;
    };

    const filteredMailboxes = availableMailboxes.filter(matchesFilters);
    const anyFilterActive =
        filterHealth.size > 0 ||
        filterProvider.size > 0 ||
        filterUtilization.size > 0 ||
        mailboxSearch.trim().length > 0;

    // Recipient preview - sender info derived from the first selected (or
    // first available) mailbox. Falls back to placeholder if no mailboxes
    // are connected yet, since the user may open Sequence (step 2) before
    // Mailboxes (step 4).
    const previewSender = (() => {
        const firstSelected = availableMailboxes.find(m => selectedMailboxIds.has(m.id));
        const fallback = availableMailboxes[0];
        const mb = firstSelected || fallback;
        return {
            name: mb?.display_name || (mb?.email ? mb.email.split('@')[0] : 'Your name'),
            email: mb?.email || 'you@yourdomain.com',
        };
    })();

    // Review-step live preview state (inline, not modal)
    const [reviewStepIdx, setReviewStepIdx] = useState(0);
    const [reviewVariantIdx, setReviewVariantIdx] = useState(0); // 0 = main/A, 1+ = variants[i-1]
    const [reviewLeadKey, setReviewLeadKey] = useState<string>('__demo__'); // email of selected lead, or '__demo__'

    // Step 4: Schedule
    const [timezone, setTimezone] = useState('America/New_York');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [activeDays, setActiveDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri']);
    const [dailyLimit, setDailyLimit] = useState(50);
    const [sendGapMinutes, setSendGapMinutes] = useState(17);
    const [startDate, setStartDate] = useState('');

    // Step 5: Settings
    const [espRouting, setEspRouting] = useState(true);
    const [stopOnReply, setStopOnReply] = useState(true);
    const [stopOnBounce, setStopOnBounce] = useState(true);
    const [trackOpens, setTrackOpens] = useState(true);
    const [trackClicks, setTrackClicks] = useState(true);
    // Default ON - required for CAN-SPAM § 5(a)(4)(A) one-click unsubscribe and
    // Gmail's bulk-sender requirements (Feb 2024). Customer can toggle off if
    // they're sending purely transactional/internal mail; we surface a clear
    // warning when they do.
    const [includeUnsubscribe, setIncludeUnsubscribe] = useState(true);
    // EU compliance mode - when on, suppresses open-tracking pixel and adds
    // an explicit "no engagement tracking" line to the footer for ePrivacy
    // alignment. Default off; opt-in per campaign for EU-targeted sends.
    const [euComplianceMode, setEuComplianceMode] = useState(false);
    const [trackingDomain, setTrackingDomain] = useState('');

    // ========== EDIT MODE PREFILL ==========

    useEffect(() => {
        if (!editId) return;
        let cancelled = false;
        setPrefillLoading(true);
        apiClient<any>(`/api/sequencer/campaigns/${editId}`)
            .then((c: any) => {
                if (cancelled || !c) return;
                setCampaignName(c.name || '');
                // Legacy Smartlead-import string array - preserved here so a
                // re-save doesn't drop pre-existing legacy tags. The wizard
                // no longer exposes UI to edit them; new tagging happens via
                // the org-level TagPicker below.
                setCampaignTags(Array.isArray(c.legacy_tags) ? c.legacy_tags.join(', ') : '');
                // Hydrate org-level tag pills (c.tags = [{id, name, color}, ...]).
                if (Array.isArray(c.tags)) {
                    setSelectedTagIds(c.tags.map((t: any) => t.id).filter(Boolean));
                }
                setEditStatus(c.status || '');

                // Sequence steps with variants
                if (Array.isArray(c.steps) && c.steps.length > 0) {
                    setSequenceSteps(c.steps.map((s: any) => ({
                        id: s.id || safeRandomUUID(),
                        stepNumber: s.step_number,
                        stepType: (s.step_type || 'email') as WizardStepType,
                        delayDays: s.delay_days ?? 0,
                        delayHours: s.delay_hours ?? 0,
                        subject: s.subject || '',
                        preheader: s.preheader || '',
                        bodyHtml: s.body_html || '',
                        stepConfig: (s.step_config && typeof s.step_config === 'object') ? s.step_config : {},
                        condition: s.condition ?? null,
                        branchToStepNumber: s.branch_to_step_number ?? null,
                        variants: Array.isArray(s.variants) ? s.variants.map((v: any) => ({
                            id: v.id || safeRandomUUID(),
                            label: v.variant_label || v.label || 'B',
                            subject: v.subject || '',
                            preheader: v.preheader || '',
                            bodyHtml: v.body_html || '',
                            weight: v.weight ?? 50,
                        })) : [],
                    })));
                }

                // Mailboxes - accounts array is [{ account: {...} }, ...]
                if (Array.isArray(c.accounts)) {
                    setSelectedMailboxIds(new Set(c.accounts.map((a: any) => a.account?.id).filter(Boolean)));
                }

                // LinkedIn senders - for mixed-channel campaigns.
                if (Array.isArray(c.linkedin_senders)) {
                    setSelectedLinkedInSenderIds(new Set(c.linkedin_senders.map((s: any) => s.linkedin_account_id).filter(Boolean)));
                }

                // Suppression rules - separate endpoint so the campaign detail
                // payload doesn't bloat for campaigns with many rules.
                // apiClient unwraps {success, data} → returns the array directly.
                apiClient<SuppressionRule[]>(`/api/sequencer/campaigns/${editId}/suppression`)
                    .then((sup) => {
                        if (!cancelled && Array.isArray(sup)) setSuppressionRules(sup);
                    })
                    .catch(() => { /* non-fatal */ });

                // Schedule
                if (c.schedule_timezone) setTimezone(c.schedule_timezone);
                if (c.schedule_start_time) setStartTime(c.schedule_start_time);
                if (c.schedule_end_time) setEndTime(c.schedule_end_time);
                if (Array.isArray(c.schedule_days) && c.schedule_days.length) setActiveDays(c.schedule_days);
                if (typeof c.daily_limit === 'number') setDailyLimit(c.daily_limit);
                if (typeof c.send_gap_minutes === 'number') setSendGapMinutes(c.send_gap_minutes);

                // Settings
                if (typeof c.esp_routing === 'boolean') setEspRouting(c.esp_routing);
                if (typeof c.stop_on_reply === 'boolean') setStopOnReply(c.stop_on_reply);
                if (typeof c.stop_on_bounce === 'boolean') setStopOnBounce(c.stop_on_bounce);
                if (typeof c.track_opens === 'boolean') setTrackOpens(c.track_opens);
                if (typeof c.track_clicks === 'boolean') setTrackClicks(c.track_clicks);
                if (typeof c.include_unsubscribe === 'boolean') setIncludeUnsubscribe(c.include_unsubscribe);
                if (typeof c.eu_compliance_mode === 'boolean') setEuComplianceMode(c.eu_compliance_mode);
                if (c.tracking_domain) setTrackingDomain(c.tracking_domain);

                // Leads count (read-only in edit mode)
                setExistingLeadCount(c.lead_count ?? c.total_leads ?? 0);
            })
            .catch((err: any) => {
                setLaunchError(err?.message || 'Failed to load campaign for editing');
            })
            .finally(() => {
                if (!cancelled) setPrefillLoading(false);
            });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    // ========== NAVIGATION ==========

    const stepIsAuthored = (s: SequenceStepData): boolean => {
        if (s.stepType === 'email') {
            return s.subject.trim().length > 0 && s.bodyHtml.trim().length > 0;
        }
        const cfg = (s.stepConfig || {}) as Record<string, string | undefined>;
        if (s.stepType === 'linkedin_connection_request') return (cfg.note_template || '').trim().length > 0;
        if (s.stepType === 'linkedin_message')            return (cfg.body_template || '').trim().length > 0;
        if (s.stepType === 'linkedin_inmail')             return (cfg.subject || '').trim().length > 0 && (cfg.body || '').trim().length > 0;
        // view_profile / follow / like_post have no message body.
        return true;
    };

    const sequenceHasLinkedIn = sequenceSteps.some(s => isLinkedInStepType(s.stepType));
    const sequenceHasEmail = sequenceSteps.some(s => s.stepType === 'email');

    const isStepComplete = (step: number) => {
        switch (step) {
            case 0: return campaignName.trim().length > 0;
            case 1: return isEditMode
                ? ((existingLeadCount - removeLeadIds.size) + leads.length) > 0
                : leads.length > 0;
            case 2: return sequenceSteps.length > 0 && sequenceSteps.every(stepIsAuthored);
            case 3: {
                // Email steps need a mailbox; LinkedIn steps need a sender
                // pool. Mixed campaigns need both. (Pure-LinkedIn sequences
                // legitimately have zero mailboxes.)
                const mailboxOk = !sequenceHasEmail || selectedMailboxIds.size > 0;
                const linkedinOk = !sequenceHasLinkedIn || selectedLinkedInSenderIds.size > 0;
                return mailboxOk && linkedinOk;
            }
            case 4: return activeDays.length > 0;       // Schedule step
            case 5: return true;                         // Settings - all optional with defaults
            default: return true;
        }
    };

    const allStepsComplete = () => [0, 1, 2, 3, 4, 5].every(isStepComplete);

    // ========== LEADS IMPORT ==========

    const handleCSVUpload = (file: File) => {
        setLeadsFileName(file.name);
        setMappingConfirmed(false);
        setLeads([]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const headers = result.meta.fields || [];
                const rows = result.data as Record<string, string>[];
                setCsvHeaders(headers);
                setCsvRawRows(rows);

                // Auto-detect column mapping
                const detected: ColumnMapping = {};
                for (const [field, variants] of Object.entries(FIELD_VARIANTS)) {
                    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
                    for (const variant of variants) {
                        const idx = normalizedHeaders.indexOf(variant);
                        if (idx !== -1) {
                            detected[field] = headers[idx];
                            break;
                        }
                    }
                }
                setColumnMapping(detected);
            }
        });
    };

    const updateMapping = (platformField: string, csvHeader: string) => {
        setColumnMapping(prev => ({ ...prev, [platformField]: csvHeader || '' }));
    };

    const addCustomField = () => {
        const key = newCustomFieldName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (!key || customFields.some(f => f.key === key) || MANDATORY_FIELDS.some(f => f.key === key)) return;
        setCustomFields(prev => [...prev, { key, label: newCustomFieldName.trim() }]);
        setNewCustomFieldName('');
    };

    const removeCustomField = (key: string) => {
        setCustomFields(prev => prev.filter(f => f.key !== key));
        setColumnMapping(prev => { const next = { ...prev }; delete next[key]; return next; });
    };

    const confirmMapping = () => {
        // Only the fields flagged `required: true` block confirmation. full_name and
        // website are accepted as optional - full_name can be derived from first+last,
        // and website is rarely present in cold-outreach CSVs.
        const missing = MANDATORY_FIELDS.filter(f => f.required && !columnMapping[f.key]);
        if (missing.length > 0) {
            toast.error(`Map these required fields: ${missing.map(f => f.label).join(', ')}`);
            return;
        }

        // Parse leads using the confirmed mapping
        const parsed: CampaignLead[] = [];
        for (const row of csvRawRows) {
            const email = (row[columnMapping.email] || '').trim().toLowerCase();
            if (!email || !email.includes('@')) continue;

            const firstName = (row[columnMapping.first_name] || '').trim();
            const lastName = (row[columnMapping.last_name] || '').trim();
            const mappedFullName = (row[columnMapping.full_name] || '').trim();
            const lead: CampaignLead = {
                email,
                first_name: firstName,
                last_name: lastName,
                // Fall back to first+last when full_name isn't mapped, so {{full_name}}
                // token renders even if the CSV doesn't carry it explicitly.
                full_name: mappedFullName || [firstName, lastName].filter(Boolean).join(' '),
                company: (row[columnMapping.company] || '').trim(),
                website: (row[columnMapping.website] || '').trim(),
            };

            // Map custom fields
            for (const cf of customFields) {
                if (columnMapping[cf.key]) {
                    lead[cf.key] = (row[columnMapping[cf.key]] || '').trim();
                }
            }

            parsed.push(lead);
        }

        setLeads(parsed);
        setMappingConfirmed(true);
    };

    const resetLeads = () => {
        setLeads([]);
        setCsvHeaders([]);
        setCsvRawRows([]);
        setColumnMapping({});
        setMappingConfirmed(false);
        setLeadsFileName('');
        setCustomFields([]);
        setDbLeads([]);
        setDbSelectedIds(new Set());
        setDbSearched(false);
    };

    // ========== LEAD DATABASE SEARCH ==========

    const searchLeadDatabase = async () => {
        setDbLoading(true);
        setDbSearched(true);
        try {
            const params = new URLSearchParams();
            if (dbSearchQuery) params.set('search', dbSearchQuery);
            if (dbStatusFilter) params.set('status', dbStatusFilter);
            if (dbValidationFilter) params.set('validation_status', dbValidationFilter);
            params.set('limit', '100');
            // Use the dashboard contacts endpoint (org-scoped via session, no API-key scope needed).
            // v1/leads required `leads:read` scope which session users don't carry.
            const result = await apiClient<any>(`/api/sequencer/contacts?${params.toString()}`);
            const list = Array.isArray(result) ? result : (result?.contacts || result?.data || []);
            setDbLeads(list);
        } catch {
            setDbLeads([]);
        } finally {
            setDbLoading(false);
        }
    };

    // Auto-load leads when the user first opens the Lead Database tab so they see
    // their existing contacts immediately without having to click Search.
    useEffect(() => {
        if (currentStep === 1 && leadSourceTab === 'database' && !dbSearched && !dbLoading) {
            searchLeadDatabase();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, leadSourceTab]);

    const verifyAllLeadEmails = async () => {
        if (leads.length === 0 || verifyingEmails) return;
        const emails = leads.map(l => l.email).filter(Boolean);
        // Skip already-verified emails to save credits
        const unverified = emails.filter(e => !leadValidationResults[e.toLowerCase()]);
        if (unverified.length === 0) {
            return;
        }
        setVerifyingEmails(true);
        try {
            const res = await apiClient<any>('/api/sequencer/contacts/validate-preview', {
                method: 'POST',
                body: JSON.stringify({ emails: unverified }),
            });
            const results = Array.isArray(res?.results) ? res.results : [];
            setLeadValidationResults(prev => {
                const next = { ...prev };
                for (const r of results) {
                    next[String(r.email).toLowerCase()] = {
                        status: r.status,
                        score: r.score ?? 0,
                        rejection_reason: r.rejection_reason ?? null,
                    };
                }
                return next;
            });
        } catch {
            // apiClient auto-toasts errors (402 on credits exhausted, etc.)
        } finally {
            setVerifyingEmails(false);
        }
    };

    const removeInvalidLeads = () => {
        const before = leads.length;
        setLeads(prev => prev.filter(l => {
            const r = leadValidationResults[l.email.toLowerCase()];
            return !r || r.status !== 'invalid';
        }));
        const removed = before - leads.filter(l => {
            const r = leadValidationResults[l.email.toLowerCase()];
            return !r || r.status !== 'invalid';
        }).length;
        if (removed > 0) {
            setLeadValidationResults(prev => {
                const next = { ...prev };
                for (const key of Object.keys(next)) {
                    if (next[key].status === 'invalid') delete next[key];
                }
                return next;
            });
        }
    };

    const removeSingleLead = (email: string) => {
        setLeads(prev => prev.filter(l => l.email !== email));
    };

    // Aggregate counts for the verification summary bar
    const verificationSummary = (() => {
        let verified = 0, valid = 0, risky = 0, invalid = 0;
        for (const l of leads) {
            const r = leadValidationResults[l.email.toLowerCase()];
            if (!r) continue;
            verified++;
            if (r.status === 'valid') valid++;
            else if (r.status === 'risky') risky++;
            else if (r.status === 'invalid') invalid++;
        }
        return { verified, valid, risky, invalid, unverified: leads.length - verified };
    })();

    const addLeadsFromDatabase = () => {
        const selected = dbLeads.filter(l => dbSelectedIds.has(l.id));
        const newLeads: CampaignLead[] = selected.map(l => ({
            email: l.email,
            first_name: l.first_name || '',
            last_name: l.last_name || '',
            full_name: l.full_name || [l.first_name, l.last_name].filter(Boolean).join(' ') || '',
            company: l.company || '',
            website: l.website || '',
            _db_lead_id: l.id, // track source for potential linking
        }));
        setLeads(prev => [...prev, ...newLeads.filter(nl => !prev.some(p => p.email === nl.email))]);
        setDbSelectedIds(new Set());
    };

    // ========== MANUAL LEAD ADD ==========

    const addManualCustomField = () => {
        const raw = newManualFieldName.trim();
        if (!raw) return;
        const key = raw.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (!key) return;
        // Don't add if it already exists in manual fields or main custom fields
        if (manualCustomFieldDefs.some(f => f.key === key) || customFields.some(f => f.key === key) || PERSONALIZATION_TOKENS.includes(key)) return;
        setManualCustomFieldDefs(prev => [...prev, { key, label: raw }]);
        // Also register in the main customFields so it becomes a {{token}} in the sequence editor
        setCustomFields(prev => prev.some(f => f.key === key) ? prev : [...prev, { key, label: raw }]);
        setNewManualFieldName('');
    };

    const removeManualCustomField = (key: string) => {
        setManualCustomFieldDefs(prev => prev.filter(f => f.key !== key));
        setManualCustomValues(prev => { const next = { ...prev }; delete next[key]; return next; });
        // Don't remove from main customFields - other leads may use it
    };

    const addManualLead = () => {
        if (!manualEmail.trim() || !manualEmail.includes('@')) return;
        if (leads.some(l => l.email === manualEmail.toLowerCase().trim())) return;

        const lead: CampaignLead = {
            email: manualEmail.toLowerCase().trim(),
            first_name: manualFirstName.trim(),
            last_name: manualLastName.trim(),
            full_name: [manualFirstName.trim(), manualLastName.trim()].filter(Boolean).join(' '),
            company: manualCompany.trim(),
            website: manualWebsite.trim(),
        };

        // Attach custom field values
        for (const field of manualCustomFieldDefs) {
            const val = manualCustomValues[field.key]?.trim();
            if (val) lead[field.key] = val;
        }

        setLeads(prev => [...prev, lead]);
        setManualEmail('');
        setManualFirstName('');
        setManualLastName('');
        setManualCompany('');
        setManualWebsite('');
        // Clear custom values but keep the field definitions for the next lead
        setManualCustomValues({});
    };

    // ========== SEQUENCE HELPERS ==========

    const addStep = (stepType: WizardStepType = 'email') => {
        // Minimum 3-hour gap between steps. The first step can be 0/0
        // ("send immediately"); subsequent steps default to 2 days which keeps
        // us comfortably above the minimum without surprising the operator.
        const isFirst = sequenceSteps.length === 0;
        const defaultDelayDays = isFirst ? 0 : 2;
        const defaultConfig: Record<string, unknown> = (() => {
            switch (stepType) {
                case 'linkedin_connection_request':
                    return { note_template: 'Hi {{first_name}}, came across your profile and would love to connect.' };
                case 'linkedin_message':
                    return { body_template: 'Hi {{first_name}}, thanks for connecting! Quick thought…' };
                case 'linkedin_inmail':
                    return { subject: '{{first_name}} - quick thought', body: 'Hi {{first_name}}, ...' };
                case 'linkedin_like_post':
                    return { reaction_type: 'LIKE', post_selection_timespan_days: 30, skip_if_no_post: true };
                default:
                    return {};
            }
        })();
        const newStep: SequenceStepData = {
            id: safeRandomUUID(),
            stepNumber: sequenceSteps.length + 1,
            stepType,
            delayDays: defaultDelayDays,
            delayHours: 0,
            subject: '',
            preheader: '',
            bodyHtml: '',
            stepConfig: defaultConfig,
            // DMs / InMails make sense only after a connection landed -
            // mirror the LinkedIn-only wizard default so operators don't
            // accidentally send a DM to a stranger.
            condition: (stepType === 'linkedin_message' || stepType === 'linkedin_inmail') ? 'if_connection' : null,
            variants: [],
        };
        setSequenceSteps([...sequenceSteps, newStep]);
        setActiveStepIndex(sequenceSteps.length);
    };

    const removeStep = (index: number) => {
        if (sequenceSteps.length <= 1) return;
        const updated = sequenceSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }));
        setSequenceSteps(updated);
        if (activeStepIndex >= updated.length) setActiveStepIndex(updated.length - 1);
    };

    const duplicateStep = (index: number) => {
        const source = sequenceSteps[index];
        const dup: SequenceStepData = {
            ...source,
            id: safeRandomUUID(),
            stepNumber: sequenceSteps.length + 1,
            variants: source.variants.map(v => ({ ...v, id: safeRandomUUID() })),
        };
        setSequenceSteps([...sequenceSteps, dup]);
        setActiveStepIndex(sequenceSteps.length);
    };

    const updateStep = (index: number, updates: Partial<SequenceStepData>) => {
        setSequenceSteps(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
    };

    const addVariant = (stepIndex: number) => {
        const step = sequenceSteps[stepIndex];
        const labels = 'ABCDEFGH';
        const nextLabel = labels[step.variants.length + 1] || 'X';
        const variant = {
            id: safeRandomUUID(),
            label: nextLabel,
            subject: step.subject,
            preheader: step.preheader,
            bodyHtml: step.bodyHtml,
            weight: Math.round(100 / (step.variants.length + 2)),
        };
        // Rebalance weights
        const totalVariants = step.variants.length + 2; // original A + existing + new
        const newWeight = Math.round(100 / totalVariants);
        const updatedVariants = [...step.variants.map(v => ({ ...v, weight: newWeight })), variant];
        updateStep(stepIndex, { variants: updatedVariants });
    };

    const removeVariant = (stepIndex: number, variantIndex: number) => {
        const step = sequenceSteps[stepIndex];
        const updated = step.variants.filter((_, i) => i !== variantIndex);
        // Rebalance
        const totalVariants = updated.length + 1;
        const newWeight = Math.round(100 / totalVariants);
        updateStep(stepIndex, { variants: updated.map(v => ({ ...v, weight: newWeight })) });
    };

    const toggleDay = (day: string) => {
        setActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    // Substitute `{{token}}` (with optional whitespace + optional `custom.` prefix) with
    // the matching value from the sample lead. Missing tokens are left visible but
    // highlighted so the user can spot unfilled variables.
    const renderTemplate = (tpl: string, lead: Record<string, string>): string => {
        if (!tpl) return '';
        return tpl.replace(/\{\{\s*(?:custom\.)?([a-zA-Z0-9_]+)\s*\}\}/g, (_match, token) => {
            const v = lead[token];
            if (v && v.trim().length > 0) return v;
            return `<span style="background:#FEF3C7;color:#92400E;padding:0 4px;border-radius:3px;font-size:0.85em;">{{${token}}}</span>`;
        });
    };

    // Merge leads available for preview: new-import leads + existing campaign leads (edit mode).
    // Deduplicates by email (new import wins since it has fuller data).
    const availableReviewLeads = (() => {
        const byEmail = new Map<string, Record<string, string>>();
        for (const l of existingLeads) {
            if (!l.email) continue;
            byEmail.set(l.email, {
                email: l.email,
                first_name: l.first_name || '',
                last_name: l.last_name || '',
                full_name: [l.first_name, l.last_name].filter(Boolean).join(' '),
                company: l.company || '',
                website: '',
            });
        }
        for (const l of leads) {
            if (!l.email) continue;
            byEmail.set(l.email, {
                email: l.email,
                first_name: l.first_name || '',
                last_name: l.last_name || '',
                full_name: l.full_name || [l.first_name, l.last_name].filter(Boolean).join(' '),
                company: l.company || '',
                website: l.website || '',
            });
        }
        return Array.from(byEmail.values()).slice(0, 100);
    })();

    // When the selected review lead changes, push its data into previewLead so the renderer picks it up.
    useEffect(() => {
        if (reviewLeadKey === '__demo__') {
            setPreviewLead(DEMO_LEAD);
            return;
        }
        const match = availableReviewLeads.find(l => l.email === reviewLeadKey);
        // Full replace (not merge) - empty fields on a real lead should render as empty,
        // not inherit from whatever lead was previously selected.
        if (match) setPreviewLead(match);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewLeadKey, existingLeads.length, leads.length]);

    // Clamp variant index when switching between steps with different variant counts
    useEffect(() => {
        const step = sequenceSteps[reviewStepIdx];
        if (!step) return;
        const maxIdx = step.variants.length; // 0 = main, 1..N = variants
        if (reviewVariantIdx > maxIdx) setReviewVariantIdx(0);
    }, [reviewStepIdx, sequenceSteps, reviewVariantIdx]);

    // ========== LAUNCH ==========

    const [launching, setLaunching] = useState(false);
    const [launchError, setLaunchError] = useState('');

    const buildPayload = () => {
        // Provenance for the leads being submitted in this batch - drives the
        // "Lead sources" panel on the campaign detail page. The wizard tracks
        // which tab the user used (CSV / database / manual) so we map that to
        // the canonical source enum the backend persists.
        const leadSource =
            leadSourceTab === 'csv' ? 'csv'
                : leadSourceTab === 'database' ? 'database'
                    : 'manual';
        const leadSourceFile = leadSourceTab === 'csv' && leadsFileName ? leadsFileName : undefined;

        const base = {
            name: campaignName,
            steps: sequenceSteps.map(s => ({
                step_number: s.stepNumber,
                step_type: s.stepType,
                step_config: s.stepConfig ?? {},
                delay_days: s.delayDays,
                delay_hours: s.delayHours,
                subject: s.subject,
                preheader: s.preheader,
                body_html: s.bodyHtml,
                condition: s.condition || null,
                branch_to_step_number: s.branchToStepNumber ?? null,
                // Variants are an email-only concept for now. Backend
                // accepts them on any step_type but the dispatcher only
                // uses them for the email executor.
                variants: s.variants.map(v => ({
                    label: v.label,
                    subject: v.subject,
                    preheader: v.preheader,
                    body_html: v.bodyHtml,
                    weight: v.weight,
                })),
            })),
            accountIds: Array.from(selectedMailboxIds),
            // Mixed-channel sender pool. Backend creates one
            // CampaignLinkedInSender row per id, with rotation_priority
            // following selection order.
            linkedinSenders: Array.from(selectedLinkedInSenderIds).map((id, idx) => ({
                linkedin_account_id: id,
                rotation_priority: idx,
            })),
            schedule: { timezone, start_time: startTime, end_time: endTime, days: activeDays, sendGapMinutes },
            settings: { espRouting, daily_limit: dailyLimit, stop_on_reply: stopOnReply, stop_on_bounce: true, track_opens: trackOpens, track_clicks: trackClicks, include_unsubscribe: includeUnsubscribe, eu_compliance_mode: euComplianceMode },
            // Canonical suppression payload. Backend folds the legacy boolean
            // into the rules array if both are sent, so we transmit both for
            // backwards compat with the older API surface.
            suppressionRules,
            skipDuplicatesAcrossCampaigns,
            leadSource,
            ...(leadSourceFile ? { leadSourceFile } : {}),
        };
        // On create, include leads for health-gate + validation.
        // On edit, use addLeads (new) + removeLeadIds (deletions) - existing unselected
        // leads are preserved server-side.
        if (!isEditMode) return { ...base, leads };
        const editPayload: any = { ...base };
        if (leads.length > 0) editPayload.addLeads = leads;
        if (removeLeadIds.size > 0) editPayload.removeLeadIds = Array.from(removeLeadIds);
        return editPayload;
    };

    // Persist the org-level tag set via the dedicated /tags endpoint. The
    // create/update endpoints don't accept tagIds inline, so we PUT after
    // the campaign row is committed. Non-fatal: a tag-persist failure
    // doesn't roll back the campaign.
    const persistTags = async (campaignId: string) => {
        try {
            await apiClient(`/api/sequencer/campaigns/${campaignId}/tags`, {
                method: 'PUT',
                body: JSON.stringify({ tagIds: selectedTagIds }),
            });
        } catch (err: any) {
            // Toast on failure so the operator knows the tags didn't stick,
            // even though the campaign itself saved successfully.
            toast.error(`Campaign saved but tag update failed: ${err?.message || 'unknown error'}`);
        }
    };

    const handleLaunch = async () => {
        setLaunching(true);
        setLaunchError('');
        try {
            if (isEditMode && editId) {
                await apiClient(`/api/sequencer/campaigns/${editId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(buildPayload()),
                });
                await persistTags(editId);
                // Only call /launch for drafts - active/paused campaigns stay in their current state
                if (!isAlreadyLaunched) {
                    await apiClient(`/api/sequencer/campaigns/${editId}/launch`, { method: 'POST' });
                }
                router.push(`/dashboard/sequencer/campaigns/${editId}`);
                return;
            }
            const campaign = await apiClient<{ id: string }>('/api/sequencer/campaigns', {
                method: 'POST',
                body: JSON.stringify(buildPayload()),
            });
            if (campaign?.id) {
                await persistTags(campaign.id);
                await apiClient(`/api/sequencer/campaigns/${campaign.id}/launch`, { method: 'POST' });
            }
            router.push('/dashboard/sequencer/campaigns');
        } catch (err: any) {
            setLaunchError(err.message || (isEditMode ? 'Failed to save and launch campaign' : 'Failed to create campaign'));
            setLaunching(false);
        }
    };

    const handleSaveDraft = async () => {
        setLaunching(true);
        setLaunchError('');
        try {
            if (isEditMode && editId) {
                await apiClient(`/api/sequencer/campaigns/${editId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(buildPayload()),
                });
                await persistTags(editId);
                router.push(`/dashboard/sequencer/campaigns/${editId}`);
                return;
            }
            const created = await apiClient<{ id: string }>('/api/sequencer/campaigns', {
                method: 'POST',
                body: JSON.stringify(buildPayload()),
            });
            if (created?.id) await persistTags(created.id);
            router.push('/dashboard/sequencer/campaigns');
        } catch (err: any) {
            setLaunchError(err.message || 'Failed to save draft');
            setLaunching(false);
        }
    };

    // ========== RENDER ==========

    const allTokens = [...PERSONALIZATION_TOKENS, ...customFields.map(f => f.key)];

    return (
        <div className="p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Campaign' : 'Create Campaign'}</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {campaignName || 'Untitled campaign'}
                        {prefillLoading ? ' · loading…' : ''}
                    </p>
                </div>
                <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
            </div>

            {/* Step Indicator - all steps clickable. The "Mailboxes" stage
                label switches to "Senders" when the sequence has any
                linkedin_* step, since the operator picks LinkedIn accounts
                on that stage too. */}
            <div className="flex items-center gap-1">
                {STEPS.map((rawLabel, i) => {
                    const label = (rawLabel === 'Mailboxes' && sequenceHasLinkedIn) ? 'Senders' : rawLabel;
                    const complete = i < 5 && isStepComplete(i);
                    const active = i === currentStep;
                    return (
                        <div key={label} className="flex items-center gap-1 flex-1">
                            <button
                                onClick={() => setCurrentStep(i)}
                                className="flex items-center gap-1.5 cursor-pointer"
                            >
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{
                                    background: active ? '#111827' : complete ? '#059669' : '#E8E3DC',
                                    color: active || complete ? '#FFFFFF' : '#6B7280',
                                }}>
                                    {complete && !active ? <Check size={10} /> : i + 1}
                                </div>
                                <span className="text-[10px] font-medium hidden sm:block" style={{ color: active ? '#111827' : complete ? '#059669' : '#9CA3AF' }}>{label}</span>
                            </button>
                            {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ background: complete ? '#059669' : '#E8E3DC' }} />}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="premium-card min-h-[calc(100vh-220px)] flex-1">
                {/* ==================== STEP 1: BASICS ==================== */}
                {currentStep === 0 && (
                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Campaign Name *</label>
                            <input
                                type="text"
                                value={campaignName}
                                onChange={e => setCampaignName(e.target.value)}
                                placeholder="e.g. Q2 Enterprise Outreach"
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                                style={{ border: '1px solid #D1CBC5' }}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tags</label>
                            <div className="flex items-center gap-1.5 flex-wrap min-h-[34px] px-2 py-1.5 rounded-lg" style={{ border: '1px solid #D1CBC5', background: '#FFFFFF' }}>
                                {selectedTagIds.length > 0 && allTags
                                    .filter(t => selectedTagIds.includes(t.id))
                                    .map(t => (
                                        <span
                                            key={t.id}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                                            style={{ background: t.color ? `${t.color}22` : '#F3F4F6', color: t.color || '#374151' }}
                                        >
                                            {t.name}
                                        </span>
                                    ))}
                                <TagPicker
                                    allTags={allTags}
                                    selectedIds={selectedTagIds}
                                    onChange={(ids) => setSelectedTagIds(ids)}
                                    onTagCreated={fetchOrgTags}
                                    align="left"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Apply org-level tags to organize and filter. Create new ones inline.
                            </p>
                        </div>
                    </div>
                )}

                {/* ==================== STEP 2: LEADS ==================== */}
                {currentStep === 1 && (
                    <div className="flex flex-col gap-4">
                        {/* Edit mode - existing leads list with search, pagination, and remove */}
                        {isEditMode && (
                            <div className="rounded-lg border border-[#D1CBC5] bg-white">
                                <div className="px-3 py-2 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                    <div className="text-xs font-semibold text-gray-900">
                                        Existing leads <span className="text-gray-400 font-normal">
                                            ({Math.max(0, existingLeadsMeta.total - removeLeadIds.size).toLocaleString()} kept
                                            {removeLeadIds.size > 0 ? ` · ${removeLeadIds.size} to remove` : ''})
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={existingLeadsSearch}
                                        onChange={e => {
                                            const v = e.target.value;
                                            setExistingLeadsSearch(v);
                                            if (existingSearchTimerRef.current) clearTimeout(existingSearchTimerRef.current);
                                            existingSearchTimerRef.current = setTimeout(() => {
                                                if (editId) fetchExistingLeads(editId, 1, v);
                                            }, 350);
                                        }}
                                        placeholder="Search email, name, company..."
                                        className="px-2 py-1 text-xs rounded-md outline-none border border-[#D1CBC5] w-56"
                                    />
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {existingLeadsLoading ? (
                                        <div className="py-6 flex items-center justify-center">
                                            <Loader2 size={14} className="animate-spin text-gray-400" />
                                        </div>
                                    ) : existingLeads.length === 0 ? (
                                        <p className="px-3 py-4 text-xs text-gray-500">
                                            {existingLeadsSearch ? 'No leads match your search.' : 'No leads in this campaign yet.'}
                                        </p>
                                    ) : (
                                        <table className="w-full text-xs">
                                            <tbody>
                                                {existingLeads.map(l => {
                                                    const marked = removeLeadIds.has(l.id);
                                                    return (
                                                        <tr key={l.id} className={marked ? 'bg-red-50' : 'hover:bg-gray-50'} style={{ borderBottom: '1px solid #F0EBE3' }}>
                                                            <td className="px-3 py-1.5 w-8">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={marked}
                                                                    onChange={() => setRemoveLeadIds(prev => {
                                                                        const next = new Set(prev);
                                                                        if (next.has(l.id)) next.delete(l.id); else next.add(l.id);
                                                                        return next;
                                                                    })}
                                                                    className="cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className={`px-2 py-1.5 ${marked ? 'line-through text-red-600' : 'text-gray-900'} font-medium`}>{l.email}</td>
                                                            <td className="px-2 py-1.5 text-gray-600">{[l.first_name, l.last_name].filter(Boolean).join(' ') || '-'}</td>
                                                            <td className="px-2 py-1.5 text-gray-600">{l.company || '-'}</td>
                                                            <td className="px-2 py-1.5 text-gray-500 capitalize">{l.status}</td>
                                                            <td className="px-2 py-1.5 text-gray-400 text-right">step {l.current_step}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                {existingLeadsMeta.totalPages > 1 && (
                                    <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: '1px solid #E8E3DC' }}>
                                        <span className="text-[10px] text-gray-500">
                                            Page {existingLeadsMeta.page} of {existingLeadsMeta.totalPages} · {existingLeadsMeta.total.toLocaleString()} total
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => editId && fetchExistingLeads(editId, Math.max(1, existingLeadsMeta.page - 1), existingLeadsSearch)}
                                                disabled={existingLeadsMeta.page <= 1 || existingLeadsLoading}
                                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                                            >
                                                <ChevronLeft size={14} className="text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => editId && fetchExistingLeads(editId, Math.min(existingLeadsMeta.totalPages, existingLeadsMeta.page + 1), existingLeadsSearch)}
                                                disabled={existingLeadsMeta.page >= existingLeadsMeta.totalPages || existingLeadsLoading}
                                                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                                            >
                                                <ChevronRight size={14} className="text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="px-3 py-2 text-[10px] text-gray-500 bg-gray-50" style={{ borderTop: '1px solid #E8E3DC' }}>
                                    Tick leads to remove on save. Add more leads using the tabs below - new leads run through the health gate + validation.
                                </div>
                            </div>
                        )}

                        {/* Suppression picker - replaces the legacy "skip duplicates"
                            toggle. Three modes: no filter, all campaigns, or pick
                            specific campaigns (with an optional per-lead override).
                            Persists as CampaignSuppression rules on save. */}
                        <SuppressionPicker
                            currentCampaignId={editId ?? null}
                            rules={suppressionRules}
                            onChange={setSuppressionRules}
                        />

                        {/* Lead source tabs - always visible in both create and edit mode */}
                        {!mappingConfirmed && leads.length === 0 && (
                            <>
                                <div className="flex gap-1 p-1 rounded-xl w-fit bg-slate-100">
                                    {[
                                        { key: 'csv', label: 'Upload CSV' },
                                        { key: 'database', label: 'From Lead Database' },
                                        { key: 'manual', label: 'Add Manually' },
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setLeadSourceTab(tab.key as any)}
                                            className="rounded-[10px] border-none text-xs font-semibold cursor-pointer transition-all duration-200 px-4 py-2"
                                            style={{
                                                background: leadSourceTab === tab.key ? '#FFFFFF' : 'transparent',
                                                color: leadSourceTab === tab.key ? '#111827' : '#64748B',
                                                boxShadow: leadSourceTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* ── TAB: From Lead Database ─�� */}
                                {leadSourceTab === 'database' && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    value={dbSearchQuery}
                                                    onChange={e => setDbSearchQuery(e.target.value)}
                                                    placeholder="Search leads by email, persona..."
                                                    className="w-full pl-3 pr-3 py-2 text-xs rounded-lg outline-none"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                />
                                            </div>
                                            <div className="w-40">
                                                <CustomSelect
                                                    value={dbStatusFilter}
                                                    onChange={setDbStatusFilter}
                                                    placeholder="All statuses"
                                                    options={[
                                                        { value: '', label: 'All statuses' },
                                                        { value: 'held', label: 'Held' },
                                                        { value: 'active', label: 'Active' },
                                                        { value: 'paused', label: 'Paused' },
                                                    ]}
                                                />
                                            </div>
                                            <div className="w-44">
                                                <CustomSelect
                                                    value={dbValidationFilter}
                                                    onChange={setDbValidationFilter}
                                                    placeholder="All validation"
                                                    options={[
                                                        { value: '', label: 'All validation' },
                                                        { value: 'valid', label: 'Valid' },
                                                        { value: 'risky', label: 'Risky' },
                                                        { value: 'invalid', label: 'Invalid' },
                                                        { value: 'pending', label: 'Pending' },
                                                    ]}
                                                />
                                            </div>
                                            <button
                                                onClick={searchLeadDatabase}
                                                disabled={dbLoading}
                                                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                {dbLoading ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>

                                        {dbLeads.length > 0 && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-gray-500">{dbLeads.length} leads found - {dbSelectedIds.size} selected</span>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setDbSelectedIds(dbSelectedIds.size === dbLeads.length ? new Set() : new Set(dbLeads.map(l => l.id)))} className="text-[10px] text-blue-600 cursor-pointer font-medium bg-transparent border-none">
                                                            {dbSelectedIds.size === dbLeads.length ? 'Deselect all' : 'Select all'}
                                                        </button>
                                                        {dbSelectedIds.size > 0 && (
                                                            <button onClick={addLeadsFromDatabase} className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-gray-800">
                                                                Add {dbSelectedIds.size} leads to campaign
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                                    <table className="w-full text-left text-xs">
                                                        <thead>
                                                            <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                                                                <th className="px-3 py-2 w-8"><input type="checkbox" checked={dbSelectedIds.size === dbLeads.length && dbLeads.length > 0} onChange={() => setDbSelectedIds(dbSelectedIds.size === dbLeads.length ? new Set() : new Set(dbLeads.map(l => l.id)))} className="cursor-pointer" /></th>
                                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Email</th>
                                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Persona</th>
                                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Source</th>
                                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Validation</th>
                                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Score</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dbLeads.map(lead => (
                                                                <tr key={lead.id} className="hover:bg-[#F5F1EA] transition-colors cursor-pointer" style={{ borderBottom: '1px solid #E8E3DC' }} onClick={() => { const next = new Set(dbSelectedIds); next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id); setDbSelectedIds(next); }}>
                                                                    <td className="px-3 py-1.5"><input type="checkbox" checked={dbSelectedIds.has(lead.id)} readOnly className="cursor-pointer" /></td>
                                                                    <td className="px-3 py-1.5 text-gray-900 font-medium">{lead.email}</td>
                                                                    <td className="px-3 py-1.5 text-gray-600 capitalize">{lead.persona || '-'}</td>
                                                                    <td className="px-3 py-1.5 text-gray-500">{lead.source || '-'}</td>
                                                                    <td className="px-3 py-1.5">
                                                                        {lead.validation_status ? (
                                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{
                                                                                background: lead.validation_status === 'valid' ? '#D1FAE5' : lead.validation_status === 'risky' ? '#FEF3C7' : lead.validation_status === 'invalid' ? '#FEE2E2' : '#F3F4F6',
                                                                                color: lead.validation_status === 'valid' ? '#065F46' : lead.validation_status === 'risky' ? '#92400E' : lead.validation_status === 'invalid' ? '#991B1B' : '#6B7280',
                                                                            }}>{lead.validation_status}</span>
                                                                        ) : <span className="text-[9px] text-gray-400">���</span>}
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-gray-600">{lead.lead_score}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}

                                        {dbLeads.length === 0 && dbSearched && !dbLoading && (
                                            <div className="text-center py-8 text-gray-400 text-xs">No leads found matching your filters. Try adjusting the search or import leads via Clay/API first.</div>
                                        )}

                                        {!dbSearched && !dbLoading && (
                                            <div className="text-center py-10">
                                                <div className="text-3xl mb-3">🔍</div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Search your lead database</p>
                                                <p className="text-[10px] text-gray-400">Find leads from Clay webhooks, API imports, or previous uploads. Click Search to load results.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAB: Add Manually ── */}
                                {leadSourceTab === 'manual' && (
                                    <div className="flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Email *</label>
                                                <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)} placeholder="john@acme.com" className="w-full px-3 py-2 text-xs rounded-lg outline-none" style={{ border: '1px solid #D1CBC5' }} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Company</label>
                                                <input type="text" value={manualCompany} onChange={e => setManualCompany(e.target.value)} placeholder="Acme Corp" className="w-full px-3 py-2 text-xs rounded-lg outline-none" style={{ border: '1px solid #D1CBC5' }} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">First Name</label>
                                                <input type="text" value={manualFirstName} onChange={e => setManualFirstName(e.target.value)} placeholder="John" className="w-full px-3 py-2 text-xs rounded-lg outline-none" style={{ border: '1px solid #D1CBC5' }} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Last Name</label>
                                                <input type="text" value={manualLastName} onChange={e => setManualLastName(e.target.value)} placeholder="Smith" className="w-full px-3 py-2 text-xs rounded-lg outline-none" style={{ border: '1px solid #D1CBC5' }} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Website</label>
                                                <input type="text" value={manualWebsite} onChange={e => setManualWebsite(e.target.value)} placeholder="acme.com" className="w-full px-3 py-2 text-xs rounded-lg outline-none" style={{ border: '1px solid #D1CBC5' }} />
                                            </div>
                                        </div>

                                        {/* Custom fields for this lead */}
                                        {manualCustomFieldDefs.length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Custom Fields</div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {manualCustomFieldDefs.map(field => (
                                                        <div key={field.key} className="flex items-center gap-1.5">
                                                            <div className="flex-1">
                                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">{field.label} <span className="text-[8px] text-gray-400 normal-case">{`{{${field.key}}}`}</span></label>
                                                                <input
                                                                    type="text"
                                                                    value={manualCustomValues[field.key] || ''}
                                                                    onChange={e => setManualCustomValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                                                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                                                    style={{ border: '1px solid #D1CBC5' }}
                                                                />
                                                            </div>
                                                            <button onClick={() => removeManualCustomField(field.key)} className="mt-4 p-1 text-gray-400 hover:text-red-500 cursor-pointer">
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add custom field */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={newManualFieldName}
                                                    onChange={e => setNewManualFieldName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && addManualCustomField()}
                                                    placeholder="Add custom field e.g. Industry, Phone, LinkedIn..."
                                                    className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                />
                                                <button
                                                    onClick={addManualCustomField}
                                                    disabled={!newManualFieldName.trim()}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-30"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                >
                                                    <Plus size={10} /> Add Field
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-gray-400 mt-1">Custom fields become personalization variables like {`{{industry}}`} in your email sequence.</p>
                                        </div>

                                        <button
                                            onClick={addManualLead}
                                            disabled={!manualEmail.trim() || !manualEmail.includes('@')}
                                            className="w-fit px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                                        >
                                            <Plus size={12} className="inline mr-1" />Add Lead
                                        </button>

                                        {leads.length > 0 && (
                                            <div className="mt-2 p-3 rounded-lg" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                                                <span className="text-xs font-semibold text-emerald-900">{leads.length} lead{leads.length > 1 ? 's' : ''} added manually</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── TAB: Upload CSV (existing flow) ── */}
                        {leadSourceTab === 'csv' && !mappingConfirmed && leads.length === 0 && csvHeaders.length === 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Import Leads</label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    style={{ borderColor: '#D1CBC5' }}
                                    onClick={() => document.getElementById('csv-input')?.click()}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleCSVUpload(f); }}
                                >
                                    <div className="text-2xl mb-2">📄</div>
                                    <p className="text-sm font-medium text-gray-700">Drop a CSV file or click to browse</p>
                                    <p className="text-[10px] text-gray-400 mt-1">We&apos;ll auto-detect columns and let you map them to required fields</p>
                                    <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCSVUpload(f); }} />
                                </div>
                            </div>
                        )}

                        {/* Phase 2: Column Mapping */}
                        {csvHeaders.length > 0 && !mappingConfirmed && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Map Columns</h3>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{csvRawRows.length} rows found in {leadsFileName}. Map your CSV columns to Superkabe fields.</p>
                                    </div>
                                    <button onClick={resetLeads} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Remove file</button>
                                </div>

                                {/* Field mapping - required fields are highlighted red when unmapped,
                                     optional fields show a neutral border whether mapped or not. */}
                                <div>
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Field Mapping</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {MANDATORY_FIELDS.map(field => {
                                            const isMapped = !!columnMapping[field.key];
                                            const isRequiredAndMissing = field.required && !isMapped;
                                            return (
                                                <div
                                                    key={field.key}
                                                    className="flex items-center gap-2 p-2.5 rounded-lg"
                                                    style={{
                                                        border: `1px solid ${isRequiredAndMissing ? '#FCA5A5' : '#D1CBC5'}`,
                                                        background: isRequiredAndMissing ? '#FEF2F2' : 'transparent',
                                                    }}
                                                >
                                                    <div className="flex-1">
                                                        <div className="text-[10px] font-semibold text-gray-700">
                                                            {field.label}{' '}
                                                            {field.required ? (
                                                                <span className="text-red-500">*</span>
                                                            ) : (
                                                                <span className="text-gray-400 font-normal text-[9px]">optional</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] text-gray-400">{`{{${field.key}}}`}</div>
                                                    </div>
                                                    <div className="min-w-[160px]">
                                                        <CustomSelect
                                                            value={columnMapping[field.key] || ''}
                                                            onChange={(val) => updateMapping(field.key, val)}
                                                            options={[
                                                                { value: '', label: field.required ? '- select column -' : '- skip -' },
                                                                ...csvHeaders.map(h => ({ value: h, label: h })),
                                                            ]}
                                                            placeholder={field.required ? '- select column -' : '- skip -'}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom fields */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] font-semibold text-gray-500 uppercase">Custom Fields (for personalization)</div>
                                    </div>

                                    {customFields.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                            {customFields.map(field => (
                                                <div key={field.key} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                                    <div className="flex-1">
                                                        <div className="text-[10px] font-semibold text-gray-700">{field.label}</div>
                                                        <div className="text-[9px] text-gray-400">{`{{${field.key}}}`}</div>
                                                    </div>
                                                    <div className="min-w-[160px]">
                                                        <CustomSelect
                                                            value={columnMapping[field.key] || ''}
                                                            onChange={(val) => updateMapping(field.key, val)}
                                                            options={[{ value: '', label: '- select column -' }, ...csvHeaders.map(h => ({ value: h, label: h }))]}
                                                            placeholder="- select column -"
                                                        />
                                                    </div>
                                                    <button onClick={() => removeCustomField(field.key)} className="text-gray-400 hover:text-red-500 cursor-pointer p-1">
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add custom field */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newCustomFieldName}
                                            onChange={e => setNewCustomFieldName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addCustomField()}
                                            placeholder="e.g. Industry, Phone, LinkedIn URL..."
                                            className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        />
                                        <button
                                            onClick={addCustomField}
                                            disabled={!newCustomFieldName.trim()}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-30"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            <Plus size={10} /> Add Field
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-1">Custom fields become personalization variables like {`{{industry}}`} in your emails.</p>
                                </div>

                                {/* CSV Preview */}
                                <div>
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Preview (first 3 rows)</div>
                                    <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                        <table className="w-full text-left text-[10px]">
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                                                    {csvHeaders.slice(0, 8).map(h => <th key={h} className="px-2 py-1.5 text-gray-500 font-semibold">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvRawRows.slice(0, 3).map((row, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #E8E3DC' }}>
                                                        {csvHeaders.slice(0, 8).map(h => <td key={h} className="px-2 py-1 text-gray-600 max-w-[120px] truncate">{row[h] || ''}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Confirm button */}
                                <button
                                    onClick={confirmMapping}
                                    className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800 transition-colors"
                                >
                                    Confirm Mapping & Import {csvRawRows.length} Leads
                                </button>
                            </div>
                        )}

                        {/* Phase 3: Confirmed leads (shown for CSV, database, or manual sources) */}
                        {leads.length > 0 && (mappingConfirmed || leadSourceTab !== 'csv') && (
                            <div>
                                <div className="flex items-center justify-between mb-3 p-3 rounded-lg" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                                    <div className="flex items-center gap-2">
                                        <Check size={14} className="text-emerald-700" />
                                        <span className="text-sm font-semibold text-emerald-900">{leads.length} leads imported</span>
                                        <span className="text-xs text-emerald-700">{leadsFileName ? `from ${leadsFileName}` : leadSourceTab === 'database' ? 'from lead database' : 'added manually'}</span>
                                    </div>
                                    <button onClick={resetLeads} className="text-xs text-emerald-700 hover:text-red-600 cursor-pointer">Replace</button>
                                </div>

                                {/* Verify emails action bar - runs MillionVerifier on all unverified leads */}
                                <div className="flex items-center justify-between gap-3 mb-3 p-2.5 rounded-lg flex-wrap" style={{ background: '#FAFAF8', border: '1px solid #E8E3DC' }}>
                                    <div className="flex items-center gap-3 flex-wrap text-[11px]">
                                        <span className="font-semibold text-gray-700">Email validation:</span>
                                        {verificationSummary.verified === 0 ? (
                                            <span className="text-gray-500">No leads verified yet. Validation only runs when you click below - campaign creation won&apos;t consume credits.</span>
                                        ) : (
                                            <>
                                                <span className="text-emerald-700 font-semibold">{verificationSummary.valid} valid</span>
                                                <span className="text-amber-700 font-semibold">{verificationSummary.risky} risky</span>
                                                <span className="text-red-600 font-semibold">{verificationSummary.invalid} invalid</span>
                                                {verificationSummary.unverified > 0 && (
                                                    <span className="text-gray-500">· {verificationSummary.unverified} not verified</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {verificationSummary.invalid > 0 && (
                                            <button
                                                onClick={removeInvalidLeads}
                                                disabled={verifyingEmails}
                                                className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold text-red-600 rounded-md cursor-pointer border border-red-200 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <Trash2 size={10} /> Remove {verificationSummary.invalid} invalid
                                            </button>
                                        )}
                                        <button
                                            onClick={verifyAllLeadEmails}
                                            disabled={verifyingEmails || verificationSummary.unverified === 0}
                                            className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold text-white bg-gray-900 rounded-md cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                                            title={verificationSummary.unverified === 0 ? 'All leads already verified' : `Verify ${verificationSummary.unverified} leads`}
                                        >
                                            {verifyingEmails ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                            {verifyingEmails ? 'Verifying...' : `Verify ${verificationSummary.unverified || 'Emails'}`}
                                        </button>
                                    </div>
                                </div>

                                {/* Mapped fields summary */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {[...MANDATORY_FIELDS, ...customFields.map(f => ({ key: f.key, label: f.label, required: false }))].map(f => (
                                        <span key={f.key} className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#F5F1EA', color: '#6B7280' }}>
                                            {`{{${f.key}}}`} → {columnMapping[f.key] || '-'}
                                        </span>
                                    ))}
                                </div>

                                {/* Lead table - shows all leads with validation status pills + per-row remove */}
                                <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Email</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Name</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Company</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Website</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Validation</th>
                                                <th className="px-3 py-2 w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.slice(0, 50).map((lead, i) => {
                                                const v = leadValidationResults[lead.email.toLowerCase()];
                                                return (
                                                    <tr key={i} style={{ borderBottom: '1px solid #E8E3DC' }}>
                                                        <td className="px-3 py-1.5 text-gray-900">{lead.email}</td>
                                                        <td className="px-3 py-1.5 text-gray-600">{lead.full_name || [lead.first_name, lead.last_name].filter(Boolean).join(' ') || '-'}</td>
                                                        <td className="px-3 py-1.5 text-gray-600">{lead.company || '-'}</td>
                                                        <td className="px-3 py-1.5 text-gray-600">{lead.website || '-'}</td>
                                                        <td className="px-3 py-1.5">
                                                            {v ? (
                                                                <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                                                                    v.status === 'valid' ? 'bg-emerald-50 text-emerald-700' :
                                                                    v.status === 'risky' ? 'bg-amber-50 text-amber-700' :
                                                                    v.status === 'invalid' ? 'bg-red-50 text-red-600' :
                                                                    'bg-gray-100 text-gray-500'
                                                                }`}
                                                                title={v.rejection_reason ? `${v.status} · ${v.rejection_reason}` : v.status}>
                                                                    {v.status}{v.score ? ` ${v.score}` : ''}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-right">
                                                            <button
                                                                onClick={() => removeSingleLead(lead.email)}
                                                                className="p-0.5 text-gray-300 hover:text-red-500 cursor-pointer bg-transparent border-none"
                                                                title="Remove from list"
                                                            >
                                                                <Trash2 size={11} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {leads.length > 50 && (
                                        <div className="px-3 py-1.5 text-[10px] text-gray-400 text-center" style={{ borderTop: '1px solid #E8E3DC' }}>
                                            + {leads.length - 50} more leads (scroll or paginate after launch to see the rest)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== STEP 3: SEQUENCE ==================== */}
                {currentStep === 2 && (
                    <div className="flex flex-col gap-4">
                        {/* Saved-sequence loader - picks a Sequence from the
                            templates page and clones its steps into wizard state.
                            Replaces the current step list outright; we warn before
                            clobbering hand-authored work. */}
                        <LoadSavedSequence
                            currentSteps={sequenceSteps}
                            onLoad={(loaded) => setSequenceSteps(loaded)}
                        />

                        {/* Step tabs - chip per step, accent by channel */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {sequenceSteps.map((step, i) => {
                                const meta = STEP_TYPE_META[step.stepType];
                                const active = activeStepIndex === i;
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStepIndex(i)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                        style={{
                                            background: active ? meta.accent : meta.accentBg,
                                            color: active ? '#FFFFFF' : meta.accent,
                                        }}
                                    >
                                        {meta.icon}
                                        Step {step.stepNumber} · {meta.shortLabel}
                                        {step.variants.length > 0 && (
                                            <span className="text-[9px] px-1 rounded" style={{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)' }}>
                                                {step.variants.length + 1} variants
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            <AddStepDropdown onPick={(t) => addStep(t)} />
                        </div>

                        {/* Active step editor */}
                        {sequenceSteps[activeStepIndex] && (() => {
                            const step = sequenceSteps[activeStepIndex];
                            const idx = activeStepIndex;
                            return (
                                <div className="flex flex-col gap-3">
                                    {/* Step header with actions */}
                                    <div className="flex items-center justify-between flex-wrap gap-y-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xs font-bold text-gray-900">Step {step.stepNumber}</span>
                                            {idx > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-gray-400">Send after</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={step.delayDays}
                                                        onChange={e => updateStep(idx, { delayDays: parseInt(e.target.value) || 0 })}
                                                        className="w-12 px-1.5 py-0.5 text-xs rounded border text-center"
                                                        style={{ borderColor: '#D1CBC5' }}
                                                    />
                                                    <span className="text-[10px] text-gray-400">days</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={23}
                                                        value={step.delayHours}
                                                        onChange={e => updateStep(idx, { delayHours: parseInt(e.target.value) || 0 })}
                                                        className="w-12 px-1.5 py-0.5 text-xs rounded border text-center"
                                                        style={{ borderColor: '#D1CBC5' }}
                                                    />
                                                    <span className="text-[10px] text-gray-400">hours</span>
                                                </div>
                                            )}
                                            {/* Branching - only meaningful from step 2 onward (step 1 is the entry,
                                                conditions reference signals only later steps can have produced). */}
                                            {idx > 0 && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                    <span className="text-[10px] text-gray-500 shrink-0">Send only if</span>
                                                    <div className="w-44">
                                                        <CustomSelect
                                                            value={step.condition || ''}
                                                            onChange={(v) => updateStep(idx, { condition: v || null, branchToStepNumber: v ? step.branchToStepNumber : null })}
                                                            options={[
                                                                { value: '', label: 'always' },
                                                                { value: 'if_no_reply', label: 'no reply yet' },
                                                                { value: 'if_replied', label: 'lead replied' },
                                                                ...(step.stepType === 'email' ? [
                                                                    { value: 'if_opened', label: 'a prior step was opened' },
                                                                    { value: 'if_not_opened', label: 'no prior opens' },
                                                                    { value: 'if_clicked', label: 'a prior step had a click' },
                                                                    { value: 'if_not_clicked', label: 'no clicks yet' },
                                                                ] : [
                                                                    { value: 'if_connection', label: 'lead accepted the connection' },
                                                                    { value: 'if_not_connection', label: 'still not connected' },
                                                                ]),
                                                            ]}
                                                        />
                                                    </div>
                                                    {step.condition && (
                                                        <>
                                                            <span className="text-[10px] text-gray-500 shrink-0">otherwise</span>
                                                            <div className="w-40">
                                                                <CustomSelect
                                                                    value={step.branchToStepNumber == null ? '' : String(step.branchToStepNumber)}
                                                                    onChange={(v) => updateStep(idx, { branchToStepNumber: v === '' ? null : parseInt(v) })}
                                                                    options={[
                                                                        { value: '', label: 'end sequence' },
                                                                        ...sequenceSteps
                                                                            .filter(s => s.stepNumber !== step.stepNumber)
                                                                            .map(s => ({ value: String(s.stepNumber), label: `jump to Step ${s.stepNumber}` })),
                                                                    ]}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { setPreviewVariantTab(0); setPreviewStepIndex(idx); }}
                                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-gray-600 hover:bg-gray-100 cursor-pointer bg-transparent border-none"
                                                title="Preview as recipient - Gmail · MacBook"
                                            >
                                                <Eye size={11} /> Preview as recipient
                                            </button>
                                            <button
                                                onClick={() => duplicateStep(idx)}
                                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-gray-600 hover:bg-gray-100 cursor-pointer bg-transparent border-none"
                                                title="Duplicate step"
                                            >
                                                <Copy size={11} /> Duplicate Step
                                            </button>
                                            {sequenceSteps.length > 1 && (
                                                <button onClick={() => removeStep(idx)} className="p-1.5 rounded hover:bg-red-50 cursor-pointer" title="Delete step"><Trash2 size={12} className="text-red-400" /></button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Channel-aware editor - email shows subject/preheader/body
                                        + A/B variants; LinkedIn touch points render LinkedInStepEditor;
                                        utility steps (find_linkedin_url) render a compact
                                        no-message card explaining what the step does + a
                                        warning if no enrichment providers are connected. */}
                                    {isLinkedInStepType(step.stepType) && (
                                        <LinkedInStepEditor
                                            step={step}
                                            onUpdate={(patch) => updateStep(idx, patch)}
                                            personalizationTokens={allTokens}
                                        />
                                    )}
                                    {step.stepType === 'find_linkedin_url' && (
                                        <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5', background: '#ECFEFF' }}>
                                            <div className="flex items-start gap-2 mb-2">
                                                <Search size={14} className="text-cyan-700 mt-0.5 shrink-0" />
                                                <div>
                                                    <div className="text-xs font-bold text-gray-900">Find LinkedIn URL via enrichment waterfall</div>
                                                    <p className="m-0 mt-1 text-[11px] text-gray-600 leading-snug">
                                                        Discovers the lead&apos;s LinkedIn profile using your connected enrichment providers. Contacts that already have a URL on file are skipped (no provider cost). Place this BEFORE any LinkedIn touch points so they have a URL to act on.
                                                    </p>
                                                </div>
                                            </div>
                                            {enrichmentProviders.length === 0 ? (
                                                <div className="mt-2 rounded-md px-2.5 py-2 flex items-start gap-2" style={{ border: '1px solid #FCD34D', background: '#FFFBEB' }}>
                                                    <AlertTriangle size={12} className="text-amber-700 mt-0.5 shrink-0" />
                                                    <div className="text-[11px] text-amber-900 leading-snug">
                                                        <span className="font-semibold">No enrichment provider connected.</span> This step will skip every contact until at least one provider is configured.{' '}
                                                        <a href="/dashboard/settings/enrichment" className="underline decoration-dotted hover:text-amber-950" target="_blank" rel="noreferrer">
                                                            Connect a provider →
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : enrichmentProviders.length === 1 ? (
                                                <div className="mt-2 text-[11px] text-gray-700">
                                                    Provider: <span className="font-semibold capitalize">{enrichmentProviders[0].code.toLowerCase()}</span>
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-[11px] text-gray-700">
                                                    Waterfall:{' '}
                                                    <span className="font-semibold">
                                                        {enrichmentProviders
                                                            .slice()
                                                            .sort((a, b) => a.order_index - b.order_index)
                                                            .map(p => p.code.charAt(0).toUpperCase() + p.code.slice(1).toLowerCase())
                                                            .join(' → ')}
                                                    </span>
                                                    <span className="text-gray-500"> · first hit wins. Configure order in Settings → Enrichment.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {step.stepType === 'email' && (<>
                                    {/* Subject + Body (Variant A / main) */}
                                    <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Variant A {step.variants.length > 0 && `(${Math.round(100 / (step.variants.length + 1))}%)`}</span>
                                            <div ref={templatePickerOpen === idx ? templatePickerRef : null} className="flex items-center gap-3 relative">
                                                <button
                                                    onClick={() => setTemplatePickerOpen(templatePickerOpen === idx ? null : idx)}
                                                    className="flex items-center gap-1 text-[10px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none"
                                                >
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                    Load from Template
                                                </button>
                                                {templatePickerOpen === idx && (
                                                    <div
                                                        className="absolute top-full right-0 mt-1 bg-white overflow-y-auto max-h-[280px] z-50"
                                                        style={{ border: '1px solid #D1CBC5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '280px' }}
                                                    >
                                                        <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b" style={{ borderColor: '#F0EBE3', background: '#FAFAF8' }}>
                                                            {savedTemplates.length > 0 ? `Choose template (${savedTemplates.length})` : 'No templates yet'}
                                                        </div>
                                                        {savedTemplates.length > 0 ? (
                                                            savedTemplates.map(t => (
                                                                <button
                                                                    key={t.id}
                                                                    onClick={() => {
                                                                        updateStep(idx, { subject: t.subject, preheader: t.preheader || '', bodyHtml: t.body_html });
                                                                        setTemplatePickerOpen(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 cursor-pointer transition-colors hover:bg-[#F5F1EA] bg-transparent border-none"
                                                                    style={{ borderBottom: '1px solid #F0EBE3' }}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-xs font-semibold text-gray-900 truncate">{t.name}</span>
                                                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize shrink-0">{t.category}</span>
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500 truncate">{t.subject}</div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-3 py-3">
                                                                <p className="text-[10px] text-gray-500 mb-2">Save reusable emails as templates for faster campaign creation.</p>
                                                                <a
                                                                    href="/dashboard/sequencer/templates"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 underline"
                                                                >
                                                                    Create your first template →
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => addVariant(idx)}
                                                    className="text-[10px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-none"
                                                >+ Add A/B Variant</button>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <AIAssistPanel
                                                key={`ai-step-${step.id}`}
                                                compact
                                                defaultIntent={idx === 0 ? 'intro' : idx === sequenceSteps.length - 1 && sequenceSteps.length >= 3 ? 'breakup' : 'follow_up'}
                                                stepNumber={idx + 1}
                                                totalSteps={sequenceSteps.length}
                                                onInsert={(subject, body_html) => updateStep(idx, { subject, bodyHtml: body_html })}
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                value={step.subject}
                                                onChange={e => updateStep(idx, { subject: e.target.value })}
                                                placeholder="Subject line... use {{first_name}} for personalization"
                                                className="w-full px-3 py-1.5 rounded-md text-xs outline-none"
                                                style={{ border: '1px solid #D1CBC5' }}
                                            />
                                        </div>
                                        <PreheaderInput
                                            value={step.preheader}
                                            onChange={(v) => updateStep(idx, { preheader: v })}
                                        />
                                        <RichTextEditor
                                            content={step.bodyHtml}
                                            onChange={html => updateStep(idx, { bodyHtml: html })}
                                            placeholder="Write your email body..."
                                            personalizationTokens={allTokens}
                                                signatures={signatures}
                                        />
                                    </div>

                                    {/* Variants B, C, etc. */}
                                    {step.variants.map((variant, vi) => (
                                        <div key={variant.id} className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                    Variant {variant.label} ({variant.weight}%)
                                                </span>
                                                <button onClick={() => removeVariant(idx, vi)} className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer">Remove</button>
                                            </div>
                                            {step.subject && step.bodyHtml && (
                                                <div className="mb-3">
                                                    <AIAssistPanel
                                                        key={`ai-variant-${variant.id}`}
                                                        compact
                                                        defaultIntent={idx === 0 ? 'intro' : 'follow_up'}
                                                        stepNumber={idx + 1}
                                                        totalSteps={sequenceSteps.length}
                                                        variantOf={{ subject: step.subject, body_html: step.bodyHtml }}
                                                        onInsert={(subject, body_html) => {
                                                            const updated = [...step.variants];
                                                            updated[vi] = { ...updated[vi], subject, bodyHtml: body_html };
                                                            updateStep(idx, { variants: updated });
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    value={variant.subject}
                                                    onChange={e => {
                                                        const updated = [...step.variants];
                                                        updated[vi] = { ...updated[vi], subject: e.target.value };
                                                        updateStep(idx, { variants: updated });
                                                    }}
                                                    placeholder="Subject line for variant..."
                                                    className="w-full px-3 py-1.5 rounded-md text-xs outline-none"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                />
                                            </div>
                                            <PreheaderInput
                                                value={variant.preheader}
                                                placeholder={`Preheader (falls back to step's preheader if empty)`}
                                                onChange={(v) => {
                                                    const updated = [...step.variants];
                                                    updated[vi] = { ...updated[vi], preheader: v };
                                                    updateStep(idx, { variants: updated });
                                                }}
                                            />
                                            <RichTextEditor
                                                content={variant.bodyHtml}
                                                onChange={html => {
                                                    const updated = [...step.variants];
                                                    updated[vi] = { ...updated[vi], bodyHtml: html };
                                                    updateStep(idx, { variants: updated });
                                                }}
                                                placeholder={`Write variant ${variant.label} body...`}
                                                personalizationTokens={allTokens}
                                                signatures={signatures}
                                            />
                                        </div>
                                    ))}
                                    </>)}

                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* ==================== STEP 4: MAILBOXES / SENDERS ==================== */}
                {currentStep === 3 && (
                    <div className="flex flex-col gap-4">
                      {sequenceHasEmail && (<>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Choose Mailboxes</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    Select which connected mailboxes send emails for this campaign. Mailboxes in healing, quarantine, or paused state are not selectable.
                                </p>
                            </div>
                            {(() => {
                                // Scope Select-all to the FILTERED set so the bulk action
                                // matches what the user can actually see on screen. With
                                // no filters this is the same as before (every selectable
                                // mailbox in the account).
                                const scope = filteredMailboxes.filter(m => m.selectable);
                                const scopeIds = new Set(scope.map(m => m.id));
                                const selectedInScope = scope.filter(m => selectedMailboxIds.has(m.id)).length;
                                const allInScopeSelected = scope.length > 0 && selectedInScope === scope.length;
                                return (
                                    <button
                                        onClick={() => {
                                            if (allInScopeSelected) {
                                                // Deselect only within scope; selections outside the
                                                // filter (e.g. previously picked then filter applied)
                                                // are preserved.
                                                const next = new Set(selectedMailboxIds);
                                                scopeIds.forEach(id => next.delete(id));
                                                setSelectedMailboxIds(next);
                                            } else {
                                                const next = new Set(selectedMailboxIds);
                                                scopeIds.forEach(id => next.add(id));
                                                setSelectedMailboxIds(next);
                                            }
                                        }}
                                        disabled={scope.length === 0}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer bg-transparent border disabled:opacity-30"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    >
                                        {allInScopeSelected
                                            ? `Deselect ${anyFilterActive ? 'filtered' : 'all'} (${scope.length})`
                                            : `Select ${anyFilterActive ? 'filtered' : 'all'} (${scope.length})`}
                                    </button>
                                );
                            })()}
                        </div>

                        {/* Filters + search - hidden until there's a non-trivial
                            list. Each filter is its own multi-select dropdown
                            (consistent with the unibox quality filter pattern). */}
                        {!mailboxesLoading && availableMailboxes.length > 2 && (
                            <MailboxFilterBar
                                mailboxes={availableMailboxes}
                                health={filterHealth}
                                provider={filterProvider}
                                utilization={filterUtilization}
                                search={mailboxSearch}
                                onHealth={setFilterHealth}
                                onProvider={setFilterProvider}
                                onUtilization={setFilterUtilization}
                                onSearch={setMailboxSearch}
                                bucketOf={mailboxHealth as (m: { mailbox_status: string; recovery_phase: string }) => 'paused' | 'in_recovery' | 'warning' | 'healthy'}
                                onClearAll={() => {
                                    setFilterHealth(new Set());
                                    setFilterProvider(new Set());
                                    setFilterUtilization(new Set());
                                    setMailboxSearch('');
                                }}
                            />
                        )}

                        {mailboxesLoading ? (
                            <div className="text-center py-12 text-xs text-gray-400">Loading mailboxes...</div>
                        ) : availableMailboxes.length === 0 ? (
                            <div className="text-center py-12 rounded-lg" style={{ border: '1px dashed #D1CBC5', background: '#FAFAF8' }}>
                                <div className="text-3xl mb-3">📬</div>
                                <p className="text-sm font-semibold text-gray-900 mb-1">No mailboxes connected</p>
                                <p className="text-[11px] text-gray-500 mb-4">You need at least one connected mailbox to launch a campaign.</p>
                                <a href="/dashboard/sequencer/accounts" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg no-underline">
                                    Connect a Mailbox →
                                </a>
                            </div>
                        ) : filteredMailboxes.length === 0 ? (
                            <div className="text-center py-10 rounded-lg" style={{ border: '1px dashed #D1CBC5', background: '#FAFAF8' }}>
                                <p className="text-sm font-semibold text-gray-900 mb-1">No mailboxes match these filters</p>
                                <p className="text-[11px] text-gray-500 mb-3">
                                    {availableMailboxes.length} mailbox{availableMailboxes.length === 1 ? '' : 'es'} hidden - clear filters to see them.
                                </p>
                                <button
                                    onClick={() => { setFilterHealth(new Set()); setFilterProvider(new Set()); setFilterUtilization(new Set()); }}
                                    className="px-3 py-1.5 text-[11px] font-semibold rounded-lg cursor-pointer bg-white border"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {filteredMailboxes.map(mb => {
                                    const isSelected = selectedMailboxIds.has(mb.id);
                                    const statusConfig = mb.recovery_phase === 'paused' || mb.mailbox_status === 'paused'
                                        ? { label: 'Paused', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' }
                                        : mb.recovery_phase === 'quarantine'
                                        ? { label: 'Quarantine', bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' }
                                        : mb.recovery_phase === 'restricted_send' || mb.recovery_phase === 'warm_recovery'
                                        ? { label: 'Healing', bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' }
                                        : mb.mailbox_status === 'warning'
                                        ? { label: 'Warning', bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' }
                                        : mb.connection_status !== 'active'
                                        ? { label: 'Disconnected', bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' }
                                        : { label: 'Healthy', bg: '#D1FAE5', text: '#065F46', dot: '#10B981' };

                                    const utilConfig = mb.utilization === 'overutilized'
                                        ? { label: 'Overutilized', color: '#DC2626' }
                                        : mb.utilization === 'underutilized'
                                        ? { label: 'Underutilized', color: '#D97706' }
                                        : { label: 'Balanced', color: '#059669' };

                                    return (
                                        <button
                                            key={mb.id}
                                            onClick={() => {
                                                if (!mb.selectable) return;
                                                const next = new Set(selectedMailboxIds);
                                                if (next.has(mb.id)) next.delete(mb.id); else next.add(mb.id);
                                                setSelectedMailboxIds(next);
                                            }}
                                            disabled={!mb.selectable}
                                            title={mb.disabled_reason || ''}
                                            className="text-left p-3 rounded-xl transition-all bg-transparent"
                                            style={{
                                                border: isSelected ? '2px solid #111827' : '1px solid #D1CBC5',
                                                background: isSelected ? '#F5F1EA' : '#FFFFFF',
                                                opacity: mb.selectable ? 1 : 0.45,
                                                cursor: mb.selectable ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        readOnly
                                                        disabled={!mb.selectable}
                                                        className="w-3.5 h-3.5 accent-gray-900 cursor-pointer shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-gray-900 truncate">{mb.display_name || mb.email}</div>
                                                        <div className="text-[10px] text-gray-500 truncate">{mb.email}</div>
                                                    </div>
                                                </div>
                                                <span
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                                                    style={{ background: statusConfig.bg, color: statusConfig.text }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusConfig.dot }} />
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Provider</span>
                                                    <span className="text-[10px] font-semibold text-gray-700 capitalize">{mb.provider}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: utilConfig.color }} />
                                                    <span className="text-[10px] font-semibold" style={{ color: utilConfig.color }}>{utilConfig.label}</span>
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-[9px] text-gray-500 mb-1">
                                                    <span>{mb.sends_today} / {mb.daily_send_limit} sends today</span>
                                                    <span>{mb.utilization_pct}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{ width: `${Math.min(mb.utilization_pct, 100)}%`, background: utilConfig.color }}
                                                    />
                                                </div>
                                            </div>

                                            {!mb.selectable && mb.disabled_reason && (
                                                <div className="mt-2 text-[9px] text-gray-500 italic">{mb.disabled_reason}</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Selection summary */}
                        {selectedMailboxIds.size > 0 && (
                            <div className="mt-1 p-3 rounded-lg" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                                <span className="text-xs font-semibold text-emerald-900">
                                    {selectedMailboxIds.size} mailbox{selectedMailboxIds.size === 1 ? '' : 'es'} selected
                                </span>
                                <span className="text-[10px] text-emerald-700 ml-2">
                                    · Combined daily capacity: {availableMailboxes.filter(m => selectedMailboxIds.has(m.id)).reduce((sum, m) => sum + m.daily_send_limit, 0).toLocaleString()} sends/day
                                </span>
                            </div>
                        )}
                      </>)}

                        {/* LinkedIn sender pool - only surfaced when the
                            sequence contains a linkedin_* step. Mirrors the
                            picker used by the LinkedIn-only wizard. */}
                        {sequenceHasLinkedIn && (
                            <div className="mt-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Linkedin size={14} strokeWidth={1.75} className="text-[#0A66C2]" />
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">LinkedIn sender pool</h3>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                Pick the LinkedIn accounts that will execute the LinkedIn steps in this sequence. Workspace caps and working-hours are enforced at dispatch time.
                                            </p>
                                        </div>
                                    </div>
                                    {availableLinkedInAccounts.length > 0 && (
                                        <button
                                            onClick={() => {
                                                const allIds = new Set(availableLinkedInAccounts.map(a => a.id));
                                                const allPicked = availableLinkedInAccounts.length > 0 && availableLinkedInAccounts.every(a => selectedLinkedInSenderIds.has(a.id));
                                                setSelectedLinkedInSenderIds(allPicked ? new Set() : allIds);
                                            }}
                                            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer bg-transparent border"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            {availableLinkedInAccounts.length > 0 && availableLinkedInAccounts.every(a => selectedLinkedInSenderIds.has(a.id))
                                                ? `Deselect all (${availableLinkedInAccounts.length})`
                                                : `Select all (${availableLinkedInAccounts.length})`}
                                        </button>
                                    )}
                                </div>

                                {linkedInAccountsLoading ? (
                                    <div className="flex items-center justify-center py-6 text-xs text-gray-500">
                                        <Loader2 size={14} className="animate-spin mr-2" /> Loading LinkedIn accounts…
                                    </div>
                                ) : availableLinkedInAccounts.length === 0 ? (
                                    <div className="rounded-lg p-4 text-center" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                        <p className="text-xs font-semibold text-amber-900 mb-2">No LinkedIn accounts connected</p>
                                        <p className="text-[11px] text-amber-800 mb-3">Connect at least one account before launching a campaign that includes LinkedIn steps.</p>
                                        <a
                                            href="/dashboard/linkedin/accounts"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block px-3 py-1.5 rounded-md bg-amber-600 text-white text-[11px] font-semibold no-underline"
                                        >
                                            Connect LinkedIn account →
                                        </a>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {availableLinkedInAccounts.map(a => {
                                            const picked = selectedLinkedInSenderIds.has(a.id);
                                            return (
                                                <button
                                                    key={a.id}
                                                    onClick={() => setSelectedLinkedInSenderIds(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(a.id)) next.delete(a.id); else next.add(a.id);
                                                        return next;
                                                    })}
                                                    className="text-left rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
                                                    style={{
                                                        background: picked ? '#EFF6FF' : '#FFFFFF',
                                                        border: picked ? '2px solid #0A66C2' : '1px solid #E8E3DC',
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold text-gray-900 truncate">{a.display_name}</div>
                                                            <div className="text-[10px] text-gray-500 capitalize">{a.account_type.replace(/_/g, ' ')}</div>
                                                        </div>
                                                        <span
                                                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                                                            style={{ background: a.status === 'OK' ? '#DCFCE7' : '#FEF3C7', color: a.status === 'OK' ? '#15803D' : '#B45309' }}
                                                        >
                                                            {a.status}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {selectedLinkedInSenderIds.size > 0 && (
                                    <div className="mt-2 p-3 rounded-lg" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                        <span className="text-xs font-semibold text-blue-900">
                                            {selectedLinkedInSenderIds.size} LinkedIn account{selectedLinkedInSenderIds.size === 1 ? '' : 's'} selected
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== STEP 5: SCHEDULE ==================== */}
                {currentStep === 4 && (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Timezone</label>
                                <CustomSelect
                                    value={timezone}
                                    onChange={setTimezone}
                                    options={TIMEZONES.map(tz => ({ value: tz.value, label: tz.label }))}
                                    searchable
                                    placeholder="Select timezone..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Daily Send Limit</label>
                                <input type="number" min={1} max={1000} value={dailyLimit} onChange={e => setDailyLimit(parseInt(e.target.value) || 50)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #D1CBC5' }} />
                                <p className="text-[10px] text-gray-400 mt-1">Max emails this campaign sends per day across all accounts.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gap Between Emails (minutes)</label>
                                <input type="number" min={1} max={120} value={sendGapMinutes} onChange={e => setSendGapMinutes(parseInt(e.target.value) || 17)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #D1CBC5' }} />
                                <p className="text-[10px] text-gray-400 mt-1">Time between each email sent per mailbox. Higher = more natural to spam filters.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sending Window Start</label>
                                <TimePicker value={startTime} onChange={setStartTime} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sending Window End</label>
                                <TimePicker value={endTime} onChange={setEndTime} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Active Days</label>
                            <div className="flex gap-2">
                                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        className="w-10 h-10 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors"
                                        style={{
                                            background: activeDays.includes(day) ? '#111827' : '#F3F4F6',
                                            color: activeDays.includes(day) ? '#FFFFFF' : '#6B7280',
                                        }}
                                    >{day}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Start Date (optional)</label>
                            <DatePicker value={startDate} onChange={setStartDate} placeholder="Start immediately" />
                            <p className="text-[10px] text-gray-400 mt-1">Leave empty to start immediately on launch.</p>
                        </div>
                    </div>
                )}

                {/* ==================== STEP 6: SETTINGS ==================== */}
                {currentStep === 5 && (
                    <div className="flex flex-col gap-4">
                        {/* ESP Routing Toggle - prominent placement */}
                        <div className="p-4 rounded-xl" style={{ border: espRouting ? '2px solid #059669' : '1px solid #DC2626', background: espRouting ? '#ECFDF510' : '#FEF2F210' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-xs font-bold text-gray-900">ESP-Aware Routing</div>
                                        {!espRouting && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">RECOMMENDED TO KEEP ON</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed m-0">
                                        Automatically sends each email through the mailbox with the best delivery history for that recipient&apos;s email provider (Gmail, Outlook, etc.). Improves inbox placement rates by 10-20%. Mailboxes still receive equal send volume - routing only adjusts which leads go to which mailbox.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEspRouting(!espRouting)}
                                    className="w-10 h-5 rounded-full cursor-pointer transition-colors relative shrink-0 ml-4"
                                    style={{ background: espRouting ? '#059669' : '#D1CBC5' }}
                                >
                                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform" style={{ left: espRouting ? '22px' : '2px' }} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-900">Sending Behavior</h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Stop sequence on reply', desc: 'When a lead replies, stop sending follow-ups', value: stopOnReply, onChange: setStopOnReply },
                                { label: 'Stop sequence on bounce', desc: 'When an email hard bounces, stop the sequence for that lead', value: stopOnBounce, onChange: setStopOnBounce },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                                        <div className="text-[10px] text-gray-400">{item.desc}</div>
                                    </div>
                                    <button
                                        onClick={() => item.onChange(!item.value)}
                                        className="w-10 h-5 rounded-full cursor-pointer transition-colors relative"
                                        style={{ background: item.value ? '#111827' : '#D1CBC5' }}
                                    >
                                        <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform" style={{ left: item.value ? '22px' : '2px' }} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 mt-2">Tracking</h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Track opens', desc: 'Embed a tracking pixel to detect when emails are opened', value: trackOpens, onChange: setTrackOpens },
                                { label: 'Track clicks', desc: 'Wrap links to detect when recipients click', value: trackClicks, onChange: setTrackClicks },
                                { label: 'Include unsubscribe link', desc: 'Required by law (CAN-SPAM, CASL, GDPR). Adds one-click unsubscribe + List-Unsubscribe headers. Default ON - turn off only for purely transactional/internal mail.', value: includeUnsubscribe, onChange: setIncludeUnsubscribe },
                                { label: 'EU compliance mode (ePrivacy)', desc: 'Recommended for campaigns sent to EU recipients. Suppresses open-tracking pixel and adds an explicit no-tracking notice to the footer.', value: euComplianceMode, onChange: setEuComplianceMode },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                                        <div className="text-[10px] text-gray-400">{item.desc}</div>
                                    </div>
                                    <button
                                        onClick={() => item.onChange(!item.value)}
                                        className="w-10 h-5 rounded-full cursor-pointer transition-colors relative"
                                        style={{ background: item.value ? '#111827' : '#D1CBC5' }}
                                    >
                                        <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform" style={{ left: item.value ? '22px' : '2px' }} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Custom Tracking Domain (optional)</label>
                            <input
                                type="text"
                                value={trackingDomain}
                                onChange={e => setTrackingDomain(e.target.value)}
                                placeholder="e.g. track.yourdomain.com"
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                                style={{ border: '1px solid #D1CBC5' }}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Uses Superkabe default tracking domain if left empty.</p>
                        </div>
                    </div>
                )}

                {/* ==================== STEP 7: REVIEW ==================== */}
                {currentStep === 6 && (
                    <div className="flex flex-col gap-4">
                        {/* Incomplete steps warning */}
                        {!allStepsComplete() && (
                            <div className="p-3 rounded-lg flex flex-col gap-1.5" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                <div className="text-xs font-semibold text-amber-800">Complete these steps before launching:</div>
                                {!isStepComplete(0) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(0)}>Step 1 - Campaign name is required</div>}
                                {!isStepComplete(1) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(1)}>Step 2 - Import at least one lead</div>}
                                {!isStepComplete(2) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(2)}>Step 3 - Add subject line and email body to Step 1</div>}
                                {!isStepComplete(3) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(3)}>Step 4 - Select at least one active sending day</div>}
                            </div>
                        )}

                        {/* LinkedIn coverage preflight - only shown when the sequence
                            has at least one linkedin_* touch point. Tells the operator
                            how many imported leads have a LinkedIn URL on file and
                            therefore can actually be acted on by those steps. Goes
                            quiet if a find_linkedin_url step precedes the first
                            linkedin_* step (the waterfall will fill the gaps). */}
                        {(() => {
                            const firstLinkedInIdx = sequenceSteps.findIndex(s => isLinkedInStepType(s.stepType));
                            if (firstLinkedInIdx === -1) return null;
                            const findStepIdx = sequenceSteps.findIndex(s => s.stepType === 'find_linkedin_url');
                            const findCoversTouches = findStepIdx !== -1 && findStepIdx < firstLinkedInIdx;

                            const totalLeads = leads.length;
                            if (totalLeads === 0) return null;
                            const withLinkedIn = leads.filter(l => {
                                const v = (l.linkedin_url || l.linkedin || l['linkedin_profile_url'] || '').toString();
                                return v.trim().length > 0;
                            }).length;
                            const missing = totalLeads - withLinkedIn;
                            const pct = Math.round((withLinkedIn / totalLeads) * 100);

                            if (missing === 0) {
                                return (
                                    <div className="p-3 rounded-lg flex items-start gap-2 text-[11px]" style={{ border: '1px solid #D1CBC5', background: '#F0FDF4' }}>
                                        <Linkedin size={13} className="text-emerald-700 mt-0.5 shrink-0" />
                                        <div className="text-gray-700">
                                            All <span className="font-semibold">{totalLeads.toLocaleString()}</span> leads have a LinkedIn URL on file - every LinkedIn step will fire.
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="p-3 rounded-lg flex items-start gap-2 text-[11px]" style={{ border: '1px solid #D1CBC5', background: findCoversTouches ? '#ECFEFF' : '#FFFBEB' }}>
                                    {findCoversTouches
                                        ? <Search size={13} className="text-cyan-700 mt-0.5 shrink-0" />
                                        : <AlertTriangle size={13} className="text-amber-700 mt-0.5 shrink-0" />}
                                    <div className="text-gray-700">
                                        <div className="font-semibold text-gray-900">
                                            LinkedIn coverage: {withLinkedIn.toLocaleString()} / {totalLeads.toLocaleString()} ({pct}%)
                                        </div>
                                        {findCoversTouches ? (
                                            <p className="m-0 mt-0.5 text-gray-600 leading-snug">
                                                A Find LinkedIn URL step runs first - the {missing.toLocaleString()} missing URL{missing === 1 ? '' : 's'} will be enriched before any LinkedIn touch point.{enrichmentProviders.length === 0 ? ' Connect an enrichment provider in Settings → Enrichment to make this work.' : ''}
                                            </p>
                                        ) : (
                                            <p className="m-0 mt-0.5 text-gray-600 leading-snug">
                                                {missing.toLocaleString()} contact{missing === 1 ? '' : 's'} will skip every LinkedIn step. They&apos;ll still receive email steps. Add a <button type="button" onClick={() => setCurrentStep(2)} className="underline decoration-dotted bg-transparent border-none cursor-pointer text-amber-900 p-0">Find LinkedIn URL</button> step before the first LinkedIn touch point to enrich missing URLs.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        <h3 className="text-sm font-bold text-gray-900">Campaign Summary</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Campaign</div>
                                <div className="text-sm font-bold text-gray-900">{campaignName}</div>
                                {selectedTagIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {allTags
                                            .filter(t => selectedTagIds.includes(t.id))
                                            .map(t => (
                                                <span
                                                    key={t.id}
                                                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                                                    style={{ background: t.color ? `${t.color}22` : '#F3F4F6', color: t.color || '#374151' }}
                                                >
                                                    {t.name}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Leads</div>
                                <div className="text-sm font-bold text-gray-900">{leads.length.toLocaleString()}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5">from {leadsFileName || 'manual entry'}</div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Sequence</div>
                                <div className="text-sm font-bold text-gray-900">{sequenceSteps.length} step{sequenceSteps.length !== 1 ? 's' : ''}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5">{sequenceSteps.reduce((n, s) => n + s.variants.length, 0)} A/B variants</div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Schedule</div>
                                <div className="text-sm font-bold text-gray-900">{startTime} – {endTime}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5">{activeDays.join(', ')} · {TIMEZONES.find(t => t.value === timezone)?.label || timezone}</div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Estimated Duration</div>
                            <div className="text-sm text-gray-900">
                                {leads.length} leads × {sequenceSteps.length} steps = <strong>{(leads.length * sequenceSteps.length).toLocaleString()} emails</strong>.
                                At {dailyLimit}/day → <strong>~{Math.ceil((leads.length * sequenceSteps.length) / dailyLimit)} days</strong> to complete.
                            </div>
                        </div>

                        <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                            <div className="text-[10px] text-gray-400 uppercase font-semibold mb-2">Settings</div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex justify-between"><span className="text-gray-500">ESP routing</span><span className="font-semibold" style={{ color: espRouting ? '#059669' : '#6B7280' }}>{espRouting ? 'On' : 'Off'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Stop on reply</span><span className="font-semibold text-gray-900">{stopOnReply ? 'Yes' : 'No'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Stop on bounce</span><span className="font-semibold text-gray-900">{stopOnBounce ? 'Yes' : 'No'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Track opens</span><span className="font-semibold text-gray-900">{trackOpens ? 'Yes' : 'No'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Track clicks</span><span className="font-semibold text-gray-900">{trackClicks ? 'Yes' : 'No'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Unsubscribe link</span><span className="font-semibold text-gray-900">{includeUnsubscribe ? 'Yes' : 'No'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Daily limit</span><span className="font-semibold text-gray-900">{dailyLimit}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Send gap</span><span className="font-semibold text-gray-900">{sendGapMinutes} min</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Mailboxes</span><span className="font-semibold text-gray-900">{selectedMailboxIds.size}</span></div>
                            </div>
                        </div>

                        {/* ─── Inline Live Preview ─── */}
                        <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div>
                                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                        <Eye size={13} /> Live Preview
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        See the exact email a recipient will receive - variables substituted with real lead data.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Email step dropdown - platform-themed */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-gray-500 font-semibold uppercase">Email</span>
                                        <div className="w-36">
                                            <CustomSelect
                                                value={String(reviewStepIdx)}
                                                onChange={(v) => { setReviewStepIdx(Number(v)); setReviewVariantIdx(0); }}
                                                options={sequenceSteps.map((s, i) => ({ value: String(i), label: `Email ${s.stepNumber}` }))}
                                                placeholder="Select email"
                                            />
                                        </div>
                                    </div>
                                    {/* Lead picker dropdown - platform-themed, searchable */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-gray-500 font-semibold uppercase">Lead</span>
                                        <div className="w-64">
                                            <CustomSelect
                                                value={reviewLeadKey}
                                                onChange={setReviewLeadKey}
                                                searchable={availableReviewLeads.length > 5}
                                                options={[
                                                    { value: '__demo__', label: 'Demo lead - Alex Morgan · Acme' },
                                                    ...availableReviewLeads.map(l => ({
                                                        value: l.email,
                                                        label: `${[l.first_name, l.last_name].filter(Boolean).join(' ') || l.email} · ${l.email}`,
                                                    })),
                                                ]}
                                                placeholder="Choose a lead"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variant tabs - only if the selected step has variants */}
                            {sequenceSteps[reviewStepIdx] && sequenceSteps[reviewStepIdx].variants.length > 0 && (
                                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                                    {[{ label: 'A', weight: Math.round(100 / (sequenceSteps[reviewStepIdx].variants.length + 1)) }]
                                        .concat(sequenceSteps[reviewStepIdx].variants.map(v => ({ label: v.label, weight: v.weight })))
                                        .map((v, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setReviewVariantIdx(i)}
                                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                                                    reviewVariantIdx === i
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                                }`}
                                                style={{ border: '1px solid #D1CBC5' }}
                                            >
                                                Variant {v.label} ({v.weight}%)
                                            </button>
                                        ))}
                                </div>
                            )}

                            {/* Rendered email card */}
                            {(() => {
                                const step = sequenceSteps[reviewStepIdx];
                                if (!step) return null;
                                const source = reviewVariantIdx === 0
                                    ? { subject: step.subject, preheader: step.preheader, bodyHtml: step.bodyHtml }
                                    : (() => {
                                        const v = step.variants[reviewVariantIdx - 1];
                                        return v ? { subject: v.subject, preheader: v.preheader || step.preheader, bodyHtml: v.bodyHtml } : null;
                                    })();
                                if (!source) return null;
                                return (
                                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #D1CBC5', background: '#FAFAF8' }}>
                                        <div className="px-3 py-2 flex items-center gap-4 bg-white" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                            <span className="text-[10px] text-gray-400 uppercase font-semibold w-12 shrink-0">To</span>
                                            <span className="text-xs text-gray-900">
                                                {previewLead.full_name || [previewLead.first_name, previewLead.last_name].filter(Boolean).join(' ') || 'Recipient'} &lt;{previewLead.email || 'recipient@example.com'}&gt;
                                            </span>
                                        </div>
                                        <div className="px-3 py-2 flex items-center gap-4 bg-white" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                            <span className="text-[10px] text-gray-400 uppercase font-semibold w-12 shrink-0">Subject</span>
                                            <span
                                                className="text-sm font-semibold text-gray-900 flex-1"
                                                dangerouslySetInnerHTML={{ __html: renderTemplate(source.subject, previewLead) || '<span class="text-gray-400 italic font-normal">No subject yet</span>' }}
                                            />
                                        </div>
                                        {source.preheader && (
                                            <div className="px-3 py-2 flex items-center gap-4 bg-white" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold w-16 shrink-0">Preheader</span>
                                                <span
                                                    className="text-xs text-gray-600 flex-1 italic"
                                                    dangerouslySetInnerHTML={{ __html: renderTemplate(source.preheader, previewLead) }}
                                                />
                                            </div>
                                        )}
                                        <div className="px-3 py-4 bg-white">
                                            <div
                                                className="text-sm text-gray-900 prose prose-sm max-w-none"
                                                style={{ lineHeight: 1.55 }}
                                                dangerouslySetInnerHTML={{ __html: renderTemplate(source.bodyHtml, previewLead) || '<p class="text-gray-400 italic">No body content yet.</p>' }}
                                            />
                                        </div>
                                        <div className="px-3 py-1.5 text-[9px] text-gray-400" style={{ borderTop: '1px solid #E8E3DC' }}>
                                            Tracking pixel, click-wrappers and unsubscribe footer are added automatically at send time.
                                        </div>
                                    </div>
                                );
                            })()}
                            {reviewLeadKey === '__demo__' && availableReviewLeads.length === 0 && (
                                <p className="text-[10px] text-gray-500 mt-2">Import leads in the Leads step to preview with real data.</p>
                            )}

                            {/* Recipient preview - across mainstream clients, with the lead's
                                actual data substituted. Helps catch truncation, AI-summary
                                surprises and rendering issues before launch. */}
                            {(() => {
                                const step = sequenceSteps[reviewStepIdx];
                                if (!step) return null;
                                const source = reviewVariantIdx === 0
                                    ? { subject: step.subject, preheader: step.preheader, bodyHtml: step.bodyHtml }
                                    : (() => {
                                        const v = step.variants[reviewVariantIdx - 1];
                                        return v ? { subject: v.subject, preheader: v.preheader || step.preheader, bodyHtml: v.bodyHtml } : null;
                                    })();
                                if (!source) return null;
                                return (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px dashed #D1CBC5' }}>
                                        <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                            <Eye size={12} /> How it lands across clients
                                        </div>
                                        <RecipientPreviewPanel
                                            subject={renderTemplate(source.subject, previewLead)}
                                            preheader={renderTemplate(source.preheader || '', previewLead)}
                                            bodyHtml={renderTemplate(source.bodyHtml, previewLead)}
                                            senderName={previewSender.name}
                                            senderEmail={previewSender.email}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>

            {/* Launch/Save error banner */}
            {launchError && (
                <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-red-900 mb-0.5">Unable to launch campaign</div>
                        <div className="text-xs text-red-800">{launchError}</div>
                        {launchError.toLowerCase().includes('no connected accounts') || launchError.toLowerCase().includes('no mailbox') ? (
                            <a href="/dashboard/sequencer/accounts" className="inline-block mt-2 text-xs font-semibold text-red-700 underline hover:text-red-900">Connect a mailbox →</a>
                        ) : null}
                    </div>
                    <button onClick={() => setLaunchError('')} className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none p-1">✕</button>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    <ChevronLeft size={12} /> Back
                </button>

                <div className="flex items-center gap-2">
                    {/* Secondary action - only shown when it's semantically distinct from the primary:
                        - Create mode: "Save as Draft" (primary launches)
                        - Editing a draft: "Save Changes" (primary is "Save & Launch")
                        Hidden when editing an already-launched campaign - primary is already "Save Changes". */}
                    {currentStep === 6 && !(isEditMode && isAlreadyLaunched) && (
                        <button
                            onClick={handleSaveDraft}
                            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-gray-600 hover:bg-gray-50"
                            style={{ border: '1px solid #D1CBC5' }}
                        >
                            {isEditMode ? 'Save Changes' : 'Save as Draft'}
                        </button>
                    )}

                    {currentStep < 6 ? (
                        <button
                            onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                            className="flex items-center gap-1.5 px-5 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800 transition-colors"
                        >
                            Next <ChevronRight size={12} />
                        </button>
                    ) : (
                        <button
                            onClick={handleLaunch}
                            disabled={!allStepsComplete()}
                            className="flex items-center gap-1.5 px-5 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={!allStepsComplete() ? 'Complete all steps before launching' : ''}
                        >
                            <Rocket size={12} /> {isEditMode ? (isAlreadyLaunched ? 'Save Changes' : 'Save & Launch') : 'Launch Campaign'}
                        </button>
                    )}
                </div>
            </div>

            {/* Preview Modal - recipient preview on the user's chosen client + device.
                Variables are silently substituted with the demo lead so the user sees
                what the recipient actually receives. */}
            {previewStepIndex !== null && sequenceSteps[previewStepIndex] && (() => {
                const step = sequenceSteps[previewStepIndex];
                const renders = [
                    { label: 'A', weight: Math.round(100 / (step.variants.length + 1)), subject: step.subject, preheader: step.preheader, bodyHtml: step.bodyHtml },
                    ...step.variants.map(v => ({ label: v.label, weight: v.weight, subject: v.subject, preheader: v.preheader || step.preheader, bodyHtml: v.bodyHtml })),
                ];
                const activeIdx = Math.min(previewVariantTab, renders.length - 1);
                const active = renders[activeIdx];
                const renderedSubject = renderTemplate(active.subject, DEMO_LEAD);
                const renderedPreheader = renderTemplate(active.preheader || '', DEMO_LEAD);
                const renderedBody = renderTemplate(active.bodyHtml, DEMO_LEAD);
                return (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
                        style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setPreviewStepIndex(null); }}
                    >
                        <div className="bg-white rounded-2xl w-full max-w-[1480px] h-[94vh] flex flex-col overflow-hidden" style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }}>
                            {/* Header */}
                            <div className="px-6 py-4 flex items-center justify-between bg-white" style={{ borderBottom: '1px solid #E5E5E5' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                                        <Eye size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-neutral-900">Preview as recipient</h2>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            Step {step.stepNumber} · this is exactly what your prospect will see when they receive this email.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {renders.length > 1 && (
                                        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5">
                                            {renders.map((r, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setPreviewVariantTab(i)}
                                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                                                        activeIdx === i ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    Variant {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setPreviewStepIndex(null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                                    >
                                        <X size={14} />
                                        Close
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto bg-neutral-50 px-6 py-6">
                                <RecipientPreviewPanel
                                    subject={renderedSubject}
                                    preheader={renderedPreheader}
                                    bodyHtml={renderedBody}
                                    senderName={previewSender.name}
                                    senderEmail={previewSender.email}
                                />
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

/**
 * PreheaderInput - small reusable field for the preheader.
 *
 * Renders with the same styling language as the subject input. Cap hint
 * at 100 chars is informational only (Gmail mobile shows ~50–90, Outlook
 * up to ~140); we let the user write longer if they want and the client
 * will truncate. Empty value is the no-preheader sentinel and is the
 * recommended default for transactional-feeling sequences.
 */
function PreheaderInput({
    value,
    onChange,
    placeholder = 'Preheader shown next to subject in inbox (optional)',
}: {
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
}) {
    const len = value.length;
    const tone = len === 0 ? 'text-gray-400' : len > 100 ? 'text-amber-600' : 'text-gray-400';
    return (
        <div className="mb-2 relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-1.5 pr-12 rounded-md text-xs outline-none"
                style={{ border: '1px dashed #D1CBC5', background: '#FAFAF8' }}
            />
            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] tabular-nums ${tone}`}>{len}</span>
        </div>
    );
}

/**
 * LoadSavedSequence - picks a saved sequence and clones its steps into
 * the wizard's `sequenceSteps` state. Confirms before replacing existing
 * non-empty step content so the user can't lose hand-authored work to a
 * misclick.
 */
function LoadSavedSequence({
    currentSteps,
    onLoad,
}: {
    currentSteps: SequenceStepData[];
    onLoad: (steps: SequenceStepData[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [sequences, setSequences] = useState<Array<{ id: string; name: string; step_count: number; category: string; ai_model_used: string | null }>>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [pickingId, setPickingId] = useState<string | null>(null);
    const [pendingPickId, setPendingPickId] = useState<string | null>(null);

    const hasContent = currentSteps.some(s => s.subject.trim() || s.bodyHtml.trim());

    const fetchList = async () => {
        setLoadingList(true);
        try {
            const data = await apiClient<Array<{ id: string; name: string; step_count: number; category: string; ai_model_used: string | null }>>('/api/sequencer/sequences');
            setSequences(Array.isArray(data) ? data : []);
        } catch { /* non-fatal */ }
        finally { setLoadingList(false); }
    };

    const handleOpen = () => {
        setOpen(true);
        if (sequences.length === 0) fetchList();
    };

    const handlePick = async (id: string) => {
        if (hasContent) {
            setPendingPickId(id);
            return;
        }
        await doPick(id);
    };

    const doPick = async (id: string) => {
        setPickingId(id);
        try {
            const full = await apiClient<{
                steps: Array<{ step_number: number; delay_days: number; delay_hours: number; subject: string; preheader: string; body_html: string }>;
            }>(`/api/sequencer/sequences/${id}`);
            // Convert backend step shape → wizard SequenceStepData shape.
            // Saved sequences are email-only - they predate multi-channel.
            const loaded: SequenceStepData[] = (full.steps || []).map(s => ({
                id: safeRandomUUID(),
                stepNumber: s.step_number,
                stepType: 'email' as WizardStepType,
                delayDays: s.delay_days,
                delayHours: s.delay_hours,
                subject: s.subject || '',
                preheader: s.preheader || '',
                bodyHtml: s.body_html || '',
                stepConfig: {},
                variants: [],
            }));
            if (loaded.length === 0) {
                toast.error('That sequence has no steps');
                return;
            }
            onLoad(loaded);
            setOpen(false);
            toast.success(`Loaded ${loaded.length} step${loaded.length === 1 ? '' : 's'} from sequence`);
        } catch (err) {
            toast.error((err as Error)?.message || 'Failed to load sequence');
        } finally {
            setPickingId(null);
        }
    };

    return (
        <div className="rounded-lg flex items-center gap-2 px-3 py-2" style={{ background: '#F9FAFB', border: '1px dashed #D1CBC5' }}>
            <Sparkles size={12} className="text-indigo-600 shrink-0" />
            <div className="flex-1 text-[11px] text-gray-700">
                <span className="font-semibold">Skip the blank page</span> - load steps from a saved sequence.
            </div>
            <button
                type="button"
                onClick={handleOpen}
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-transparent border-none cursor-pointer"
            >
                Load from sequence →
            </button>

            <ConfirmActionModal
                isOpen={pendingPickId !== null}
                title="Replace your current steps?"
                icon="🔄"
                message="Loading a saved sequence will overwrite the steps you've authored here."
                consequences={['Your current subject lines, preheaders, and bodies will be replaced.', 'Variants and step-config (LinkedIn step types) will be cleared - saved sequences are email-only.']}
                confirmLabel="Replace steps"
                variant="warning"
                loading={pickingId !== null}
                onConfirm={async () => {
                    const id = pendingPickId;
                    if (!id) return;
                    setPendingPickId(null);
                    await doPick(id);
                }}
                onCancel={() => { if (pickingId === null) setPendingPickId(null); }}
            />

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }} onClick={() => setOpen(false)}>
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 m-0">Load a saved sequence</h3>
                                <p className="text-[11px] text-gray-500 m-0 mt-0.5">Its steps will be cloned into this campaign.</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1">
                                <ChevronRight size={16} className="rotate-90" />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-3">
                            {loadingList ? (
                                <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
                                    <Loader2 size={11} className="animate-spin" /> Loading sequences…
                                </div>
                            ) : sequences.length === 0 ? (
                                <p className="text-xs text-gray-500 py-6 text-center">
                                    No saved sequences yet. Build one from <strong>Templates → Sequences</strong>.
                                </p>
                            ) : (
                                <ul className="m-0 p-0 list-none flex flex-col gap-1">
                                    {sequences.map(s => (
                                        <li key={s.id}>
                                            <button
                                                type="button"
                                                onClick={() => handlePick(s.id)}
                                                disabled={pickingId !== null}
                                                className="w-full text-left px-3 py-2 rounded-lg cursor-pointer bg-white hover:bg-gray-50 border disabled:opacity-50"
                                                style={{ border: '1px solid #E5E7EB' }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-semibold text-gray-900 truncate">{s.name}</span>
                                                    {pickingId === s.id && <Loader2 size={11} className="animate-spin text-gray-400" />}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-500">{s.step_count} step{s.step_count === 1 ? '' : 's'}</span>
                                                    <span className="text-[10px] text-gray-400">·</span>
                                                    <span className="text-[10px] text-gray-500">{s.category}</span>
                                                    {s.ai_model_used && (
                                                        <span className="text-[9px] text-indigo-700 font-bold ml-1 inline-flex items-center gap-0.5">
                                                            <Sparkles size={8} /> AI
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


/**
 * Mailbox filter bar - three dropdowns + a search input.
 *
 * Uses the canonical `MultiSelectDropdown` component (same one the
 * contacts page uses for company / title / source / tag filters) so the
 * theme - borders, hover, checkbox, search behaviour - is identical
 * across every filter surface in the app. Per the dashboard convention,
 * NEVER lay filter options out as a chip strip; always a dropdown.
 */
interface FilterMailbox {
    id: string;
    email: string;
    display_name: string | null;
    provider: 'google' | 'microsoft' | 'smtp';
    utilization: 'underutilized' | 'balanced' | 'overutilized';
    mailbox_status: string;
    recovery_phase: string;
}

function MailboxFilterBar({
    mailboxes,
    health, provider, utilization, search,
    onHealth, onProvider, onUtilization, onSearch,
    bucketOf, onClearAll,
}: {
    mailboxes: FilterMailbox[];
    health: Set<string>;
    provider: Set<string>;
    utilization: Set<string>;
    search: string;
    onHealth: (s: Set<string>) => void;
    onProvider: (s: Set<string>) => void;
    onUtilization: (s: Set<string>) => void;
    onSearch: (s: string) => void;
    bucketOf: (m: { mailbox_status: string; recovery_phase: string }) => 'paused' | 'in_recovery' | 'warning' | 'healthy';
    onClearAll: () => void;
}) {
    // Pre-count each option value so the dropdown rows can show "(N)" -
    // helps the operator anticipate the result set before committing.
    const counts = {
        health: { healthy: 0, warning: 0, in_recovery: 0, paused: 0 } as Record<string, number>,
        provider: { google: 0, microsoft: 0, smtp: 0 } as Record<string, number>,
        utilization: { underutilized: 0, balanced: 0, overutilized: 0 } as Record<string, number>,
    };
    for (const m of mailboxes) {
        counts.health[bucketOf(m)] += 1;
        counts.provider[m.provider] = (counts.provider[m.provider] || 0) + 1;
        counts.utilization[m.utilization] = (counts.utilization[m.utilization] || 0) + 1;
    }

    // Bridge Set<string> ↔ string[] for the canonical component.
    const toArr = (s: Set<string>) => Array.from(s);
    const fromArr = (a: string[]) => new Set(a);
    // Small colored dot used as the per-option icon - matches the
    // "tag swatch" pattern in the contacts page tag dropdown without
    // introducing a new visual primitive.
    const Dot = ({ color }: { color: string }) => (
        <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: color, display: 'inline-block' }}
        />
    );

    const anyActive =
        health.size > 0 || provider.size > 0 || utilization.size > 0 || search.trim().length > 0;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search - mirrors the contacts-page search affordance. */}
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-[240px] pl-7 pr-3 py-2 text-xs rounded-lg outline-none bg-white"
                    style={{ border: '1px solid #D1CBC5' }}
                />
                <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
            </div>

            <div className="w-[170px]">
                <MultiSelectDropdown
                    placeholder="All health"
                    selected={toArr(health)}
                    onChange={(arr) => onHealth(fromArr(arr))}
                    options={[
                        { value: 'healthy',     label: `Healthy (${counts.health.healthy})`,         icon: <Dot color="#10B981" /> },
                        { value: 'warning',     label: `Warning (${counts.health.warning})`,         icon: <Dot color="#F59E0B" /> },
                        { value: 'in_recovery', label: `In recovery (${counts.health.in_recovery})`, icon: <Dot color="#F97316" /> },
                        { value: 'paused',      label: `Paused (${counts.health.paused})`,           icon: <Dot color="#EF4444" /> },
                    ]}
                />
            </div>
            <div className="w-[170px]">
                <MultiSelectDropdown
                    placeholder="All providers"
                    selected={toArr(provider)}
                    onChange={(arr) => onProvider(fromArr(arr))}
                    options={[
                        { value: 'google',    label: `Gmail (${counts.provider.google})`,        icon: <Dot color="#374151" /> },
                        { value: 'microsoft', label: `Outlook (${counts.provider.microsoft})`,   icon: <Dot color="#0EA5E9" /> },
                        { value: 'smtp',      label: `SMTP / Relay (${counts.provider.smtp})`,   icon: <Dot color="#8B5CF6" /> },
                    ]}
                />
            </div>
            <div className="w-[180px]">
                <MultiSelectDropdown
                    placeholder="All utilization"
                    selected={toArr(utilization)}
                    onChange={(arr) => onUtilization(fromArr(arr))}
                    options={[
                        { value: 'underutilized', label: `Underutilized (${counts.utilization.underutilized})`, icon: <Dot color="#3B82F6" /> },
                        { value: 'balanced',      label: `Balanced (${counts.utilization.balanced})`,           icon: <Dot color="#10B981" /> },
                        { value: 'overutilized',  label: `Overutilized (${counts.utilization.overutilized})`,   icon: <Dot color="#F59E0B" /> },
                    ]}
                />
            </div>

            {anyActive && (
                <button
                    type="button"
                    onClick={onClearAll}
                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer underline"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}

/**
 * AddStepDropdown - single "+ Add step" button that opens a channel-grouped
 * menu of step types. Replaces the legacy email-only "+ Add Step" button so
 * operators can mix LinkedIn touch points into an email sequence (and
 * vice-versa).
 */
function AddStepDropdown({ onPick }: { onPick: (t: WizardStepType) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-50 bg-transparent"
                style={{ border: '1px dashed #D1CBC5' }}
            >
                <Plus size={10} /> Add step <ChevronDown size={10} />
            </button>
            {open && (
                <div
                    className="absolute top-full left-0 mt-1 bg-white z-50 overflow-hidden"
                    style={{ minWidth: 280, border: '1px solid #D1CBC5', borderRadius: 10, boxShadow: '0 8px 20px rgba(0,0,0,0.10)' }}
                >
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400" style={{ borderBottom: '1px solid #F0EBE3', background: '#FAFAF8' }}>
                        Email
                    </div>
                    <StepPickerRow type="email" onPick={(t) => { onPick(t); setOpen(false); }} />
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400" style={{ borderTop: '1px solid #F0EBE3', borderBottom: '1px solid #F0EBE3', background: '#FAFAF8' }}>
                        LinkedIn
                    </div>
                    {([
                        'linkedin_view_profile',
                        'linkedin_follow',
                        'linkedin_like_post',
                        'linkedin_connection_request',
                        'linkedin_message',
                        'linkedin_inmail',
                    ] as WizardStepType[]).map(t => (
                        <StepPickerRow key={t} type={t} onPick={(picked) => { onPick(picked); setOpen(false); }} />
                    ))}
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400" style={{ borderTop: '1px solid #F0EBE3', borderBottom: '1px solid #F0EBE3', background: '#FAFAF8' }}>
                        Utility
                    </div>
                    <StepPickerRow type="find_linkedin_url" onPick={(picked) => { onPick(picked); setOpen(false); }} />
                </div>
            )}
        </div>
    );
}

function StepPickerRow({ type, onPick }: { type: WizardStepType; onPick: (t: WizardStepType) => void }) {
    const meta = STEP_TYPE_META[type];
    return (
        <button
            onClick={() => onPick(type)}
            className="w-full text-left px-3 py-2 cursor-pointer flex items-start gap-2 hover:bg-[#F5F1EA] bg-transparent border-none"
        >
            <span
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: meta.accentBg, color: meta.accent }}
            >
                {meta.icon}
            </span>
            <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-gray-900">{meta.label}</span>
                <span className="block text-[10px] text-gray-500 leading-snug">{meta.description}</span>
            </span>
        </button>
    );
}

/**
 * LinkedInStepEditor - channel-aware editor surfaced for any linkedin_*
 * step type. Mirrors the field shape used by the LinkedIn-only wizard so a
 * connection request shows a 300-char note, a DM shows a body template, an
 * InMail shows subject + body, and the no-message types (view / follow /
 * like) just show a short helper card.
 */
function LinkedInStepEditor({
    step, onUpdate, personalizationTokens,
}: {
    step: SequenceStepData;
    onUpdate: (patch: Partial<SequenceStepData>) => void;
    personalizationTokens: string[];
}) {
    const meta = STEP_TYPE_META[step.stepType];
    const cfg = (step.stepConfig || {}) as Record<string, string | number | boolean | undefined>;

    // Pre-coerce each config slot so JSX value={...} never inlines a
    // `(x as Type) ?? default` expression. Turbopack 16.1.x miscompiles
    // that pattern inside JSX attribute values into a `_ref` temp variable
    // that loses its declaration during HMR, producing a runtime
    // ReferenceError. Extracting into typed locals sidesteps the bug -
    // see https://github.com/vercel/next.js/issues/* (filed downstream).
    const noteTemplate = typeof cfg.note_template === 'string' ? cfg.note_template : '';
    const bodyTemplate = typeof cfg.body_template === 'string' ? cfg.body_template : '';
    const inmailSubject = typeof cfg.subject === 'string' ? cfg.subject : '';
    const inmailBody = typeof cfg.body === 'string' ? cfg.body : '';
    const reactionType = typeof cfg.reaction_type === 'string' ? cfg.reaction_type : 'LIKE';
    const lookbackDays = typeof cfg.post_selection_timespan_days === 'number' ? cfg.post_selection_timespan_days : 30;

    const setCfg = (patch: Record<string, unknown>) => {
        onUpdate({ stepConfig: { ...(step.stepConfig || {}), ...patch } });
    };

    const insertToken = (current: string, token: string, applySetter: (v: string) => void) => {
        applySetter(`${current || ''}{{${token}}}`);
    };

    return (
        <div className="p-3 rounded-lg flex flex-col gap-3" style={{ border: `1px solid ${meta.accent}33`, background: meta.accentBg }}>
            <div className="flex items-start gap-2">
                <span
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: meta.accent, color: '#FFFFFF' }}
                >
                    {meta.icon}
                </span>
                <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900">{meta.label}</div>
                    <div className="text-[11px] text-gray-600 leading-snug">{meta.description}</div>
                </div>
            </div>

            {step.stepType === 'linkedin_connection_request' && (
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Connection note <span className="text-gray-400 font-medium">(optional, 300 chars max)</span></label>
                    <textarea
                        value={noteTemplate}
                        onChange={e => setCfg({ note_template: e.target.value.slice(0, 300) })}
                        rows={3}
                        placeholder="Hi {{first_name}}, came across your profile and would love to connect."
                        className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none resize-none bg-white"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                    <div className="flex items-center justify-between mt-1">
                        <TokenChips tokens={personalizationTokens} onInsert={(tk) => insertToken(noteTemplate, tk, (v) => setCfg({ note_template: v.slice(0, 300) }))} />
                        <span className="text-[10px] text-gray-500">{noteTemplate.length} / 300</span>
                    </div>
                    <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={Boolean(cfg.use_workspace_default_note_fallback)}
                            onChange={e => setCfg({ use_workspace_default_note_fallback: e.target.checked })}
                        />
                        <span className="text-[10px] text-gray-600">Send blank CR if note can't render (e.g. missing first name)</span>
                    </label>
                </div>
            )}

            {step.stepType === 'linkedin_message' && (
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">DM body</label>
                    <textarea
                        value={bodyTemplate}
                        onChange={e => setCfg({ body_template: e.target.value })}
                        rows={5}
                        placeholder="Hi {{first_name}}, thanks for connecting!"
                        className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none resize-none bg-white"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                    <TokenChips tokens={personalizationTokens} onInsert={(tk) => insertToken(bodyTemplate, tk, (v) => setCfg({ body_template: v }))} />
                </div>
            )}

            {step.stepType === 'linkedin_inmail' && (
                <>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">InMail subject</label>
                        <input
                            type="text"
                            value={inmailSubject}
                            onChange={e => setCfg({ subject: e.target.value })}
                            placeholder="{{first_name}} - quick thought"
                            className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">InMail body</label>
                        <textarea
                            value={inmailBody}
                            onChange={e => setCfg({ body: e.target.value })}
                            rows={5}
                            placeholder="Hi {{first_name}}, ..."
                            className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none resize-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                        <TokenChips tokens={personalizationTokens} onInsert={(tk) => insertToken(inmailBody, tk, (v) => setCfg({ body: v }))} />
                    </div>
                </>
            )}

            {step.stepType === 'linkedin_like_post' && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reaction</label>
                        <select
                            value={reactionType}
                            onChange={e => setCfg({ reaction_type: e.target.value })}
                            className="px-2 py-1 text-xs rounded-md outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        >
                            {['LIKE', 'PRAISE', 'EMPATHY', 'INTEREST', 'APPRECIATION', 'MAYBE', 'FUNNY'].map(r => (
                                <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Lookback</label>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                max={365}
                                value={lookbackDays}
                                onChange={e => setCfg({ post_selection_timespan_days: parseInt(e.target.value) || 30 })}
                                className="w-16 px-2 py-1 text-xs rounded-md outline-none bg-white"
                                style={{ border: '1px solid #D1CBC5' }}
                            />
                            <span className="text-[10px] text-gray-500">days</span>
                        </div>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={Boolean(cfg.skip_if_no_post)}
                            onChange={e => setCfg({ skip_if_no_post: e.target.checked })}
                        />
                        <span className="text-[10px] text-gray-600">Skip step if no recent post found</span>
                    </label>
                </div>
            )}

            {(step.stepType === 'linkedin_view_profile' || step.stepType === 'linkedin_follow') && (
                <div className="text-[11px] text-gray-600 italic">
                    No message body for this step - the dispatcher executes the action and moves the lead to the next step.
                </div>
            )}
        </div>
    );
}

function TokenChips({ tokens, onInsert }: { tokens: string[]; onInsert: (token: string) => void }) {
    if (tokens.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-1 mt-1">
            <span className="text-[9px] uppercase text-gray-400 mr-1">Insert</span>
            {tokens.slice(0, 6).map(tk => (
                <button
                    key={tk}
                    onClick={() => onInsert(tk)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white text-gray-700 cursor-pointer hover:bg-gray-50"
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    {`{{${tk}}}`}
                </button>
            ))}
        </div>
    );
}
