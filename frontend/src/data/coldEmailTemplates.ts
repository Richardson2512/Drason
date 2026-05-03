/**
 * Cold Email Templates — V1 library (30 templates)
 *
 * Curated, hand-written templates that pass the "would a real cold email pro
 * respect this?" test. Every template includes:
 *   - subject + body with personalization placeholders
 *   - the AI prompt that would generate it (so users can re-generate
 *     variations for their own context)
 *   - annotations explaining *why* each part works
 *   - a deliverability score (0-100) computed against length, spam triggers,
 *     personalization depth, link count, and structural compliance
 *
 * Adding new templates: just append to TEMPLATES below. The hub page,
 * detail pages, and sitemap auto-discover.
 */

// ============================================================================
// TYPES
// ============================================================================

export type TemplateGoal =
    | 'introduction'
    | 'follow-up-1'
    | 'follow-up-2'
    | 'follow-up-3'
    | 'follow-up-4'
    | 'breakup'
    | 'meeting-request'
    | 'referral-ask'
    | 're-engagement'
    | 'post-content'
    | 'post-event'
    | 'problem-pitch'
    | 'partnership-pitch'
    | 'investor-outreach'
    | 'press-pitch'
    | 'podcast-pitch'
    | 'backlink-outreach'
    | 'sponsorship-pitch'
    | 'case-study-request'
    | 'customer-interview'
    | 'beta-invite'
    | 'recap'
    | 'agenda'
    | 'win-back'
    | 'renewal'
    | 'negotiation';

export type TemplateIndustry =
    | 'saas'
    | 'agencies'
    | 'recruiting'
    | 'real-estate'
    | 'financial-services'
    | 'ecommerce'
    | 'freelancers'
    | 'consulting'
    | 'cybersecurity'
    | 'ai-tools'
    | 'healthcare'
    | 'manufacturing'
    | 'legal'
    | 'education'
    | 'insurance'
    | 'logistics'
    | 'hospitality'
    | 'nonprofit'
    | 'media'
    | 'construction'
    | 'retail'
    | 'government'
    | 'energy'
    | 'general';

export type TemplateRole =
    | 'founder-ceo'
    | 'vp-sales'
    | 'vp-marketing'
    | 'cto'
    | 'cfo'
    | 'cmo'
    | 'head-of-people'
    | 'head-of-demand-gen'
    | 'director-ops'
    | 'sdr-manager'
    | 'compliance-officer'
    | 'procurement-buyer'
    | 'it-director'
    | 'customer-success-leader'
    | 'product-manager'
    | 'engineering-manager'
    | 'marketing-manager'
    | 'sales-manager'
    | 'office-manager'
    | 'smb-owner'
    | 'agency-owner'
    | 'vc-investor'
    | 'journalist'
    | 'podcast-host'
    | 'hr-director'
    | 'plant-manager'
    | 'law-firm-partner'
    | 'healthcare-admin'
    | 'school-admin'
    | 'general';

export type TemplateFramework =
    | 'aida'
    | 'pas'
    | 'bab'
    | 'qvc'
    | 'story'
    | 'problem-solution'
    | 'question-led'
    | 'direct';

export type TemplateTone =
    | 'formal'
    | 'casual'
    | 'witty'
    | 'direct'
    | 'personal'
    | 'provocative';

export type TemplateLength = 'micro' | 'short' | 'medium';

export interface TemplateAnnotation {
    section: 'subject' | 'opener' | 'body' | 'cta' | 'sign-off';
    label: string;
    reason: string;
}

export interface ColdEmailTemplate {
    slug: string;
    title: string;
    subject: string;
    body: string;                // plain text with line breaks; rendered with whitespace-preserving CSS
    prompt: string;              // the AI prompt to recreate or adapt
    bestFor: string;             // one-line use case
    goal: TemplateGoal;
    industry: TemplateIndustry;
    role: TemplateRole;
    framework: TemplateFramework;
    tone: TemplateTone;
    length: TemplateLength;
    deliverabilityScore: number; // 0–100
    variables: string[];         // personalization placeholders used
    annotations: TemplateAnnotation[];
}

// ============================================================================
// HUMAN-READABLE METADATA (for filter chips, breadcrumbs, page copy)
// ============================================================================

export const GOAL_META: Record<TemplateGoal, { label: string; description: string }> = {
    'introduction':       { label: 'Cold Intro',         description: 'First-touch outreach to a prospect who has never heard from you' },
    'follow-up-1':        { label: 'Follow-up #1',       description: 'Soft bump 2–4 days after the first email got no reply' },
    'follow-up-2':        { label: 'Follow-up #2',       description: 'Value-add follow-up with a fresh angle or data point' },
    'follow-up-3':        { label: 'Follow-up #3',       description: 'Pivot the angle entirely — try a different value prop' },
    'follow-up-4':        { label: 'Follow-up #4',       description: 'Last touch before the breakup — pattern interrupt or final value' },
    'breakup':            { label: 'Breakup Email',      description: 'Final touch that gracefully exits the sequence' },
    'meeting-request':    { label: 'Meeting Request',    description: 'Direct ask for a 15–30 minute call' },
    'referral-ask':       { label: 'Referral Ask',       description: '"Wrong person?" play to find the right buyer at a target account' },
    're-engagement':      { label: 'Re-engagement',      description: 'Reach back to a lead who went cold 60–180 days ago' },
    'post-content':       { label: 'Post-Content',       description: 'After someone consumed your content (download, video, podcast)' },
    'post-event':         { label: 'Post-Event',         description: 'After meeting in person at a conference, mixer, or webinar' },
    'problem-pitch':      { label: 'Problem-First Pitch',description: 'Lead with a specific pain point you suspect they have' },
    'partnership-pitch':  { label: 'Partnership Pitch',  description: 'Co-marketing, integration, or strategic collaboration ask' },
    'investor-outreach':  { label: 'Investor Outreach',  description: 'Founder reaching out to VCs or angel investors' },
    'press-pitch':        { label: 'Press Pitch',        description: 'Outreach to journalists or editors for media coverage' },
    'podcast-pitch':      { label: 'Podcast Pitch',      description: 'Pitching yourself as a guest on a podcast' },
    'backlink-outreach':  { label: 'Backlink Outreach',  description: 'SEO link request to bloggers, journalists, or content creators' },
    'sponsorship-pitch':  { label: 'Sponsorship Pitch',  description: 'Asking to sponsor a newsletter, podcast, or community' },
    'case-study-request': { label: 'Case Study Request', description: 'Ask an existing customer to participate in a case study' },
    'customer-interview': { label: 'Customer Interview', description: 'Customer-research / discovery interview request' },
    'beta-invite':        { label: 'Beta Invite',        description: 'Invite a prospect or customer to test a new feature/product' },
    'recap':              { label: 'Meeting Recap',      description: 'Post-meeting summary with next steps and accountability' },
    'agenda':             { label: 'Pre-Meeting Agenda', description: 'Send agenda before the call to set expectations' },
    'win-back':           { label: 'Win-Back',           description: 'Reach back to a churned customer with a new reason to return' },
    'renewal':            { label: 'Renewal / Upsell',   description: 'Customer-facing nudge to renew or expand contract' },
    'negotiation':        { label: 'Negotiation',        description: 'Pricing or contract discussion email' },
};

export const INDUSTRY_META: Record<TemplateIndustry, string> = {
    'saas':              'SaaS',
    'agencies':          'Agencies',
    'recruiting':        'Recruiting',
    'real-estate':       'Real Estate',
    'financial-services':'Financial Services',
    'ecommerce':         'Ecommerce',
    'freelancers':       'Freelancers',
    'consulting':        'Consulting',
    'cybersecurity':     'Cybersecurity',
    'ai-tools':          'AI Tools',
    'healthcare':        'Healthcare',
    'manufacturing':     'Manufacturing',
    'legal':             'Legal Services',
    'education':         'Education',
    'insurance':         'Insurance',
    'logistics':         'Logistics',
    'hospitality':       'Hospitality',
    'nonprofit':         'Nonprofit',
    'media':             'Media / Publishing',
    'construction':      'Construction',
    'retail':            'Retail / CPG',
    'government':        'Government',
    'energy':            'Energy / Utilities',
    'general':           'General',
};

export const ROLE_META: Record<TemplateRole, string> = {
    'founder-ceo':            'Founder / CEO',
    'vp-sales':               'VP Sales',
    'vp-marketing':           'VP Marketing',
    'cto':                    'CTO',
    'cfo':                    'CFO',
    'cmo':                    'CMO',
    'head-of-people':         'Head of People',
    'head-of-demand-gen':     'Head of Demand Gen',
    'director-ops':           'Director of Operations',
    'sdr-manager':            'SDR Manager',
    'compliance-officer':     'Compliance Officer',
    'procurement-buyer':      'Procurement / Buyer',
    'it-director':            'IT Director',
    'customer-success-leader':'Customer Success Lead',
    'product-manager':        'Product Manager',
    'engineering-manager':    'Engineering Manager',
    'marketing-manager':      'Marketing Manager',
    'sales-manager':          'Sales Manager',
    'office-manager':         'Office Manager',
    'smb-owner':              'SMB Owner',
    'agency-owner':           'Agency Owner',
    'vc-investor':            'VC / Investor',
    'journalist':             'Journalist',
    'podcast-host':           'Podcast Host',
    'hr-director':            'HR Director',
    'plant-manager':          'Plant Manager',
    'law-firm-partner':       'Law Firm Partner',
    'healthcare-admin':       'Healthcare Administrator',
    'school-admin':           'School Administrator',
    'general':                'Any Role',
};

export const FRAMEWORK_META: Record<TemplateFramework, { label: string; description: string }> = {
    'aida':              { label: 'AIDA',              description: 'Attention → Interest → Desire → Action' },
    'pas':               { label: 'PAS',               description: 'Problem → Agitate → Solve' },
    'bab':               { label: 'BAB',               description: 'Before → After → Bridge' },
    'qvc':               { label: 'QVC',               description: 'Question → Value → CTA' },
    'story':             { label: 'Story',             description: 'Narrative-driven, often opens with a relatable scenario' },
    'problem-solution':  { label: 'Problem-Solution',  description: 'Direct identification of pain → direct solution' },
    'question-led':      { label: 'Question-Led',      description: 'Opens with a thought-provoking question' },
    'direct':            { label: 'Direct',            description: 'No fluff — straight to ask + value' },
};

// ============================================================================
// TEMPLATES (30)
// ============================================================================

export const TEMPLATES: ColdEmailTemplate[] = [
    // ─────────────────────────────────────────────────────────────────────
    // GOAL-BASED (10) — covers every step of a typical 5-touch sequence
    // ─────────────────────────────────────────────────────────────────────
    {
        slug: 'saas-founder-cold-intro-problem-first',
        title: 'SaaS Founder Cold Intro — Problem-First',
        subject: 'Bounce rate at {{company}}',
        body: `Hi {{first_name}},

Most {{custom.industry}} founders I talk to don't actually know what their cold email bounce rate is across all their sending mailboxes. Then a domain gets paused mid-quarter and suddenly it's a fire drill.

Curious — do you know yours right now? If it's above 3%, your sender reputation is already taking damage you can't see in your platform's dashboard.

Worth a 15-min look at how to fix it without rebuilding your stack?

— {{sender_first}}`,
        prompt: `Write a cold email to a SaaS founder opening with a specific operational pain point they likely don't measure today (cold email bounce rate). Use a problem-first framework. Keep it under 80 words. End with a low-commitment CTA. Tone: direct, slightly contrarian, founder-to-founder.`,
        bestFor: 'Targeting SaaS founders running outbound through Smartlead/Instantly',
        goal: 'introduction',
        industry: 'saas',
        role: 'founder-ceo',
        framework: 'problem-solution',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 92,
        variables: ['first_name', 'company', 'custom.industry', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Specific + curiosity-driven', reason: '"Bounce rate at {{company}}" is short, specific, and pattern-interrupts. No spam triggers, no clickbait, but specific enough to make the recipient open.' },
            { section: 'opener', label: 'Skip the pleasantries', reason: 'Goes straight into the pain. No "I hope this finds you well." Founder-time is too short for filler.' },
            { section: 'body', label: 'Surfaces an unknown', reason: 'Frames a problem the recipient probably hasn\'t measured themselves. Creates curiosity without selling.' },
            { section: 'cta', label: 'Low-commitment ask', reason: '"Worth a 15-min look" is far easier to say yes to than "book a demo." Optionality is a feature.' },
        ],
    },
    {
        slug: 'follow-up-1-soft-bump',
        title: 'Follow-up #1 — Soft Bump',
        subject: 'Re: Bounce rate at {{company}}',
        body: `{{first_name}},

Bumping this up. Even if it's not the right time, would love to hear what platform you're running today.

— {{sender_first}}`,
        prompt: `Write a soft follow-up to a cold email that got no reply. Keep it under 30 words. No new pitch. Goal: low-friction nudge that invites a one-word reply about their current tooling.`,
        bestFor: 'Sent 2–4 days after the first email got no response',
        goal: 'follow-up-1',
        industry: 'general',
        role: 'general',
        framework: 'direct',
        tone: 'casual',
        length: 'micro',
        deliverabilityScore: 95,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Re: thread', reason: 'Re: prefix on the original subject keeps it threaded, increases open rate, and signals "you saw this before."' },
            { section: 'body', label: 'No re-pitch', reason: 'A second email that re-pitches the value prop reads as desperate. A single-line bump invites a one-word reply.' },
            { section: 'cta', label: 'Easy answer', reason: 'Asking what platform they use is a softball question. Even prospects not interested in buying will often answer.' },
        ],
    },
    {
        slug: 'follow-up-2-data-point-bab',
        title: 'Follow-up #2 — Data-Point + Before/After',
        subject: 'How {{company}} could cut bounces 60%+',
        body: `Hi {{first_name}},

Last B2B SaaS we worked with: 50K sends/month, 8.2% bounce rate. After 30 days on a platform with a real recovery pipeline (not bot warmup), they were at 1.1%.

The unlock wasn't a better validator — it was the validator and the sender sharing data so risky leads got throttled before they bounced.

Worth a 15-min walkthrough using your current numbers as the baseline?

— {{sender_first}}`,
        prompt: `Write the second follow-up email in a sequence. Use a Before/After/Bridge framework. Lead with a specific customer outcome (numerical), explain the mechanism in one sentence, end with a CTA that offers to use the recipient's own data. Under 90 words.`,
        bestFor: '5–7 days after first email when soft bumps haven\'t worked',
        goal: 'follow-up-2',
        industry: 'saas',
        role: 'founder-ceo',
        framework: 'bab',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Number-driven curiosity', reason: 'Specific "60%+" outperforms vague claims. Makes them want to know the mechanism.' },
            { section: 'body', label: 'Mechanism, not just outcome', reason: 'Explains *why* it worked in one sentence. Buyers trust mechanism more than result-only stories.' },
            { section: 'cta', label: 'Personalized offer', reason: '"Using your current numbers as the baseline" makes the demo about them, not us.' },
        ],
    },
    {
        slug: 'breakup-graceful-exit',
        title: 'Breakup — Graceful Exit',
        subject: 'Closing the loop, {{first_name}}',
        body: `{{first_name}},

Going to stop following up on this — clearly not the right time. No hard feelings.

If outbound deliverability ever creeps up the priority list at {{company}}, my calendar's here: {{custom.calendar_link}}

Wishing you a strong quarter,
{{sender_first}}`,
        prompt: `Write a breakup email that exits a cold sequence gracefully without being passive-aggressive or guilt-tripping. Acknowledge the silence, leave the door open, end with a genuine well-wish. Under 60 words.`,
        bestFor: 'Final touch after 4–5 unanswered emails',
        goal: 'breakup',
        industry: 'general',
        role: 'general',
        framework: 'direct',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 96,
        variables: ['first_name', 'company', 'custom.calendar_link', 'sender_first'],
        annotations: [
            { section: 'subject', label: '"Closing the loop"', reason: 'Soft, professional, often outperforms aggressive breakups like "Should I close your file?"' },
            { section: 'body', label: 'No guilt, no manipulation', reason: 'Some breakup emails try to shame the recipient into replying. This one just exits cleanly. Higher reply rate, lower complaint rate.' },
            { section: 'cta', label: 'Door left open', reason: 'Calendar link as the last line lets future intent close itself. Often the highest-converting CTA in the entire sequence.' },
        ],
    },
    {
        slug: 'meeting-request-direct-micro',
        title: 'Meeting Request — Direct Micro',
        subject: '15 min, week of the {{custom.target_week}}?',
        body: `{{first_name}},

Quick ask: 15 minutes next week to walk through how {{company}} is currently handling sender reputation across mailboxes. I've got a few specific recommendations based on your domain setup that I think will be useful regardless of whether we work together.

Tuesday 2pm or Thursday 10am ET?

— {{sender_first}}`,
        prompt: `Write a direct meeting-request cold email. Lead with the time ask, name the value, offer two specific time slots. No fluff. Under 70 words.`,
        bestFor: 'Mid-funnel prospect who has shown intent (visited site, opened earlier email)',
        goal: 'meeting-request',
        industry: 'general',
        role: 'general',
        framework: 'direct',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 90,
        variables: ['first_name', 'company', 'custom.target_week', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Time-bounded ask', reason: 'Naming the duration in the subject filters out anyone who wouldn\'t commit to 15 min anyway. Higher reply intent.' },
            { section: 'body', label: 'Value before time', reason: '"A few specific recommendations regardless of whether we work together" gives the recipient a reason to take the meeting even if they\'re not buying.' },
            { section: 'cta', label: 'Two slots, not "let me know"', reason: 'Specific times convert 2–3x better than open-ended "what works for you?"' },
        ],
    },
    {
        slug: 'referral-ask-wrong-person',
        title: 'Referral Ask — Wrong Person Play',
        subject: 'Wrong person at {{company}}?',
        body: `Hi {{first_name}},

I might be off-base reaching out to you about {{custom.topic}} — apologies if so.

Mind pointing me to whoever owns {{custom.responsibility}} at {{company}}? I won't pile on, just want to make sure I'm talking to the right person.

Appreciate it,
{{sender_first}}`,
        prompt: `Write a referral-ask cold email that openly admits you might be reaching out to the wrong contact. Tone: humble, brief. End with a concrete ask for the right person's name. Under 60 words.`,
        bestFor: 'When you\'re not 100% sure you have the right buyer at the company',
        goal: 'referral-ask',
        industry: 'general',
        role: 'general',
        framework: 'question-led',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 94,
        variables: ['first_name', 'company', 'custom.topic', 'custom.responsibility', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Self-deprecating curiosity', reason: '"Wrong person?" disarms the recipient. Even people who *are* the right person often reply to confirm.' },
            { section: 'body', label: 'Humility = trust', reason: 'Admitting you might be wrong builds credibility. Most cold emails project false certainty.' },
            { section: 'cta', label: 'Low-effort referral', reason: 'A name is a 5-second response. Most prospects will reply with one even if they don\'t need your product.' },
        ],
    },
    {
        slug: 're-engagement-90-day-cold',
        title: 'Re-engagement — Cold 90-Day Lead',
        subject: 'Picking this back up?',
        body: `Hey {{first_name}},

We talked back in {{custom.last_contact_month}} about {{custom.topic}} — timing didn't line up then.

Quick check: is {{custom.responsibility}} still on your plate at {{company}}, or did it move to someone else? If it's still you, I have a new angle worth 10 min. If not, no worries — happy to be redirected.

— {{sender_first}}`,
        prompt: `Write a re-engagement email to a lead who went cold 90+ days ago. Reference the prior conversation specifically. Acknowledge that things may have changed. Offer a fresh angle without re-pitching. Under 80 words.`,
        bestFor: 'Lead who replied months ago but never converted',
        goal: 're-engagement',
        industry: 'general',
        role: 'general',
        framework: 'qvc',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 91,
        variables: ['first_name', 'company', 'custom.last_contact_month', 'custom.topic', 'custom.responsibility', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Specific reference', reason: 'Naming the prior month + topic proves this isn\'t a mass-blast re-touch. Recipients can verify in their own inbox.' },
            { section: 'body', label: 'Two-question structure', reason: 'Asks if responsibility moved, then offers a fresh angle. Either answer keeps the conversation alive.' },
        ],
    },
    {
        slug: 'post-content-engagement',
        title: 'Post-Content — Someone Engaged',
        subject: 'Caught your reaction to {{custom.content_title}}',
        body: `Hi {{first_name}},

Saw you {{custom.engagement_action}} on our {{custom.content_title}} last week — appreciate it.

Quick question since you spent time on the piece: what part landed for you, and what didn't? Genuinely useful feedback for us, and a good excuse to compare notes if any of it overlaps with how {{company}} thinks about {{custom.topic}}.

— {{sender_first}}`,
        prompt: `Write a post-content cold email triggered by a recipient engaging with your content (download/view/comment). Open with the specific engagement, ask for feedback, end with a soft connection ask. Avoid pitching. Under 80 words.`,
        bestFor: 'Triggered when a prospect downloaded a guide, watched a video, or commented on a post',
        goal: 'post-content',
        industry: 'general',
        role: 'general',
        framework: 'question-led',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 93,
        variables: ['first_name', 'company', 'custom.engagement_action', 'custom.content_title', 'custom.topic', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Specific trigger', reason: 'Naming the exact engagement (downloaded, commented, watched) proves the relevance. No spray-and-pray suspicion.' },
            { section: 'body', label: 'Feedback ask = trust ask', reason: 'Asking for genuine feedback flips the dynamic. You\'re no longer pitching — they are.' },
        ],
    },
    {
        slug: 'post-event-conference-followup',
        title: 'Post-Event — Conference Follow-up',
        subject: 'Good chat at {{custom.event_name}}',
        body: `{{first_name}},

Enjoyed the chat at {{custom.event_name}} last week — specifically the part about {{custom.specific_topic}}. Made me think.

You mentioned {{company}} was looking at {{custom.their_problem}}. I've got a 10-min walkthrough of how {{custom.solution_angle}} that I think connects directly to what you described. Worth setting up?

— {{sender_first}}`,
        prompt: `Write a post-conference follow-up email. Reference a specific conversation topic, recall what they said about their problem, offer a relevant 10-minute walkthrough. Under 80 words. Personal, warm but professional.`,
        bestFor: 'After a real-world conversation at a conference, mixer, or webinar',
        goal: 'post-event',
        industry: 'general',
        role: 'general',
        framework: 'story',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 95,
        variables: ['first_name', 'company', 'custom.event_name', 'custom.specific_topic', 'custom.their_problem', 'custom.solution_angle', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Specific recall', reason: 'Mentioning the exact topic discussed proves you actually remember the conversation. Highest-trust opener possible.' },
            { section: 'body', label: 'Their words, your value', reason: 'Echoing what they said about their problem connects your offer to a problem *they* already named — not one you pitched.' },
        ],
    },
    {
        slug: 'problem-pitch-pas-direct',
        title: 'Problem Pitch — PAS Direct',
        subject: 'Quiet domain damage at {{company}}',
        body: `Hi {{first_name}},

Most cold email platforms don't tell you when your sender reputation is dropping until a mailbox gets paused. By then you've already had 5–10 days of mail landing in spam without knowing it.

By the time the platform shows you the score, you're rebuilding. And rebuilding takes 2–6 weeks.

We solve this by feeding live Postmaster Tools data into the sending decision so reputation drops trigger an automatic recovery flow before any mailbox gets paused.

Worth 15 minutes to walk through?

— {{sender_first}}`,
        prompt: `Write a Problem-Agitate-Solve cold email. Open with the problem, agitate by quantifying the cost, offer the specific mechanism that solves it, end with a low-commitment CTA. Under 110 words.`,
        bestFor: 'Cold prospects who manage outbound at scale and would feel the pain immediately',
        goal: 'problem-pitch',
        industry: 'general',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'medium',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Industry-truth opener', reason: 'States a problem most readers will recognize before naming you. Builds resonance before anything else.' },
            { section: 'body', label: 'Cost made concrete', reason: 'Naming "5–10 days of mail in spam" + "2–6 weeks to rebuild" makes the abstract problem tangible.' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // INDUSTRY/ROLE SPECIFIC (10)
    // ─────────────────────────────────────────────────────────────────────
    {
        slug: 'saas-to-saas-icp-value-prop',
        title: 'SaaS → SaaS — ICP Value Prop',
        subject: 'How {{company}} could double SDR output',
        body: `Hi {{first_name}},

Most SaaS sales teams hit a wall at ~150 outbound emails/SDR/day — not because of effort, but because mailbox limits + warmup + deliverability fire drills cap volume.

We work with companies like {{custom.competitor_name}} (similar GTM motion to {{company}}) to remove that ceiling: more mailboxes per SDR, automatic reputation protection, no manual recovery work.

Curious if it'd hold up for your team. Open to a 15-min look?

— {{sender_first}}`,
        prompt: `Write a SaaS-to-SaaS cold email referencing a similar competitor as a peer customer. Lead with the ceiling they're hitting today, name the mechanism, soft CTA. Under 90 words.`,
        bestFor: 'B2B SaaS targeting other SaaS companies running outbound',
        goal: 'introduction',
        industry: 'saas',
        role: 'vp-sales',
        framework: 'bab',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'company', 'custom.competitor_name', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Industry pattern', reason: 'States a number ("~150 emails/SDR/day") most VPs Sales recognize. Establishes you understand their world.' },
            { section: 'body', label: 'Peer customer name-drop', reason: 'Citing a comparable company they\'d recognize is the highest-trust signal in B2B cold email when the comparable is real.' },
        ],
    },
    {
        slug: 'agency-to-ecommerce-dtc',
        title: 'Agency → Ecommerce DTC Brand',
        subject: 'Cold email for {{company}}\'s wholesale channel',
        body: `Hi {{first_name}},

Most DTC brands I talk to are running paid social → DTC and treating wholesale as an afterthought. The teams that get serious about cold outreach to buyers at retailers usually 10x their wholesale revenue inside two quarters.

We run cold outbound for DTC brands like {{custom.peer_brand}} — booking buyer meetings at chains like {{custom.target_retailer}}. End-to-end: list, copy, sending, deliverability protection.

Open to a 20-min look at what we'd build for {{company}}?

— {{sender_first}}`,
        prompt: `Write an agency-pitching-DTC cold email focused on a wholesale-channel use case. Reference peer brands and target retailers. Frame the upside. Under 100 words.`,
        bestFor: 'Cold email agency pitching to DTC ecommerce founders',
        goal: 'introduction',
        industry: 'ecommerce',
        role: 'founder-ceo',
        framework: 'bab',
        tone: 'direct',
        length: 'medium',
        deliverabilityScore: 84,
        variables: ['first_name', 'company', 'custom.peer_brand', 'custom.target_retailer', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Industry insight', reason: 'States a pattern a DTC founder will recognize and probably feel guilty about. Strong hook.' },
            { section: 'body', label: 'Specific outcome path', reason: 'Booking buyer meetings at named retailers is concrete. "10x wholesale revenue in two quarters" is the upside they care about.' },
        ],
    },
    {
        slug: 'recruiter-to-passive-candidate',
        title: 'Recruiter → Passive Candidate',
        subject: '{{custom.specific_skill}} role — would love your take',
        body: `Hi {{first_name}},

Saw your work on {{custom.specific_project}} — impressive how you {{custom.specific_outcome}}.

I'm working with {{custom.client_company}} on a {{custom.role_title}} role. They're looking for someone with exactly that profile, and they pay {{custom.comp_range}}.

Even if you're happy where you are, would you mind a quick 10-min call so I can describe the role properly? If it's not for you, I might know someone in your network it'd fit perfectly.

— {{sender_first}}`,
        prompt: `Write a recruiter cold email to a passive candidate. Open with specific praise of their actual work, name the role + comp transparently, end with a referral fallback. Under 100 words.`,
        bestFor: 'Recruiters reaching technical talent on LinkedIn / via email',
        goal: 'introduction',
        industry: 'recruiting',
        role: 'general',
        framework: 'aida',
        tone: 'personal',
        length: 'medium',
        deliverabilityScore: 89,
        variables: ['first_name', 'custom.specific_skill', 'custom.specific_project', 'custom.specific_outcome', 'custom.client_company', 'custom.role_title', 'custom.comp_range', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Hyper-specific praise', reason: 'Naming an actual project + outcome proves the message isn\'t templated. Recruiters who skip this step have <2% reply rates.' },
            { section: 'body', label: 'Comp transparency', reason: 'Naming pay range up front filters the responses you want and signals respect for the candidate\'s time.' },
            { section: 'cta', label: 'Referral fallback', reason: 'If they\'re not interested, they often refer. Compounds the recruiter\'s pipeline beyond the original outreach.' },
        ],
    },
    {
        slug: 'real-estate-agent-to-homeowner',
        title: 'Real Estate Agent → Homeowner',
        subject: 'Two recent sales near {{custom.property_address}}',
        body: `Hi {{first_name}},

Two homes on {{custom.street_name}} sold in the last 30 days — both above asking. The market in your area is moving faster than this time last year.

Not pitching anything specific. Just keeping owners on {{custom.street_name}} updated on what's happening on the block. If you ever want a 5-min call to talk through what your home would list for in this market, my schedule's open.

— {{sender_first}}`,
        prompt: `Write a real estate agent's cold email to a homeowner. Lead with hyper-local market data, name the street, avoid pushy sales language. Open the door without asking for anything. Under 90 words.`,
        bestFor: 'Realtor doing geographic farming via email',
        goal: 'introduction',
        industry: 'real-estate',
        role: 'general',
        framework: 'story',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 92,
        variables: ['first_name', 'custom.property_address', 'custom.street_name', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Local proof', reason: 'Two recent sales on the recipient\'s street is the only stat that actually matters to them. Universal market data is ignored; their block is not.' },
            { section: 'body', label: 'No pitch', reason: '"Not pitching anything specific" earns the right to a future conversation. Most realtor cold emails fail because they pitch on touch one.' },
        ],
    },
    {
        slug: 'financial-advisor-to-hnw',
        title: 'Financial Advisor → High-Net-Worth Prospect',
        subject: 'Tax planning before year-end — {{custom.specific_concern}}',
        body: `Hi {{first_name}},

A few of our clients in similar profiles to yours have been moving on {{custom.specific_concern}} ahead of year-end — small windows that close December 31.

Not selling anything in this email. Just want to flag the timeline in case you haven't already addressed it. If you've got coverage on this, ignore me.

If not, happy to share a 1-pager outlining the options. No fee, no obligation.

— {{sender_first}}, CFP®`,
        prompt: `Write a financial advisor's cold email to a high-net-worth prospect. Reference a time-sensitive tax/planning issue. Tone: discreet, no-pressure, professional. Under 90 words.`,
        bestFor: 'Financial advisors prospecting HNW individuals before tax deadlines',
        goal: 'problem-pitch',
        industry: 'financial-services',
        role: 'general',
        framework: 'pas',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 90,
        variables: ['first_name', 'custom.specific_concern', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Time-sensitive frame', reason: 'Year-end tax deadlines are universal pain. Even prospects who don\'t open most cold email open ones tied to a deadline they\'ll miss.' },
            { section: 'body', label: 'Permission to ignore', reason: '"If you\'ve got coverage, ignore me" disarms the recipient. Better reply rate than insistent advisor pitches.' },
        ],
    },
    {
        slug: 'freelancer-to-vp-marketing-services',
        title: 'Freelancer → VP Marketing — Services Pitch',
        subject: '3 ideas for {{company}}\'s {{custom.channel}} channel',
        body: `Hi {{first_name}},

Spent 30 minutes looking at {{company}}'s {{custom.channel}} setup. Three ideas:

1. {{custom.idea_1}}
2. {{custom.idea_2}}
3. {{custom.idea_3}}

Happy to walk through any of these on a 15-min call — no pitch attached. If one of them lands, I freelance specifically on this kind of work for B2B teams.

— {{sender_first}}`,
        prompt: `Write a freelancer's cold email to a VP Marketing pitching a specific channel. Open with three concrete ideas already done, offer a no-strings call, mention the freelance angle only at the end. Under 90 words.`,
        bestFor: 'Specialist freelancer (paid social, SEO, email) pitching mid-market B2B',
        goal: 'introduction',
        industry: 'freelancers',
        role: 'vp-marketing',
        framework: 'qvc',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'custom.channel', 'custom.idea_1', 'custom.idea_2', 'custom.idea_3', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Work shown, not promised', reason: 'Opening with three real ideas is itself a demo. Most freelancer cold emails ask for the meeting before delivering any value.' },
            { section: 'body', label: 'Pitch buried at the end', reason: 'Mentioning "I freelance" only after the value is delivered changes the dynamic from sales to consulting.' },
        ],
    },
    {
        slug: 'revops-consultant-to-growing-company',
        title: 'RevOps Consultant → Growing Company',
        subject: 'CRM hygiene at {{company}}?',
        body: `Hi {{first_name}},

Companies at {{company}}'s growth stage usually hit a wall where the CRM has 30%+ duplicate records, 15%+ stale opportunities, and reps are spending 4+ hours/week on data entry instead of selling.

I help RevOps teams clean that up in 4–6 weeks — recovering ~10 hours/rep/week and improving forecast accuracy by 20–30%.

Want a 15-min look at what we'd find in your data?

— {{sender_first}}`,
        prompt: `Write a RevOps consultant's cold email to a growing company. Open with a benchmark of typical CRM hygiene problems at their stage, name the recovery delta concretely, offer a 15-min audit. Under 90 words.`,
        bestFor: 'RevOps / Salesforce consultants pitching companies in 50–500 headcount range',
        goal: 'problem-pitch',
        industry: 'consulting',
        role: 'vp-sales',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 89,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Benchmark numbers', reason: 'Specific percentages ("30%+", "15%+") establish credibility immediately. Vague consulting pitches lose to precise ones every time.' },
        ],
    },
    {
        slug: 'cybersecurity-firm-to-compliance-officer',
        title: 'Cybersecurity Firm → Compliance Officer',
        subject: 'SOC 2 audit prep — typical 40-hour gap',
        body: `Hi {{first_name}},

Most {{custom.industry}} compliance teams discover ~40 hours of evidence-collection gap two weeks before their SOC 2 audit window. Then it's overtime + Slack threads with engineering.

We run a 5-day pre-audit gap analysis that surfaces those gaps 90 days early instead — gives you time to actually close them with the engineering team's normal cadence.

Worth 20 min to walk through what the audit looks like for {{company}}?

— {{sender_first}}`,
        prompt: `Write a cybersecurity vendor's cold email to a compliance officer. Lead with a SOC 2 / audit-prep pain. Show you understand the timeline. End with a low-friction discovery call. Under 100 words.`,
        bestFor: 'Cybersecurity / compliance vendors targeting in-house compliance leaders',
        goal: 'problem-pitch',
        industry: 'cybersecurity',
        role: 'compliance-officer',
        framework: 'pas',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'company', 'custom.industry', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Universal compliance pain', reason: 'The 40-hour pre-audit fire drill is recognizable to anyone who has been through a SOC 2. Earned credibility in one sentence.' },
        ],
    },
    {
        slug: 'ai-tool-builder-founder-led',
        title: 'AI Tool Builder — Founder-Led',
        subject: 'Built this for {{custom.target_workflow}}',
        body: `Hi {{first_name}},

Built a small thing for teams running {{custom.target_workflow}}. Replaces about 6 hours/week of manual work — does {{custom.specific_action}} automatically based on {{custom.trigger_signal}}.

Few teams already using it: {{custom.peer_user_1}}, {{custom.peer_user_2}}.

If {{company}} is doing this manually, want to send the demo link? It's free to try.

— {{sender_first}}, founder of {{custom.product_name}}`,
        prompt: `Write a founder-led cold email about a small AI tool. Lead with the specific manual work it replaces, cite peer users, soft demo CTA. Under 80 words. Founder voice — casual, confident, not sales-y.`,
        bestFor: 'Solo or small-team SaaS founders cold-pitching their own product',
        goal: 'introduction',
        industry: 'ai-tools',
        role: 'founder-ceo',
        framework: 'direct',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 91,
        variables: ['first_name', 'company', 'custom.target_workflow', 'custom.specific_action', 'custom.trigger_signal', 'custom.peer_user_1', 'custom.peer_user_2', 'custom.product_name', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Founder voice', reason: '"Built a small thing" is recognizable as a real founder talking about their actual product. Resonates with operator buyers.' },
            { section: 'cta', label: 'Free to try', reason: 'PLG-friendly CTA bypasses the sales motion entirely. Lower friction than "book a demo."' },
        ],
    },
    {
        slug: 'consulting-firm-to-coo-scaleup',
        title: 'Consulting Firm → Scale-up COO',
        subject: 'Operational debt at {{company}}\'s stage',
        body: `Hi {{first_name}},

At {{company}}'s headcount and growth rate, most COOs we work with are managing 3–5 critical processes that haven't been re-engineered since the company was 1/3 the size.

Usually shows up as: support response time creeping up, manual reconciliation across departments, founders involved in operational decisions they shouldn't be.

We run a 2-week ops diagnostic that identifies which process to tackle first based on cost-of-not-fixing. Open to a 20-min walkthrough of what we'd look at?

— {{sender_first}}, partner at {{custom.firm_name}}`,
        prompt: `Write a consulting firm's cold email to a scale-up COO. Identify operational debt that companies at their stage typically carry. Frame the consulting engagement as a focused 2-week diagnostic. Under 110 words.`,
        bestFor: 'Mid-market operations consultants pitching post-Series B companies',
        goal: 'problem-pitch',
        industry: 'consulting',
        role: 'director-ops',
        framework: 'pas',
        tone: 'formal',
        length: 'medium',
        deliverabilityScore: 84,
        variables: ['first_name', 'company', 'custom.firm_name', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Pain pattern recognition', reason: 'Naming three concrete symptoms ("support response time creeping up...") shows the consultant has seen this many times before.' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // ROLE-BASED + FRAMEWORK SHOWCASE (10)
    // ─────────────────────────────────────────────────────────────────────
    {
        slug: 'witty-cmo-provocative',
        title: 'Witty CMO — Provocative',
        subject: 'You\'re measuring the wrong number, {{first_name}}',
        body: `Most CMOs I talk to are measuring "MQLs" like it's still 2018.

Meanwhile pipeline is built on accounts that never filled out a form, never engaged a campaign, and showed up in the deal cycle from a totally different signal.

I'm not saying kill the MQL. I'm saying you probably already know it's a vanity metric and just haven't had the cover to fight that battle internally.

15 min to compare notes on what high-performing CMOs are actually using to forecast? No pitch.

— {{sender_first}}`,
        prompt: `Write a provocative cold email to a CMO challenging an outdated metric they\'re still using. Tone: witty, slightly contrarian, but respectful. Under 110 words.`,
        bestFor: 'B2B SaaS / agencies pitching senior marketing leaders willing to engage with direct critique',
        goal: 'introduction',
        industry: 'general',
        role: 'cmo',
        framework: 'pas',
        tone: 'provocative',
        length: 'medium',
        deliverabilityScore: 80,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Pattern interrupt', reason: 'Calling out their measurement is bold but not insulting. Either they reply defending it or curious. Either is engagement.' },
            { section: 'body', label: 'Cover, not criticism', reason: '"You probably already know" reframes from "you\'re wrong" to "you\'ve been waiting to fix this." Higher reply rate, lower hostility.' },
        ],
    },
    {
        slug: 'story-founder-personal',
        title: 'Story → Founder — Personal',
        subject: 'What broke last time we ran outbound',
        body: `Hi {{first_name}},

Last company I ran outbound for, we burned 3 sending domains in 4 weeks. We were on Smartlead, used a separate validator, ran bot warmup. By the time the platform showed us the bounce rate, we'd already lost 6 weeks of pipeline.

I built Superkabe specifically because that experience was so frustrating. The validator's signal now actually changes how the sender treats a lead. Bounces in one campaign suppress the lead everywhere instantly. Real recovery instead of "wait for warmup to fix it."

Wondering if any of this resonates with how outbound looks at {{company}} today.

— {{sender_first}}`,
        prompt: `Write a story-driven founder cold email. Open with a personal failure that motivated the product. Tie it to a specific mechanism that\'s now solved. End with a curiosity-driven question. Under 130 words.`,
        bestFor: 'Founders pitching their own product, especially when the story is real',
        goal: 'introduction',
        industry: 'general',
        role: 'founder-ceo',
        framework: 'story',
        tone: 'personal',
        length: 'medium',
        deliverabilityScore: 82,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Authentic vulnerability', reason: 'A specific failure (3 domains in 4 weeks) earns more trust than any case study. Builds parasocial connection in 2 sentences.' },
        ],
    },
    {
        slug: 'question-led-head-of-demand-gen-qvc',
        title: 'Question-Led → Head of Demand Gen',
        subject: 'How are you measuring SDR mailbox health at {{company}}?',
        body: `Hi {{first_name}},

Genuinely curious — at {{company}}, are you measuring SDR mailbox health (reputation, bounce rate, complaint rate) in real-time, or is it a weekly snapshot from someone in ops?

Most demand gen teams we work with were doing the latter, and discovering reputation drops 5–10 days late on average. We help them get to real-time visibility (and auto-recovery when things drift).

Want a 15-min look at what real-time looks like for a team your size?

— {{sender_first}}`,
        prompt: `Write a question-led cold email to a Head of Demand Gen. Open with a genuine operational question, frame the typical answer as a problem, offer the upgrade. Under 100 words.`,
        bestFor: 'Sales/marketing operations vendors pitching demand gen leaders',
        goal: 'introduction',
        industry: 'general',
        role: 'head-of-demand-gen',
        framework: 'qvc',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Real question, not rhetorical', reason: 'Asking a real question (vs. a leading one) gets actual replies. People answer honest questions about their own setup.' },
        ],
    },
    {
        slug: 'direct-cfo-micro',
        title: 'Direct CFO — Micro',
        subject: 'Cold email tool consolidation = $90K/yr at your size',
        body: `Hi {{first_name}},

Quick math: a 50-mailbox cold email setup typically runs $400–700/mo across 6 separate tools, plus ~80 hours/yr of ops time. We replace the stack.

Annual savings for a company at {{company}}'s size: ~$90K.

Worth 15 min to walk through your current spend?

— {{sender_first}}`,
        prompt: `Write a CFO-targeted cold email. Lead with concrete savings math, no fluff, name the cost categories, end with a 15-min CTA. Under 60 words. Tone: direct, financial.`,
        bestFor: 'Pitching CFOs / heads of finance at agencies running cold email at scale',
        goal: 'introduction',
        industry: 'general',
        role: 'cfo',
        framework: 'bab',
        tone: 'direct',
        length: 'micro',
        deliverabilityScore: 92,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Number-driven', reason: 'CFOs respond to numbers in subject lines more than any other persona. "$90K/yr" is the entire pitch.' },
            { section: 'body', label: 'No padding', reason: 'A CFO\'s attention span on cold email is famously short. Three sentences + CTA is the right shape.' },
        ],
    },
    {
        slug: 'casual-head-of-people-hr-tech',
        title: 'Casual → Head of People — HR Tech',
        subject: 'Onboarding is everyone\'s worst process',
        body: `Hey {{first_name}},

Onboarding is the most universally hated process at companies under 500 people. Half-built spreadsheets, manual provisioning, new hires sitting around for two days waiting for accounts to get set up.

We've been working on this with HR teams at companies your size — automating the messy parts without forcing you onto a Workday-tier system.

Quick 15 min to see if it'd actually save your team hours? No deck, just walk through your current flow.

— {{sender_first}}`,
        prompt: `Write a casual cold email to a Head of People at a sub-500-person company. Identify a universal HR pain (onboarding mess), offer a casual demo. Under 100 words.`,
        bestFor: 'HR Tech vendors targeting growing-stage companies',
        goal: 'introduction',
        industry: 'general',
        role: 'head-of-people',
        framework: 'pas',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 90,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Universal truth', reason: 'Most People leaders nod at the onboarding line. Earns the second sentence.' },
            { section: 'cta', label: 'No-deck CTA', reason: '"No deck, just walk through your current flow" signals the meeting is for them, not us. Higher acceptance rate.' },
        ],
    },
    {
        slug: 'provocative-vp-sales-status-quo',
        title: 'Provocative → VP Sales — Status-Quo Disruption',
        subject: 'Your top 3 SDRs aren\'t making quota because of your tooling',
        body: `{{first_name}},

Worth saying out loud: when SDRs miss quota at companies running on Smartlead/Instantly, the issue is rarely the SDR. It's that their reputation is degraded, half their emails are landing in spam, and the platform doesn't surface that until a mailbox gets paused.

Your top 3 reps are probably hitting 60% of their potential output.

Worth 15 min to see what the other 40% looks like? Bring your last 30 days of bounce data and I'll show you live.

— {{sender_first}}`,
        prompt: `Write a provocative cold email to a VP Sales. Make a bold claim about why their SDRs miss quota, blame the infrastructure not the rep, end with a data-backed CTA. Under 110 words. Tone: confident, slightly aggressive.`,
        bestFor: 'B2B platforms pitching VP Sales who measure their teams obsessively',
        goal: 'introduction',
        industry: 'saas',
        role: 'vp-sales',
        framework: 'pas',
        tone: 'provocative',
        length: 'medium',
        deliverabilityScore: 78,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Blame reframe', reason: 'Most VP Sales blame reps. Reframing to infrastructure is provocative but defensible — and it\'s what the data actually shows.' },
            { section: 'cta', label: 'Bring your data', reason: '"Bring your last 30 days of bounce data" is a strong qualifier. Anyone who shows up with data is a real lead.' },
        ],
    },
    {
        slug: 'aida-director-of-operations',
        title: 'AIDA Classic → Director of Operations',
        subject: 'Reduce {{company}}\'s ops dashboards from 14 to 1',
        body: `Hi {{first_name}},

The average operations leader at a 200-person company logs into 14 different tools per day to see the full picture of how the business is running.

Most of those tools share the same underlying data — but each one shows it through a different lens, with no shared model. So you spend half your day reconciling.

We built a unified ops layer that pulls from your existing tools (we don't replace them) and gives you one dashboard with one source of truth. Companies your size cut their daily login count from 14 to 1 within 30 days.

Want a 20-min walkthrough using your real tool stack?

— {{sender_first}}`,
        prompt: `Write a classic AIDA cold email to a Director of Operations. Attention (the 14-dashboard stat), Interest (why), Desire (the unified dashboard outcome), Action (20-min walkthrough). Under 130 words.`,
        bestFor: 'Ops platforms / data integration tools pitching mid-market ops leaders',
        goal: 'introduction',
        industry: 'general',
        role: 'director-ops',
        framework: 'aida',
        tone: 'direct',
        length: 'medium',
        deliverabilityScore: 84,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Hook stat', reason: 'A specific number ("14 different tools") at the very top earns the read. AIDA lives or dies on the attention step.' },
        ],
    },
    {
        slug: 'formal-legal-financial-icp',
        title: 'Formal → Legal/Financial ICP',
        subject: 'Re: confidentiality protocols for outbound at {{company}}',
        body: `Dear {{first_name}},

I work with law firms and financial advisory practices on cold outbound where confidentiality and audit-readiness are not optional.

Most general-purpose cold email platforms do not provide compliance auditing, do not log every send for legal discovery, and require manual configuration to meet GDPR / CCPA / CAN-SPAM requirements per campaign.

We provide a single platform with built-in audit trails, automatic compliance configuration, and the legal hold capabilities that regulated industries require.

Would a 30-minute call to walk through {{company}}'s outbound compliance posture be useful? I am happy to NDA in advance.

Best regards,
{{sender_first}} {{custom.sender_last}}`,
        prompt: `Write a formal cold email to a senior person at a law firm or financial advisory. Tone: precise, professional, no slang. Acknowledge confidentiality requirements, offer NDA. Under 130 words.`,
        bestFor: 'Vendors pitching legal, financial advisory, or other regulated industries',
        goal: 'introduction',
        industry: 'financial-services',
        role: 'general',
        framework: 'problem-solution',
        tone: 'formal',
        length: 'medium',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'custom.sender_last', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Tone match', reason: '"Dear" + full sentences match the recipient\'s expected register. Casual cold emails get filtered as unprofessional in regulated industries.' },
            { section: 'cta', label: 'Pre-emptive NDA', reason: 'Offering NDA in advance signals you understand the recipient\'s real concern. Removes the biggest barrier to a first call.' },
        ],
    },
    {
        slug: 'witty-pas-sdr-manager',
        title: 'Witty PAS → SDR Manager',
        subject: 'Your SDRs spent 3.2 hours yesterday on data entry',
        body: `Hi {{first_name}},

The average SDR at a B2B SaaS company spends 3.2 hours/day on data entry, manual list cleaning, and CRM updates.

That's 16 hours/week × your team size. For a 10-SDR team, you\'re losing 160 hours/week of selling time to data work.

Or: you have 4 full-time SDRs hidden inside admin work nobody asked them to do.

We automate the data side so they can sell. 15 min to talk through it?

— {{sender_first}}`,
        prompt: `Write a witty PAS cold email to an SDR Manager. Lead with a specific time-waste stat, agitate by reframing it as headcount equivalent, offer the upgrade. Under 90 words.`,
        bestFor: 'Sales-ops / sales-enablement vendors pitching SDR leadership',
        goal: 'introduction',
        industry: 'saas',
        role: 'sdr-manager',
        framework: 'pas',
        tone: 'witty',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Reframe as headcount', reason: '"You have 4 hidden SDRs" is the line that lands. Converting time waste into FTE equivalent is the highest-impact reframe in the SDR-manager pitch.' },
        ],
    },
    {
        slug: 'hyper-personalized-founder',
        title: 'Hyper-Personalized → Founder',
        subject: 'Your post on {{custom.specific_post_topic}}',
        body: `Hi {{first_name}},

Read your post on {{custom.specific_post_topic}} — particularly the part about {{custom.specific_quote_or_idea}}. Made me think.

We've been working on {{custom.related_problem}} from a different angle: {{custom.brief_approach}}. I think the conclusion you came to overlaps with where we landed, but for slightly different reasons.

Open to a 15-min compare-notes call? Genuinely useful for both sides — not pitching you in this email or that one.

— {{sender_first}}`,
        prompt: `Write a hyper-personalized cold email to a founder, referencing a specific post they wrote. Open with a quote or idea from the post, connect it to your work without pitching, propose a peer-level compare-notes call. Under 110 words.`,
        bestFor: 'Founder-led outbound to other founders who write publicly',
        goal: 'introduction',
        industry: 'general',
        role: 'founder-ceo',
        framework: 'story',
        tone: 'personal',
        length: 'medium',
        deliverabilityScore: 90,
        variables: ['first_name', 'custom.specific_post_topic', 'custom.specific_quote_or_idea', 'custom.related_problem', 'custom.brief_approach', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Quoted specificity', reason: 'Citing a specific quote/idea from their actual post is the highest-trust opener possible. Cannot be templated at scale.' },
            { section: 'cta', label: 'Peer compare-notes', reason: 'Founders meet other founders to exchange perspectives more readily than to take a sales meeting. Frame matters.' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // BATCH A — INDUSTRY INTROS (20)
    // One specialized cold intro per major B2B vertical. Each one names a
    // pain that's recognizable inside the industry and uses a CTA tuned to
    // how that buyer actually responds to outreach.
    // ─────────────────────────────────────────────────────────────────────
    {
        slug: 'healthtech-clinic-operations',
        title: 'Healthtech → Clinic Operations',
        subject: 'Patient no-show rate at {{company}}',
        body: `Hi {{first_name}},

Most multi-provider clinics run a 15–25% no-show rate without realizing what it costs in revenue. At {{custom.provider_count}} providers, that's roughly {{custom.revenue_loss_estimate}}/year in unrecoverable slots.

We work with practices like {{custom.peer_clinic}} to cut no-shows by 40%+ using a combination of timing-based reminders, deposit policy redesign, and waitlist automation — without adding work for your front desk.

Worth 20 min to walk through the math for {{company}}?

— {{sender_first}}`,
        prompt: `Write a cold email to a clinic operations director. Lead with the no-show rate as a quantifiable cost, name a peer clinic, offer a 20-min math walkthrough. Under 100 words.`,
        bestFor: 'Healthtech vendors selling scheduling, patient engagement, or revenue cycle tools',
        goal: 'introduction',
        industry: 'healthcare',
        role: 'healthcare-admin',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 89,
        variables: ['first_name', 'company', 'custom.provider_count', 'custom.revenue_loss_estimate', 'custom.peer_clinic', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Cost quantification', reason: 'Healthcare buyers respond to cost-per-incident framing more than vague "improve patient experience" claims.' },
            { section: 'body', label: 'Peer clinic name-drop', reason: 'Trust signals from comparable practices are the highest-converting credibility marker for healthcare ops leaders.' },
        ],
    },
    {
        slug: 'manufacturing-plant-manager',
        title: 'Manufacturing → Plant Manager',
        subject: 'OEE at {{company}}\'s {{custom.plant_location}} plant',
        body: `Hi {{first_name}},

Most manufacturers running mixed-model lines hit an OEE ceiling around 65–72% — not from machine downtime but from changeover lag and unplanned material wait time.

We work with plants of {{company}}'s scale to surface those soft-loss minutes (the ones MES reports usually miss) and bring OEE up 8–12 points within two quarters.

Worth a 30-min walkthrough using last quarter's OEE data?

— {{sender_first}}`,
        prompt: `Write a cold email to a plant manager. Use OEE (overall equipment effectiveness) as the hook — name the typical ceiling, identify the hidden loss type, offer a data walkthrough. Under 90 words.`,
        bestFor: 'Manufacturing software / MES / lean ops consultants',
        goal: 'introduction',
        industry: 'manufacturing',
        role: 'plant-manager',
        framework: 'problem-solution',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'custom.plant_location', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Industry-jargon-precise', reason: 'Plant managers filter cold email aggressively. Using "OEE" in the subject signals you understand their world before they open.' },
        ],
    },
    {
        slug: 'legal-law-firm-partner',
        title: 'Legal Services → Law Firm Partner',
        subject: 'Realization rate at {{company}}',
        body: `Dear {{first_name}},

Most mid-sized firms quietly run a 78–84% realization rate — meaning roughly 1 in every 6 hours billed never gets collected. That's typically 4–6% of firm revenue lost to write-downs and write-offs.

Our practice operations platform helps partners surface where realization is leaking (specific matters, specific clients, specific timekeepers) and stops the bleed before the next billing cycle.

If a 30-min review of {{company}}'s realization data would be useful, my schedule's open. Confidentiality assured; happy to NDA.

Best regards,
{{sender_first}} {{custom.sender_last}}`,
        prompt: `Write a formal cold email to a law firm partner. Lead with realization rate as the metric, frame the loss in revenue terms, offer a confidential review. Tone: precise, professional. Under 110 words.`,
        bestFor: 'Legal tech / practice management vendors targeting mid-sized firms',
        goal: 'introduction',
        industry: 'legal',
        role: 'law-firm-partner',
        framework: 'pas',
        tone: 'formal',
        length: 'medium',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'custom.sender_last', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Realization rate hook', reason: 'Realization rate is the most universally understood pain at firms — it speaks to revenue leakage every partner has felt.' },
            { section: 'cta', label: 'Pre-emptive NDA', reason: 'Offering NDA in advance lowers the biggest barrier to a first conversation with regulated-services partners.' },
        ],
    },
    {
        slug: 'education-school-admin',
        title: 'Education → Head of School',
        subject: 'Re-enrollment yield at {{company}}',
        body: `Hi {{first_name}},

Independent schools hit a re-enrollment yield ceiling around 88–92% — and the families that don't return usually showed signals 60–90 days before they actually withdrew.

We help schools surface those signals (specific tuition discussions, missing tour follow-ups, lapsed parent communications) and intervene before withdrawal becomes inevitable. Schools your size typically recover 2–4 percentage points of yield annually — which is significant tuition revenue.

Open to a 20-min call to discuss what we'd look at for {{company}}?

— {{sender_first}}`,
        prompt: `Write a cold email to a head of school or admissions director. Lead with re-enrollment yield as the metric, identify withdrawal signals, frame the recovery as tuition revenue. Under 100 words.`,
        bestFor: 'Edtech / school management / parent comms platforms',
        goal: 'introduction',
        industry: 'education',
        role: 'school-admin',
        framework: 'pas',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Tuition revenue framing', reason: 'School leaders respond to retention more than acquisition because losing a family means losing 8–12 years of tuition.' },
        ],
    },
    {
        slug: 'marketing-agency-brand-manager',
        title: 'Marketing Agency → Brand Manager',
        subject: 'Stop paying for paid social you can\'t attribute',
        body: `Hi {{first_name}},

Most brand teams I talk to are spending 30–40% of paid social budget on placements they can't actually attribute to revenue — and the agency reports keep showing "engagement" instead of pipeline.

We run paid social for B2C brands like {{custom.peer_brand}} where every dollar gets tied to either a purchase or a real qualified signup. No engagement vanity metrics.

Open to a 20-min audit of {{company}}'s last quarter? We'll show you exactly which placements are leaking.

— {{sender_first}}`,
        prompt: `Write a cold email from an agency to a brand manager. Lead with the paid social attribution problem, name a peer brand, offer a free audit. Under 100 words.`,
        bestFor: 'Performance marketing agencies pitching mid-market consumer brands',
        goal: 'introduction',
        industry: 'agencies',
        role: 'marketing-manager',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 85,
        variables: ['first_name', 'company', 'custom.peer_brand', 'sender_first'],
        annotations: [
            { section: 'cta', label: 'Free audit', reason: 'Audits are the highest-converting cold-email CTA for agencies. They\'re concrete, time-boxed, and demonstrate value before a contract.' },
        ],
    },
    {
        slug: 'insurance-broker-pitch',
        title: 'Insurance → Broker',
        subject: 'Renewal retention at {{company}}',
        body: `Hi {{first_name}},

Most independent brokerages run 88–92% renewal retention — but the 8–12% that walk are often clients who got a better quote 60 days before renewal, not at renewal.

We help brokers surface those at-risk accounts 90 days early so you can have the right conversation before the prospect's already shopping.

Worth 20 min to walk through how this would fit your book at {{company}}?

— {{sender_first}}`,
        prompt: `Write a cold email to an insurance broker. Lead with renewal retention, identify the 90-day-before-renewal moment, offer a walkthrough specific to their book. Under 90 words.`,
        bestFor: 'Insurance tech vendors selling retention or renewal-management tools',
        goal: 'introduction',
        industry: 'insurance',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Specific timing window', reason: 'Naming the 90-day-before-renewal moment shows operational understanding most cold emails miss.' },
        ],
    },
    {
        slug: 'logistics-vp-pitch',
        title: 'Logistics → VP Logistics',
        subject: 'Final-mile cost at {{company}}',
        body: `Hi {{first_name}},

Final-mile is now 40–53% of total shipping cost for most distributors — and most logistics teams are still optimizing the warehouse-to-hub leg where the savings are maybe 3-5%.

We help VPs Logistics get visibility into where the actual final-mile dollars are going (specific zones, specific carriers, specific time windows) and renegotiate from data instead of vendor relationships.

Open to a 30-min call using your last quarter's final-mile data as the baseline?

— {{sender_first}}`,
        prompt: `Write a cold email to a VP Logistics. Lead with final-mile cost as the largest line-item, contrast with where teams typically optimize, offer a data-driven walkthrough. Under 100 words.`,
        bestFor: 'Logistics / TMS / supply chain visibility vendors',
        goal: 'introduction',
        industry: 'logistics',
        role: 'general',
        framework: 'problem-solution',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Misallocation insight', reason: 'Pointing out that teams optimize the wrong leg of the supply chain is a credibility-building move that earns the meeting.' },
        ],
    },
    {
        slug: 'hospitality-hotel-gm',
        title: 'Hospitality → Hotel GM',
        subject: 'RevPAR vs market at {{custom.hotel_name}}',
        body: `Hi {{first_name}},

Last 30 days, properties in {{custom.market}} ran an average RevPAR of {{custom.market_revpar}}. Curious where {{custom.hotel_name}} landed — if you're below market, the gap is almost always rate optimization on shoulder dates, not occupancy.

We work with hotels in your competitive set to close that RevPAR gap by 8–14% within a quarter using dynamic pricing tied to actual demand signals (not last year's pace report).

Worth a 25-min look?

— {{sender_first}}`,
        prompt: `Write a cold email to a hotel GM. Lead with RevPAR comparison to local market, identify the gap as a rate problem (not occupancy), offer a quarterly close. Under 100 words.`,
        bestFor: 'Hospitality revenue management / dynamic pricing / channel manager vendors',
        goal: 'introduction',
        industry: 'hospitality',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'custom.hotel_name', 'custom.market', 'custom.market_revpar', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Localized benchmark', reason: 'Citing market RevPAR specific to their submarket is the most precise hook in hospitality cold email.' },
        ],
    },
    {
        slug: 'nonprofit-executive-director',
        title: 'Nonprofit → Executive Director',
        subject: 'Donor retention rate at {{company}}',
        body: `Hi {{first_name}},

Average nonprofit donor retention sits at 43%. Best-in-class is 70%+. The difference isn't fundraising spend — it's the 60-day window after a first donation, where most orgs send a tax receipt and then go silent for 11 months.

We help EDs build the second-touch moment that closes that retention gap. Cost a fraction of acquiring net-new donors.

If a 20-min call to discuss {{company}}'s retention numbers would be useful, happy to set it up.

— {{sender_first}}`,
        prompt: `Write a cold email to a nonprofit executive director. Lead with donor retention benchmark, identify the 60-day silent window, offer a strategic call. Tone: respectful, mission-aware. Under 100 words.`,
        bestFor: 'Nonprofit CRM / donor engagement platforms',
        goal: 'introduction',
        industry: 'nonprofit',
        role: 'founder-ceo',
        framework: 'pas',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 89,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Retention vs acquisition', reason: 'Most nonprofit cold pitches focus on acquiring more donors. Reframing to retention speaks to the actual ED-level priority.' },
        ],
    },
    {
        slug: 'construction-project-manager',
        title: 'Construction → Project Manager',
        subject: 'Schedule slippage on {{custom.project_name}}',
        body: `Hi {{first_name}},

Most commercial projects slip 8–14% beyond original schedule — and the variance compounds in the last 30% of the build because subcontractor coordination breaks down right when the field is most chaotic.

We work with project managers on builds {{company}}'s size to keep weekly subcontractor accountability tight in the closeout phase, typically recovering 3–6 weeks of schedule.

Open to a 25-min call to discuss your closeout approach?

— {{sender_first}}`,
        prompt: `Write a cold email to a construction project manager. Lead with schedule slippage as the universal pain, identify the closeout phase as the breakdown point, offer a recovery-focused walkthrough. Under 100 words.`,
        bestFor: 'Construction tech / project management / closeout management software',
        goal: 'introduction',
        industry: 'construction',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'custom.project_name', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Closeout-phase specificity', reason: 'PMs nod at "closeout breaks down" instantly. It\'s where their reputation lives or dies on every project.' },
        ],
    },
    {
        slug: 'media-editor-pitch',
        title: 'Media → Editor',
        subject: 'Original data on {{custom.beat_topic}}',
        body: `Hi {{first_name}},

Saw your piece on {{custom.recent_article_topic}} last week — the data you cited was thin (you noted it yourself). I have proprietary numbers on {{custom.related_dataset}} from {{custom.data_source}} that go deeper.

If useful for a follow-up piece, happy to share under embargo. The data shows {{custom.headline_finding}} — which I don't think anyone else has reported.

Lmk if a 15-min call to brief you would help.

— {{sender_first}}`,
        prompt: `Write a cold email to a journalist or editor. Reference a specific recent article they wrote, offer proprietary data they don't have, propose embargoed sharing. Under 100 words. Tone: professional, peer-level.`,
        bestFor: 'PR / data-driven companies pitching trade journalists',
        goal: 'press-pitch',
        industry: 'media',
        role: 'journalist',
        framework: 'qvc',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'custom.beat_topic', 'custom.recent_article_topic', 'custom.related_dataset', 'custom.data_source', 'custom.headline_finding', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Specific article reference', reason: 'Journalists get hundreds of pitches. Citing one of their pieces (and a real critique of it) immediately stands out.' },
            { section: 'cta', label: 'Embargo offer', reason: 'Embargoed exclusives are the currency journalists trade in. Offering one signals professionalism.' },
        ],
    },
    {
        slug: 'pharma-medical-director',
        title: 'Pharma → Medical Director',
        subject: 'KOL engagement at {{company}}',
        body: `Dear Dr. {{last_name}},

Most pharma medical affairs teams measure KOL engagement with quarterly snapshots — by which point the relationship has either deepened or atrophied without intervention.

Our medical-affairs analytics surface real-time KOL signals (publication patterns, conference attendance, peer citations) so your team can respond to opportunities and risks weeks earlier.

If a 30-min review of {{company}}'s current KOL framework would be useful, happy to set it up. NDA in place if needed.

Best regards,
{{sender_first}} {{custom.sender_last}}`,
        prompt: `Write a formal cold email to a pharma medical director. Lead with KOL engagement as the operational pain, contrast quarterly snapshots with real-time signals, offer NDA. Under 100 words.`,
        bestFor: 'Medical affairs / KOL management software for pharma',
        goal: 'introduction',
        industry: 'healthcare',
        role: 'healthcare-admin',
        framework: 'pas',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 84,
        variables: ['last_name', 'company', 'custom.sender_last', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Title-respect', reason: 'Using "Dr. {{last_name}}" rather than first name signals you understand pharma\'s formal register.' },
        ],
    },
    {
        slug: 'accounting-firm-partner',
        title: 'Accounting Firm → Partner',
        subject: 'Realization at {{company}}',
        body: `Hi {{first_name}},

CPA firms in the {{custom.firm_size_tier}} tier typically run realization in the 82–87% range — and the gap to best-in-class (94%+) is usually three things: WIP review cadence, fixed-fee scope creep, and partner time entry lag.

We help partners surface those three leaks specifically and recover 4–7 points of realization within two seasons.

Open to a 30-min review of {{company}}'s last filing season data? Confidentiality assured.

— {{sender_first}}`,
        prompt: `Write a formal cold email to a CPA firm partner. Lead with realization rate, name three specific leaks, offer a confidential review. Under 100 words.`,
        bestFor: 'Practice management / time-tracking / WIP management software for CPA firms',
        goal: 'introduction',
        industry: 'financial-services',
        role: 'general',
        framework: 'pas',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'custom.firm_size_tier', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Three named leaks', reason: 'Specific operational categories (WIP review, scope creep, time entry) prove the sender has worked with similar firms.' },
        ],
    },
    {
        slug: 'retail-buyer-merchandiser',
        title: 'Retail → Buyer / Merchandiser',
        subject: 'Inventory turn at {{company}}\'s {{custom.category}} category',
        body: `Hi {{first_name}},

Most retailers running {{custom.category}} hit inventory turn around 4.5–6x. The buyers who cross 8x consistently aren't sourcing better — they're stocking less variety per door and using replenishment automation to never go OOS on the SKUs that move.

Curious where {{company}} sits today. If turn is below 6, we'd want a 25-min call to walk through what's possible.

— {{sender_first}}`,
        prompt: `Write a cold email to a retail buyer or merchandiser. Lead with inventory turn benchmark for their category, contrast width-of-assortment with replenishment automation, offer a benchmarking call. Under 100 words.`,
        bestFor: 'Retail tech / merchandise planning / inventory automation vendors',
        goal: 'introduction',
        industry: 'retail',
        role: 'procurement-buyer',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'custom.category', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Counterintuitive insight', reason: 'Reframing high-turn as "less variety + better replenishment" goes against intuition and earns the meeting.' },
        ],
    },
    {
        slug: 'property-management-portfolio',
        title: 'Property Management → Portfolio Manager',
        subject: 'Renewal rate at {{company}}',
        body: `Hi {{first_name}},

Multifamily portfolios in the {{custom.market}} market are running renewal rates in the 52–58% range right now — down from pre-2024 norms. The portfolios staying at 65%+ are sending personalized renewal offers 90 days out, not generic blanket increases.

We help portfolio managers segment residents by risk-of-non-renewal and price renewals individually. Typical lift: 6–10 percentage points within one renewal cycle.

Open to 25 min to walk through {{company}}'s renewal data?

— {{sender_first}}`,
        prompt: `Write a cold email to a multifamily property portfolio manager. Lead with regional renewal benchmark, contrast generic with personalized renewal pricing, offer a data walkthrough. Under 100 words.`,
        bestFor: 'PropTech / multifamily revenue management / resident retention vendors',
        goal: 'introduction',
        industry: 'real-estate',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'custom.market', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Market-specific benchmark', reason: 'Regional benchmarks beat national ones in real estate — every market has its own dynamics and operators know it.' },
        ],
    },
    {
        slug: 'government-program-manager',
        title: 'Government Contractor → Program Manager',
        subject: 'CPARS performance at {{company}}',
        body: `Dear {{first_name}},

CPARS ratings are increasingly the deciding factor on follow-on contracts — and most program managers are still seeing the rating after submission, not driving it during execution.

We work with prime contractors to surface CPARS-relevant signals (CDRL timeliness, CO communication patterns, milestone variance) in real time so you can correct course before quarterly reviews lock the rating in.

Worth 30 min to discuss {{company}}'s current CPARS posture?

Best regards,
{{sender_first}} {{custom.sender_last}}`,
        prompt: `Write a formal cold email to a government program manager at a prime contractor. Lead with CPARS rating impact, identify the in-execution intervention point, offer a posture review. Under 100 words.`,
        bestFor: 'Government contracting software / compliance / CPARS-monitoring tools',
        goal: 'introduction',
        industry: 'government',
        role: 'general',
        framework: 'pas',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 84,
        variables: ['first_name', 'company', 'custom.sender_last', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'CPARS specificity', reason: 'Anyone in govcon knows CPARS is the metric that determines re-competes. Naming it in the subject filters out non-relevant readers.' },
        ],
    },
    {
        slug: 'energy-procurement-director',
        title: 'Energy → Procurement Director',
        subject: 'Hedging strategy at {{company}}',
        body: `Hi {{first_name}},

Most utility procurement directors are hedging 60–70% of expected load on a static layered approach — which works in stable markets but leaves real money on the table when forward curves move.

We help directors at investor-owned utilities your size run dynamic hedge ratios that reflect actual market signals. Typical impact: 8–15% reduction in procurement variance, which usually translates to {{custom.savings_estimate}} on a portfolio of {{company}}'s scale.

Open to a 30-min call to walk through your current strategy?

— {{sender_first}}`,
        prompt: `Write a cold email to an energy procurement director. Lead with hedging strategy critique, contrast static with dynamic ratios, frame impact in dollars. Under 100 words.`,
        bestFor: 'Energy markets / hedging analytics / power procurement software',
        goal: 'introduction',
        industry: 'energy',
        role: 'procurement-buyer',
        framework: 'problem-solution',
        tone: 'formal',
        length: 'short',
        deliverabilityScore: 84,
        variables: ['first_name', 'company', 'custom.savings_estimate', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Domain-precise', reason: '"Static layered approach" + "dynamic hedge ratios" is jargon real procurement directors use. Filters in the right reader.' },
        ],
    },
    {
        slug: 'veterinary-practice-manager',
        title: 'Veterinary → Practice Manager',
        subject: 'Compliance rate at {{company}}',
        body: `Hi {{first_name}},

Most multi-doctor vet practices run at 38–48% compliance on recommended preventive care (annual exams, dental, parasitics) — meaning over half of recommendations don't convert into a booked visit.

The practices that hit 65%+ aren't communicating differently with clients — they're tracking which doctor's recommendations stick, surfacing the gap, and using automated reminder sequences for the 60-day window.

If your team is below 50% compliance, worth a 20-min walkthrough?

— {{sender_first}}`,
        prompt: `Write a cold email to a veterinary practice manager. Lead with preventive care compliance rate, contrast communication-style fixes with tracking + reminders, offer a walkthrough. Under 100 words.`,
        bestFor: 'Vet practice management / patient comms / reminder automation',
        goal: 'introduction',
        industry: 'healthcare',
        role: 'general',
        framework: 'pas',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Per-doctor visibility', reason: 'Practice managers who track per-doctor compliance immediately recognize this as actionable. Most don\'t today.' },
        ],
    },
    {
        slug: 'architecture-principal',
        title: 'Architecture → Principal',
        subject: 'Project profitability at {{company}}',
        body: `Hi {{first_name}},

Most architecture firms run a healthy gross margin per project but bleed at the project-portfolio level — typically because 20-25% of jobs are scope-creep losers and partners don't see it until close-out.

We work with principals at firms {{company}}'s size to surface scope creep weekly (not at billing review) and renegotiate before the loss compounds. Net effect: 3-7 points of firm-level margin recovered annually.

Worth a 30-min review of last year's project P&L?

— {{sender_first}}`,
        prompt: `Write a cold email to an architecture firm principal. Lead with project portfolio profitability, identify scope creep as the leak, offer a P&L review. Under 100 words.`,
        bestFor: 'Architecture project management / time tracking / scope management vendors',
        goal: 'introduction',
        industry: 'consulting',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Project-level vs portfolio-level distinction', reason: 'Principals nod at this distinction immediately — most firms know individual projects look fine but the firm bleeds.' },
        ],
    },
    {
        slug: 'saas-customer-success-leader',
        title: 'SaaS → Customer Success Leader',
        subject: 'NRR at {{company}}',
        body: `Hi {{first_name}},

NRR for B2B SaaS at {{company}}'s scale typically runs 105–115%. The teams hitting 130%+ aren't doing better QBRs — they're catching expansion signals 60 days before the customer asks (usage spikes in specific feature combos, new admin invites, integration depth changes).

We surface those signals automatically inside your CRM so CSMs can show up with the right expansion conversation pre-emptively.

Open to 25 min to compare to {{company}}'s current motion?

— {{sender_first}}`,
        prompt: `Write a cold email to a SaaS Customer Success leader. Lead with NRR benchmark, identify behavioral signals as the unlock, offer a motion comparison. Under 100 words.`,
        bestFor: 'CS analytics / health-score / expansion intelligence software',
        goal: 'introduction',
        industry: 'saas',
        role: 'customer-success-leader',
        framework: 'bab',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Pre-emptive vs reactive', reason: 'CS leaders know reactive expansion conversations (after the customer asks) are too late. Naming the 60-day window resonates.' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // BATCH B — SEQUENCE COMPLETERS (10)
    // The deeper touches in a 5-7 step sequence: pivots, pattern-breaks,
    // post-meeting recaps, win-backs, and renewal nudges.
    // ─────────────────────────────────────────────────────────────────────
    {
        slug: 'follow-up-3-pivot',
        title: 'Follow-up #3 — Pivot Angle',
        subject: 'Different angle, {{first_name}}',
        body: `{{first_name}},

Going to try a totally different angle on this since the first two didn't land.

Forget the {{custom.original_value_prop}} pitch. The real question for {{company}} is probably: are you actually measuring {{custom.specific_metric}}? Most teams aren't, and it's the one number that explains everything else.

15 min to talk through how we'd surface that for you?

— {{sender_first}}`,
        prompt: `Write a third follow-up that explicitly pivots to a different value prop. Acknowledge the silence, drop the original pitch, lead with a different question. Under 70 words.`,
        bestFor: 'Third touch in a 5-step sequence after the first two value props didn\'t resonate',
        goal: 'follow-up-3',
        industry: 'general',
        role: 'general',
        framework: 'question-led',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 89,
        variables: ['first_name', 'company', 'custom.original_value_prop', 'custom.specific_metric', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Honest pivot', reason: 'Acknowledging the previous emails didn\'t work disarms the recipient and signals you\'re paying attention to engagement, not blasting templates.' },
        ],
    },
    {
        slug: 'follow-up-4-pattern-break',
        title: 'Follow-up #4 — Pattern Break',
        subject: 'Question for {{first_name}}',
        body: `{{first_name}},

Out of curiosity — what's the actual reason you're not engaging? Genuinely useful for me to know:

- Wrong person?
- Wrong timing?
- Wrong fit?
- Just inbox overload?

A one-word reply tells me whether to keep trying or close the loop. Either is fine.

— {{sender_first}}`,
        prompt: `Write a fourth follow-up using a pattern-break: explicitly ask why they haven't engaged with multiple choices. Under 60 words. Disarming, low-friction.`,
        bestFor: 'Fourth touch — last meaningful attempt before the breakup email',
        goal: 'follow-up-4',
        industry: 'general',
        role: 'general',
        framework: 'question-led',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 91,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Multi-choice option', reason: 'A one-word reply (wrong person, wrong timing, wrong fit) is much easier than crafting a real response. Often the highest-reply-rate email in the sequence.' },
        ],
    },
    {
        slug: 'loom-video-drop',
        title: 'Follow-up — Loom Video Drop',
        subject: '90-second video for {{company}}',
        body: `Hi {{first_name}},

Recorded a 90-second walkthrough specifically for {{company}}: {{custom.loom_url}}

Goes through the three things I'd specifically change about your {{custom.specific_area}} based on what I saw publicly. No pitch in the video — just observations.

If any of it lands, happy to set up 15 min to walk through deeper.

— {{sender_first}}`,
        prompt: `Write a follow-up email featuring a personalized Loom video. Reference the prospect's specific situation, frame the video as observation not pitch. Under 70 words.`,
        bestFor: 'Mid-sequence touch when prior emails got opens but no replies',
        goal: 'follow-up-2',
        industry: 'general',
        role: 'general',
        framework: 'direct',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 84,
        variables: ['first_name', 'company', 'custom.loom_url', 'custom.specific_area', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Video as gift, not ask', reason: 'Personalized Looms convert when framed as observations they can use independently. Framing them as part of a sales pitch kills the magic.' },
        ],
    },
    {
        slug: 'competitor-mention-followup',
        title: 'Follow-up — Competitor Mention',
        subject: 'Saw {{custom.competitor_brand}} in your stack',
        body: `Hi {{first_name}},

Spotted on {{custom.signal_source}} that {{company}} is running {{custom.competitor_brand}}.

Not here to bash them — they\'re a fine product. But two things their architecture doesn't handle well: {{custom.gap_1}} and {{custom.gap_2}}. If either of those is actively painful for {{company}}, that\'s where we win.

If neither matters to you, ignore. If one does, 15 min worth your time.

— {{sender_first}}`,
        prompt: `Write a follow-up email referencing a specific competitor in the prospect's stack. Don't bash. Identify two specific architectural gaps. Soft CTA. Under 80 words.`,
        bestFor: 'Mid-sequence when you have signal that a prospect uses a specific competitor',
        goal: 'follow-up-2',
        industry: 'general',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 84,
        variables: ['first_name', 'company', 'custom.competitor_brand', 'custom.signal_source', 'custom.gap_1', 'custom.gap_2', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Honest competitor framing', reason: 'Bashing competitors in cold email lowers reply rates — buyers see through it. Acknowledging strengths first earns the right to name gaps.' },
        ],
    },
    {
        slug: 'news-event-trigger',
        title: 'Follow-up — News Event Trigger',
        subject: 'Saw the {{custom.event_type}} announcement',
        body: `Hi {{first_name}},

Saw {{company}}'s {{custom.event_type}} announcement — congrats. Whenever {{custom.event_type_implication}} happens, the next 90 days are usually a scramble around {{custom.likely_pain}}.

We help companies in this exact moment stand up {{custom.solution_angle}} fast. Curious if it's on your radar yet.

15 min to discuss?

— {{sender_first}}`,
        prompt: `Write a follow-up triggered by a news event (funding, acquisition, leadership change, product launch). Connect the event to a likely operational consequence + your solution. Under 80 words.`,
        bestFor: 'Triggered outreach after a prospect company announces funding, hiring, expansion, or leadership change',
        goal: 'follow-up-2',
        industry: 'general',
        role: 'general',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'custom.event_type', 'custom.event_type_implication', 'custom.likely_pain', 'custom.solution_angle', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Trigger-event timing', reason: 'Cold emails sent within 7 days of a major company event have 3-4x typical reply rates because relevance is obvious.' },
        ],
    },
    {
        slug: 'pre-meeting-agenda',
        title: 'Pre-Meeting Agenda',
        subject: 'Tomorrow\'s call — quick agenda',
        body: `Hi {{first_name}},

Looking forward to tomorrow at {{custom.meeting_time}}. Quick agenda so we use the time well:

1. Your current setup ({{custom.specific_topic_1}}) — 10 min
2. Where it's bottlenecking ({{custom.specific_topic_2}}) — 5 min
3. What we'd change + how — 10 min
4. Q&A and next steps — 5 min

Anything you'd add or skip? Happy to adjust.

— {{sender_first}}`,
        prompt: `Write a pre-meeting agenda email. Send 24h before the call. List 3-4 specific time-boxed sections. Invite agenda input. Under 80 words.`,
        bestFor: 'Sent 24 hours before any first sales call to set expectations',
        goal: 'agenda',
        industry: 'general',
        role: 'general',
        framework: 'direct',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 95,
        variables: ['first_name', 'custom.meeting_time', 'custom.specific_topic_1', 'custom.specific_topic_2', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Time-boxed sections', reason: 'Pre-meeting agendas with specific time allocations dramatically reduce meeting drift and prepare the prospect to engage substantively.' },
        ],
    },
    {
        slug: 'post-meeting-recap',
        title: 'Post-Meeting Recap',
        subject: 'Recap + next steps',
        body: `{{first_name}},

Thanks for the time today. Quick recap so we're aligned:

What I heard:
- {{custom.pain_point_1}}
- {{custom.pain_point_2}}
- {{custom.success_metric}} is how you'd measure success

What I committed to:
- Send {{custom.deliverable_1}} by {{custom.deadline_1}}
- Connect you with {{custom.peer_intro}} for a reference call

What you committed to:
- Loop in {{custom.stakeholder_name}} on the next call
- Pull {{custom.data_to_pull}} for our next session

Misunderstand anything?

— {{sender_first}}`,
        prompt: `Write a post-meeting recap with 3 sections: what I heard, what I committed to, what you committed to. Specific bullets in each. Under 130 words.`,
        bestFor: 'Sent within 4 hours of any sales call to lock in next steps',
        goal: 'recap',
        industry: 'general',
        role: 'general',
        framework: 'direct',
        tone: 'direct',
        length: 'medium',
        deliverabilityScore: 96,
        variables: ['first_name', 'custom.pain_point_1', 'custom.pain_point_2', 'custom.success_metric', 'custom.deliverable_1', 'custom.deadline_1', 'custom.peer_intro', 'custom.stakeholder_name', 'custom.data_to_pull', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Mutual accountability', reason: 'Listing what THEY committed to (in writing, in their inbox) is the single biggest deal-velocity move in B2B sales.' },
        ],
    },
    {
        slug: 'negotiation-pricing',
        title: 'Negotiation / Pricing Discussion',
        subject: 'Pricing — let\'s find the right shape',
        body: `Hi {{first_name}},

Heard the pushback on pricing. Genuinely useful.

The shape we usually land on with companies your size is one of three:
1. {{custom.shape_1}}
2. {{custom.shape_2}}
3. {{custom.shape_3}}

Which one fits where {{company}} is right now? Whichever it is, we can probably get to yes — but I'd rather know which constraint matters most before I come back with revised numbers.

— {{sender_first}}`,
        prompt: `Write a pricing negotiation email. Acknowledge the pushback, offer three deal shapes (multi-year discount, pilot pricing, scope adjustment, etc.), ask which constraint matters. Under 90 words.`,
        bestFor: 'After a prospect has flagged price as a blocker',
        goal: 'negotiation',
        industry: 'general',
        role: 'general',
        framework: 'qvc',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 92,
        variables: ['first_name', 'company', 'custom.shape_1', 'custom.shape_2', 'custom.shape_3', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Shape-not-discount framing', reason: 'Most pricing pushback isn\'t actually about the price — it\'s about the shape of the deal. Three options forces the prospect to declare their real constraint.' },
        ],
    },
    {
        slug: 'renewal-upsell',
        title: 'Renewal / Upsell',
        subject: '90 days to renewal — quick check',
        body: `Hi {{first_name}},

90 days out from {{company}}'s renewal. Wanted to flag this early so it's not a fire drill in the last week.

Two questions worth thinking through:
1. Are the original use cases we set up at signup still the right ones, or has the team's focus shifted?
2. Is anyone using {{custom.adjacent_feature}} yet? If not, that's the highest-leverage place to expand value before renewal.

Happy to set up a 30-min review at {{custom.proposed_time}}. Or push to next month if better — your call.

— {{sender_first}}`,
        prompt: `Write a customer-facing renewal email sent 90 days before contract end. Two specific check-in questions, propose a renewal review meeting. Tone: collaborative not pushy. Under 110 words.`,
        bestFor: 'CS-led renewal motion 60-90 days before contract expiry',
        goal: 'renewal',
        industry: 'general',
        role: 'customer-success-leader',
        framework: 'qvc',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 96,
        variables: ['first_name', 'company', 'custom.adjacent_feature', 'custom.proposed_time', 'sender_first'],
        annotations: [
            { section: 'body', label: '90-day timing', reason: 'Renewal conversations starting 90 days early have dramatically higher expansion rates than the same conversation in the last 30 days.' },
        ],
    },
    {
        slug: 'win-back-churned',
        title: 'Win-Back — Churned Customer',
        subject: 'A few things have changed since you left',
        body: `Hi {{first_name}},

Saw {{company}} churned about {{custom.months_since_churn}} months ago. Won't pretend that didn't sting.

Three things have shipped since you left that I think directly address what wasn't working:
- {{custom.improvement_1}}
- {{custom.improvement_2}}
- {{custom.improvement_3}}

Not asking for the sale. Just curious whether any of those would have changed the original decision. If the answer's "no, we left for other reasons" — useful feedback either way.

— {{sender_first}}`,
        prompt: `Write a win-back email to a churned customer. Acknowledge the churn, reference specific product improvements that address why they left, ask for honest feedback. Under 100 words.`,
        bestFor: 'Reaching back to a customer 6-18 months after churn',
        goal: 'win-back',
        industry: 'general',
        role: 'general',
        framework: 'story',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'company', 'custom.months_since_churn', 'custom.improvement_1', 'custom.improvement_2', 'custom.improvement_3', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Acknowledge the churn', reason: 'Pretending the churn didn\'t happen makes the email feel like a generic re-engagement. Naming it directly earns the read.' },
            { section: 'cta', label: 'Feedback over selling', reason: 'Asking for honest feedback (vs. asking for the sale) reopens the relationship. Sometimes leads to a re-sign, almost always leads to a useful conversation.' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // BATCH C — SPECIALIZED USE CASES (10)
    // Cold email for non-sales motions: investor outreach, press, podcasts,
    // partnerships, sponsorships, customer research, and case-study asks.
    // ─────────────────────────────────────────────────────────────────────
    {
        slug: 'investor-outreach-vc',
        title: 'Investor Outreach — Founder → VC',
        subject: '{{custom.company_name}} — {{custom.metric}} in {{custom.timeframe}}',
        body: `Hi {{first_name}},

Building {{custom.company_name}} — {{custom.one_line_pitch}}.

Quick numbers: {{custom.metric}} in {{custom.timeframe}}, {{custom.growth_signal}}. Competing in {{custom.market}} which is {{custom.market_size_signal}}.

Saw you led {{custom.portfolio_company}}'s round — looks like a strong thesis fit. Open to a 20-min intro call?

Deck attached. Happy to skip if you'd rather just talk.

— {{sender_first}}, founder/CEO`,
        prompt: `Write a founder-to-VC investor outreach cold email. Subject line: company name + key metric + timeframe. Body: one-line pitch, three numbers, thesis-fit reference, soft CTA. Under 80 words. Founder voice — confident, no fluff.`,
        bestFor: 'Founder outreach to early-stage investors, signed deals are unlikely from cold but warm intros come from this',
        goal: 'investor-outreach',
        industry: 'general',
        role: 'vc-investor',
        framework: 'direct',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'custom.company_name', 'custom.metric', 'custom.timeframe', 'custom.one_line_pitch', 'custom.growth_signal', 'custom.market', 'custom.market_size_signal', 'custom.portfolio_company', 'sender_first'],
        annotations: [
            { section: 'subject', label: 'Numbers in subject', reason: 'VCs scan inboxes for traction. Putting a metric + timeframe in the subject is the highest-open-rate format founder-to-VC.' },
            { section: 'body', label: 'Thesis-fit reference', reason: 'Citing a portfolio company that signals fit is the difference between "another deck" and "I should reply to this."' },
        ],
    },
    {
        slug: 'podcast-guest-pitch',
        title: 'Podcast Guest Pitch',
        subject: 'Guest idea for {{custom.podcast_name}}',
        body: `Hi {{first_name}},

Listened to your episode with {{custom.recent_guest}} last week — the part about {{custom.specific_topic}} stuck with me.

I'd love to come on to talk about {{custom.your_angle}}. Specifically the data/story around {{custom.specific_data_point}} — which I haven't seen anyone in the space cover.

A few things that would make me a useful guest:
- {{custom.credential_1}}
- {{custom.credential_2}}
- {{custom.credential_3}}

Happy to send sample audio of me speaking. 20-min recording, your timeline.

— {{sender_first}}`,
        prompt: `Write a cold pitch to a podcast host. Reference a specific recent episode, propose your angle with a unique data point, list three credentials, offer audio sample. Under 110 words.`,
        bestFor: 'Founders, authors, or operators pitching themselves as podcast guests',
        goal: 'podcast-pitch',
        industry: 'general',
        role: 'podcast-host',
        framework: 'qvc',
        tone: 'personal',
        length: 'medium',
        deliverabilityScore: 87,
        variables: ['first_name', 'custom.podcast_name', 'custom.recent_guest', 'custom.specific_topic', 'custom.your_angle', 'custom.specific_data_point', 'custom.credential_1', 'custom.credential_2', 'custom.credential_3', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Specific episode', reason: 'Hosts get hundreds of guest pitches. Naming a specific episode and what stuck is the only way to prove you actually listen.' },
        ],
    },
    {
        slug: 'backlink-outreach-blogger',
        title: 'Backlink Outreach — Blogger',
        subject: 'Quick suggestion for your {{custom.article_title}} piece',
        body: `Hi {{first_name}},

Read your piece on {{custom.article_topic}} — solid breakdown.

One small suggestion: in the section on {{custom.specific_section}}, the resource you linked ({{custom.existing_link}}) is from {{custom.year}}. We just published an updated breakdown ({{custom.our_resource_url}}) with current data — might be a useful update for readers.

No pressure. Just thought it might fit.

— {{sender_first}}`,
        prompt: `Write a backlink outreach email to a blogger. Reference a specific article they wrote, identify a stale resource they linked to, offer your fresher resource as a replacement. Under 80 words. No-pressure tone.`,
        bestFor: 'SEO link-building outreach to bloggers or content publishers',
        goal: 'backlink-outreach',
        industry: 'media',
        role: 'journalist',
        framework: 'qvc',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'custom.article_title', 'custom.article_topic', 'custom.specific_section', 'custom.existing_link', 'custom.year', 'custom.our_resource_url', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Stale-link replacement', reason: 'Highest-converting backlink ask is replacing an existing dead/old link with a fresher one. The blogger gets a content update; you get a link.' },
        ],
    },
    {
        slug: 'partnership-co-marketing',
        title: 'Partnership / Co-Marketing Pitch',
        subject: 'Co-marketing with {{company}}',
        body: `Hi {{first_name}},

Our customer overlap with {{company}} is roughly {{custom.overlap_estimate}} accounts. If we're seeing the same buyers, there's probably an opportunity to co-market without competing.

Three concrete ideas:
1. {{custom.idea_1}}
2. {{custom.idea_2}}
3. {{custom.idea_3}}

Worth 20 min to talk through which makes sense for both sides? Genuinely useful regardless of whether we land on something formal.

— {{sender_first}}`,
        prompt: `Write a partnership/co-marketing cold pitch. Lead with customer overlap as proof of mutual relevance, propose three concrete co-marketing plays, soft CTA. Under 90 words.`,
        bestFor: 'Cross-pitching another vendor in your space for a co-marketing program',
        goal: 'partnership-pitch',
        industry: 'general',
        role: 'cmo',
        framework: 'qvc',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'custom.overlap_estimate', 'custom.idea_1', 'custom.idea_2', 'custom.idea_3', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Customer overlap proof', reason: 'Quantifying customer overlap upfront establishes there\'s a real reason to talk — not just generic "let\'s partner" energy.' },
        ],
    },
    {
        slug: 'sponsorship-newsletter',
        title: 'Sponsorship Pitch — Newsletter',
        subject: 'Sponsoring {{custom.newsletter_name}}',
        body: `Hi {{first_name}},

Read {{custom.newsletter_name}} weekly — your audience of {{custom.audience_description}} is exactly who we sell to.

Interested in a 4-week sponsorship test:
- Issue 1-4 placements (whatever format works for you)
- {{custom.budget}} for the test
- Track conversions to a unique landing page

If the test works, happy to extend to a quarterly commit. If it doesn't, no harm done.

Open slots in the next 6 weeks?

— {{sender_first}}`,
        prompt: `Write a newsletter sponsorship pitch. Identify audience fit, propose a small test commitment, name budget, offer trackable success metric. Under 90 words.`,
        bestFor: 'B2B vendors pitching newsletter or community sponsorships',
        goal: 'sponsorship-pitch',
        industry: 'media',
        role: 'general',
        framework: 'direct',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 89,
        variables: ['first_name', 'custom.newsletter_name', 'custom.audience_description', 'custom.budget', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Test-commit framing', reason: 'Newsletter operators are wary of big-budget asks from unknown sponsors. A small test commit with clear extension criteria is the easiest "yes."' },
        ],
    },
    {
        slug: 'press-pitch-journalist',
        title: 'Press Pitch — Journalist',
        subject: 'Story idea: {{custom.story_angle}}',
        body: `Hi {{first_name}},

Pitching a story angle for your beat: {{custom.story_angle}}.

Why now: {{custom.timeliness_hook}}.

What I have:
- Original data on {{custom.proprietary_data}} ({{custom.data_size}})
- Two customers willing to talk on the record about {{custom.customer_angle}}
- Industry context from {{custom.expert_source}}

Embargo for {{custom.embargo_date}} if useful. Or ignore if it's not your beat.

— {{sender_first}}`,
        prompt: `Write a press pitch to a trade journalist. Lead with a story angle, justify timeliness, list three concrete assets you can provide (data, sources, context), offer embargo. Under 100 words.`,
        bestFor: 'PR-led pitches to trade journalists for product launches or industry stories',
        goal: 'press-pitch',
        industry: 'media',
        role: 'journalist',
        framework: 'qvc',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'custom.story_angle', 'custom.timeliness_hook', 'custom.proprietary_data', 'custom.data_size', 'custom.customer_angle', 'custom.expert_source', 'custom.embargo_date', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Three-asset structure', reason: 'Journalists need data, sources, and context to write quickly. Listing all three upfront makes the pitch turnkey.' },
        ],
    },
    {
        slug: 'conference-speaker-pitch',
        title: 'Conference Speaker Pitch',
        subject: 'Speaking proposal for {{custom.conference_name}}',
        body: `Hi {{first_name}},

Submitting a talk proposal for {{custom.conference_name}}'s {{custom.track_name}} track:

Title: {{custom.talk_title}}
Audience takeaway: {{custom.takeaway}}
Why I'm qualified: {{custom.qualification}}

Three reasons this fits the conference: {{custom.fit_reason_1}}, {{custom.fit_reason_2}}, {{custom.fit_reason_3}}.

Sample talks: {{custom.sample_talk_url_1}}, {{custom.sample_talk_url_2}}.

Happy to discuss adjustments or push the pitch elsewhere if the track's full.

— {{sender_first}}`,
        prompt: `Write a conference speaking pitch. Title + takeaway + qualifications + three fit reasons + sample talks. Under 110 words.`,
        bestFor: 'Operators pitching themselves to speak at industry conferences',
        goal: 'introduction',
        industry: 'general',
        role: 'general',
        framework: 'direct',
        tone: 'direct',
        length: 'medium',
        deliverabilityScore: 86,
        variables: ['first_name', 'custom.conference_name', 'custom.track_name', 'custom.talk_title', 'custom.takeaway', 'custom.qualification', 'custom.fit_reason_1', 'custom.fit_reason_2', 'custom.fit_reason_3', 'custom.sample_talk_url_1', 'custom.sample_talk_url_2', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Sample talks linked', reason: 'Conference organizers will not book speakers they haven\'t seen perform. Sample talk links are the difference between "maybe" and a real review.' },
        ],
    },
    {
        slug: 'customer-interview-request',
        title: 'Customer Interview Request',
        subject: 'Quick research call — 20 min, your insight',
        body: `Hi {{first_name}},

Doing customer research on {{custom.research_topic}} and would love your perspective. You're one of {{custom.customer_count}} customers I'm reaching out to — your scale and use case make your input particularly valuable.

What I'm trying to understand: {{custom.research_question}}.

20 minutes, recorded if you're comfortable, transcript shared back to you. Token of thanks: {{custom.thank_you_offer}}.

Available {{custom.proposed_times}}?

— {{sender_first}}`,
        prompt: `Write a customer-research interview request. Lead with the research goal, name selectivity (you\'re 1 of N), offer a small thank-you, propose times. Under 100 words.`,
        bestFor: 'Product / CS / research teams running customer discovery interviews',
        goal: 'customer-interview',
        industry: 'general',
        role: 'general',
        framework: 'qvc',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 92,
        variables: ['first_name', 'custom.research_topic', 'custom.customer_count', 'custom.research_question', 'custom.thank_you_offer', 'custom.proposed_times', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Selectivity framing', reason: '"You\'re 1 of N customers I\'m reaching out to" makes the recipient feel chosen. Generic "would you participate?" emails get sub-10% reply rates.' },
        ],
    },
    {
        slug: 'case-study-request-customer',
        title: 'Case Study Request — Customer',
        subject: 'Telling your story',
        body: `Hi {{first_name}},

{{company}} is one of our best wins this year — {{custom.specific_outcome}} in {{custom.timeframe}}. Want to ask if you'd be open to letting us tell that story.

What it would look like:
- 45-min interview (we draft, you approve every word)
- Final piece you can use for your own marketing too
- Logo on our customer page + a real quote

Win-win — your team gets a polished case study to use. Open to a quick chat to discuss?

— {{sender_first}}`,
        prompt: `Write a customer case study request. Reference the specific win, frame the value to the customer (not just to you), promise full editorial control. Under 90 words.`,
        bestFor: 'Customer marketing / CS asking for a formal case study',
        goal: 'case-study-request',
        industry: 'general',
        role: 'customer-success-leader',
        framework: 'bab',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 94,
        variables: ['first_name', 'company', 'custom.specific_outcome', 'custom.timeframe', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Editorial control promise', reason: '"You approve every word" is the line that converts. Customers worry about being misquoted; this removes the fear.' },
        ],
    },
    {
        slug: 'beta-tester-invite',
        title: 'Beta Tester Invite',
        subject: 'Beta access — your feedback shaped the design',
        body: `Hi {{first_name}},

Building something based on the feedback you gave on {{custom.feedback_topic}} — and you're the first person I want testing it.

The feature: {{custom.feature_description}}.

What I need from you:
- 30 min hands-on next week
- Honest feedback (especially the harsh kind)
- No commitment to use it long-term — just an early read

In return: 6 months of {{custom.perk}} when we ship.

Sound fair? {{custom.proposed_times}} works on my end.

— {{sender_first}}`,
        prompt: `Write a beta tester invite to a customer or prospect who provided earlier feedback. Reference the feedback origin, describe the feature, name the ask + the perk. Under 100 words.`,
        bestFor: 'Product launches inviting power users into a closed beta',
        goal: 'beta-invite',
        industry: 'general',
        role: 'general',
        framework: 'qvc',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 92,
        variables: ['first_name', 'custom.feedback_topic', 'custom.feature_description', 'custom.perk', 'custom.proposed_times', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'Feedback-origin reference', reason: 'Telling the recipient their feedback shaped the design dramatically increases acceptance — they\'re no longer testing your product, they\'re testing their idea.' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // BATCH D — ROLE VARIANTS (10)
    // Cold pitches tuned to less-common roles where the right framing
    // matters: procurement, IT, product, engineering, EAs, SMB owners.
    // ─────────────────────────────────────────────────────────────────────
    {
        slug: 'procurement-buyer-cost',
        title: 'Procurement / Buyer — Cost-Focused',
        subject: '{{custom.category}} cost reduction at {{company}}',
        body: `Hi {{first_name}},

For {{company}}'s scale on {{custom.category}}, the typical cost-reduction range we see across our customer base is {{custom.savings_range}} — primarily from supplier rationalization and term-renegotiation triggers most procurement teams aren't tracking.

We don't replace your existing tools; we plug into what you have and surface the specific accounts where renegotiation has the highest leverage. Quarterly contract for the program, no per-seat licensing.

Worth 25 min to walk through what the math looks like for {{company}}?

— {{sender_first}}`,
        prompt: `Write a cold email to a procurement / buyer. Lead with cost reduction range, name the mechanism (supplier rationalization), avoid "platform replacement" language, simple commercial structure. Under 100 words.`,
        bestFor: 'Procurement intelligence / cost-reduction software vendors',
        goal: 'introduction',
        industry: 'general',
        role: 'procurement-buyer',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'custom.category', 'custom.savings_range', 'sender_first'],
        annotations: [
            { section: 'body', label: '"Don\'t replace, plug in"', reason: 'Procurement leaders are wary of vendors pitching rip-and-replace. Plugging into existing tools is a much easier yes.' },
        ],
    },
    {
        slug: 'it-director-security',
        title: 'IT Director — Security Angle',
        subject: 'Shadow SaaS at {{company}}',
        body: `Hi {{first_name}},

Average mid-market company has 400+ SaaS apps in use; IT directors typically know about 80–120 of them. The other 280 are shadow SaaS — purchased on credit cards, never reviewed for security or compliance.

We give IT directors visibility into the full SaaS footprint (not just SSO-connected apps) and flag the high-risk ones first. Specifically focused on tools handling customer PII or production credentials.

Worth a 25-min walkthrough? Happy to scope a 2-week assessment if a full deployment is too much.

— {{sender_first}}`,
        prompt: `Write a cold email to an IT director focused on shadow SaaS / security. Quantify the visibility gap, name the risk category (PII / credentials), offer a small assessment as alternative entry point. Under 100 words.`,
        bestFor: 'SaaS management / shadow IT discovery / security posture vendors',
        goal: 'introduction',
        industry: 'general',
        role: 'it-director',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Risk-category specificity', reason: '"Tools handling customer PII or production credentials" is the language IT directors use internally with security teams.' },
        ],
    },
    {
        slug: 'customer-success-retention',
        title: 'Customer Success Lead — Retention',
        subject: 'Early-warning signals for at-risk accounts',
        body: `Hi {{first_name}},

Most CS teams identify at-risk accounts 30–60 days before churn. Best-in-class identifies them 90–120 days out. The difference is what signals they're tracking.

The teams catching it early aren't relying on quarterly health scores — they're tracking week-over-week changes in admin engagement, integration depth, and support ticket sentiment.

If your CS team is missing the early window, worth 20 min to walk through what those signals look like?

— {{sender_first}}`,
        prompt: `Write a cold email to a Customer Success leader. Lead with the at-risk-detection timing gap, name three specific weekly signals, offer a walkthrough. Under 100 words.`,
        bestFor: 'Customer success software / health-score / churn prediction vendors',
        goal: 'introduction',
        industry: 'saas',
        role: 'customer-success-leader',
        framework: 'bab',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Weekly vs quarterly framing', reason: 'CS leaders nod at this — they know quarterly health scores are too lagging but most don\'t have weekly signal infrastructure.' },
        ],
    },
    {
        slug: 'product-manager-research',
        title: 'Product Manager — Research Angle',
        subject: 'Faster user research for {{company}}\'s {{custom.product_area}}',
        body: `Hi {{first_name}},

PMs at {{company}}'s scale typically run 3–5 user interviews per quarter on each major feature decision — and even then most can't reach saturation. Real saturation usually requires 12–15.

We run AI-assisted async interviews so PMs can hit 15+ user conversations in the same time it currently takes to do 5. Same insight quality (we have the comparison data), 3x the volume.

If your team is bottlenecked on user research, worth 25 min to walk through?

— {{sender_first}}`,
        prompt: `Write a cold email to a product manager. Lead with the research saturation gap (5 vs 15 interviews), offer async AI-assisted alternative, end with a walkthrough CTA. Under 100 words.`,
        bestFor: 'User research platforms / async interview tools',
        goal: 'introduction',
        industry: 'saas',
        role: 'product-manager',
        framework: 'bab',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'custom.product_area', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Saturation specificity', reason: 'PMs trained on UX research recognize "saturation" immediately. Naming it filters in the right reader.' },
        ],
    },
    {
        slug: 'engineering-manager-tools',
        title: 'Engineering Manager — Dev Velocity',
        subject: 'Code review bottleneck at {{company}}',
        body: `Hi {{first_name}},

Engineering teams at {{company}}'s scale typically lose 6–10 dev-days per sprint to code review wait time — not the actual reviews, but the waiting between submission and reviewer attention.

We help eng managers identify exactly where that wait time accumulates (specific reviewers, specific repos, specific times of day) and reroute to keep velocity up without burning out senior engineers.

Worth a 25-min look at your team's review patterns?

— {{sender_first}}`,
        prompt: `Write a cold email to an engineering manager. Lead with the code review wait-time problem, identify the specific bottleneck (waiting, not reviewing), offer a pattern review. Under 90 words.`,
        bestFor: 'Engineering productivity / dev velocity / code review automation tools',
        goal: 'introduction',
        industry: 'saas',
        role: 'engineering-manager',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Waiting vs reviewing', reason: 'Eng managers who think about velocity recognize this distinction. Most code review tools optimize the review itself, not the wait time, which is the actual bottleneck.' },
        ],
    },
    {
        slug: 'office-manager-gatekeeper',
        title: 'Office Manager / EA — Gatekeeper-Friendly',
        subject: 'Quick question for {{first_name}}',
        body: `Hi {{first_name}},

Reaching out because you tend to know what's actually going on at {{company}} better than most exec assistants give themselves credit for.

Quick question: who at {{company}} owns {{custom.responsibility}}? I'd rather not blast {{custom.exec_name}} directly without confirming you're routing this kind of thing somewhere specific.

If it's still on {{custom.exec_name}}'s plate, happy to send a one-pager you can forward at the right moment. If not, point me to the right person and I won't bother you again.

Appreciate it,
{{sender_first}}`,
        prompt: `Write a respectful cold email to an executive assistant or office manager. Acknowledge their role as gatekeeper, ask who owns a specific area, offer a one-pager they can forward. Under 100 words.`,
        bestFor: 'When you can\'t get past the EA — making the EA your ally instead of obstacle',
        goal: 'referral-ask',
        industry: 'general',
        role: 'office-manager',
        framework: 'qvc',
        tone: 'personal',
        length: 'short',
        deliverabilityScore: 90,
        variables: ['first_name', 'company', 'custom.responsibility', 'custom.exec_name', 'sender_first'],
        annotations: [
            { section: 'opener', label: 'EA respect', reason: 'EAs are routinely treated as obstacles. Acknowledging their actual role explicitly converts them from blocker to advocate.' },
        ],
    },
    {
        slug: 'smb-owner-cost-conscious',
        title: 'SMB Owner — Cost-Conscious',
        subject: 'Honest pricing for businesses {{company}}\'s size',
        body: `Hi {{first_name}},

Quick reach-out: most software targeted at {{company}}'s {{custom.team_size}} team is priced for enterprises and assumes you have an admin to configure it.

We built specifically for owner-operators: {{custom.starting_price}}/month flat, no per-seat creep, set up in under 15 minutes, no implementation fee.

If you've been holding off on {{custom.problem_area}} because the tools you've evaluated felt overbuilt, this is the one where you can just sign up and start.

Free trial here: {{custom.trial_link}}.

— {{sender_first}}`,
        prompt: `Write a cold email to an SMB owner-operator. Acknowledge that most software is overbuilt for them, name flat pricing, no implementation fee, point at trial. Under 100 words.`,
        bestFor: 'PLG SaaS targeting owner-operators of small businesses',
        goal: 'introduction',
        industry: 'general',
        role: 'smb-owner',
        framework: 'pas',
        tone: 'casual',
        length: 'short',
        deliverabilityScore: 88,
        variables: ['first_name', 'company', 'custom.team_size', 'custom.starting_price', 'custom.problem_area', 'custom.trial_link', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Anti-enterprise framing', reason: 'SMB owners are tired of being sold enterprise tools. Naming the overbuild problem upfront builds instant trust.' },
        ],
    },
    {
        slug: 'agency-owner-margin',
        title: 'Agency Owner — Margin Recovery',
        subject: 'Margin recovery for {{company}}',
        body: `Hi {{first_name}},

Agency margins at {{custom.agency_type}} firms typically run 18–22% — and most of the gap to best-in-class (35%+) is one specific operational drag: tool sprawl across the client portfolio.

We replace 5–6 separate tools most agencies run with a single platform — typically saves $400–700/mo per client served, plus the time your team spends reconciling between dashboards.

Worth a 20-min look at your current stack and what'd consolidate?

— {{sender_first}}`,
        prompt: `Write a cold email to an agency owner. Lead with margin reality, identify tool sprawl as the culprit, frame consolidation savings per-client. Under 90 words.`,
        bestFor: 'Agency-targeted platforms that consolidate multi-tool spend',
        goal: 'introduction',
        industry: 'agencies',
        role: 'agency-owner',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'custom.agency_type', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Margin specificity', reason: 'Agency owners know their own margins. Naming the 18-22% range vs best-in-class is recognized immediately as someone who has seen agency P&Ls.' },
        ],
    },
    {
        slug: 'marketing-manager-campaign-tools',
        title: 'Marketing Manager — Campaign Tools',
        subject: 'Multi-channel attribution at {{company}}',
        body: `Hi {{first_name}},

Most B2B marketing managers can attribute single-channel campaigns cleanly but struggle the moment a buyer touches paid social, then organic, then a webinar, then converts via email.

The result: budget gets allocated based on last-touch (which over-credits email) instead of full-journey contribution.

We help marketing managers see the full multi-touch journey and reallocate based on what's actually moving deals — usually shifts 15–25% of budget within a quarter.

Worth 20 min to walk through your current attribution setup?

— {{sender_first}}`,
        prompt: `Write a cold email to a marketing manager. Lead with multi-channel attribution as the gap, contrast last-touch with full-journey, name the budget shift. Under 100 words.`,
        bestFor: 'Marketing attribution / journey analytics platforms',
        goal: 'introduction',
        industry: 'general',
        role: 'marketing-manager',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 87,
        variables: ['first_name', 'company', 'sender_first'],
        annotations: [
            { section: 'body', label: 'Budget reallocation framing', reason: 'Marketing managers respond to budget-impact framing more than "better insights" framing. The 15-25% shift is the deciding number.' },
        ],
    },
    {
        slug: 'sales-manager-rep-enablement',
        title: 'Sales Manager — Rep Enablement',
        subject: 'Why your top rep is 3x your bottom rep',
        body: `Hi {{first_name}},

In most sales teams, the top performer is doing roughly 3x the bottom performer — and the gap is rarely about effort or hours. It's about the specific moves the top rep makes in deal cycles that nobody has documented or systematized.

We capture top-rep behavior (specific call moments, specific objection responses, specific email patterns) and roll it out as enablement for the rest of the team.

Worth 25 min to look at your current top-vs-bottom gap?

— {{sender_first}}`,
        prompt: `Write a cold email to a sales manager. Lead with the universal top-vs-bottom rep gap, identify the cause as systematized behavior, offer a gap analysis call. Under 100 words.`,
        bestFor: 'Sales enablement / call coaching / rep performance platforms',
        goal: 'introduction',
        industry: 'saas',
        role: 'sales-manager',
        framework: 'pas',
        tone: 'direct',
        length: 'short',
        deliverabilityScore: 86,
        variables: ['first_name', 'sender_first'],
        annotations: [
            { section: 'opener', label: '3x universal gap', reason: 'Sales managers recognize the 3x gap immediately because they live with it. The framing creates instant resonance.' },
        ],
    },
];

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

export function getTemplateBySlug(slug: string): ColdEmailTemplate | undefined {
    return TEMPLATES.find((t) => t.slug === slug);
}

export function getRelatedTemplates(slug: string, limit = 3): ColdEmailTemplate[] {
    const target = getTemplateBySlug(slug);
    if (!target) return [];
    // Score: same goal +3, same industry +2, same role +2, same framework +1
    const scored = TEMPLATES
        .filter((t) => t.slug !== slug)
        .map((t) => ({
            template: t,
            score:
                (t.goal === target.goal ? 3 : 0) +
                (t.industry === target.industry ? 2 : 0) +
                (t.role === target.role ? 2 : 0) +
                (t.framework === target.framework ? 1 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    return scored.map((s) => s.template);
}

export function wordCount(body: string): number {
    return body.trim().split(/\s+/).filter(Boolean).length;
}
