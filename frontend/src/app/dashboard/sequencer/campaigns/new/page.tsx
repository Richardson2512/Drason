'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Trash2, Copy, GripVertical, Clock, Check, Rocket, Loader2, Eye, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';
import CustomSelect from '@/components/ui/CustomSelect';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import AIAssistPanel from '@/components/sequencer/AIAssistPanel';
import RecipientPreviewPanel from '@/components/sequencer/RecipientPreviewPanel';
import toast from 'react-hot-toast';

// Dynamic import to avoid SSR issues with Tiptap
const RichTextEditor = dynamic(() => import('@/components/sequencer/RichTextEditor'), { ssr: false });

// ============================================================================
// TYPES
// ============================================================================

interface SequenceStepData {
    id: string;
    stepNumber: number;
    delayDays: number;
    delayHours: number;
    subject: string;
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
    variants: Array<{
        id: string;
        label: string;
        subject: string;
        bodyHtml: string;
        weight: number;
    }>;
}

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

const PERSONALIZATION_TOKENS = ['first_name', 'last_name', 'full_name', 'company', 'website', 'email'];

const TIMEZONES = [
    { value: 'Pacific/Midway', label: '(GMT-11:00) Midway Island, Samoa' },
    { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii' },
    { value: 'America/Anchorage', label: '(GMT-09:00) Alaska' },
    { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time — PST' },
    { value: 'America/Tijuana', label: '(GMT-08:00) Tijuana' },
    { value: 'America/Denver', label: '(GMT-07:00) Mountain Time — MST' },
    { value: 'America/Phoenix', label: '(GMT-07:00) Arizona (no DST)' },
    { value: 'America/Chicago', label: '(GMT-06:00) Central Time — CST' },
    { value: 'America/Mexico_City', label: '(GMT-06:00) Mexico City' },
    { value: 'America/Regina', label: '(GMT-06:00) Saskatchewan' },
    { value: 'America/New_York', label: '(GMT-05:00) Eastern Time — EST' },
    { value: 'America/Bogota', label: '(GMT-05:00) Bogota, Lima' },
    { value: 'America/Indiana/Indianapolis', label: '(GMT-05:00) Indiana (East)' },
    { value: 'America/Halifax', label: '(GMT-04:00) Atlantic Time — AST' },
    { value: 'America/Caracas', label: '(GMT-04:00) Caracas' },
    { value: 'America/Santiago', label: '(GMT-04:00) Santiago' },
    { value: 'America/St_Johns', label: '(GMT-03:30) Newfoundland' },
    { value: 'America/Sao_Paulo', label: '(GMT-03:00) Brasilia' },
    { value: 'America/Argentina/Buenos_Aires', label: '(GMT-03:00) Buenos Aires' },
    { value: 'Atlantic/South_Georgia', label: '(GMT-02:00) Mid-Atlantic' },
    { value: 'Atlantic/Azores', label: '(GMT-01:00) Azores' },
    { value: 'Atlantic/Cape_Verde', label: '(GMT-01:00) Cape Verde' },
    { value: 'UTC', label: '(GMT+00:00) UTC — Coordinated Universal Time' },
    { value: 'Europe/London', label: '(GMT+00:00) London, Dublin — GMT' },
    { value: 'Africa/Casablanca', label: '(GMT+00:00) Casablanca' },
    { value: 'Europe/Paris', label: '(GMT+01:00) Paris, Brussels — CET' },
    { value: 'Europe/Berlin', label: '(GMT+01:00) Berlin, Amsterdam' },
    { value: 'Europe/Madrid', label: '(GMT+01:00) Madrid' },
    { value: 'Africa/Lagos', label: '(GMT+01:00) West Central Africa' },
    { value: 'Europe/Helsinki', label: '(GMT+02:00) Helsinki, Kyiv — EET' },
    { value: 'Europe/Athens', label: '(GMT+02:00) Athens, Bucharest' },
    { value: 'Africa/Cairo', label: '(GMT+02:00) Cairo' },
    { value: 'Africa/Johannesburg', label: '(GMT+02:00) Johannesburg — SAST' },
    { value: 'Asia/Jerusalem', label: '(GMT+02:00) Jerusalem — IST' },
    { value: 'Europe/Istanbul', label: '(GMT+03:00) Istanbul' },
    { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow — MSK' },
    { value: 'Asia/Kuwait', label: '(GMT+03:00) Kuwait, Riyadh' },
    { value: 'Africa/Nairobi', label: '(GMT+03:00) Nairobi — EAT' },
    { value: 'Asia/Tehran', label: '(GMT+03:30) Tehran' },
    { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai, Abu Dhabi — GST' },
    { value: 'Asia/Baku', label: '(GMT+04:00) Baku' },
    { value: 'Asia/Tbilisi', label: '(GMT+04:00) Tbilisi' },
    { value: 'Asia/Kabul', label: '(GMT+04:30) Kabul' },
    { value: 'Asia/Karachi', label: '(GMT+05:00) Karachi — PKT' },
    { value: 'Asia/Tashkent', label: '(GMT+05:00) Tashkent' },
    { value: 'Asia/Kolkata', label: '(GMT+05:30) Mumbai, Delhi, Kolkata — IST' },
    { value: 'Asia/Colombo', label: '(GMT+05:30) Sri Lanka' },
    { value: 'Asia/Kathmandu', label: '(GMT+05:45) Kathmandu' },
    { value: 'Asia/Almaty', label: '(GMT+06:00) Almaty' },
    { value: 'Asia/Dhaka', label: '(GMT+06:00) Dhaka — BST' },
    { value: 'Asia/Yangon', label: '(GMT+06:30) Yangon' },
    { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok, Hanoi — ICT' },
    { value: 'Asia/Jakarta', label: '(GMT+07:00) Jakarta — WIB' },
    { value: 'Asia/Shanghai', label: '(GMT+08:00) Beijing, Shanghai — CST' },
    { value: 'Asia/Hong_Kong', label: '(GMT+08:00) Hong Kong — HKT' },
    { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore — SGT' },
    { value: 'Asia/Taipei', label: '(GMT+08:00) Taipei' },
    { value: 'Australia/Perth', label: '(GMT+08:00) Perth — AWST' },
    { value: 'Asia/Seoul', label: '(GMT+09:00) Seoul — KST' },
    { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo — JST' },
    { value: 'Australia/Adelaide', label: '(GMT+09:30) Adelaide — ACST' },
    { value: 'Australia/Darwin', label: '(GMT+09:30) Darwin' },
    { value: 'Australia/Sydney', label: '(GMT+10:00) Sydney, Melbourne — AEST' },
    { value: 'Australia/Brisbane', label: '(GMT+10:00) Brisbane' },
    { value: 'Pacific/Guam', label: '(GMT+10:00) Guam' },
    { value: 'Asia/Vladivostok', label: '(GMT+10:00) Vladivostok' },
    { value: 'Pacific/Noumea', label: '(GMT+11:00) New Caledonia' },
    { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland, Wellington — NZST' },
    { value: 'Pacific/Fiji', label: '(GMT+12:00) Fiji' },
    { value: 'Pacific/Tongatapu', label: '(GMT+13:00) Tonga' },
];

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function NewCampaignPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Edit mode — populated from ?id=<campaignId> in the URL
    const [editId, setEditId] = useState<string | null>(null);
    const [prefillLoading, setPrefillLoading] = useState(false);
    const [existingLeadCount, setExistingLeadCount] = useState(0);
    const [editStatus, setEditStatus] = useState<string>('');
    const isEditMode = !!editId;
    const isAlreadyLaunched = editStatus === 'active' || editStatus === 'paused';

    // Existing leads (edit mode) — paginated list + remove-by-id tracking
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
    const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string; name: string; subject: string; body_html: string; category: string }>>([]);
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

        // Fetch connected mailboxes with Protection status + utilization
        setMailboxesLoading(true);
        apiClient<any>('/api/sequencer/accounts')
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.accounts || res?.data || []);
                setAvailableMailboxes(list);
            })
            .catch(() => setAvailableMailboxes([]))
            .finally(() => setMailboxesLoading(false));

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
                // delay_between_emails is now stored in minutes — mirror it into the
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
    const [campaignTags, setCampaignTags] = useState('');

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

    // Cross-campaign deduplication toggle — when on, leads whose email already appears
    // in any OTHER campaign in the org are dropped server-side before insert.
    const [skipDuplicatesAcrossCampaigns, setSkipDuplicatesAcrossCampaigns] = useState(false);

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
        { id: crypto.randomUUID(), stepNumber: 1, delayDays: 0, delayHours: 0, subject: '', bodyHtml: '', variants: [] },
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

    // Recipient preview — sender info derived from the first selected (or
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
    const [includeUnsubscribe, setIncludeUnsubscribe] = useState(true);
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
                setCampaignTags(Array.isArray(c.tags) ? c.tags.join(', ') : '');
                setEditStatus(c.status || '');

                // Sequence steps with variants
                if (Array.isArray(c.steps) && c.steps.length > 0) {
                    setSequenceSteps(c.steps.map((s: any) => ({
                        id: s.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Math.random())),
                        stepNumber: s.step_number,
                        delayDays: s.delay_days ?? 0,
                        delayHours: s.delay_hours ?? 0,
                        subject: s.subject || '',
                        bodyHtml: s.body_html || '',
                        condition: s.condition ?? null,
                        branchToStepNumber: s.branch_to_step_number ?? null,
                        variants: Array.isArray(s.variants) ? s.variants.map((v: any) => ({
                            id: v.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Math.random())),
                            label: v.variant_label || v.label || 'B',
                            subject: v.subject || '',
                            bodyHtml: v.body_html || '',
                            weight: v.weight ?? 50,
                        })) : [],
                    })));
                }

                // Mailboxes — accounts array is [{ account: {...} }, ...]
                if (Array.isArray(c.accounts)) {
                    setSelectedMailboxIds(new Set(c.accounts.map((a: any) => a.account?.id).filter(Boolean)));
                }

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

    const isStepComplete = (step: number) => {
        switch (step) {
            case 0: return campaignName.trim().length > 0;
            case 1: return isEditMode
                ? ((existingLeadCount - removeLeadIds.size) + leads.length) > 0
                : leads.length > 0;
            case 2: return sequenceSteps.length > 0 && sequenceSteps[0].subject.trim().length > 0 && sequenceSteps[0].bodyHtml.trim().length > 0;
            case 3: return selectedMailboxIds.size > 0; // Mailboxes step
            case 4: return activeDays.length > 0;       // Schedule step
            case 5: return true;                         // Settings — all optional with defaults
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
        // website are accepted as optional — full_name can be derived from first+last,
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
        // Don't remove from main customFields — other leads may use it
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

    const addStep = () => {
        const newStep: SequenceStepData = {
            id: crypto.randomUUID(),
            stepNumber: sequenceSteps.length + 1,
            delayDays: 2,
            delayHours: 0,
            subject: '',
            bodyHtml: '',
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
            id: crypto.randomUUID(),
            stepNumber: sequenceSteps.length + 1,
            variants: source.variants.map(v => ({ ...v, id: crypto.randomUUID() })),
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
            id: crypto.randomUUID(),
            label: nextLabel,
            subject: step.subject,
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
        // Full replace (not merge) — empty fields on a real lead should render as empty,
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
        // Provenance for the leads being submitted in this batch — drives the
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
                delay_days: s.delayDays,
                delay_hours: s.delayHours,
                subject: s.subject,
                body_html: s.bodyHtml,
                condition: s.condition || null,
                branch_to_step_number: s.branchToStepNumber ?? null,
                variants: s.variants.map(v => ({
                    label: v.label,
                    subject: v.subject,
                    body_html: v.bodyHtml,
                    weight: v.weight,
                })),
            })),
            accountIds: Array.from(selectedMailboxIds),
            schedule: { timezone, start_time: startTime, end_time: endTime, days: activeDays, sendGapMinutes },
            settings: { espRouting, daily_limit: dailyLimit, stop_on_reply: stopOnReply, stop_on_bounce: true, track_opens: trackOpens, track_clicks: trackClicks, include_unsubscribe: includeUnsubscribe },
            skipDuplicatesAcrossCampaigns,
            leadSource,
            ...(leadSourceFile ? { leadSourceFile } : {}),
        };
        // On create, include leads for health-gate + validation.
        // On edit, use addLeads (new) + removeLeadIds (deletions) — existing unselected
        // leads are preserved server-side.
        if (!isEditMode) return { ...base, leads };
        const editPayload: any = { ...base };
        if (leads.length > 0) editPayload.addLeads = leads;
        if (removeLeadIds.size > 0) editPayload.removeLeadIds = Array.from(removeLeadIds);
        return editPayload;
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
                // Only call /launch for drafts — active/paused campaigns stay in their current state
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
                router.push(`/dashboard/sequencer/campaigns/${editId}`);
                return;
            }
            await apiClient('/api/sequencer/campaigns', {
                method: 'POST',
                body: JSON.stringify(buildPayload()),
            });
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

            {/* Step Indicator — all steps clickable */}
            <div className="flex items-center gap-1">
                {STEPS.map((label, i) => {
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
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={campaignTags}
                                onChange={e => setCampaignTags(e.target.value)}
                                placeholder="e.g. enterprise, q2-2026, outbound"
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                                style={{ border: '1px solid #D1CBC5' }}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Tags help you organize and filter campaigns later.</p>
                        </div>
                    </div>
                )}

                {/* ==================== STEP 2: LEADS ==================== */}
                {currentStep === 1 && (
                    <div className="flex flex-col gap-4">
                        {/* Edit mode — existing leads list with search, pagination, and remove */}
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
                                                            <td className="px-2 py-1.5 text-gray-600">{[l.first_name, l.last_name].filter(Boolean).join(' ') || '—'}</td>
                                                            <td className="px-2 py-1.5 text-gray-600">{l.company || '—'}</td>
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
                                    Tick leads to remove on save. Add more leads using the tabs below — new leads run through the health gate + validation.
                                </div>
                            </div>
                        )}

                        {/* Cross-campaign dedupe toggle — applies to all import methods below */}
                        <div className="flex items-start gap-3 p-3 rounded-lg" style={{ border: '1px solid #D1CBC5', background: '#FAFAF8' }}>
                            <button
                                type="button"
                                onClick={() => setSkipDuplicatesAcrossCampaigns(v => !v)}
                                role="switch"
                                aria-checked={skipDuplicatesAcrossCampaigns}
                                className="relative shrink-0 cursor-pointer border-none"
                                style={{
                                    width: 34,
                                    height: 20,
                                    background: skipDuplicatesAcrossCampaigns ? '#111827' : '#D1CBC5',
                                    borderRadius: 999,
                                    transition: 'background 0.15s ease',
                                    padding: 0,
                                }}
                            >
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        left: skipDuplicatesAcrossCampaigns ? 16 : 2,
                                        width: 16,
                                        height: 16,
                                        background: '#FFFFFF',
                                        borderRadius: '50%',
                                        transition: 'left 0.15s ease',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                    }}
                                />
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-900">Skip leads already in other campaigns</div>
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                    When enabled, any lead whose email already appears in another campaign in this organization is dropped during import. Useful for preventing accidental overlap across sequences.
                                </div>
                            </div>
                        </div>

                        {/* Lead source tabs — always visible in both create and edit mode */}
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
                                                    <span className="text-[10px] text-gray-500">{dbLeads.length} leads found — {dbSelectedIds.size} selected</span>
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
                                                                    <td className="px-3 py-1.5 text-gray-600 capitalize">{lead.persona || '—'}</td>
                                                                    <td className="px-3 py-1.5 text-gray-500">{lead.source || '—'}</td>
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

                                {/* Field mapping — required fields are highlighted red when unmapped,
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
                                                                { value: '', label: field.required ? '— select column —' : '— skip —' },
                                                                ...csvHeaders.map(h => ({ value: h, label: h })),
                                                            ]}
                                                            placeholder={field.required ? '— select column —' : '— skip —'}
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
                                                            options={[{ value: '', label: '— select column —' }, ...csvHeaders.map(h => ({ value: h, label: h }))]}
                                                            placeholder="— select column —"
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

                                {/* Verify emails action bar — runs MillionVerifier on all unverified leads */}
                                <div className="flex items-center justify-between gap-3 mb-3 p-2.5 rounded-lg flex-wrap" style={{ background: '#FAFAF8', border: '1px solid #E8E3DC' }}>
                                    <div className="flex items-center gap-3 flex-wrap text-[11px]">
                                        <span className="font-semibold text-gray-700">Email validation:</span>
                                        {verificationSummary.verified === 0 ? (
                                            <span className="text-gray-500">No leads verified yet. Validation only runs when you click below — campaign creation won&apos;t consume credits.</span>
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
                                            {`{{${f.key}}}`} → {columnMapping[f.key] || '—'}
                                        </span>
                                    ))}
                                </div>

                                {/* Lead table — shows all leads with validation status pills + per-row remove */}
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
                                                        <td className="px-3 py-1.5 text-gray-600">{lead.full_name || [lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}</td>
                                                        <td className="px-3 py-1.5 text-gray-600">{lead.company || '—'}</td>
                                                        <td className="px-3 py-1.5 text-gray-600">{lead.website || '—'}</td>
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
                                                                <span className="text-[9px] text-gray-400">—</span>
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
                        {/* Step tabs */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {sequenceSteps.map((step, i) => (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStepIndex(i)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                    style={{
                                        background: activeStepIndex === i ? '#111827' : '#F3F4F6',
                                        color: activeStepIndex === i ? '#FFFFFF' : '#4B5563',
                                    }}
                                >
                                    {i === 0 ? <Clock size={10} /> : <Clock size={10} />}
                                    Step {step.stepNumber}
                                    {step.variants.length > 0 && (
                                        <span className="text-[9px] px-1 rounded" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                            {step.variants.length + 1} variants
                                        </span>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={addStep}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                style={{ border: '1px dashed #D1CBC5' }}
                            >
                                <Plus size={10} /> Add Step
                            </button>
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
                                            {/* Branching — only meaningful from step 2 onward (step 1 is the entry,
                                                conditions reference signals only later steps can have produced). */}
                                            {idx > 0 && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                                    <span className="text-[10px] text-gray-500">Send only if</span>
                                                    <select
                                                        value={step.condition || ''}
                                                        onChange={e => updateStep(idx, { condition: e.target.value || null, branchToStepNumber: e.target.value ? step.branchToStepNumber : null })}
                                                        className="px-1.5 py-0.5 text-[11px] rounded border bg-white outline-none cursor-pointer"
                                                        style={{ borderColor: '#D1CBC5' }}
                                                    >
                                                        <option value="">always</option>
                                                        <option value="if_no_reply">no reply yet</option>
                                                        <option value="if_replied">lead replied</option>
                                                        <option value="if_opened">a prior step was opened</option>
                                                        <option value="if_not_opened">no prior opens</option>
                                                        <option value="if_clicked">a prior step had a click</option>
                                                        <option value="if_not_clicked">no clicks yet</option>
                                                    </select>
                                                    {step.condition && (
                                                        <>
                                                            <span className="text-[10px] text-gray-500">otherwise</span>
                                                            <select
                                                                value={step.branchToStepNumber == null ? '' : String(step.branchToStepNumber)}
                                                                onChange={e => updateStep(idx, { branchToStepNumber: e.target.value === '' ? null : parseInt(e.target.value) })}
                                                                className="px-1.5 py-0.5 text-[11px] rounded border bg-white outline-none cursor-pointer"
                                                                style={{ borderColor: '#D1CBC5' }}
                                                            >
                                                                <option value="">end sequence</option>
                                                                {sequenceSteps
                                                                    .filter(s => s.stepNumber !== step.stepNumber)
                                                                    .map(s => (
                                                                        <option key={s.id} value={String(s.stepNumber)}>
                                                                            jump to Step {s.stepNumber}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { setPreviewVariantTab(0); setPreviewStepIndex(idx); }}
                                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-gray-600 hover:bg-gray-100 cursor-pointer bg-transparent border-none"
                                                title="Preview as recipient — Gmail · MacBook"
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
                                                                        updateStep(idx, { subject: t.subject, bodyHtml: t.body_html });
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

                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* ==================== STEP 4: MAILBOXES ==================== */}
                {currentStep === 3 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Choose Mailboxes</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    Select which connected mailboxes send emails for this campaign. Mailboxes in healing, quarantine, or paused state are not selectable.
                                </p>
                            </div>
                            {(() => {
                                const selectableCount = availableMailboxes.filter(m => m.selectable).length;
                                const selectedCount = availableMailboxes.filter(m => m.selectable && selectedMailboxIds.has(m.id)).length;
                                const allSelectableSelected = selectableCount > 0 && selectedCount === selectableCount;
                                return (
                                    <button
                                        onClick={() => {
                                            if (allSelectableSelected) {
                                                setSelectedMailboxIds(new Set());
                                            } else {
                                                setSelectedMailboxIds(new Set(availableMailboxes.filter(m => m.selectable).map(m => m.id)));
                                            }
                                        }}
                                        disabled={selectableCount === 0}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer bg-transparent border disabled:opacity-30"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    >
                                        {allSelectableSelected ? 'Deselect all' : `Select all (${selectableCount})`}
                                    </button>
                                );
                            })()}
                        </div>

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
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {availableMailboxes.map(mb => {
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
                        {/* ESP Routing Toggle — prominent placement */}
                        <div className="p-4 rounded-xl" style={{ border: espRouting ? '2px solid #059669' : '1px solid #DC2626', background: espRouting ? '#ECFDF510' : '#FEF2F210' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-xs font-bold text-gray-900">ESP-Aware Routing</div>
                                        {!espRouting && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">RECOMMENDED TO KEEP ON</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed m-0">
                                        Automatically sends each email through the mailbox with the best delivery history for that recipient&apos;s email provider (Gmail, Outlook, etc.). Improves inbox placement rates by 10-20%. Mailboxes still receive equal send volume — routing only adjusts which leads go to which mailbox.
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
                                { label: 'Include unsubscribe link', desc: 'Add a one-click unsubscribe link at the bottom (CAN-SPAM)', value: includeUnsubscribe, onChange: setIncludeUnsubscribe },
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
                                {!isStepComplete(0) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(0)}>Step 1 — Campaign name is required</div>}
                                {!isStepComplete(1) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(1)}>Step 2 — Import at least one lead</div>}
                                {!isStepComplete(2) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(2)}>Step 3 — Add subject line and email body to Step 1</div>}
                                {!isStepComplete(3) && <div className="text-[10px] text-amber-700 cursor-pointer hover:underline" onClick={() => setCurrentStep(3)}>Step 4 — Select at least one active sending day</div>}
                            </div>
                        )}

                        <h3 className="text-sm font-bold text-gray-900">Campaign Summary</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Campaign</div>
                                <div className="text-sm font-bold text-gray-900">{campaignName}</div>
                                {campaignTags && <div className="text-[10px] text-gray-500 mt-0.5">Tags: {campaignTags}</div>}
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
                                        See the exact email a recipient will receive — variables substituted with real lead data.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Email step dropdown — platform-themed */}
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
                                    {/* Lead picker dropdown — platform-themed, searchable */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-gray-500 font-semibold uppercase">Lead</span>
                                        <div className="w-64">
                                            <CustomSelect
                                                value={reviewLeadKey}
                                                onChange={setReviewLeadKey}
                                                searchable={availableReviewLeads.length > 5}
                                                options={[
                                                    { value: '__demo__', label: 'Demo lead — Alex Morgan · Acme' },
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

                            {/* Variant tabs — only if the selected step has variants */}
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
                                    ? { subject: step.subject, bodyHtml: step.bodyHtml }
                                    : step.variants[reviewVariantIdx - 1];
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

                            {/* Recipient preview — across mainstream clients, with the lead's
                                actual data substituted. Helps catch truncation, AI-summary
                                surprises and rendering issues before launch. */}
                            {(() => {
                                const step = sequenceSteps[reviewStepIdx];
                                if (!step) return null;
                                const source = reviewVariantIdx === 0
                                    ? { subject: step.subject, bodyHtml: step.bodyHtml }
                                    : step.variants[reviewVariantIdx - 1];
                                if (!source) return null;
                                return (
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px dashed #D1CBC5' }}>
                                        <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                            <Eye size={12} /> How it lands across clients
                                        </div>
                                        <RecipientPreviewPanel
                                            subject={renderTemplate(source.subject, previewLead)}
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
                    {/* Secondary action — only shown when it's semantically distinct from the primary:
                        - Create mode: "Save as Draft" (primary launches)
                        - Editing a draft: "Save Changes" (primary is "Save & Launch")
                        Hidden when editing an already-launched campaign — primary is already "Save Changes". */}
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

            {/* Preview Modal — recipient preview on the user's chosen client + device.
                Variables are silently substituted with the demo lead so the user sees
                what the recipient actually receives. */}
            {previewStepIndex !== null && sequenceSteps[previewStepIndex] && (() => {
                const step = sequenceSteps[previewStepIndex];
                const renders = [
                    { label: 'A', weight: Math.round(100 / (step.variants.length + 1)), subject: step.subject, bodyHtml: step.bodyHtml },
                    ...step.variants.map(v => ({ label: v.label, weight: v.weight, subject: v.subject, bodyHtml: v.bodyHtml })),
                ];
                const activeIdx = Math.min(previewVariantTab, renders.length - 1);
                const active = renders[activeIdx];
                const renderedSubject = renderTemplate(active.subject, DEMO_LEAD);
                const renderedBody = renderTemplate(active.bodyHtml, DEMO_LEAD);
                return (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[9998] p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setPreviewStepIndex(null); }}
                    >
                        <div className="bg-white rounded-2xl w-full max-w-[1480px] h-[94vh] flex flex-col shadow-2xl overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
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
