/**
 * Cross-feature demo narrative for Super Sequencer / Super Protect /
 * Super LinkedIn surfaces. One canonical cast of:
 *
 *   - sales team (the org's own users + LinkedIn senders)
 *   - prospects (the engaging profiles + contacts + leads)
 *   - posts (the content the prospects engaged with)
 *   - campaigns (the outreach the prospects are routed into)
 *   - ICPs (the filters that decide routing)
 *
 * The four LinkedIn-side pages that still ship with hardcoded placeholders
 * (overview / signals / campaigns / contacts) all import from this file so
 * a name introduced on one page recurs naturally on the next. The data
 * shape mirrors the v1 API responses so swapping a page to live data
 * later requires no structural changes.
 */

// ── Sales team — the org's own users / LinkedIn senders ──────────────────────

export const SALES_TEAM = [
    { id: 'sender-eugin',  name: 'Eugin Richardson', title: 'Founder',         linkedin_account: 'eugin-richardson',  account_type: 'PREMIUM',   status: 'OK' },
    { id: 'sender-asha',   name: 'Asha Patel',       title: 'Head of Growth',  linkedin_account: 'asha-patel',        account_type: 'SALES_NAV', status: 'OK' },
    { id: 'sender-ben',    name: 'Ben Walker',       title: 'SDR',             linkedin_account: 'ben-walker',        account_type: 'CLASSIC',   status: 'OK' },
    { id: 'sender-shared', name: 'Drason SDR',       title: 'Outbound SDR',    linkedin_account: 'drason-sdr',        account_type: 'CLASSIC',   status: 'CREDENTIALS' },
] as const;

// ── Posts — content the prospects engaged with ───────────────────────────────
//
// Each entry is shaped to mirror the live /api/linkedin/accounts/:id/posts
// payload so the PostsFeed can render demo posts using the same component
// code. Spread across the four buckets the account-detail subpages render:
//
//   post        — short-form opinion / observation
//   article     — long-form (LinkedIn article)
//   repost      — reshared third-party content
//   <thought leadership> — derived bucket: post_kind='post' AND text ≥ 500
//                          chars AND reaction_count ≥ 25
//
// 'post-eugin-launch', 'post-asha-pricing', 'post-ben-latency' are kept as
// canonical ids so the SIGNALS array below still resolves cleanly.

export interface DemoPost {
    id: string;
    /** Account this post belongs to — refs SALES_TEAM[].id. */
    author_id: string;
    /** "Minutes ago" anchor so the relative-time math stays demo-stable. */
    posted_at_minutes_ago: number;
    post_kind: 'post' | 'article' | 'repost';
    post_urn: string;
    /** Full body text. For articles, the first line is the title. */
    text: string;
    reaction_count: number;
    comment_count: number;
    share_count: number;
}

export const DEMO_POSTS: DemoPost[] = [
    // ── Eugin Richardson (Founder) ──────────────────────────────────────
    {
        id: 'post-eugin-launch',
        author_id: 'sender-eugin',
        posted_at_minutes_ago: 60 * 6, // 6h ago
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000001',
        text: `5 launch lessons from shipping our v3 last quarter.

1. The riskiest part of a launch isn't the launch — it's the 30 days after, when half the team has already moved on and the bugs land.
2. "Beta cohort" is a euphemism for "people who'll forgive you once." Don't waste them.
3. Pricing changes always read as "we're now expensive" even when the rebundle is genuinely better. Lead with the rebundle.
4. Press is a lagging indicator. Customer Slack channels are leading. We should have been reading them daily, not weekly.
5. Most launch wins compound. Most launch misses also compound. Pay attention to both feedback loops the same day.

If you're shipping a v-something in Q3, happy to compare notes — drop a comment and I'll DM you what we did differently between v2 and v3.`,
        reaction_count: 184,
        comment_count: 27,
        share_count: 9,
    },
    {
        id: 'post-eugin-article-deliverability',
        author_id: 'sender-eugin',
        posted_at_minutes_ago: 60 * 26, // 1d 2h ago
        post_kind: 'article',
        post_urn: 'urn:li:article:7184000000000000002',
        text: `What I wish I'd known about cold-email deliverability before we shipped Drason
After two years of running 90+ mailbox pools in production, the deliverability myths I believed at the start cost us about six months. Here's the full breakdown of what we learned — domain warmup curves, why the "150/day" rule is a folk tale, where Google's classifiers actually live in 2025, and the three signals that genuinely predict inbox placement.

This is the long version; the short version is: stop optimizing for sends-per-day and start optimizing for reply-per-thousand. The rest of the article walks through how to instrument that.`,
        reaction_count: 312,
        comment_count: 41,
        share_count: 28,
    },
    {
        id: 'post-eugin-repost-warmup',
        author_id: 'sender-eugin',
        posted_at_minutes_ago: 60 * 48, // 2d
        post_kind: 'repost',
        post_urn: 'urn:li:share:7184000000000000003',
        text: `Worth reposting — Yui's breakdown on PLG funnel decay is the cleanest writeup I've seen.

Especially the bit about activation cohorts that look great in week 1 and quietly fall off a cliff in week 4. We see the exact same pattern on the cold-outreach side: campaigns that look "active" by send-volume but flatlined on reply rate two weeks in.`,
        reaction_count: 47,
        comment_count: 4,
        share_count: 2,
    },
    {
        id: 'post-eugin-short-friday',
        author_id: 'sender-eugin',
        posted_at_minutes_ago: 60 * 70, // ~3d
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000004',
        text: `Friday observation: every "we tried AI-personalisation and it didn't move the needle" post I read this week is using AI to vary the subject line and nothing else. That's not personalisation. That's templating with extra steps.`,
        reaction_count: 11,
        comment_count: 2,
        share_count: 0,
    },
    {
        id: 'post-eugin-thought-leadership-pricing',
        author_id: 'sender-eugin',
        posted_at_minutes_ago: 60 * 90, // ~3.75d
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000005',
        text: `Spent the last 2 weeks rewriting our outbound philosophy. The TLDR is: we were optimising for activity ("did the SDR send 80 emails today") and not outcome ("did the SDR have one real conversation today"). When we flipped the rubric the volume halved and the pipeline tripled.

Three things that surprised me on the way:

1. The leading indicator that actually predicts pipeline is "% of replies that are >40 words" — not opens, not clicks, not replies-as-a-count. A two-word "thanks remove me" reply is not a reply.

2. Sender quality compounds harder than mailbox capacity. One trusted senior sender outperforms 4 SDRs sharing capacity, on the same list, every time we've measured it. We were under-investing in seniority because we were optimising send count, which is silly because the cost is the same.

3. Cold-outreach as a channel is dying for the median ICP and getting BETTER for the top decile. The bifurcation is real. If your data isn't picking out the top decile, you're effectively running against the median, and that's why the channel feels harder year over year.

If you're rebuilding your own outbound rubric this quarter, I'd start with question 1 — instrument %-of-replies->40-words for last 90 days and see what it tells you. Took us a Saturday afternoon.`,
        reaction_count: 268,
        comment_count: 52,
        share_count: 19,
    },

    // ── Asha Patel (Head of Growth) ─────────────────────────────────────
    {
        id: 'post-asha-pricing',
        author_id: 'sender-asha',
        posted_at_minutes_ago: 60 * 4, // 4h ago
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000006',
        text: `Pricing for product-led B2B — our take after three repricings in 18 months:

- "Per seat" is fine for productivity tools. It breaks the moment your product is a workflow that one user runs on behalf of a team.
- Usage-based pricing is great in theory and a nightmare to forecast against. Customers want a number they can put in a budget.
- The cleanest pricing we ever shipped was a tiered "outcomes" pricing tied to a metric the customer was already tracking (replies booked, deals closed). Even when it didn't make us the most money, it made the sales conversation 4x faster.

What's working for you in 2026?`,
        reaction_count: 156,
        comment_count: 38,
        share_count: 11,
    },
    {
        id: 'post-asha-article-funnel',
        author_id: 'sender-asha',
        posted_at_minutes_ago: 60 * 18, // 18h ago
        post_kind: 'article',
        post_urn: 'urn:li:article:7184000000000000007',
        text: `Decoding PLG funnel decay — why your week-4 activation cohorts look fine and your week-12 cohorts don't
We instrumented a 12-week cohort study across 7 PLG companies and the pattern was identical: activation rate is fine in week 1, decay sets in around week 4, and by week 12 you've lost 60-70% of the cohort. Aggregate metrics hide the decay because new sign-ups mask the curve.

This article walks through the instrumentation, the three rituals that fix the leak, and why we now think "weekly active accounts" is the wrong North Star for early-stage PLG.`,
        reaction_count: 198,
        comment_count: 22,
        share_count: 14,
    },
    {
        id: 'post-asha-thought-leadership-sdr',
        author_id: 'sender-asha',
        posted_at_minutes_ago: 60 * 36, // 1.5d ago
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000008',
        text: `Most growth teams I talk to are running the wrong experiment.

They're A/B testing message copy on cold outbound. But the variance between two well-written messages is maybe 10-15%. The variance between "right ICP with the right signal" and "wrong ICP with the best copy in the world" is something like 8x. We measured.

What we did differently this quarter, in plain language:

- Stopped A/B testing copy. The hours spent on subject-line variations were not paying for themselves.
- Built one signal per ICP. For founders: "just raised, mentioned hiring SDRs." For RevOps: "Salesforce post engagement in last 30d." For PLG growth: "moved from Series A to Series B in last 6 months." That's it — three ICPs, three signals, each one boolean.
- Routed only signal-positive prospects into the active sequences. Signal-negative ones got tagged for the warm-up pool and pulled later when conditions changed.

Reply rate moved from 6.2% to 14.8%. The copy didn't change. What changed was the population we were sending to.

If you're a growth lead spending all your time on copy and your reply rate has plateaued — the lever isn't the copy. It's the list.`,
        reaction_count: 241,
        comment_count: 44,
        share_count: 17,
    },
    {
        id: 'post-asha-short-prediction',
        author_id: 'sender-asha',
        posted_at_minutes_ago: 60 * 56, // 2.3d
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000009',
        text: `Prediction for 2026: every outbound team will have a "signal" role that owns the question "who is in the right state to be contacted RIGHT NOW", separate from the SDR who actually contacts them. It's already happening at the larger companies. The smaller companies are still cargo-culting volume.`,
        reaction_count: 67,
        comment_count: 9,
        share_count: 3,
    },

    // ── Ben Walker (SDR) ────────────────────────────────────────────────
    {
        id: 'post-ben-latency',
        author_id: 'sender-ben',
        posted_at_minutes_ago: 60 * 8, // 8h ago
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000010',
        text: `How we cut cold-email reply latency 4x — from 11min median to 2min 40s.

What didn't work: faster typing, hotkey templates, AI-suggested replies. What worked: a 30-minute pre-shift review of the queue so every reply already had context loaded in my head. Boring answer but the data is unambiguous — context-loaded replies close 2.7x more meetings than zero-context "fast" replies.

If you're an SDR drowning in inbox: the bottleneck is rarely typing speed. It's almost always context-switching.`,
        reaction_count: 142,
        comment_count: 21,
        share_count: 6,
    },
    {
        id: 'post-ben-repost-asha',
        author_id: 'sender-ben',
        posted_at_minutes_ago: 60 * 22, // 22h
        post_kind: 'repost',
        post_urn: 'urn:li:share:7184000000000000011',
        text: `+1 to everything Asha said about copy vs list. I run the actual sends and the painful truth is that I can write the same message every week if the list is right. The week the list is wrong is the week I'm rewriting subject lines at midnight wondering if I should change careers.`,
        reaction_count: 38,
        comment_count: 5,
        share_count: 1,
    },
    {
        id: 'post-ben-thought-leadership-meetings',
        author_id: 'sender-ben',
        posted_at_minutes_ago: 60 * 30, // 1.25d
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000012',
        text: `Took 47 discovery calls last month. Detailed notes from every one. Patterns I didn't expect:

1. The buyers who said "we're not actively looking right now" became 4 of our last 6 closed-won deals. The "not looking" was a polite scheduling signal, not a real disqualifier. We've stopped marking them lost.

2. Founders consistently lie about their team size, in both directions. The 5-person team that says "we're 15" wants to look bigger to seem investable; the 80-person team that says "we're a small team" wants to seem scrappy. We've stopped trusting the answer and we just look at LinkedIn employee count before the call.

3. The single highest-leverage discovery question I've found: "Walk me through the last time this problem came up — what happened, what did you try?" Not "what's keeping you up at night" (every disco asks it), not "what's your current stack" (rarely surprising). The narrative answer surfaces real pain way faster than the inventory answer.

4. Buyers who turn the camera on close ~3x more often than buyers who don't. I'm not claiming causation. But I'm done pretending it's a small effect.

Not advice, just patterns. If you're an SDR or AE and your discovery feels formulaic, try question 3 next week and tell me what changes.`,
        reaction_count: 175,
        comment_count: 34,
        share_count: 8,
    },
    {
        id: 'post-ben-short-tooling',
        author_id: 'sender-ben',
        posted_at_minutes_ago: 60 * 96, // 4d
        post_kind: 'post',
        post_urn: 'urn:li:activity:7184000000000000013',
        text: `Hot take: most SDR tooling is built for managers to look at, not for SDRs to use. The dashboards are gorgeous. The actual "do the work" surfaces are afterthoughts. I'd happily trade every Looker board we have for a queue that doesn't lose my place when I switch tabs.`,
        reaction_count: 89,
        comment_count: 14,
        share_count: 4,
    },
];

/** Legacy alias — keeps the old `findPost(id)` callers + the SIGNALS
 *  array's `post_id` references resolving to the same set. */
export const POSTS = Object.fromEntries(
    DEMO_POSTS.map(p => [p.id.replace(/^post-/, '').replace(/-/g, '_'), p]),
) as Record<string, DemoPost>;

// ── ICPs — same shape as the IcpProfile API rows ─────────────────────────────

export const ICPS = [
    {
        id: 'icp-saas-founders',
        name: 'B2B SaaS founders',
        description: 'Series-A to Series-C SaaS founders building cold-outreach-adjacent tools.',
        titles: ['Founder', 'Co-Founder', 'CEO'],
        industries: ['B2B SaaS', 'Sales Tech', 'MarTech'],
        company_sizes: ['11-50', '51-200', '201-500'],
        geos: ['United States', 'Canada', 'United Kingdom', 'Germany'],
        enabled: true,
    },
    {
        id: 'icp-plg-growth',
        name: 'PLG growth leaders',
        description: 'Growth + demand-gen leaders at product-led companies.',
        titles: ['Head of Growth', 'VP Growth', 'Director of Demand Gen', 'Head of Demand'],
        industries: ['B2B SaaS', 'Developer Tools', 'PLG'],
        company_sizes: ['51-200', '201-500', '501-1000'],
        geos: ['United States', 'United Kingdom', 'Netherlands', 'Australia'],
        enabled: true,
    },
    {
        id: 'icp-revops',
        name: 'RevOps directors',
        description: 'RevOps and Sales Ops leaders in mid-market SaaS.',
        titles: ['Director of RevOps', 'Head of RevOps', 'VP RevOps', 'Sales Ops Lead'],
        industries: ['B2B SaaS', 'FinTech', 'HealthTech'],
        company_sizes: ['51-200', '201-500', '501-1000', '1001-5000'],
        geos: ['United States', 'Canada'],
        enabled: true,
    },
    {
        id: 'icp-healthcare',
        name: 'Healthcare ops (paused)',
        description: 'Hospital-network ops leaders. Paused — not pursuing this segment Q2.',
        titles: ['VP Operations', 'COO', 'Director of Operations'],
        industries: ['Healthcare', 'Hospital & Health Care'],
        company_sizes: ['501-1000', '1001-5000', '5000+'],
        geos: ['United States'],
        enabled: false,
    },
] as const;

// ── Prospects — the cast that recurs on signals + contacts + unibox ──────────

export interface Prospect {
    id: string;
    name: string;
    headline: string;
    company: string;
    title: string;
    industry: string;
    location: string;
    linkedin_slug: string;
    email: string | null;
    phone: string | null;
    icp_id: string | null;
    icp_score: number | null;
    connection_status: 'CONNECTED' | 'INVITE_SENT' | 'NOT_CONNECTED' | 'INVITE_ACCEPTED';
    lead_score: number;
    auto_tag: 'Interested' | 'Not Interested' | 'Generic' | null;
    source: 'linkedin_signal' | 'csv' | 'clay' | 'apollo' | 'lusha' | 'sequencer';
    tags: Array<{ label: string; color: string }>;
    avatar_tint: string;
}

export const PROSPECTS: Prospect[] = [
    {
        id: 'prospect-priya-sharma',
        name: 'Priya Sharma',
        headline: 'VP Marketing @ Stellar Cloud',
        company: 'Stellar Cloud',
        title: 'VP Marketing',
        industry: 'B2B SaaS',
        location: 'San Francisco, CA',
        linkedin_slug: 'priyasharma',
        email: 'priya@stellarcloud.io',
        phone: '+1 415 555 0142',
        icp_id: null,
        icp_score: 0.62,
        connection_status: 'CONNECTED',
        lead_score: 71,
        auto_tag: 'Interested',
        source: 'linkedin_signal',
        tags: [{ label: 'Engaged', color: 'emerald' }, { label: 'Q2 launch', color: 'blue' }],
        avatar_tint: 'from-blue-100 to-indigo-100',
    },
    {
        id: 'prospect-marcus-chen',
        name: 'Marcus Chen',
        headline: 'Founder @ Pinetree Labs (Series A)',
        company: 'Pinetree Labs',
        title: 'Founder',
        industry: 'B2B SaaS',
        location: 'New York, NY',
        linkedin_slug: 'marcuschen',
        email: 'marcus@pinetree.dev',
        phone: null,
        icp_id: 'icp-saas-founders',
        icp_score: 0.91,
        connection_status: 'INVITE_ACCEPTED',
        lead_score: 84,
        auto_tag: 'Interested',
        source: 'linkedin_signal',
        tags: [{ label: 'Hot', color: 'rose' }, { label: 'Founder', color: 'violet' }],
        avatar_tint: 'from-rose-100 to-amber-100',
    },
    {
        id: 'prospect-yui-tanaka',
        name: 'Yui Tanaka',
        headline: 'Head of Growth @ Modern.ai',
        company: 'Modern.ai',
        title: 'Head of Growth',
        industry: 'Developer Tools',
        location: 'Singapore',
        linkedin_slug: 'yuitanaka',
        email: 'yui@modern.ai',
        phone: '+65 9123 4567',
        icp_id: 'icp-plg-growth',
        icp_score: 0.87,
        connection_status: 'CONNECTED',
        lead_score: 79,
        auto_tag: 'Interested',
        source: 'linkedin_signal',
        tags: [{ label: 'PLG', color: 'emerald' }],
        avatar_tint: 'from-emerald-100 to-teal-100',
    },
    {
        id: 'prospect-ravi-bhalla',
        name: 'Ravi Bhalla',
        headline: 'CEO @ Tessera (acquired 2024)',
        company: 'Tessera',
        title: 'CEO',
        industry: 'B2B SaaS',
        location: 'London, UK',
        linkedin_slug: 'ravibhalla',
        email: 'ravi@tessera.work',
        phone: null,
        icp_id: 'icp-saas-founders',
        icp_score: 0.96,
        connection_status: 'INVITE_SENT',
        lead_score: 88,
        auto_tag: 'Interested',
        source: 'linkedin_signal',
        tags: [{ label: 'Hot', color: 'rose' }, { label: 'Decision-maker', color: 'amber' }],
        avatar_tint: 'from-violet-100 to-fuchsia-100',
    },
    {
        id: 'prospect-lena-hoffmann',
        name: 'Lena Hoffmann',
        headline: 'Product Lead @ Rivelo Health',
        company: 'Rivelo Health',
        title: 'Product Lead',
        industry: 'HealthTech',
        location: 'Berlin, Germany',
        linkedin_slug: 'lenahoffmann',
        email: null,
        phone: null,
        icp_id: null,
        icp_score: 0.18,
        connection_status: 'NOT_CONNECTED',
        lead_score: 41,
        auto_tag: 'Generic',
        source: 'linkedin_signal',
        tags: [],
        avatar_tint: 'from-cyan-100 to-sky-100',
    },
    {
        id: 'prospect-dev-patel',
        name: 'Dev Patel',
        headline: 'COO @ Northcrest Capital',
        company: 'Northcrest Capital',
        title: 'COO',
        industry: 'FinTech',
        location: 'Toronto, ON',
        linkedin_slug: 'devpatel',
        email: 'dev@northcrest.cap',
        phone: '+1 416 555 0238',
        icp_id: 'icp-saas-founders',
        icp_score: 0.83,
        connection_status: 'CONNECTED',
        lead_score: 76,
        auto_tag: 'Interested',
        source: 'apollo',
        tags: [{ label: 'Warm intro', color: 'amber' }],
        avatar_tint: 'from-orange-100 to-red-100',
    },
    {
        id: 'prospect-sofia-reyes',
        name: 'Sofía Reyes',
        headline: 'Director of RevOps @ Halford Bio',
        company: 'Halford Bio',
        title: 'Director of RevOps',
        industry: 'HealthTech',
        location: 'Austin, TX',
        linkedin_slug: 'sofiareyes',
        email: 'sofia@halfordbio.com',
        phone: '+1 512 555 0119',
        icp_id: 'icp-revops',
        icp_score: 0.89,
        connection_status: 'CONNECTED',
        lead_score: 81,
        auto_tag: 'Interested',
        source: 'linkedin_signal',
        tags: [{ label: 'RevOps', color: 'blue' }],
        avatar_tint: 'from-pink-100 to-rose-100',
    },
    {
        id: 'prospect-hannah-muller',
        name: 'Hannah Müller',
        headline: 'Co-Founder @ Loop & Anchor',
        company: 'Loop & Anchor',
        title: 'Co-Founder',
        industry: 'B2B SaaS',
        location: 'Munich, Germany',
        linkedin_slug: 'hannahmuller',
        email: 'hannah@loopanchor.co',
        phone: null,
        icp_id: 'icp-saas-founders',
        icp_score: 0.92,
        connection_status: 'CONNECTED',
        lead_score: 82,
        auto_tag: 'Interested',
        source: 'clay',
        tags: [{ label: 'Founder', color: 'violet' }],
        avatar_tint: 'from-amber-100 to-yellow-100',
    },
    {
        id: 'prospect-kojo-mensah',
        name: 'Kojo Mensah',
        headline: 'Head of Demand @ Modern.ai',
        company: 'Modern.ai',
        title: 'Head of Demand',
        industry: 'Developer Tools',
        location: 'London, UK',
        linkedin_slug: 'kojomensah',
        email: 'kojo@modern.ai',
        phone: null,
        icp_id: 'icp-plg-growth',
        icp_score: 0.84,
        connection_status: 'INVITE_SENT',
        lead_score: 73,
        auto_tag: null,
        source: 'sequencer',
        tags: [],
        avatar_tint: 'from-lime-100 to-emerald-100',
    },
    {
        id: 'prospect-james-liu',
        name: 'James Liu',
        headline: 'Director of Engineering @ Pinetree Labs',
        company: 'Pinetree Labs',
        title: 'Director of Engineering',
        industry: 'B2B SaaS',
        location: 'New York, NY',
        linkedin_slug: 'jamesliu',
        email: null,
        phone: null,
        icp_id: null,
        icp_score: 0.34,
        connection_status: 'NOT_CONNECTED',
        lead_score: 52,
        auto_tag: 'Not Interested',
        source: 'linkedin_signal',
        tags: [{ label: 'Bounce', color: 'rose' }],
        avatar_tint: 'from-slate-100 to-gray-100',
    },
];

// ── Campaigns — cross-feature, with the prospects above as leads ─────────────

export interface DemoCampaign {
    id: string;
    name: string;
    channel: 'linkedin' | 'email' | 'mixed';
    status: 'active' | 'paused' | 'draft' | 'finished';
    icp_id: string;
    sender_ids: string[];                    // refs SALES_TEAM[].id
    enrolled_prospect_ids: string[];         // refs PROSPECTS[].id
    counts: {
        pending: number;
        in_sequence: number;
        finished: number;
        replied: number;
        accept_rate: number;                 // 0-1
        reply_rate: number;                  // 0-1
    };
}

export const CAMPAIGNS: DemoCampaign[] = [
    // ── Super LinkedIn — LinkedIn-only campaigns ────────────────────────
    {
        id: 'camp-plg-growth-q2',
        name: 'PLG Heads of Growth — Q2',
        channel: 'linkedin',
        status: 'active',
        icp_id: 'icp-plg-growth',
        sender_ids: ['sender-asha', 'sender-ben'],
        enrolled_prospect_ids: ['prospect-yui-tanaka', 'prospect-kojo-mensah'],
        counts: { pending: 12, in_sequence: 52, finished: 25, replied: 6, accept_rate: 0.27, reply_rate: 0.12 },
    },
    {
        id: 'camp-revops-us-east',
        name: 'RevOps US East — touch 1',
        channel: 'linkedin',
        status: 'paused',
        icp_id: 'icp-revops',
        sender_ids: ['sender-asha', 'sender-shared'],
        enrolled_prospect_ids: ['prospect-sofia-reyes'],
        counts: { pending: 0, in_sequence: 24, finished: 14, replied: 2, accept_rate: 0.24, reply_rate: 0.08 },
    },
    {
        id: 'camp-founders-li-only',
        name: 'Founders Series-A — LinkedIn warm-up',
        channel: 'linkedin',
        status: 'active',
        icp_id: 'icp-saas-founders',
        sender_ids: ['sender-eugin', 'sender-asha'],
        enrolled_prospect_ids: ['prospect-marcus-chen', 'prospect-ravi-bhalla', 'prospect-hannah-muller'],
        counts: { pending: 8, in_sequence: 47, finished: 18, replied: 9, accept_rate: 0.41, reply_rate: 0.19 },
    },
    {
        id: 'camp-content-engagers',
        name: 'Content engagers — Eugin Q3 launch',
        channel: 'linkedin',
        status: 'active',
        icp_id: 'icp-plg-growth',
        sender_ids: ['sender-eugin'],
        enrolled_prospect_ids: ['prospect-priya-sharma', 'prospect-dev-patel'],
        counts: { pending: 5, in_sequence: 33, finished: 12, replied: 7, accept_rate: 0.52, reply_rate: 0.21 },
    },
    {
        id: 'camp-bio-health-vps',
        name: 'Bio/Health VPs — warm only',
        channel: 'linkedin',
        status: 'draft',
        icp_id: 'icp-healthcare',
        sender_ids: ['sender-shared'],
        enrolled_prospect_ids: [],
        counts: { pending: 0, in_sequence: 0, finished: 0, replied: 0, accept_rate: 0, reply_rate: 0 },
    },

    // ── Super Sequencer — mixed (email + LinkedIn) and email-only ─────
    {
        id: 'camp-founders-series-a',
        name: 'Founders — Series A SaaS (mixed)',
        channel: 'mixed',
        status: 'active',
        icp_id: 'icp-saas-founders',
        sender_ids: ['sender-eugin', 'sender-asha', 'sender-ben'],
        enrolled_prospect_ids: ['prospect-marcus-chen', 'prospect-ravi-bhalla', 'prospect-hannah-muller', 'prospect-dev-patel'],
        counts: { pending: 18, in_sequence: 89, finished: 35, replied: 14, accept_rate: 0.36, reply_rate: 0.16 },
    },
    {
        id: 'camp-revops-mixed-q3',
        name: 'RevOps US — email-first + LinkedIn nudge',
        channel: 'mixed',
        status: 'active',
        icp_id: 'icp-revops',
        sender_ids: ['sender-asha', 'sender-ben'],
        enrolled_prospect_ids: ['prospect-sofia-reyes'],
        counts: { pending: 6, in_sequence: 41, finished: 18, replied: 5, accept_rate: 0.29, reply_rate: 0.12 },
    },
    {
        id: 'camp-newsletter-warmup',
        name: 'Newsletter signups — drip (email-only)',
        channel: 'email',
        status: 'active',
        icp_id: 'icp-plg-growth',
        sender_ids: ['sender-ben'],
        enrolled_prospect_ids: ['prospect-kojo-mensah', 'prospect-priya-sharma'],
        counts: { pending: 22, in_sequence: 145, finished: 78, replied: 24, accept_rate: 0, reply_rate: 0.17 },
    },
];

// ── Campaign sequences — the per-campaign schema rendered on the
//    /campaigns/[id]/sequence page. One DemoSequenceStep[] per
//    CAMPAIGNS entry, sized to show off the diagram (follow → CR →
//    DM, sometimes preceded by view-profile and/or punctuated by an
//    InMail). The step_types match the backend stepTypeRegistry
//    vocabulary so the diagram renders the same node mix as live data.

export interface DemoSequenceStep {
    id: string;
    step_number: number;
    step_type:
        | 'linkedin_view_profile'
        | 'linkedin_follow'
        | 'linkedin_like_post'
        | 'linkedin_connection_request'
        | 'linkedin_message'
        | 'linkedin_inmail'
        | 'email';
    delay_days: number;
    delay_hours: number;
    /** Surfaced on InMail steps as the email subject line. */
    subject: string | null;
    /** DM / InMail body, or the connection-note for CR steps. */
    body: string | null;
    condition: string | null;
}

export const CAMPAIGN_SEQUENCES: Record<string, DemoSequenceStep[]> = {
    // ─────────────────────────────────────────────────────────────────────
    // Super LinkedIn — LinkedIn-only sequences. NO email steps allowed.
    // Channel discipline: Super LinkedIn is single-channel by design;
    // anything that combines email + LinkedIn lives on Super Sequencer.
    // ─────────────────────────────────────────────────────────────────────

    // PLG growth leaders — post-like + DM rhythm with an InMail escape.
    'camp-plg-growth-q2': [
        { id: 'step-plg-1', step_number: 1, step_type: 'linkedin_follow',             delay_days: 0, delay_hours: 0, subject: null, body: null, condition: null },
        { id: 'step-plg-2', step_number: 2, step_type: 'linkedin_like_post',          delay_days: 2, delay_hours: 0, subject: null, body: null, condition: null },
        { id: 'step-plg-3', step_number: 3, step_type: 'linkedin_connection_request', delay_days: 1, delay_hours: 0, subject: null, body: 'Hey {{first_name}} — your post on funnel decay was the cleanest framing I\'ve seen this quarter. Building outbound tooling in the same neighbourhood; would love to connect.', condition: null },
        { id: 'step-plg-4', step_number: 4, step_type: 'linkedin_message',            delay_days: 5, delay_hours: 0, subject: null, body: 'Thanks for connecting, {{first_name}}! Curious — when you instrument cohort decay at {{company}}, are you doing it in your data warehouse or somewhere else? Working on the outbound equivalent and your read would be gold.', condition: 'if_connection' },
        { id: 'step-plg-5', step_number: 5, step_type: 'linkedin_inmail',             delay_days: 7, delay_hours: 0, subject: 'Open to a 15-min on outbound signal at {{company}}?', body: 'Hi {{first_name}} — Drason runs signal-based outbound for PLG growth teams. We measure replies-per-thousand, not sends-per-day. If outbound is on your Q3 roadmap, happy to show 15 mins of how we\'d structure it for {{company}} specifically. Worth a look?', condition: 'if_not_connection' },
    ],

    // RevOps US — short, polite, three touches.
    'camp-revops-us-east': [
        { id: 'step-rev-1', step_number: 1, step_type: 'linkedin_view_profile',       delay_days: 0, delay_hours: 0,  subject: null, body: null, condition: null },
        { id: 'step-rev-2', step_number: 2, step_type: 'linkedin_connection_request', delay_days: 1, delay_hours: 0,  subject: null, body: 'Hi {{first_name}}, building tooling for RevOps leaders on the outbound side — would love to connect and learn how you\'re thinking about it at {{company}}.', condition: null },
        { id: 'step-rev-3', step_number: 3, step_type: 'linkedin_message',            delay_days: 7, delay_hours: 0,  subject: null, body: 'Thanks for connecting, {{first_name}}! Quick one: when SDR reply-quality dips at {{company}}, where do you usually start looking — list, copy, or sender mix? We\'ve built tooling that answers that one specifically.', condition: 'if_connection' },
    ],

    // Founders Series-A — LinkedIn-only warm-up (separate from the
    // mixed `camp-founders-series-a` campaign, which lives on Sequencer).
    'camp-founders-li-only': [
        { id: 'step-fli-1', step_number: 1, step_type: 'linkedin_view_profile',       delay_days: 0, delay_hours: 0, subject: null, body: null, condition: null },
        { id: 'step-fli-2', step_number: 2, step_type: 'linkedin_follow',             delay_days: 0, delay_hours: 6, subject: null, body: null, condition: null },
        { id: 'step-fli-3', step_number: 3, step_type: 'linkedin_connection_request', delay_days: 1, delay_hours: 0, subject: null, body: 'Hi {{first_name}}, came across your work at {{company}} — building Drason in the same neighbourhood. Would love to swap notes on what\'s working for outbound at your stage.', condition: null },
        { id: 'step-fli-4', step_number: 4, step_type: 'linkedin_message',            delay_days: 4, delay_hours: 0, subject: null, body: 'Thanks for connecting, {{first_name}}! Quick one — if you had to pick the single hardest part of running outbound at {{company}}\'s stage, what would it be? Genuinely curious; I collect answers and the patterns are interesting.', condition: 'if_connection' },
    ],

    // Content engagers — fed by the signal poller on Eugin\'s launch post.
    'camp-content-engagers': [
        { id: 'step-ce-1', step_number: 1, step_type: 'linkedin_view_profile',       delay_days: 0, delay_hours: 0, subject: null, body: null, condition: null },
        { id: 'step-ce-2', step_number: 2, step_type: 'linkedin_connection_request', delay_days: 0, delay_hours: 12, subject: null, body: 'Hey {{first_name}} — thanks for the {{reaction}} on the launch post. I\'d love to connect; I\'m building Drason and your read on cold-outreach problems would mean a lot.', condition: null },
        { id: 'step-ce-3', step_number: 3, step_type: 'linkedin_message',            delay_days: 3, delay_hours: 0, subject: null, body: 'Appreciate the connect, {{first_name}}! Followup on the post — what landed for you, and what felt off? Won\'t pitch; just collecting honest reads from people who pay attention to this space.', condition: 'if_connection' },
    ],

    // Draft healthcare-VPs sequence — paused until ICP approves Q3 targeting.
    'camp-bio-health-vps': [
        { id: 'step-bio-1', step_number: 1, step_type: 'linkedin_view_profile',       delay_days: 0, delay_hours: 0, subject: null, body: null, condition: null },
        { id: 'step-bio-2', step_number: 2, step_type: 'linkedin_connection_request', delay_days: 2, delay_hours: 0, subject: null, body: 'Hi {{first_name}}, working on outbound tooling that respects the compliance surface of healthcare orgs — would love to connect and trade notes.', condition: null },
    ],

    // ─────────────────────────────────────────────────────────────────────
    // Super Sequencer — mixed (email + LinkedIn) and email-only sequences.
    // Channel discipline: ONLY campaigns rendered on the Sequencer surfaces.
    // Never accessible from the Super LinkedIn list / detail / schema.
    // ─────────────────────────────────────────────────────────────────────

    // Mixed: email opener, LinkedIn warm-up + CR + DM, email breakup.
    'camp-founders-series-a': [
        { id: 'step-fsa-1', step_number: 1, step_type: 'email',                       delay_days: 0, delay_hours: 0,  subject: 'Quick thought, {{first_name}}', body: 'Hey {{first_name}} — we built Drason for founders who hate the look of cold-outreach tools but still need pipeline. Two-line ask: would you be open to a 15-min look at how we do signal-based outbound for SaaS founders specifically? — Eugin', condition: null },
        { id: 'step-fsa-2', step_number: 2, step_type: 'linkedin_view_profile',       delay_days: 1, delay_hours: 0,  subject: null, body: null, condition: 'if_no_reply' },
        { id: 'step-fsa-3', step_number: 3, step_type: 'linkedin_follow',             delay_days: 0, delay_hours: 6,  subject: null, body: null, condition: 'if_no_reply' },
        { id: 'step-fsa-4', step_number: 4, step_type: 'linkedin_connection_request', delay_days: 1, delay_hours: 0,  subject: null, body: 'Hi {{first_name}}, came across your work at {{company}} — building Drason in the same neighbourhood. Would love to swap notes on what\'s working for outbound at your stage.', condition: 'if_no_reply' },
        { id: 'step-fsa-5', step_number: 5, step_type: 'linkedin_message',            delay_days: 4, delay_hours: 0,  subject: null, body: 'Thanks for connecting, {{first_name}}! Quick context: we focus on signal-based outbound for founders going Series-A → B. If pipeline is on the Q3 list, happy to show the playbook (15 min, no slides). Worth a look?', condition: 'if_connection' },
        { id: 'step-fsa-6', step_number: 6, step_type: 'email',                       delay_days: 3, delay_hours: 0,  subject: 'Closing the loop — {{first_name}}', body: 'Hey {{first_name}} — last note from me. Mind if I keep an eye on what you\'re building over the next quarter, and reach back out when timing works better? Either way, good luck with the build.', condition: 'if_no_reply' },
    ],

    // Mixed: email-first three touches, LinkedIn CR nudge for non-responders.
    'camp-revops-mixed-q3': [
        { id: 'step-rmq-1', step_number: 1, step_type: 'email',                       delay_days: 0, delay_hours: 0,  subject: 'A short read for {{first_name}}', body: 'Hi {{first_name}} — when reply-quality dips on your team, where do you usually start looking — list, copy, or sender mix? We built tooling to answer that one specifically and would love your read.', condition: null },
        { id: 'step-rmq-2', step_number: 2, step_type: 'email',                       delay_days: 3, delay_hours: 0,  subject: 'Re: A short read for {{first_name}}', body: 'Adding context to the earlier note — we surface 9 reply classes per thread and a sender-quality score that compounds across campaigns. 15 minutes if useful?', condition: 'if_no_reply' },
        { id: 'step-rmq-3', step_number: 3, step_type: 'linkedin_view_profile',       delay_days: 2, delay_hours: 0,  subject: null, body: null, condition: 'if_no_reply' },
        { id: 'step-rmq-4', step_number: 4, step_type: 'linkedin_connection_request', delay_days: 0, delay_hours: 12, subject: null, body: 'Hi {{first_name}}, sent a couple of notes over email — wanted to add LinkedIn so we\'re on each other\'s radar. No pitch attached.', condition: 'if_no_reply' },
        { id: 'step-rmq-5', step_number: 5, step_type: 'email',                       delay_days: 4, delay_hours: 0,  subject: 'Closing the loop — {{first_name}}', body: 'Last note from me. Mind if I save your name for when timing\'s better? Either way, hope the quarter wraps well.', condition: 'if_no_reply' },
    ],

    // Email-only newsletter drip — the legacy email-channel case.
    'camp-newsletter-warmup': [
        { id: 'step-nw-1', step_number: 1, step_type: 'email', delay_days: 0, delay_hours: 0,  subject: 'Welcome, {{first_name}}', body: 'Hey {{first_name}} — thanks for joining. This is a slow drip (one email a week, never more) on what we\'re learning about outbound. First note coming Wednesday.', condition: null },
        { id: 'step-nw-2', step_number: 2, step_type: 'email', delay_days: 4, delay_hours: 0,  subject: 'Reply rate vs send count', body: 'Counter-intuitive: the SDRs we work with who halved their send count usually tripled their pipeline. The link below walks through why — it\'s mostly a measurement problem.', condition: null },
        { id: 'step-nw-3', step_number: 3, step_type: 'email', delay_days: 7, delay_hours: 0,  subject: 'How we measure sender quality', body: 'A short breakdown of the sender-quality score Drason maintains per mailbox — what goes in, what it predicts, and how we use it to route sends. Half the article is the failure modes.', condition: null },
        { id: 'step-nw-4', step_number: 4, step_type: 'email', delay_days: 7, delay_hours: 0,  subject: 'Want a closer look?', body: 'Last note in the drip: if any of this resonated, hit reply with a one-line "yes" and I\'ll send a 4-min walkthrough video that goes deeper. No call required.', condition: null },
    ],
};

// ── Signal events ────────────────────────────────────────────────────────────

export interface DemoSignal {
    id: string;
    prospect_id: string;
    post_id: string;
    event_type: 'REACTION' | 'COMMENT' | 'SHARE' | 'REPOST';
    reaction_type: 'LIKE' | 'PRAISE' | 'EMPATHY' | 'INTEREST' | 'APPRECIATION' | 'MAYBE' | 'FUNNY' | null;
    mode: 'OBSERVE' | 'SUGGEST' | 'ENFORCE';
    action: 'added_to_list' | 'added_to_campaign' | 'queued_review' | 'observed_only';
    minutes_ago: number;
}

export const SIGNALS: DemoSignal[] = [
    { id: 'sig-01', prospect_id: 'prospect-priya-sharma',   post_id: 'post-eugin-launch', event_type: 'REACTION', reaction_type: 'PRAISE',       mode: 'OBSERVE', action: 'observed_only',    minutes_ago: 12 },
    { id: 'sig-02', prospect_id: 'prospect-marcus-chen',    post_id: 'post-eugin-launch', event_type: 'COMMENT',  reaction_type: null,           mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 38 },
    { id: 'sig-03', prospect_id: 'prospect-yui-tanaka',     post_id: 'post-asha-pricing', event_type: 'SHARE',    reaction_type: null,           mode: 'SUGGEST', action: 'queued_review',    minutes_ago: 64 },
    { id: 'sig-04', prospect_id: 'prospect-ravi-bhalla',    post_id: 'post-asha-pricing', event_type: 'REACTION', reaction_type: 'INTEREST',     mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 120 },
    { id: 'sig-05', prospect_id: 'prospect-lena-hoffmann',  post_id: 'post-eugin-launch', event_type: 'REACTION', reaction_type: 'LIKE',         mode: 'OBSERVE', action: 'observed_only',    minutes_ago: 140 },
    { id: 'sig-06', prospect_id: 'prospect-dev-patel',      post_id: 'post-ben-latency',  event_type: 'REACTION', reaction_type: 'APPRECIATION', mode: 'SUGGEST', action: 'added_to_list',    minutes_ago: 180 },
    { id: 'sig-07', prospect_id: 'prospect-sofia-reyes',    post_id: 'post-ben-latency',  event_type: 'COMMENT',  reaction_type: null,           mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 240 },
    { id: 'sig-08', prospect_id: 'prospect-hannah-muller',  post_id: 'post-eugin-launch', event_type: 'REACTION', reaction_type: 'PRAISE',       mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 330 },
    { id: 'sig-09', prospect_id: 'prospect-kojo-mensah',    post_id: 'post-asha-pricing', event_type: 'COMMENT',  reaction_type: null,           mode: 'SUGGEST', action: 'added_to_list',    minutes_ago: 420 },
    { id: 'sig-10', prospect_id: 'prospect-marcus-chen',    post_id: 'post-ben-latency',  event_type: 'REACTION', reaction_type: 'EMPATHY',      mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 540 },
    { id: 'sig-11', prospect_id: 'prospect-james-liu',      post_id: 'post-eugin-launch', event_type: 'REACTION', reaction_type: 'MAYBE',        mode: 'OBSERVE', action: 'observed_only',    minutes_ago: 700 },
    { id: 'sig-12', prospect_id: 'prospect-yui-tanaka',     post_id: 'post-ben-latency',  event_type: 'REACTION', reaction_type: 'INTEREST',     mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 880 },
    { id: 'sig-13', prospect_id: 'prospect-priya-sharma',   post_id: 'post-ben-latency',  event_type: 'REACTION', reaction_type: 'LIKE',         mode: 'OBSERVE', action: 'observed_only',    minutes_ago: 1100 },
    { id: 'sig-14', prospect_id: 'prospect-hannah-muller',  post_id: 'post-asha-pricing', event_type: 'COMMENT',  reaction_type: null,           mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 1260 },
    { id: 'sig-15', prospect_id: 'prospect-ravi-bhalla',    post_id: 'post-ben-latency',  event_type: 'REACTION', reaction_type: 'APPRECIATION', mode: 'ENFORCE', action: 'added_to_campaign', minutes_ago: 1440 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function findProspect(id: string): Prospect | undefined {
    return PROSPECTS.find(p => p.id === id);
}

export function findCampaign(id: string): DemoCampaign | undefined {
    return CAMPAIGNS.find(c => c.id === id);
}

export function findIcp(id: string): typeof ICPS[number] | undefined {
    return ICPS.find(i => i.id === id);
}

export function findSender(id: string): typeof SALES_TEAM[number] | undefined {
    return SALES_TEAM.find(s => s.id === id);
}

export function findPost(id: string) {
    return DEMO_POSTS.find(p => p.id === id);
}

/** Short display title — for articles, the literal first line; for plain
 *  posts and reposts, the first sentence truncated to ~90 chars. */
export function postTitle(p: DemoPost): string {
    const first = p.text.split('\n').find(l => l.trim().length > 0)?.trim() ?? '';
    if (first.length <= 90) return first;
    return first.slice(0, 90).replace(/\s+\S*$/, '') + '…';
}

/** Compose a `posted_at` ISO string from the minutes-ago anchor so demo
 *  rows time-travel correctly under relative-time renders. */
export function postedAtIso(p: DemoPost): string {
    return new Date(Date.now() - p.posted_at_minutes_ago * 60 * 1000).toISOString();
}

/** Demo posts authored by a given account, ordered newest first. */
export function getDemoPostsForAccount(accountId: string): DemoPost[] {
    return [...DEMO_POSTS]
        .filter(p => p.author_id === accountId)
        .sort((a, b) => a.posted_at_minutes_ago - b.posted_at_minutes_ago);
}

/** Heuristic mirrors the backend's isThoughtLeadership rule. */
export function isThoughtLeadership(p: DemoPost): boolean {
    return p.post_kind === 'post' && p.text.length >= 500 && p.reaction_count >= 25;
}

/** Demo sequence for a campaign id; empty array if unknown. */
export function findDemoSequence(campaignId: string): DemoSequenceStep[] {
    return CAMPAIGN_SEQUENCES[campaignId] ?? [];
}

/** Prospects who engaged with a given post — derived from SIGNALS. */
export function getDemoEngagersForPost(postId: string): Array<Prospect & { event_type: DemoSignal['event_type']; reaction_type: DemoSignal['reaction_type']; minutes_ago: number }> {
    const events = SIGNALS.filter(s => s.post_id === postId);
    const seen = new Set<string>();
    const rows: Array<Prospect & { event_type: DemoSignal['event_type']; reaction_type: DemoSignal['reaction_type']; minutes_ago: number }> = [];
    for (const ev of events) {
        if (seen.has(ev.prospect_id)) continue;
        seen.add(ev.prospect_id);
        const prospect = findProspect(ev.prospect_id);
        if (!prospect) continue;
        rows.push({ ...prospect, event_type: ev.event_type, reaction_type: ev.reaction_type, minutes_ago: ev.minutes_ago });
    }
    return rows;
}

export function relativeTime(minutesAgo: number): string {
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    if (minutesAgo < 24 * 60) return `${Math.floor(minutesAgo / 60)}h ago`;
    return `${Math.floor(minutesAgo / (24 * 60))}d ago`;
}

export function initials(name: string): string {
    return name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || '??';
}
