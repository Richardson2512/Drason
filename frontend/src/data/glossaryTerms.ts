/**
 * Glossary of cold-email + deliverability terms for Superkabe.
 *
 * Each term renders as a dedicated `/glossary/[slug]` page with proper
 * schema.org `DefinedTerm` markup, FAQPage when present, and explicit
 * cross-linking to product pages and related terms.
 *
 * Coverage strategy (75 terms across 11 categories):
 *   - Authentication / DNS  : 10
 *   - Bounce + failure      : 6
 *   - Sender reputation     : 8
 *   - Email validation      : 7
 *   - Cold-email infra      : 10
 *   - Sending infrastructure: 7
 *   - Sequencer concepts    : 10
 *   - Threading / Unibox    : 4
 *   - Compliance            : 6
 *   - Blacklists / DNSBLs   : 4
 *   - LinkedIn / multi-chan : 4
 *   - Superkabe product     : 6 (cross-referenced from the above)
 *
 * Editorial rules baked into the structure (all enforced at metadata-
 * build time on /glossary/[slug]/page.tsx):
 *   - shortDefinition must be <=200ch (becomes the `<meta description>`
 *     after the suffix, so practical budget is ~140ch)
 *   - long entries do NOT repeat the shortDefinition verbatim
 *   - relatedTerms slugs MUST resolve to entries in this same file -
 *     the page template's "See also" rendering tolerates a missing
 *     slug but the linkcheck script will flag it
 *   - relatedProducts slugs MUST exist in productPages.ts
 *   - sameAs URLs point to authoritative sources (RFC, Wikipedia,
 *     vendor docs) - do NOT use marketing pages
 */

export type GlossaryCategory =
    | 'authentication'
    | 'deliverability'
    | 'reputation'
    | 'validation'
    | 'infrastructure'
    | 'sending'
    | 'sequencer'
    | 'threading'
    | 'compliance'
    | 'blacklists'
    | 'linkedin'
    | 'product';

export interface GlossaryFaq {
    q: string;
    a: string;
}

export interface GlossaryTerm {
    /** kebab-case URL slug. Matches `/glossary/${slug}`. */
    slug: string;
    /** Display name (Title Case). Used in H1 + meta title. */
    name: string;
    /** Optional abbreviation expansion (e.g. "Sender Policy Framework" for SPF). */
    expansion?: string;
    /** Category bucket - drives index-page grouping. */
    category: GlossaryCategory;
    /** Short definition (1-2 sentences, <=200ch). Used in schema.org
     *  DefinedTerm.description AND meta description. */
    shortDefinition: string;
    /** Long-form body. Each entry = one paragraph rendered as <p>. */
    longDefinition: string[];
    /** Optional "Why it matters" callout for Superkabe context. */
    whyItMatters?: string;
    /** Optional FAQ pairs for the FAQPage JSON-LD + visible accordion. */
    faq?: GlossaryFaq[];
    /** Slug references to other glossary terms. Rendered in See Also. */
    relatedTerms?: string[];
    /** Slugs of related /product/[slug] pages from productPages.ts. */
    relatedProducts?: string[];
    /** Slugs of related /blog/[slug] posts. */
    relatedBlog?: string[];
    /** URL to authoritative source (RFC, Wikipedia, vendor docs). */
    sameAs?: string;
    /** ISO 8601 date for schema.org dateModified. */
    dateModified?: string;
}

const DEFAULT_DATE = '2026-05-21';

export const glossaryTerms: Record<string, GlossaryTerm> = {
    // ─── Authentication / DNS ────────────────────────────────────────
    'spf': {
        slug: 'spf',
        name: 'SPF',
        expansion: 'Sender Policy Framework',
        category: 'authentication',
        shortDefinition: 'DNS TXT record listing which IPs and hosts can send email for a domain. Receivers reject mail from any source not on the list.',
        longDefinition: [
            'SPF (Sender Policy Framework) is a published TXT record on your domain that names every IP address and host authorized to send email for that domain. When a receiving server gets a message, it checks the envelope-from address against your SPF record. If the connecting IP is not on the list, the SPF check fails - and DMARC then decides what to do.',
            'For cold outreach, SPF must include every sending IP your campaigns route through. The most common misconfiguration is omitting a sending-platform IP after migrating from one provider to another - SPF passes for the old provider but silently fails for the new one, dropping inbox placement without an obvious symptom.',
            'SPF records have a 10-lookup limit. Stacking too many `include:` mechanisms (one per sending tool) exceeds it and causes a `permerror`, which receivers treat as a hard failure.',
        ],
        whyItMatters: 'Superkabe checks every domain\'s SPF as part of the infrastructure assessment. Failing SPF is one of the four authentication signals that drop a domain\'s health score.',
        faq: [
            { q: 'Does my SPF need to include every mailbox I send from?', a: 'It needs to include every IP or sending host. If all your mailboxes route through Google Workspace, one `include:_spf.google.com` covers all of them. If you also send via custom SMTP, that sender\'s IP range needs its own entry.' },
            { q: 'What happens if SPF fails?', a: 'Without DMARC, SPF failure is just one signal among many - the message may still be delivered. With DMARC at p=quarantine or p=reject, an SPF failure becomes load-bearing - the receiver acts on the policy.' },
        ],
        relatedTerms: ['dkim', 'dmarc', 'dns', 'txt-record'],
        relatedProducts: ['b2b-sender-reputation-management'],
        relatedBlog: ['spf-dkim-dmarc-explained', 'why-spf-dmarc-failing'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc7208',
        dateModified: DEFAULT_DATE,
    },
    'dkim': {
        slug: 'dkim',
        name: 'DKIM',
        expansion: 'DomainKeys Identified Mail',
        category: 'authentication',
        shortDefinition: 'A cryptographic signature added to outgoing emails proving the message was authorized by the sending domain and not modified in transit.',
        longDefinition: [
            'DKIM (DomainKeys Identified Mail) is a public-key signature applied to outgoing email at send time. The sending server signs the message body and selected headers with a private key; the corresponding public key lives in the sending domain\'s DNS as a TXT record at a specific selector (e.g. `google._domainkey.yourdomain.com`).',
            'When the receiver gets the message, it pulls the public key from DNS and verifies the signature. A valid signature proves two things: the email was authorized by the domain owner, and it has not been tampered with in transit.',
            'DKIM is one of the three authentication signals that compose modern email trust (alongside SPF and DMARC). Missing or invalid DKIM is the single most common reason cold-outreach domains fail DMARC alignment.',
        ],
        whyItMatters: 'Superkabe\'s infrastructure assessment checks DKIM presence + selector validity on every sending domain. A domain with invalid DKIM gets flagged in the dashboard until corrected.',
        faq: [
            { q: 'Do I need DKIM for cold email?', a: 'Yes. Since Gmail and Yahoo\'s 2024 bulk-sender rules, DKIM is required for any sender at scale. Practically, every cold-outreach platform sets it automatically when you connect a mailbox.' },
            { q: 'What does a DKIM selector mean?', a: 'A selector is just a label that lets you publish multiple DKIM keys on the same domain (one per sending tool or rotation generation). The public key lives at `selector._domainkey.yourdomain.com` in DNS.' },
        ],
        relatedTerms: ['spf', 'dmarc', 'dns'],
        relatedProducts: ['b2b-sender-reputation-management'],
        relatedBlog: ['spf-dkim-dmarc-explained', 'free-dkim-lookup-tool'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc6376',
        dateModified: DEFAULT_DATE,
    },
    'dmarc': {
        slug: 'dmarc',
        name: 'DMARC',
        expansion: 'Domain-based Message Authentication, Reporting and Conformance',
        category: 'authentication',
        shortDefinition: 'A DNS policy that tells receiving servers what to do when SPF or DKIM checks fail - none, quarantine, or reject - and where to send authentication reports.',
        longDefinition: [
            'DMARC (Domain-based Message Authentication, Reporting and Conformance) is a published policy that sits on top of SPF and DKIM. It tells receiving mail servers two things: what to do when authentication fails, and where to send aggregate reports about the results.',
            'The policy has three levels. `p=none` (also called monitoring mode) lets failing mail through but generates reports - safe to start here. `p=quarantine` routes failing mail to spam. `p=reject` refuses delivery entirely. Most cold-outreach senders settle at `p=quarantine` once they have validated their sending sources.',
            'Since Gmail and Yahoo\'s February 2024 bulk-sender rules, DMARC is effectively required for any sender doing volume. Without a published DMARC record, your domain is treated as unverified and inbox placement degrades materially.',
        ],
        whyItMatters: 'Superkabe surfaces DMARC policy on every domain in the infrastructure score. A `p=none` policy is acceptable; missing DMARC entirely flags the domain as at-risk.',
        faq: [
            { q: 'Should I start at p=none, p=quarantine, or p=reject?', a: 'Start at p=none for 2-4 weeks to collect aggregate reports and confirm every legitimate sending source is SPF- or DKIM-aligned. Then move to p=quarantine. Only escalate to p=reject if you are confident there are no legitimate sources you might break.' },
            { q: 'Does p=none give me any deliverability benefit?', a: 'Yes - the mere existence of a published DMARC record is a signal to receivers. p=none is much better than no DMARC, even though it does not enforce anything.' },
            { q: 'What is DMARC alignment?', a: 'Alignment means the SPF or DKIM domain (the one that passed authentication) matches the visible From: domain. DMARC requires at least one of the two to be aligned, not just to pass.' },
        ],
        relatedTerms: ['spf', 'dkim', 'bimi', 'dns'],
        relatedProducts: ['b2b-sender-reputation-management', 'email-deliverability-protection'],
        relatedBlog: ['spf-dkim-dmarc-explained', 'why-spf-dmarc-failing', 'email-authentication-checker-tools'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc7489',
        dateModified: DEFAULT_DATE,
    },
    'bimi': {
        slug: 'bimi',
        name: 'BIMI',
        expansion: 'Brand Indicators for Message Identification',
        category: 'authentication',
        shortDefinition: 'A DNS record that lets your verified brand logo appear next to emails in supporting inboxes (Gmail, Apple Mail) - requires DMARC at p=quarantine or stricter.',
        longDefinition: [
            'BIMI (Brand Indicators for Message Identification) is an emerging standard that links a domain\'s authenticated email to a verified logo image. Supporting inbox providers (Gmail, Apple Mail, Yahoo) render the logo as the sender avatar, which materially increases open rates and recipient trust.',
            'Requirements are strict: a published BIMI DNS record pointing to a square SVG logo, DMARC enforcement at p=quarantine or stricter, and (for Gmail) a Verified Mark Certificate (VMC) issued by an authorized CA. The VMC alone costs $1,500-$2,000/year, which is why BIMI adoption is concentrated in enterprise senders.',
            'For cold outreach, BIMI is rarely worth the cost on outreach domains - the volume per domain is too low to amortize the certificate. It does pay off on the primary marketing domain where newsletter volume is high.',
        ],
        relatedTerms: ['dmarc', 'spf', 'dkim'],
        sameAs: 'https://bimigroup.org/',
        dateModified: DEFAULT_DATE,
    },
    'mx-record': {
        slug: 'mx-record',
        name: 'MX Record',
        expansion: 'Mail Exchanger Record',
        category: 'authentication',
        shortDefinition: 'DNS record naming which mail servers accept inbound email for a domain and their priority order. Required for inbound mail delivery.',
        longDefinition: [
            'The MX record is the entry in DNS that names which mail servers accept inbound email for a domain. Each MX entry has a priority value (lower number = higher priority); receiving servers try the highest-priority host first and fall back to lower-priority hosts on failure.',
            'For cold outreach, MX matters in two ways. First, MX presence is a basic deliverability gate - if your sending domain has no MX, mail to that domain will bounce, and many spam filters downgrade senders whose own domain cannot receive. Second, the recipient\'s MX tells you which ESP they use (Google, Microsoft, custom) - the basis of ESP-aware routing.',
        ],
        relatedTerms: ['dns', 'spf', 'esp-bucket'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc5321#section-5.1',
        dateModified: DEFAULT_DATE,
    },
    'ptr-record': {
        slug: 'ptr-record',
        name: 'PTR Record',
        expansion: 'Pointer Record (Reverse DNS)',
        category: 'authentication',
        shortDefinition: 'A reverse-DNS entry that maps an IP address back to a hostname. Receivers reject or quarantine mail from IPs without a valid PTR, especially for direct SMTP.',
        longDefinition: [
            'A PTR record (also called reverse DNS) is the reverse of an A record - it maps an IP address back to a hostname. For email senders, PTR is a basic legitimacy signal: a sending IP without a valid PTR record is almost always rejected by major receivers, since spam botnets historically lacked them.',
            'PTR matters most for senders running their own SMTP infrastructure (dedicated IPs, AWS SES with custom domains). For OAuth-connected mailboxes (Gmail/Microsoft 365), the provider handles PTR for you - you do not need to configure it. Dedicated IP customers must publish a PTR pointing to a hostname that itself resolves back to the IP (forward-confirmed reverse DNS).',
        ],
        relatedTerms: ['dns', 'dedicated-ip', 'mx-record'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc1912#section-2.1',
        dateModified: DEFAULT_DATE,
    },
    'dns': {
        slug: 'dns',
        name: 'DNS',
        expansion: 'Domain Name System',
        category: 'authentication',
        shortDefinition: 'The internet\'s naming system. Every email authentication signal (SPF, DKIM, DMARC, BIMI, MX, PTR) lives in DNS as a published record on your domain.',
        longDefinition: [
            'DNS (Domain Name System) is the distributed database that resolves domain names to IP addresses and to other published records. For email, DNS is where every authentication signal lives: SPF as a TXT record, DKIM as a TXT record at a selector, DMARC as a TXT record at the `_dmarc` subdomain, MX as a record naming inbound mail servers, BIMI as a TXT record for brand-logo display.',
            'DNS propagation usually completes in under an hour but can take up to 24-48 hours depending on TTL values. Common cold-outreach mistake: launching campaigns immediately after a DNS change without waiting for propagation, then debugging "why is my SPF failing" when the receivers are reading the old record.',
        ],
        relatedTerms: ['spf', 'dkim', 'dmarc', 'mx-record', 'txt-record'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc1035',
        dateModified: DEFAULT_DATE,
    },
    'txt-record': {
        slug: 'txt-record',
        name: 'TXT Record',
        category: 'authentication',
        shortDefinition: 'A DNS record type holding arbitrary text. SPF, DKIM, DMARC, BIMI, and domain-verification tokens all use TXT records as their transport.',
        longDefinition: [
            'A TXT record is a DNS record type that holds arbitrary text. Email authentication leverages TXT records for nearly every signal: SPF policies, DKIM public keys, DMARC policies, BIMI links, and domain-ownership verification tokens (used by Google, Microsoft, HubSpot, and most major SaaS platforms).',
            'A single domain can have multiple TXT records at the same name; receivers concatenate them in publication order. This is occasionally weaponized for accidental misconfiguration - publishing two SPF TXT records on the same domain produces a `permerror` and all SPF authentication fails.',
        ],
        relatedTerms: ['dns', 'spf', 'dkim', 'dmarc'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.14',
        dateModified: DEFAULT_DATE,
    },
    'arc': {
        slug: 'arc',
        name: 'ARC',
        expansion: 'Authenticated Received Chain',
        category: 'authentication',
        shortDefinition: 'Header chain that lets mail relays (mailing lists, forwarders) preserve original SPF/DKIM authentication results when they would otherwise break.',
        longDefinition: [
            'ARC (Authenticated Received Chain) addresses a structural gap in SPF and DKIM: when mail passes through an intermediate relay (a mailing list, a forwarding service, a corporate gateway), the SPF check fails because the connecting IP is now the relay\'s, not the original sender\'s. DKIM may also fail if the relay modifies the message body.',
            'ARC adds a header chain that lets each hop attest "the authentication checks passed when I got the message, and here is the proof signed with my key." Receivers can then trust the chain even when end-to-end SPF/DKIM would fail. Mostly relevant for B2B senders whose recipients use corporate mail gateways - rarely needed for direct cold outreach.',
        ],
        relatedTerms: ['spf', 'dkim', 'dmarc'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc8617',
        dateModified: DEFAULT_DATE,
    },
    'dnssec': {
        slug: 'dnssec',
        name: 'DNSSEC',
        expansion: 'DNS Security Extensions',
        category: 'authentication',
        shortDefinition: 'Cryptographic DNS extension that signs records so receivers verify they were not forged. Rarely required for email but improves domain trust.',
        longDefinition: [
            'DNSSEC (Domain Name System Security Extensions) signs DNS records cryptographically, letting receivers verify the records they look up have not been forged in transit (cache poisoning, on-path attacks). For email, DNSSEC is not a deliverability gate but a defense-in-depth signal: a senders with DNSSEC-signed domains is harder to spoof at the DNS layer.',
            'Most cold-outreach domains do not enable DNSSEC because the operational complexity (key rotation, automated signing) is higher than the deliverability return. Worth enabling on long-running primary domains; rarely worth enabling on rotation outreach domains with short lifespans.',
        ],
        relatedTerms: ['dns'],
        sameAs: 'https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions',
        dateModified: DEFAULT_DATE,
    },

    // ─── Bounce + failure types ─────────────────────────────────────
    'hard-bounce': {
        slug: 'hard-bounce',
        name: 'Hard Bounce',
        category: 'deliverability',
        shortDefinition: 'Permanent delivery failure - the recipient address does not exist or the domain is invalid. Never retry; suppress the address immediately.',
        longDefinition: [
            'A hard bounce is a permanent SMTP failure (5xx response code) indicating the destination address does not exist, the domain is invalid, or the receiving server has permanently rejected delivery. Common causes: typos in lead lists, employees who have left a company, domain takedowns, role addresses (info@, sales@) that were never real.',
            'Hard bounces are the single most-damaging signal in cold outreach. Every hard bounce is interpreted by receiving ISPs as "this sender is using bad data" - a few percent of hard bounces is enough to drop sender reputation materially, and a sustained 5-10% rate gets domains blacklisted. Every cold-outreach platform must suppress hard-bounced addresses immediately and never retry them.',
        ],
        whyItMatters: 'Superkabe\'s auto-pause threshold (3% bounce rate after 60 sends) is triggered primarily by hard bounces. The 5-bounce absolute safety net catches mailboxes whose volume is too low for the percentage calculation to fire in time.',
        faq: [
            { q: 'What bounce rate is dangerous?', a: 'Above 2-3% hard bounce rate sustained over a 100-send window triggers ISP filtering. Above 5%, you risk blacklisting. Above 10%, expect immediate inbox-placement collapse.' },
            { q: 'Can I retry a hard bounce?', a: 'No. Retrying makes it worse - the sending pattern looks even more like spam. The address must be added to the suppression list and never sent to again from any mailbox.' },
        ],
        relatedTerms: ['soft-bounce', 'bounce-rate', 'smtp-code', 'dsn'],
        relatedProducts: ['automated-bounce-management', 'bounce-rate-protection-system'],
        relatedBlog: ['bounce-rate-deliverability', 'cold-email-bounce-rate-thresholds'],
        dateModified: DEFAULT_DATE,
    },
    'soft-bounce': {
        slug: 'soft-bounce',
        name: 'Soft Bounce',
        category: 'deliverability',
        shortDefinition: 'A temporary delivery failure - the mailbox is full, the server is briefly unreachable, or the message exceeds the receiver\'s size limit. Soft bounces are typically retried.',
        longDefinition: [
            'A soft bounce is a temporary SMTP failure (4xx response code) - the receiving server signals "try again later." Common causes: full mailboxes (over quota), server briefly unreachable, message size over the recipient\'s limit, greylisting (delay-based spam filter), or rate-limiting against your sending IP.',
            'Soft bounces are not as damaging as hard bounces but still count against reputation if they accumulate. Most sending platforms retry soft bounces 2-5 times with exponential backoff; persistent soft bounces eventually get downgraded to suppression.',
        ],
        relatedTerms: ['hard-bounce', 'bounce-rate', 'smtp-code', 'greylisting'],
        relatedProducts: ['automated-bounce-management'],
        relatedBlog: ['bounce-rate-deliverability'],
        dateModified: DEFAULT_DATE,
    },
    'bounce-rate': {
        slug: 'bounce-rate',
        name: 'Bounce Rate',
        category: 'deliverability',
        shortDefinition: 'Bounced emails divided by total sent, as a percentage. The most-watched health metric in cold outreach - sustained >3% triggers ISP filtering.',
        longDefinition: [
            'Bounce rate is the percentage of sent emails that failed to deliver. Industry-standard formula: hard bounces / total sent over a rolling window (typically the last 100 sends, or the last 24 hours for high-volume senders).',
            'The ISP-defined safe thresholds are tight: 2% sustained bounce rate is the warning zone, 3% is the auto-pause trigger most platforms enforce, 5%+ is blacklist territory. Above 10%, expect immediate inbox-placement collapse across major providers within hours.',
            'In Superkabe, bounce rate is calculated per mailbox over a 100-send rolling window, with a 60-send minimum before the threshold engages (so a low-volume mailbox with one early bounce is not unfairly paused) and a 5-bounce absolute safety net for high-volume scenarios where percentages move slowly.',
        ],
        whyItMatters: 'Auto-pause at 3% bounce rate is the load-bearing safety mechanism of the Super Protect layer. Most platforms expose bounce rate as a chart; Superkabe enforces it as an action.',
        faq: [
            { q: 'What bounce rate is acceptable for cold email?', a: 'Below 2% is healthy. 2-3% is the warning zone where most platforms send alerts. Above 3% triggers automatic pauses on platforms with active protection. Above 5% is dangerous territory; above 10% means immediate intervention.' },
            { q: 'How is bounce rate calculated on a rolling window?', a: 'Most platforms compute it over the last N sends per mailbox (typically 100). The rolling window captures recent behavior - a mailbox that bounced heavily 6 months ago but cleanly since then is treated by current behavior, not all-time history.' },
            { q: 'Why is there a minimum send count before threshold enforcement?', a: 'Without a minimum, the first 1-2 bounces in early sends would generate a 50-100% bounce rate. Superkabe requires 60+ sends before the 3% threshold engages, which prevents false-positive auto-pauses on freshly-warmed mailboxes.' },
        ],
        relatedTerms: ['hard-bounce', 'soft-bounce', 'sender-reputation', 'esp-bucket'],
        relatedProducts: ['bounce-rate-protection-system', 'automated-bounce-management'],
        relatedBlog: ['bounce-rate-deliverability', 'cold-email-bounce-rate-thresholds', 'reduce-cold-email-bounce-rate'],
        dateModified: DEFAULT_DATE,
    },
    'dsn': {
        slug: 'dsn',
        name: 'DSN',
        expansion: 'Delivery Status Notification',
        category: 'deliverability',
        shortDefinition: 'Asynchronous bounce message sent from a receiving server when delivery fails after SMTP accept. The RFC alternative to inline SMTP rejection.',
        longDefinition: [
            'A Delivery Status Notification (DSN) is an asynchronous bounce: the receiving server accepts the message at SMTP time (returning 250 OK), then later determines it cannot deliver and sends a bounce back to the original envelope-from address as a separate email. The DSN carries structured headers explaining the failure.',
            'For cold-outreach platforms, DSNs are harder to process than synchronous SMTP rejections. The platform needs an inbound parser on the envelope-from address (often a return-path mailbox) that reads the DSN, extracts the failure reason and the original recipient, and writes a BounceEvent row. Superkabe runs this parser as part of the bounce ingestion pipeline.',
        ],
        relatedTerms: ['hard-bounce', 'soft-bounce', 'smtp-code'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc3464',
        dateModified: DEFAULT_DATE,
    },
    'smtp-code': {
        slug: 'smtp-code',
        name: 'SMTP Code',
        category: 'deliverability',
        shortDefinition: '3-digit response code from a receiving mail server: 2xx success, 4xx temporary failure, 5xx permanent failure. 5xx codes drive hard-bounce class.',
        longDefinition: [
            'SMTP response codes are the 3-digit numbers receiving mail servers return on every connection. The first digit determines the class: 2xx = success (message accepted), 4xx = temporary failure (retry later - soft bounce), 5xx = permanent failure (do not retry - hard bounce).',
            'Common codes in cold outreach: 421 (server busy - retry), 450/451 (try again later), 550 (mailbox does not exist - the classic hard bounce), 552/553 (message rejected for content or recipient policy), 554 (transaction failed - generic permanent rejection). The enhanced status codes (5.1.1, 5.7.1, etc.) provide more granularity.',
        ],
        relatedTerms: ['hard-bounce', 'soft-bounce', 'dsn'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc5321#section-4.2',
        dateModified: DEFAULT_DATE,
    },
    'greylisting': {
        slug: 'greylisting',
        name: 'Greylisting',
        category: 'deliverability',
        shortDefinition: 'Anti-spam technique where a receiving server temporarily rejects new senders (4xx), expecting legitimate ones to retry. Spam botnets often do not.',
        longDefinition: [
            'Greylisting is a server-side anti-spam technique: when a sender connects for the first time, the receiver returns a temporary failure code (typically 451 4.7.1) and remembers the (IP, sender, recipient) tuple. Legitimate mail servers retry within minutes; spam botnets often do not. After the retry succeeds, the receiver allows future mail from that combination through without delay.',
            'For cold outreach, greylisting causes the first message from a new sending IP to bounce as a soft bounce, then succeed on retry. Most modern sending platforms handle this transparently. The risk is that greylisting can be mistaken for a real soft-bounce trend if a platform aggregates 4xx responses without distinguishing the retry-success pattern.',
        ],
        relatedTerms: ['soft-bounce', 'smtp-code', 'spam-trap'],
        sameAs: 'https://en.wikipedia.org/wiki/Greylisting_(email)',
        dateModified: DEFAULT_DATE,
    },

    // ─── Sender reputation ───────────────────────────────────────────
    'sender-reputation': {
        slug: 'sender-reputation',
        name: 'Sender Reputation',
        category: 'reputation',
        shortDefinition: 'An ISP-assigned score reflecting a domain or IP\'s historical sending behavior - bounce rate, complaint rate, engagement, authentication. Determines inbox placement.',
        longDefinition: [
            'Sender reputation is the invisible score every major ISP (Google, Microsoft, Yahoo) assigns to a sending domain and IP based on historical behavior: bounce rates, spam complaints, engagement metrics (opens, replies, deletions, marked-as-spam), authentication results, and sending-volume patterns.',
            'A good reputation lands you in the inbox. A poor reputation lands you in spam or gets you blackholed. Reputation is updated continuously - one bad list segment can drop reputation in hours and take 30-45 days of careful low-volume sending to rebuild.',
            'Reputation is the foundation of cold-email economics. A burned domain is functionally dead for weeks; replacement requires fresh DNS, fresh warmup, and fresh inbox-placement signals. Most cold-outreach failure modes trace back to reputation collapse.',
        ],
        whyItMatters: 'Super Protect is built around defending reputation - auto-pause, healing, ESP-aware routing all exist to keep sender reputation healthy before damage compounds.',
        faq: [
            { q: 'How long does it take to rebuild damaged sender reputation?', a: '30-45 days of low-volume, high-engagement sending typically rebuilds reputation from a moderate dip. From a serious crash (sustained 10%+ bounce or blacklist listing) it can take 60-90 days or never fully recover. Replacing the domain is often faster than rehabilitation.' },
            { q: 'What is the difference between domain and IP reputation?', a: 'Domain reputation is tied to the visible From: domain and follows you anywhere you send. IP reputation is tied to the connecting server and only matters if you control the IP (dedicated IP setups). For shared-pool senders, IP reputation is managed by the platform; domain reputation is yours alone.' },
        ],
        relatedTerms: ['domain-reputation', 'ip-reputation', 'bounce-rate', 'inbox-placement'],
        relatedProducts: ['b2b-sender-reputation-management', 'email-deliverability-protection'],
        relatedBlog: ['email-reputation-lifecycle', 'how-to-check-domain-reputation-cold-email'],
        dateModified: DEFAULT_DATE,
    },
    'domain-reputation': {
        slug: 'domain-reputation',
        name: 'Domain Reputation',
        category: 'reputation',
        shortDefinition: 'The sender-reputation score attached to the visible From: domain. Travels with the domain across any IP it sends from - the bigger lever in cold outreach.',
        longDefinition: [
            'Domain reputation is the portion of sender reputation that is tied to the visible From: domain rather than the connecting IP. Because cold outreach typically rotates IPs (shared sending pools) but keeps a stable From: domain, domain reputation is the larger and more consequential lever.',
            'A domain accumulates reputation across every send from every IP it ever uses. Once damaged, the domain carries the damage everywhere - switching sending platforms does not reset it.',
        ],
        relatedTerms: ['sender-reputation', 'ip-reputation', 'inbox-placement'],
        relatedBlog: ['domain-reputation-vs-ip-reputation', 'how-to-check-domain-reputation-cold-email'],
        dateModified: DEFAULT_DATE,
    },
    'ip-reputation': {
        slug: 'ip-reputation',
        name: 'IP Reputation',
        category: 'reputation',
        shortDefinition: 'The sender-reputation portion tied to the connecting IP address rather than the From: domain. Important for dedicated-IP senders; less so for shared pools.',
        longDefinition: [
            'IP reputation is the portion of sender reputation that follows the connecting IP address. On a shared sending pool (most cold-outreach platforms), IP reputation is managed by the platform and shared across all tenants of that pool. On a dedicated IP, IP reputation belongs only to the workspace that owns the IP.',
            'For cold outreach, IP reputation matters less than domain reputation because most outreach platforms rotate IPs. The exception is dedicated-IP setups (AWS SES, ESP-managed dedicated IPs), where the IP is your reputation surface and you control it directly.',
        ],
        relatedTerms: ['sender-reputation', 'domain-reputation', 'dedicated-ip', 'shared-ip-pool'],
        relatedProducts: ['dedicated-ip'],
        relatedBlog: ['domain-reputation-vs-ip-reputation', 'dedicated-ip-cold-email'],
        dateModified: DEFAULT_DATE,
    },
    'google-postmaster-tools': {
        slug: 'google-postmaster-tools',
        name: 'Google Postmaster Tools',
        category: 'reputation',
        shortDefinition: 'Google\'s free dashboard showing your domain reputation, IP reputation, spam complaint rate, and authentication status for mail you send to Gmail recipients.',
        longDefinition: [
            'Google Postmaster Tools is the free dashboard Google publishes for senders to monitor how Gmail treats their outbound mail. It surfaces domain reputation (Bad / Low / Medium / High), IP reputation, spam complaint rate, authentication pass-rates (SPF, DKIM, DMARC), and feedback-loop signals.',
            'For any cold-outreach team sending to Gmail recipients (which is most of them), Postmaster Tools is the single highest-signal external dashboard. Domain reputation flipping from High to Medium is the canary in the coal mine - it usually precedes inbox-placement degradation by 24-72 hours, giving operators a chance to pause campaigns and investigate before the damage compounds.',
            'Setup requires publishing a TXT record proving domain ownership at `_dmarc.yourdomain.com` (which you would publish for DMARC anyway). After 1-2 days of accumulating volume, data starts populating.',
        ],
        relatedTerms: ['sender-reputation', 'domain-reputation', 'inbox-placement', 'feedback-loop'],
        sameAs: 'https://postmaster.google.com',
        dateModified: DEFAULT_DATE,
    },
    'microsoft-snds': {
        slug: 'microsoft-snds',
        name: 'Microsoft SNDS',
        expansion: 'Smart Network Data Services',
        category: 'reputation',
        shortDefinition: 'Microsoft\'s sender intelligence dashboard for IP reputation across Hotmail, Outlook.com, and Microsoft 365. Free; requires per-IP enrollment.',
        longDefinition: [
            'Microsoft Smart Network Data Services (SNDS) is the Outlook/Hotmail equivalent of Google Postmaster Tools - a free dashboard showing per-IP reputation signals (filter result, spam complaint rate, trap hits) for mail you send to Microsoft-hosted recipients.',
            'SNDS is IP-scoped rather than domain-scoped, which makes it most valuable for dedicated-IP senders. For shared-pool senders, the data shown is aggregated across all tenants of that IP - useful for the pool operator, less directly useful for the individual workspace.',
            'Enrollment requires proving control of each IP via a verification email sent to a postmaster@ or abuse@ address on a domain that reverse-resolves to the IP.',
        ],
        relatedTerms: ['ip-reputation', 'sender-reputation', 'inbox-placement', 'dedicated-ip'],
        sameAs: 'https://sendersupport.olc.protection.outlook.com/snds/',
        dateModified: DEFAULT_DATE,
    },
    'sender-score': {
        slug: 'sender-score',
        name: 'Sender Score',
        category: 'reputation',
        shortDefinition: '0-100 reputation score from Validity (formerly Return Path), based on sending behavior across their network. Free to look up; major ISPs do not use it.',
        longDefinition: [
            'Sender Score is a third-party reputation score (0-100) produced by Validity (formerly Return Path) from behavioral data they collect across an opt-in network of receivers. Higher is better; below 70 typically signals delivery problems.',
            'Sender Score is informational - none of the major ISPs (Google, Microsoft, Yahoo) consume it directly. It is useful as a third-party sanity check and as a public-facing way to verify a sender domain is in healthy territory, but should not be treated as authoritative. Real authority lives in Google Postmaster Tools and Microsoft SNDS.',
        ],
        relatedTerms: ['sender-reputation', 'google-postmaster-tools', 'microsoft-snds'],
        sameAs: 'https://senderscore.org/',
        dateModified: DEFAULT_DATE,
    },
    'inbox-placement': {
        slug: 'inbox-placement',
        name: 'Inbox Placement',
        category: 'reputation',
        shortDefinition: 'The percentage of sent emails that land in the recipient\'s primary inbox (vs spam folder, Promotions tab, or other categories). The output metric reputation drives.',
        longDefinition: [
            'Inbox placement is the percentage of your sent emails that land in the recipient\'s primary inbox - not the spam folder, not the Promotions tab, not the Updates folder. It is the output metric every other deliverability signal exists to influence.',
            'Inbox placement cannot be measured directly without recipient cooperation (recipients see their own inbox; senders do not). The industry workarounds are seed-list testing (sending to known accounts and checking where the message lands) and engagement-based inference (high open velocity from a recipient cohort implies inbox placement; low open velocity implies spam-folder placement). Most cold-outreach platforms infer placement; high-end ESPs run seed lists.',
        ],
        relatedTerms: ['sender-reputation', 'spam-folder', 'engagement-signals'],
        relatedBlog: ['cold-email-deliverability-troubleshooting'],
        dateModified: DEFAULT_DATE,
    },
    'spam-folder': {
        slug: 'spam-folder',
        name: 'Spam Folder',
        category: 'reputation',
        shortDefinition: 'Where receivers route mail flagged as unwanted. Once spam-foldered, recovery requires both reputation rebuild and explicit recipient action.',
        longDefinition: [
            'The spam folder (also called Junk or Bulk) is where receiving mail clients route messages they believe are unwanted. Filtering happens at the server side (based on sender reputation, content, authentication) before the message reaches the client; some clients also apply additional client-side filters.',
            'Once a sender is consistently spam-foldered, recovery is hard. Even if the underlying reputation issue is fixed, recipients no longer see the messages, so engagement signals (opens, clicks, replies) drop to zero, which reinforces the spam classification. The only effective recovery is asking recipients to mark messages as Not Spam, which is a multi-touch ask.',
        ],
        relatedTerms: ['inbox-placement', 'sender-reputation', 'feedback-loop'],
        relatedBlog: ['why-cold-emails-go-to-spam'],
        dateModified: DEFAULT_DATE,
    },

    // ─── Email validation ────────────────────────────────────────────
    'email-validation': {
        slug: 'email-validation',
        name: 'Email Validation',
        category: 'validation',
        shortDefinition: 'Checking whether an email is syntactically valid, has a deliverable mailbox, and is safe to send to (not catch-all, disposable, or spam trap).',
        longDefinition: [
            'Email validation is a multi-stage check applied to a lead before it enters a sending campaign. The internal stages: syntax (RFC 5322 conformance), MX presence (does the domain accept mail at all), disposable-domain check (is this a temporary-mailbox provider like Mailinator), catch-all detection (does the domain accept all addresses), role-based check (is it a function address like sales@ or info@).',
            'Leads that pass internal checks but are flagged as risky (catch-all, role-based, or new) get a paid second-stage verification through providers like MillionVerifier, NeverBounce, or ZeroBounce. The combined verdict feeds the Health Gate as GREEN (safe), YELLOW (caution), or RED (block).',
        ],
        whyItMatters: 'Superkabe runs hybrid validation: internal checks on every lead at import time, plus conditional MillionVerifier probing on risky leads. This pre-send filter is the single most effective bounce-rate prevention mechanism.',
        faq: [
            { q: 'What is the difference between email validation and email verification?', a: 'They are often used interchangeably. Some platforms distinguish: validation = syntax + MX + format checks (cheap); verification = SMTP probe of the actual mailbox (expensive). Most modern platforms combine both into one hybrid pipeline.' },
            { q: 'Can validation guarantee zero bounces?', a: 'No. Validation reduces bounces dramatically (typically 80-95% reduction) but cannot eliminate them. Catch-all domains pass validation but may bounce on the actual mailbox. Addresses can become invalid between validation and send time (employees leave, domains expire). Validation + real-time monitoring is the complete answer.' },
        ],
        relatedTerms: ['catch-all-domain', 'disposable-email', 'role-based-email', 'risky-lead', 'spam-trap'],
        relatedProducts: ['email-validation-infrastructure-protection', 'multi-platform-email-validation'],
        relatedBlog: ['email-validation-vs-verification', 'best-email-validation-tools-cold-outreach', 'email-validation-pricing-guide'],
        dateModified: DEFAULT_DATE,
    },
    'email-verification': {
        slug: 'email-verification',
        name: 'Email Verification',
        category: 'validation',
        shortDefinition: 'An SMTP-level probe that connects to the recipient\'s mail server to confirm the mailbox actually exists. The expensive cousin of email validation.',
        longDefinition: [
            'Email verification is the SMTP-probe stage of the validation pipeline: a real connection to the recipient\'s mail server that issues `MAIL FROM` and `RCPT TO` commands without actually sending a message, then reads the server\'s response to determine if the mailbox exists.',
            'Verification is more accurate than syntax + MX checks but costs more (per-lead pricing from MillionVerifier, ZeroBounce, etc.) and can be defeated by catch-all domains (which accept all RCPT TO probes by definition). Most validation pipelines apply verification only to leads that internal checks flag as risky.',
        ],
        relatedTerms: ['email-validation', 'catch-all-domain', 'risky-lead'],
        relatedBlog: ['email-validation-vs-verification'],
        dateModified: DEFAULT_DATE,
    },
    'catch-all-domain': {
        slug: 'catch-all-domain',
        name: 'Catch-all Domain',
        category: 'validation',
        shortDefinition: 'Domain configured to accept email at any address, real or not. SMTP verification is unreliable - the server says yes even to nonexistent addresses.',
        longDefinition: [
            'A catch-all domain is configured (intentionally or via misconfiguration) to accept inbound mail at any address. From a verification perspective, the receiver\'s server returns 250 OK to RCPT TO probes for every address - including ones that do not exist. The result is that catch-all domains pass verification but may still bounce when the real message arrives because the receiving server delivers to a black hole or generates an asynchronous DSN later.',
            'Cold-outreach platforms typically handle catch-all leads in one of three ways: (1) skip them entirely (safest, lowest yield), (2) send only to mailboxes with high-confidence ESP performance for catch-all, (3) probe with a small batch and watch the bounce rate before committing the rest. Superkabe\'s validation classifies catch-all leads as YELLOW and routes them only to mailboxes with strong recent bounce-rate history.',
        ],
        faq: [
            { q: 'What percentage of B2B leads are catch-all?', a: 'It varies wildly by industry and lead source. In our 2026 benchmarks, agency-purchased lists average 15-25% catch-all; carefully-built Apollo/Clay lists average 5-12%. Treat any list above 20% as high-risk regardless of validation pass rate.' },
            { q: 'Can I detect catch-all without sending?', a: 'Yes, with high accuracy. The standard technique probes the domain with a known-fake address (e.g. `randomstring1234@domain.com`); if the server returns 250 OK, the domain is catch-all. Most validation providers do this automatically.' },
        ],
        relatedTerms: ['email-validation', 'email-verification', 'risky-lead'],
        relatedBlog: ['catch-all-domains-cold-outreach', 'catch-all-detection-zerobounce-vs-neverbounce'],
        dateModified: DEFAULT_DATE,
    },
    'disposable-email': {
        slug: 'disposable-email',
        name: 'Disposable Email',
        category: 'validation',
        shortDefinition: 'Temporary mailbox from providers like Mailinator or Guerrilla Mail. Low-quality - the recipient explicitly does not want a stable identity.',
        longDefinition: [
            'A disposable email is an address from a temporary-mailbox service (Mailinator, Guerrilla Mail, 10MinuteMail, Temp-Mail, hundreds more). Recipients use them to sign up for things without committing their real identity. From a cold-outreach perspective, disposable addresses have zero value - the recipient never engages, and they typically expire within hours of the address being created.',
            'Detection is straightforward: maintain a list of disposable-domain providers and check the lead\'s domain against it. Superkabe ships with a denylist of several hundred disposable providers, updated quarterly.',
        ],
        relatedTerms: ['email-validation', 'role-based-email'],
        dateModified: DEFAULT_DATE,
    },
    'role-based-email': {
        slug: 'role-based-email',
        name: 'Role-Based Email',
        category: 'validation',
        shortDefinition: 'Address mapping to a function rather than a person - info@, sales@, support@. Often unmonitored or routed to many recipients. Lower-quality for outreach.',
        longDefinition: [
            'A role-based email maps to a function (info@, sales@, support@, admin@, hr@, contact@) rather than an individual person. These addresses often forward to multiple recipients, are often unmonitored, and rarely produce useful engagement from cold outreach.',
            'Role-based addresses are also overrepresented in spam-trap lists - some anti-spam operators use role addresses as honey pots. Most cold-outreach platforms downweight or skip role-based leads by default; Superkabe classifies them as YELLOW (sent to only when no individual address is available).',
        ],
        relatedTerms: ['email-validation', 'spam-trap', 'risky-lead'],
        dateModified: DEFAULT_DATE,
    },
    'spam-trap': {
        slug: 'spam-trap',
        name: 'Spam Trap',
        category: 'validation',
        shortDefinition: 'Address operated by ISPs or anti-spam groups to identify senders using purchased or scraped lists. Hitting one triggers immediate blacklisting.',
        longDefinition: [
            'A spam trap is an email address that has no legitimate user. Anti-spam operators (Spamhaus, Project Honey Pot, ISPs themselves) seed them across the internet - on abandoned domains, scraped from web forms that nobody actually filled out, sold to list brokers as bait. Any send to a spam trap is by definition unsolicited, and getting caught is the fastest path to blacklisting.',
            'Two flavors: pristine traps (addresses created by anti-spam operators specifically as traps - any send is malicious by construction) and recycled traps (previously-real addresses that have been abandoned long enough that the previous owner is definitively gone - any send means the sender did not clean their list).',
            'Validation cannot perfectly detect spam traps - pristine ones look like normal addresses. The practical defense is list hygiene: never buy lists, run validation on every lead, monitor bounce + complaint trends, and remove non-engaging addresses aggressively.',
        ],
        relatedTerms: ['email-validation', 'sender-reputation', 'feedback-loop'],
        relatedBlog: ['catch-all-domains-cold-outreach'],
        dateModified: DEFAULT_DATE,
    },
    'risky-lead': {
        slug: 'risky-lead',
        name: 'Risky Lead',
        category: 'validation',
        shortDefinition: 'A lead the validation pipeline cannot definitively classify as safe or invalid. Typically catch-all, role-based, or thin-history domains.',
        longDefinition: [
            'A risky lead is one the validation pipeline cannot confidently classify as safe (will deliver, will not bounce) or invalid (will bounce, should be blocked). The risky bucket typically includes catch-all addresses, role-based addresses, domains with thin reputation history, and addresses with formatting anomalies that pass syntax but look suspicious.',
            'Superkabe applies the YELLOW lead-health classification to risky leads, which limits them to step 2 (rather than the full sequence) and routes them only to mailboxes with strong recent bounce-rate history. The differential treatment caps the bounce-rate exposure of any single risky lead without blocking them entirely.',
        ],
        relatedTerms: ['email-validation', 'catch-all-domain', 'role-based-email', 'esp-bucket'],
        relatedProducts: ['lead-control-plane'],
        dateModified: DEFAULT_DATE,
    },
    'esp-bucket': {
        slug: 'esp-bucket',
        name: 'ESP Bucket',
        category: 'validation',
        shortDefinition: 'A lead\'s recipient email-service-provider category, inferred from the MX record - typically Gmail, Microsoft, Yahoo, or Other. Drives ESP-aware mailbox routing.',
        longDefinition: [
            'The ESP (Email Service Provider) bucket is the recipient\'s email-service category, inferred from the domain\'s MX record. Typical buckets: Gmail (including Google Workspace), Microsoft (Outlook.com, Office 365, Hotmail), Yahoo (including AOL), Other (everything else - corporate gateways, self-hosted, smaller providers).',
            'The ESP bucket matters because different ESPs have different spam-filter behaviors. A mailbox that delivers cleanly to Gmail recipients may have a higher bounce rate against Microsoft recipients, or vice versa. ESP-aware routing assigns each lead to the mailbox with the best 30-day performance against that lead\'s ESP - the single largest deliverability lever beyond auto-pause.',
        ],
        relatedTerms: ['mx-record', 'esp-routing', 'sender-reputation'],
        relatedProducts: ['esp-aware-routing', 'esp-aware-routing'],
        dateModified: DEFAULT_DATE,
    },

    // ─── Cold-email infrastructure ──────────────────────────────────
    'cold-email': {
        slug: 'cold-email',
        name: 'Cold Email',
        category: 'infrastructure',
        shortDefinition: 'Outbound email to a recipient who has not previously opted in - typically a B2B sales prospect identified by ICP fit. Different from broadcast marketing email.',
        longDefinition: [
            'Cold email is outbound 1-to-1 personalized email to a recipient who has not previously opted in, sent from your own mailbox (Gmail, Microsoft 365, or custom SMTP). The recipient is typically a B2B sales prospect identified by Ideal Customer Profile (ICP) fit rather than by self-selection.',
            'Cold email is distinct from broadcast marketing email (newsletters, drip campaigns to opted-in lists). The technical model is different - cold email sends from individual mailboxes one-at-a-time with full personalization, whereas broadcast email sends from shared ESP IPs in batches with templated content. The legal model is different too - cold email operates under CAN-SPAM (US) and similar regulations that require accurate sender identification, postal address, and unsubscribe mechanisms.',
        ],
        relatedTerms: ['cold-outreach', 'outbound', 'sequence'],
        relatedBlog: ['cold-email-deliverability-troubleshooting', 'best-cold-email-tools-2026'],
        dateModified: DEFAULT_DATE,
    },
    'cold-outreach': {
        slug: 'cold-outreach',
        name: 'Cold Outreach',
        category: 'infrastructure',
        shortDefinition: 'The broader category of outbound prospecting that includes cold email, cold calling, and LinkedIn outreach. Cold email is one channel inside cold outreach.',
        longDefinition: [
            'Cold outreach is the broader category of outbound prospecting motions: cold email, cold calling, LinkedIn outreach (connection requests and InMails), direct mail. The unifying property is that the recipient has not previously expressed interest - the seller is initiating contact based on ICP fit.',
            'Modern cold outreach is typically multi-channel: a single prospect may receive an email, a LinkedIn connection request, and a follow-up call over the course of a sequence. Superkabe\'s Super LinkedIn + Sequencer pair handles email + LinkedIn cross-channel with shared lead identity so a reply on one channel halts the other automatically.',
        ],
        relatedTerms: ['cold-email', 'outbound', 'linkedin-outreach', 'cross-channel-halt'],
        relatedProducts: ['super-linkedin', 'lead-control-plane'],
        dateModified: DEFAULT_DATE,
    },
    'outbound': {
        slug: 'outbound',
        name: 'Outbound',
        category: 'infrastructure',
        shortDefinition: 'Sales motion where the seller initiates contact based on ICP fit, vs inbound where the prospect raises their hand. Cold email and outreach are outbound.',
        longDefinition: [
            'Outbound is the sales motion where the seller initiates contact with a prospect based on Ideal Customer Profile (ICP) fit, in contrast to inbound where the prospect raises their hand first (filled out a form, requested a demo, downloaded a resource). Outbound is harder to scale because of deliverability and rapport challenges, but it is also the only path to net-new pipeline that does not depend on existing marketing reach.',
            'Modern outbound is multi-channel and AI-assisted: signal-driven prospecting (watch for trigger events like job changes, funding announcements), automated personalization (AI icebreakers from enrichment data), cross-channel sequencing (email + LinkedIn + sometimes phone). The deliverability layer (warmup, validation, auto-pause, healing) is the operational floor that makes any of it possible at scale.',
        ],
        relatedTerms: ['cold-email', 'cold-outreach', 'sequence', 'linkedin-outreach'],
        dateModified: DEFAULT_DATE,
    },
    'warm-up': {
        slug: 'warm-up',
        name: 'Warm-up',
        category: 'infrastructure',
        shortDefinition: 'Gradually increasing sending volume on a new mailbox or domain to build sender reputation. Skipping it is the fastest way to burn a fresh mailbox.',
        longDefinition: [
            'Warm-up is the process of gradually increasing sending volume on a new mailbox, domain, or IP to build sender reputation with ISPs before sending at full production volume. The typical curve: 20-30 sends/day in week 1, 30-50/day in week 2, 50-100/day by week 4, full capacity by week 6-8.',
            'Warm-up sends are typically conversational and high-engagement (mailbox-to-mailbox between participating senders, with replies, opens, and inbox-moves). The pattern signals "this is a real person sending to real people" rather than "this is a freshly-spun-up cold-outreach burner."',
            'Skipping or rushing warm-up is the single fastest way to burn a fresh mailbox. ISPs penalize new senders that jump straight to high volume; the reputation damage from a botched warm-up can take 30+ days to recover and sometimes never fully clears.',
        ],
        whyItMatters: 'Superkabe integrates with Zapmail for warmup. Once warmed, mailboxes graduate to production-volume sending; if reputation degrades mid-life, the healing pipeline returns them through a structured re-warmup curve.',
        faq: [
            { q: 'How long does warm-up take?', a: 'For Gmail and Microsoft 365 mailboxes, 3-4 weeks to reach 50-100/day is standard. For dedicated IPs, 4-8 weeks to reach full capacity. Skipping the curve halves your effective deliverability for the first month and risks burning the mailbox entirely.' },
            { q: 'Do I need warm-up for a Gmail mailbox I have been using personally?', a: 'Less than for a brand-new mailbox - existing engagement history counts. But you still need to ramp gradually because Gmail tracks behavioral changes (sudden volume spikes from a previously-personal account are a red flag).' },
        ],
        relatedTerms: ['domain-warming', 'mailbox-warming', 'sender-reputation', 'healing-pipeline'],
        relatedProducts: ['email-infrastructure-health-check'],
        relatedBlog: ['complete-email-warmup-guide', 'domain-warming-methodology', 'top-email-warmup-tools'],
        dateModified: DEFAULT_DATE,
    },
    'domain-warming': {
        slug: 'domain-warming',
        name: 'Domain Warming',
        category: 'infrastructure',
        shortDefinition: 'Warming a freshly-registered sending domain - distinct from per-mailbox warmup. Domain accumulates reputation across all mailboxes that send from it.',
        longDefinition: [
            'Domain warming is the warm-up process specific to a freshly-registered or freshly-configured sending domain. The domain accumulates reputation across every mailbox that ever sends from it; warming the domain first (typically by sending from 1-2 warmup mailboxes for 2-3 weeks before adding production mailboxes) accelerates the production ramp.',
            'For cold outreach, the typical setup is to register a sending domain (e.g. yourcompany-co.com) separate from the primary marketing domain, configure SPF/DKIM/DMARC, warm it via 1-2 mailboxes, then layer additional mailboxes onto the warmed domain over the following weeks.',
        ],
        relatedTerms: ['warm-up', 'mailbox-warming', 'sending-domain', 'domain-reputation'],
        relatedBlog: ['domain-warming-methodology'],
        dateModified: DEFAULT_DATE,
    },
    'mailbox-warming': {
        slug: 'mailbox-warming',
        name: 'Mailbox Warming',
        category: 'infrastructure',
        shortDefinition: 'The mailbox-specific portion of warm-up. New mailboxes ramp gradually even on already-warm domains, because per-mailbox sending history is a separate signal.',
        longDefinition: [
            'Mailbox warming is the warm-up process for an individual sending mailbox. Even when the domain is already warm, a new mailbox added to that domain has its own send-history score that ISPs track separately. Adding a fresh mailbox at full production volume is a behavioral anomaly that gets the mailbox throttled or filtered.',
            'Standard practice is to add new mailboxes 1-2 at a time and ramp each over 2-3 weeks: 20-30/day week 1, scaling to 50-80/day by week 3. The domain\'s existing warmth shortens the curve relative to starting from a cold domain.',
        ],
        relatedTerms: ['warm-up', 'domain-warming', 'sender-reputation'],
        dateModified: DEFAULT_DATE,
    },
    'burnt-domain': {
        slug: 'burnt-domain',
        name: 'Burnt Domain',
        category: 'infrastructure',
        shortDefinition: 'Domain whose sender reputation has collapsed: high bounce, blacklist listing, or sustained spam-folder placement. Often easier to replace than rehabilitate.',
        longDefinition: [
            'A burnt domain is one whose sender reputation has collapsed to the point where inbox placement is near zero. Causes: a single bad list segment with 10%+ bounce rate, hitting a spam trap, sustained spam complaints, or simply running at high volume without warm-up.',
            'Rehabilitation is hard. Even with the underlying cause fixed, ISPs apply algorithmic dampening for weeks to months. Most cold-outreach teams treat a burnt domain as a write-off, retire it, and replace it with a fresh one - the cost of a new domain ($10) plus 4-6 weeks of warmup is typically lower than the labor of rehabilitating a burnt one.',
        ],
        relatedTerms: ['sender-reputation', 'healing-pipeline', 'domain-reputation', 'blacklist-removal'],
        relatedBlog: ['domain-burned-recovery-prevention', 'how-to-know-if-domain-is-burned'],
        dateModified: DEFAULT_DATE,
    },
    'auto-pause': {
        slug: 'auto-pause',
        name: 'Auto-Pause',
        category: 'infrastructure',
        shortDefinition: 'Automated mailbox or domain pause when bounce or complaint signals cross safety thresholds. Stops the burn before reputation damage compounds.',
        longDefinition: [
            'Auto-pause is the protection-layer action of automatically pausing a mailbox or domain when sending signals cross safety thresholds. Superkabe\'s primary trigger is 3% bounce rate over a rolling 100-send window after a 60-send minimum, with a 5-bounce absolute safety net for low-volume mailboxes.',
            'Auto-pause distinguishes active protection from passive monitoring. Most platforms render a bounce-rate chart and notify the operator. Superkabe pauses the mailbox automatically and routes it into the healing pipeline.',
        ],
        whyItMatters: 'Auto-pause is the load-bearing safety mechanism of Super Protect. The 3% threshold is calibrated to act before a domain burns - paused mailboxes return through the structured healing pipeline rather than operator-applied recovery.',
        relatedTerms: ['bounce-rate', 'healing-pipeline', 'cooldown', 'sender-reputation'],
        relatedProducts: ['bounce-rate-protection-system', 'automated-bounce-management'],
        dateModified: DEFAULT_DATE,
    },
    'engagement-signals': {
        slug: 'engagement-signals',
        name: 'Engagement Signals',
        category: 'reputation',
        shortDefinition: 'Recipient actions ISPs use to infer inbox placement: open rate, reply rate, mark-as-not-spam, time-spent-reading. Low engagement implies spam-folder placement.',
        longDefinition: [
            'Engagement signals are the recipient-side actions ISPs use to infer whether a sender belongs in the inbox or the spam folder. Major signals: open rate (did the recipient open), reply rate, mark-as-not-spam clicks, time-spent-reading, dwell-then-archive vs immediate-delete patterns.',
            'For cold outreach, engagement signals are the inferred-inbox-placement metric. Senders cannot see recipient inboxes directly. High open and reply rates from a cohort imply the messages landed in the inbox; low engagement implies spam-folder placement. ISP reputation scoring incorporates engagement as a primary feedback loop.',
        ],
        relatedTerms: ['inbox-placement', 'sender-reputation', 'spam-folder', 'feedback-loop'],
        dateModified: DEFAULT_DATE,
    },
    'cooldown': {
        slug: 'cooldown',
        name: 'Cooldown',
        category: 'infrastructure',
        shortDefinition: 'Time-bound pause after a threshold breach. Minimum gap before healing progression begins (typically 1 hour, exponentially escalating to 16+).',
        longDefinition: [
            'A cooldown is a time-bound minimum pause applied to a mailbox after a threshold breach. It is the first stage of the healing pipeline - the mailbox must stay paused for at least the cooldown duration before any recovery progression begins, regardless of how clean its DNS or downstream signals look.',
            'Superkabe\'s cooldown is exponential: 1 hour minimum, doubling on each repeated offense, capped at 16 hours. The exponential schedule prevents rapid-fire pause-resume cycles where a chronically-borderline mailbox could be re-trigger pauses every few minutes.',
        ],
        relatedTerms: ['healing-pipeline', 'quarantine', 'auto-pause'],
        relatedProducts: ['automated-domain-healing'],
        dateModified: DEFAULT_DATE,
    },
    'healing-pipeline': {
        slug: 'healing-pipeline',
        name: 'Healing Pipeline',
        expansion: '5-Phase Mailbox Recovery',
        category: 'infrastructure',
        shortDefinition: 'Superkabe\'s 5-phase recovery pipeline that returns paused mailboxes to active status: Pause to Quarantine to Restricted Send to Warm Recovery to Healthy.',
        longDefinition: [
            'The healing pipeline is Superkabe\'s structured, automated recovery process for paused mailboxes. After auto-pause triggers, the mailbox does not return to full sending until it has progressed through five phases, each with explicit gates:',
            'Pause (cooldown timer must elapse) -> Quarantine (DNS health re-validated, blacklists rechecked) -> Restricted Send (capped at warmup_limit, clean-send minimum required) -> Warm Recovery (bounce + complaint floor verified) -> Healthy (full daily_send_limit restored). Each transition is gated by quantitative criteria; nothing advances on a timer alone.',
            'The pipeline is what differentiates active protection from passive monitoring. Most platforms surface bounce-rate charts; Superkabe enforces the gates that turn a damaged mailbox into a healthy one without operator intervention.',
        ],
        whyItMatters: 'The 5-phase pipeline is the defining feature of Super Protect - the path from burned to healthy without operator action.',
        relatedTerms: ['quarantine', 'cooldown', 'auto-pause', 'resilience-score'],
        relatedProducts: ['automated-domain-healing'],
        relatedBlog: ['domain-burned-recovery-prevention', 'domain-reputation-recovery-guide'],
        dateModified: DEFAULT_DATE,
    },
    'quarantine': {
        slug: 'quarantine',
        name: 'Quarantine',
        category: 'infrastructure',
        shortDefinition: 'Second phase of the healing pipeline. Mailbox cannot send yet; system re-validates DNS, blacklists, and connection health before advancing.',
        longDefinition: [
            'Quarantine is the second phase of Superkabe\'s healing pipeline. The cooldown has elapsed; the mailbox is no longer time-locked, but it cannot send yet. During quarantine, the system re-validates DNS health (SPF, DKIM, DMARC still resolving), checks blacklist status across 400+ DNSBLs, and confirms connection health (OAuth tokens valid, SMTP reachable).',
            'A mailbox can stay in quarantine indefinitely if its DNS or blacklist signals do not clear. This is intentional - releasing a mailbox to Restricted Send while it is still blacklisted compounds the problem. Operators see the specific blocking signal in the dashboard and can act on it (e.g. submit a delisting request to the blacklist operator).',
        ],
        relatedTerms: ['healing-pipeline', 'cooldown', 'dnsbl'],
        dateModified: DEFAULT_DATE,
    },

    // ─── Sending infrastructure ──────────────────────────────────────
    'dedicated-ip': {
        slug: 'dedicated-ip',
        name: 'Dedicated IP',
        category: 'sending',
        shortDefinition: 'IP used exclusively by one sender, so reputation is not shared. Useful at 50K+/month volume or for regulated industries; not always worth it below.',
        longDefinition: [
            'A dedicated IP is an IP address used exclusively by one sender (one workspace, one customer). Reputation accumulates only against that sender\'s behavior - no noisy-neighbor risk from other tenants of a shared pool, no benefit from other tenants\' good behavior.',
            'For cold outreach, dedicated IPs make sense above roughly 50K emails/month from one workspace, for regulated industries (healthcare, finance, legal) where audit-grade isolation is required, or for agencies whose clients contractually require it. Below that volume, a shared pool with strong tenant curation usually delivers better than an under-warmed dedicated IP.',
            'Superkabe offers Dedicated IP as an add-on at $39/month per IP, provisioned via AWS SES with automatic 4-8 week warm-up.',
        ],
        whyItMatters: 'Superkabe\'s Dedicated IP add-on routes the custom-SMTP send path through an isolated AWS SES IP, with automatic warm-up curve enforced at the send queue.',
        faq: [
            { q: 'When should I get a dedicated IP?', a: 'When sending volume exceeds 50K/month from one workspace, when you operate in a regulated industry requiring audit isolation, or when a client contractually requires per-tenant IP separation. See the decision framework in our help center.' },
            { q: 'How long does dedicated-IP warm-up take?', a: '4-8 weeks. Week 1: 50-100/day. Week 4: 1000-2500/day. Week 8: full capacity (5000+/day). Superkabe enforces the curve at the send queue so campaigns cannot accidentally overshoot.' },
        ],
        relatedTerms: ['ip-reputation', 'shared-ip-pool', 'warm-up', 'aws-ses'],
        relatedProducts: ['dedicated-ip'],
        relatedBlog: ['dedicated-ip-cold-email', 'domain-reputation-vs-ip-reputation'],
        dateModified: DEFAULT_DATE,
    },
    'shared-ip-pool': {
        slug: 'shared-ip-pool',
        name: 'Shared IP Pool',
        category: 'sending',
        shortDefinition: 'A pool of IPs shared across multiple sender tenants. Reputation pools across tenants - good behavior benefits everyone; bad behavior splashes onto everyone.',
        longDefinition: [
            'A shared IP pool is a set of IPs that multiple sender tenants share. Reputation pools across all tenants - good behavior by one helps everyone\'s deliverability; bad behavior by one splashes onto everyone else. Pool operators (most cold-outreach platforms) curate tenants aggressively to prevent splash.',
            'For most cold-outreach senders, a curated shared pool delivers better than an under-warmed dedicated IP because pooled volume amortizes the warm-up cost across many senders. The trade-off is loss of isolation - a co-tenant\'s mistake can splash onto your sending without warning.',
        ],
        relatedTerms: ['dedicated-ip', 'ip-reputation'],
        relatedBlog: ['dedicated-ip-cold-email'],
        dateModified: DEFAULT_DATE,
    },
    'sending-domain': {
        slug: 'sending-domain',
        name: 'Sending Domain',
        category: 'sending',
        shortDefinition: 'The domain in the From: address. For cold outreach, typically a dedicated domain separate from the primary brand to isolate reputation risk.',
        longDefinition: [
            'The sending domain is the domain that appears in the visible From: address of outbound mail. For cold outreach, best practice is to use a sending domain separate from the primary marketing domain - typically a close variant (yourcompany-co.com, yourcompany-mail.com, getyourcompany.com).',
            'The separation isolates reputation risk: if the cold-outreach domain burns, the primary marketing domain is unaffected. The trade-off is brand consistency - recipients may notice the variant domain and trust it less than the primary. The compromise most teams settle on is using a clearly-related variant with prominent branding in the email body to preserve recognition.',
        ],
        relatedTerms: ['domain-reputation', 'spf', 'dkim', 'dmarc', 'tracking-domain'],
        dateModified: DEFAULT_DATE,
    },
    'tracking-domain': {
        slug: 'tracking-domain',
        name: 'Tracking Domain',
        category: 'sending',
        shortDefinition: 'Domain wrapping open-tracking pixels and click-tracking links. Verified per-sender to avoid the third-party-redirect penalty on shared trackers.',
        longDefinition: [
            'The tracking domain is the domain used in the URLs for open-tracking pixels and click-tracking link wrappers in outbound email. Most cold-outreach platforms ship with a shared default tracking domain that all customers route through, which is convenient but suboptimal - Gmail and other receivers downrank messages whose tracking domain is shared across many unrelated senders.',
            'The fix is per-sender verified tracking domains: each customer points a subdomain of their own sending domain (e.g. `track.yoursendingdomain.com`) at the platform via CNAME. The CNAME is verified at platform-level so the tracking links appear as first-party URLs to receivers. Verified tracking domains measurably improve inbox placement on senders at volume.',
        ],
        relatedTerms: ['sending-domain', 'inbox-placement'],
        dateModified: DEFAULT_DATE,
    },
    'esp': {
        slug: 'esp',
        name: 'ESP',
        expansion: 'Email Service Provider',
        category: 'sending',
        shortDefinition: 'Service that provides email-sending infrastructure - APIs, IP pools, deliverability tools. SendGrid, Mailgun, AWS SES. Distinct from cold-outreach platforms.',
        longDefinition: [
            'An ESP (Email Service Provider) is a service that provides email-sending infrastructure: sending APIs, IP pool management, bounce processing, deliverability monitoring. Major players: SendGrid, Mailgun, AWS SES, Postmark, SparkPost.',
            'ESPs are distinct from cold-outreach platforms. A cold-outreach platform (like Superkabe) sends via the user\'s own connected mailboxes (Gmail, Microsoft 365, custom SMTP) or via an ESP-managed sending pool. ESPs themselves are typically the wrong tool for cold outreach because their terms of service prohibit unsolicited sending and their sending model (shared IPs, batched broadcast) is wrong for 1-to-1 personalized cold email.',
            'Confusingly, "ESP" in cold-outreach context often refers to the recipient\'s ESP - Gmail / Microsoft / Yahoo - the mail provider the recipient uses. That usage is technically inverse to the industry standard but is widespread in the cold-email community.',
        ],
        relatedTerms: ['aws-ses', 'esp-bucket', 'esp-routing'],
        dateModified: DEFAULT_DATE,
    },
    'aws-ses': {
        slug: 'aws-ses',
        name: 'AWS SES',
        expansion: 'Amazon Simple Email Service',
        category: 'sending',
        shortDefinition: 'Amazon\'s email-sending service. The backend infrastructure for Superkabe\'s Dedicated IP add-on - provisions isolated IPs, handles DKIM signing, processes feedback loops.',
        longDefinition: [
            'AWS SES (Simple Email Service) is Amazon\'s email-sending API. It provides high-volume sending infrastructure: shared sending pools by default, dedicated IPs as an add-on, DKIM signing handled automatically, bounce and complaint notifications via SNS, send-rate quotas, suppression list management.',
            'Superkabe\'s Dedicated IP feature uses SES as the underlying provisioning layer. When a workspace purchases a dedicated IP, an SES IP is allocated, the workspace\'s custom-SMTP send path is bound to it via a configuration set, and the warm-up curve is enforced at Superkabe\'s send queue (not at SES). Bounce + complaint events from SES flow back via SNS notifications to the protection layer.',
        ],
        relatedTerms: ['dedicated-ip', 'esp', 'shared-ip-pool'],
        relatedProducts: ['dedicated-ip'],
        sameAs: 'https://aws.amazon.com/ses/',
        dateModified: DEFAULT_DATE,
    },

    // ─── Sequencer concepts ─────────────────────────────────────────
    'sequence': {
        slug: 'sequence',
        name: 'Sequence',
        category: 'sequencer',
        shortDefinition: 'An ordered series of email touches sent to a lead over time - typically 3-7 steps spaced 2-5 days apart. The core unit of cold outreach automation.',
        longDefinition: [
            'A sequence is an ordered series of email touches sent to a lead over time. Typical structure: 3-7 steps spaced 2-5 days apart, each step a different message that builds on the previous (subject change, angle change, value-add resource, social proof, breakup message). Steps stop when the lead replies, bounces, or unsubscribes.',
            'Sequence design is the creative core of cold outreach. The deliverability infrastructure (warmup, validation, auto-pause) is the floor; the sequence content is what determines whether the recipient engages once the message reaches the inbox.',
        ],
        relatedTerms: ['sequence-step', 'step-variant', 'sticky-mailbox', 'send-gap'],
        relatedProducts: ['unlimited-multi-mailbox-sending', 'ai-cold-email-sequences'],
        dateModified: DEFAULT_DATE,
    },
    'sequence-step': {
        slug: 'sequence-step',
        name: 'Sequence Step',
        category: 'sequencer',
        shortDefinition: 'A single message in a sequence with its own subject, body, and delay. Each lead receives steps in order until they engage, bounce, or the sequence ends.',
        longDefinition: [
            'A sequence step is a single message within a sequence: its own subject, body, and delay from the previous step (in days + hours). Leads enter the sequence at step 1; on a successful send, the platform schedules the next step based on the delay configured.',
            'In Superkabe, step delays are configured in days + hours (minimum 1-hour granularity). The per-mailbox pacing within a day is handled by the `send_gap_minutes` setting on the campaign (default 17 minutes) - distinct from the step delay.',
        ],
        relatedTerms: ['sequence', 'step-variant', 'send-gap'],
        dateModified: DEFAULT_DATE,
    },
    'step-variant': {
        slug: 'step-variant',
        name: 'Step Variant',
        category: 'sequencer',
        shortDefinition: 'Copy variation within one sequence step (A/B/C). Leads are distributed across variants to test subject lines or framing within a single step.',
        longDefinition: [
            'A step variant is a copy variation within a single sequence step - typically labeled A, B, C, etc. Within one step, leads are distributed across variants to test which subject line, opening line, or framing produces the best reply rate.',
            'Variants are step-internal - they do not branch the sequence into separate paths. A lead that received Variant B of step 1 still proceeds to step 2 (and gets a randomly-selected variant of step 2 too). The variant assignment is logged per send for later analytics.',
        ],
        relatedTerms: ['sequence-step', 'sequence'],
        dateModified: DEFAULT_DATE,
    },
    'sticky-mailbox': {
        slug: 'sticky-mailbox',
        name: 'Sticky Mailbox',
        category: 'sequencer',
        shortDefinition: 'Mailbox-to-lead binding that persists across all sequence steps. Step 1 picks the mailbox; steps 2+ are forced through the same one for thread continuity.',
        longDefinition: [
            'Sticky mailbox assignment is the practice of pinning each lead to a single mailbox for the entire sequence. Step 1 picks the mailbox via the routing algorithm (capacity + ESP affinity); steps 2 and beyond use the same mailbox via the lead\'s `assigned_account_id` binding.',
            'The reason is thread continuity. If step 1 ships from sender-a@yourdomain.com and step 2 ships from sender-b@yourdomain.com, the recipient sees two unrelated cold emails from your company instead of one threaded conversation. Sticky mailbox + threading headers (In-Reply-To, References) together produce a coherent reply chain in the recipient\'s inbox.',
            'In Superkabe, sticky assignment is automatic for every campaign - no operator configuration needed. Reassignment happens only when the original mailbox is permanently disconnected.',
        ],
        relatedTerms: ['mailbox-rotation', 'esp-routing', 'in-reply-to', 'references-header'],
        relatedProducts: ['esp-aware-routing'],
        dateModified: DEFAULT_DATE,
    },
    'mailbox-rotation': {
        slug: 'mailbox-rotation',
        name: 'Mailbox Rotation',
        category: 'sequencer',
        shortDefinition: 'Distributing sends across multiple mailboxes in a campaign. Fair-first rotation balances volume across all mailboxes; ESP routing breaks ties.',
        longDefinition: [
            'Mailbox rotation is the algorithm that picks which mailbox sends each step-1 message in a campaign that has multiple mailboxes attached. Modern rotation is fair-first (each mailbox gets a proportional share of the daily volume) with ESP routing breaking ties (within an equal-load tier, pick the mailbox with the best 30-day performance for the lead\'s recipient ESP).',
            'Once a lead receives step 1 from a mailbox, the sticky-mailbox binding takes over - step 2+ go through the same mailbox. Mailbox rotation only governs first-touch assignment.',
        ],
        relatedTerms: ['sticky-mailbox', 'esp-routing', 'daily-send-limit'],
        relatedProducts: ['unlimited-multi-mailbox-sending'],
        dateModified: DEFAULT_DATE,
    },
    'esp-routing': {
        slug: 'esp-routing',
        name: 'ESP Routing',
        category: 'sequencer',
        shortDefinition: 'Routing leads to mailboxes based on the mailbox\'s 30-day performance for the lead\'s recipient ESP. A mailbox strong with Gmail recipients gets Gmail-bound leads preferentially.',
        longDefinition: [
            'ESP-aware routing is the practice of assigning each lead to the mailbox whose 30-day performance is best for the lead\'s recipient ESP (Gmail / Microsoft / Yahoo / Other). The same mailbox may perform well against Gmail recipients but poorly against Microsoft recipients, or vice versa - generic capacity-based rotation ignores this signal and produces worse inbox placement.',
            'Implementation: every mailbox has a `MailboxEspPerformance` row per ESP bucket tracking 30-day bounce rate and send count. The routing picker reads these scores and uses them to tie-break among equally-loaded mailboxes. With ESP routing enabled, the per-recipient-ESP send mix optimizes naturally over time.',
        ],
        relatedTerms: ['esp-bucket', 'mailbox-rotation', 'sticky-mailbox'],
        relatedProducts: ['esp-aware-routing', 'esp-aware-routing'],
        dateModified: DEFAULT_DATE,
    },
    'send-gap': {
        slug: 'send-gap',
        name: 'Send Gap',
        category: 'sequencer',
        shortDefinition: 'Minimum time between consecutive sends from the same mailbox - default 17 minutes. Distinct from step delay (between steps for the same lead).',
        longDefinition: [
            'The send gap is the minimum time the platform waits between consecutive sends from the same mailbox to different leads. In Superkabe, it is configured as `campaign.send_gap_minutes` with a default of 17 minutes.',
            'Send gap is distinct from step delay. Step delay is between consecutive steps in a sequence for one lead (e.g. step 1 day 0, step 2 day 2). Send gap is between back-to-back sends from one mailbox - if mailbox M sends to lead A at 10:00 AM, it cannot send to lead B until 10:17 AM. The gap is what makes mailboxes look like real humans typing rather than scripts firing.',
        ],
        relatedTerms: ['sequence-step', 'daily-send-limit', 'mailbox-rotation'],
        dateModified: DEFAULT_DATE,
    },
    'daily-send-limit': {
        slug: 'daily-send-limit',
        name: 'Daily Send Limit',
        category: 'sequencer',
        shortDefinition: 'The maximum number of emails a mailbox can send in 24 hours. Typically 30-50/day for fresh mailboxes ramping up to 80-150/day for warmed steady-state mailboxes.',
        longDefinition: [
            'The daily send limit caps the number of emails one mailbox can send in 24 hours. Industry-standard ramp: 20-30/day for a brand-new mailbox (week 1), 30-50/day during ramping (weeks 2-4), 80-150/day at warmed steady-state (week 30+). Above 200/day, even on a fully-warmed Google Workspace mailbox, ISPs start spam-foldering even with good signals.',
            'In Superkabe, the limit is stored on `ConnectedAccount.daily_send_limit`, overridden downward by `Mailbox.warmup_limit` during healing-pipeline recovery phases. The send queue enforces both: the effective cap is the smaller of the two.',
        ],
        relatedTerms: ['warm-up', 'send-gap', 'sender-reputation'],
        dateModified: DEFAULT_DATE,
    },
    'personalization-token': {
        slug: 'personalization-token',
        name: 'Personalization Token',
        category: 'sequencer',
        shortDefinition: 'Placeholder in email copy replaced at send time with lead-specific data - {{first_name}}, {{company}}. The signal-to-noise lever for cold copy.',
        longDefinition: [
            'A personalization token is a placeholder in email copy that gets replaced at send time with lead-specific data. Standard tokens: `{{first_name}}`, `{{last_name}}`, `{{company}}`, `{{title}}`. Custom tokens defined per campaign: `{{custom.industry}}`, `{{custom.pain_point}}`, `{{signal_icebreaker}}`.',
            'Tokens are case-sensitive and fail open: a missing value (e.g. lead has no `first_name`) substitutes an empty string by default, so messages do not ship as "Hi {{first_name}}". Most platforms also provide fallbacks: `{{first_name|there}}` substitutes "there" when first_name is empty.',
        ],
        relatedTerms: ['spintax', 'sequence-step'],
        dateModified: DEFAULT_DATE,
    },
    'spintax': {
        slug: 'spintax',
        name: 'Spintax',
        category: 'sequencer',
        shortDefinition: 'Template syntax for random variation - {Hi|Hello|Hey} {first_name}. Each send picks one at random, breaking ISP pattern-match on bulk templates.',
        longDefinition: [
            'Spintax (spinning syntax) is a template format that lets you specify alternatives inline: `{Hi|Hello|Hey} {first_name}` picks one of "Hi", "Hello", or "Hey" at random for each send. The recipient sees one version; the next send to a different lead may use a different version.',
            'For cold outreach, spintax breaks lexical pattern-matching that ISP spam filters apply to bulk-identical templates. Without spintax, 1,000 sends of a campaign all start with "Hi {{first_name}}, I noticed..." - a fingerprint spam filters easily match. With spintax across the opening phrase, subject line, and a few key sentences, each send is lexically distinct.',
            'Spintax does not replace good copy - it diversifies it. Three weak openings spun together are still weak; the variation just helps ISP filters not notice.',
        ],
        relatedTerms: ['personalization-token', 'sequence-step'],
        dateModified: DEFAULT_DATE,
    },

    // ─── Threading / Unibox ─────────────────────────────────────────
    'message-id': {
        slug: 'message-id',
        name: 'Message-ID',
        category: 'threading',
        shortDefinition: 'RFC 5322 header carrying a unique identifier per message. The foundation of email threading - In-Reply-To and References both reference Message-IDs.',
        longDefinition: [
            'Message-ID is an RFC 5322 mail header carrying a globally-unique identifier for the message, in the format `<unique-string@domain>` (angle brackets included). The receiving email client uses Message-ID values to thread related messages: the parent\'s Message-ID becomes the child\'s In-Reply-To value, and the full ancestor chain becomes References.',
            'For cold outreach, Message-ID must be saved per send so subsequent steps in the sequence can reference it. Without storing the Message-ID, follow-up steps land as new conversations on the recipient side rather than as threaded replies - measurably hurting reply rates.',
        ],
        relatedTerms: ['in-reply-to', 'references-header', 'email-thread'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.4',
        dateModified: DEFAULT_DATE,
    },
    'in-reply-to': {
        slug: 'in-reply-to',
        name: 'In-Reply-To',
        category: 'threading',
        shortDefinition: 'RFC 5322 header carrying the Message-ID of the parent message. The signal email clients use to render the message inside an existing thread.',
        longDefinition: [
            'In-Reply-To is an RFC 5322 header carrying the Message-ID of the parent message - the single message this one is a direct reply to. Email clients (Gmail, Outlook, Apple Mail) read this header to determine whether the new message belongs in an existing thread or starts a new one.',
            'For cold outreach sequence follow-ups, each step beyond step 1 must set In-Reply-To to the Message-ID of the previous step in the sequence. Missing or wrong values cause every step to render as a new conversation, defeating the purpose of a multi-step sequence.',
        ],
        relatedTerms: ['message-id', 'references-header', 'email-thread'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.4',
        dateModified: DEFAULT_DATE,
    },
    'references-header': {
        slug: 'references-header',
        name: 'References Header',
        category: 'threading',
        shortDefinition: 'An RFC 5322 header carrying the chain of ancestor Message-IDs in the thread. Used by email clients to reconstruct thread hierarchy when In-Reply-To is missing.',
        longDefinition: [
            'The References header is an RFC 5322 header carrying the chain of ancestor Message-IDs in the thread, space-separated and angle-bracketed. Step 3 of a sequence would have References = `<step1-id> <step2-id>`. Step 5 would have `<step1-id> <step2-id> <step3-id> <step4-id>`.',
            'References works alongside In-Reply-To: In-Reply-To names the immediate parent, References names the full ancestor chain. Email clients use both to reconstruct thread hierarchy and render multi-step threads correctly.',
        ],
        relatedTerms: ['message-id', 'in-reply-to', 'email-thread'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.4',
        dateModified: DEFAULT_DATE,
    },
    'email-thread': {
        slug: 'email-thread',
        name: 'Email Thread',
        category: 'threading',
        shortDefinition: 'A series of related messages grouped as one conversation in the recipient\'s email client. Cold-outreach sequences should appear as one thread, not five separate emails.',
        longDefinition: [
            'An email thread is a series of related messages grouped as one conversation in the recipient\'s email client (Gmail, Outlook, Apple Mail). Threading is driven by RFC 5322 headers (Message-ID, In-Reply-To, References) plus client-side heuristics (subject matching, sender matching).',
            'For cold outreach, the goal is to make multi-step sequences render as one thread on the recipient side - five emails arrive over two weeks, all clustered in one conversation. Recipients can read the chain in context, reply rates go up, and the recipient\'s inbox does not look spammed with five unrelated cold emails from your domain.',
        ],
        relatedTerms: ['message-id', 'in-reply-to', 'references-header'],
        relatedBlog: ['cross-channel-reply-leakage'],
        dateModified: DEFAULT_DATE,
    },

    // ─── Compliance ─────────────────────────────────────────────────
    'can-spam-act': {
        slug: 'can-spam-act',
        name: 'CAN-SPAM Act',
        category: 'compliance',
        shortDefinition: 'US law governing commercial email. Requires accurate sender ID, a postal address in every message, and a working unsubscribe mechanism.',
        longDefinition: [
            'The CAN-SPAM Act (Controlling the Assault of Non-Solicited Pornography and Marketing Act of 2003) is the US federal law governing commercial email. Key requirements: accurate From and Reply-To addresses, no deceptive subject lines, a valid physical postal address in every message (Section 5(a)(5)), a clear and functional opt-out mechanism, opt-out requests honored within 10 business days.',
            'CAN-SPAM is opt-out (not opt-in) - cold email to a B2B recipient is legal in the US as long as the message complies with these structural requirements. Most other major jurisdictions (EU/GDPR, Canada/CASL, Brazil/LGPD) are stricter.',
            'In Superkabe, the platform refuses to send any campaign without a postal address configured at the organization level; the gate is enforced at the dispatcher (sendQueueService:617).',
        ],
        relatedTerms: ['gdpr', 'casl', 'list-unsubscribe'],
        sameAs: 'https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business',
        dateModified: DEFAULT_DATE,
    },
    'gdpr': {
        slug: 'gdpr',
        name: 'GDPR',
        expansion: 'General Data Protection Regulation',
        category: 'compliance',
        shortDefinition: 'EU law governing personal data including business email. Stricter than CAN-SPAM - requires lawful basis (often legitimate interest for B2B) and opt-out.',
        longDefinition: [
            'GDPR (General Data Protection Regulation) is the EU\'s privacy law, in effect since 2018. It governs the processing of personal data of EU residents, which includes business email addresses (the EU treats them as personal data unless they are clearly role-based).',
            'For cold outreach to EU recipients, GDPR requires a lawful basis - most B2B senders rely on "legitimate interest," which requires a documented balancing test and explicit opt-out availability. The penalties for non-compliance are significant (up to 4% of global annual revenue), so most platforms ship with an EU-compliance mode that strips identifying data and limits send patterns on EU-resident recipients.',
        ],
        relatedTerms: ['can-spam-act', 'casl', 'list-unsubscribe'],
        sameAs: 'https://gdpr.eu/',
        dateModified: DEFAULT_DATE,
    },
    'casl': {
        slug: 'casl',
        name: 'CASL',
        expansion: 'Canadian Anti-Spam Legislation',
        category: 'compliance',
        shortDefinition: 'Canada\'s opt-in commercial-email law - stricter than CAN-SPAM. Requires express or implied consent before sending, accurate sender identification, and unsubscribe in every message.',
        longDefinition: [
            'CASL (Canadian Anti-Spam Legislation) is Canada\'s commercial-email law, in effect since 2014. CASL is opt-in (not opt-out) - sending commercial email to a Canadian recipient requires express or implied consent, with implied consent narrowly defined (existing business relationship, professional capacity in a publicly-listed role).',
            'Penalties are significant - up to CAD $10M per violation for businesses. Cold outreach to Canadian recipients should rely on implied consent only when there is a clear, documentable business relationship; speculative cold outreach risks enforcement action.',
        ],
        relatedTerms: ['can-spam-act', 'gdpr'],
        sameAs: 'https://crtc.gc.ca/eng/internet/anti.htm',
        dateModified: DEFAULT_DATE,
    },
    'list-unsubscribe': {
        slug: 'list-unsubscribe',
        name: 'List-Unsubscribe Header',
        category: 'compliance',
        shortDefinition: 'An RFC 8058 header that lets receiving mail clients render a one-click Unsubscribe button in the recipient\'s UI. Required by Gmail and Yahoo for bulk senders since 2024.',
        longDefinition: [
            'The List-Unsubscribe header is an RFC 8058 mail header that gives the recipient\'s mail client (Gmail, Yahoo, Outlook) the information needed to render an Unsubscribe button directly in the inbox UI - no need for the recipient to scroll to the email footer and click a link.',
            'Two values: `List-Unsubscribe: <mailto:unsubscribe@yourdomain.com>, <https://yourdomain.com/u/abc123>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. The combination signals one-click support - clicking the button hits the URL with a POST request, and the unsubscribe is honored.',
            'Required by Gmail and Yahoo for bulk senders (>5,000 sends/day to either) since February 2024. Superkabe sets both headers automatically on every send when the campaign has unsubscribe enabled (default).',
        ],
        relatedTerms: ['one-click-unsubscribe', 'can-spam-act'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc8058',
        dateModified: DEFAULT_DATE,
    },
    'one-click-unsubscribe': {
        slug: 'one-click-unsubscribe',
        name: 'One-Click Unsubscribe',
        category: 'compliance',
        shortDefinition: 'A mechanism where clicking an Unsubscribe link or button immediately removes the recipient from the sender\'s list - no login, no confirmation page, no further action.',
        longDefinition: [
            'One-click unsubscribe is the practice of immediately honoring an unsubscribe request on the first click - no login screen, no preferences page, no confirmation step. The recipient clicks Unsubscribe; the next send respects the suppression.',
            'Required by Gmail and Yahoo bulk-sender rules since 2024. Implementation: the List-Unsubscribe-Post header signals support, and the URL on the server side accepts a POST and writes a suppression-list row in the same request cycle. Anything more user-action than that fails the compliance test.',
        ],
        relatedTerms: ['list-unsubscribe', 'can-spam-act'],
        sameAs: 'https://datatracker.ietf.org/doc/html/rfc8058',
        dateModified: DEFAULT_DATE,
    },

    // ─── Blacklists / DNSBLs ────────────────────────────────────────
    'dnsbl': {
        slug: 'dnsbl',
        name: 'DNSBL',
        expansion: 'DNS-Based Blackhole List',
        category: 'blacklists',
        shortDefinition: 'Blacklist of IPs or domains known for spam, distributed via DNS. Receivers check sending IPs at SMTP-connect time and reject listed senders.',
        longDefinition: [
            'A DNSBL (DNS-Based Blackhole List) is a real-time list of IPs or domains known for spam activity, published via DNS. Receiving mail servers query the DNSBL at SMTP connect time by reversing the connecting IP and looking up `reversed.dnsbl-provider.com` - a NXDOMAIN response means clean, an A record response means listed.',
            'Major DNSBL operators: Spamhaus (the de-facto industry standard), Barracuda, SORBS, Microsoft\'s internal lists, SpamCop. Each operator has different listing criteria; some are aggressive (listing on first spam-trap hit), some are conservative (listing only after sustained pattern).',
            'Superkabe monitors every sending domain across 400+ DNSBLs every 6-24 hours and surfaces listings the moment they appear. Delisting requests need to be made directly to the listing operator.',
        ],
        relatedTerms: ['spamhaus', 'blacklist-removal', 'sender-reputation'],
        sameAs: 'https://en.wikipedia.org/wiki/Domain_Name_System_blocklist',
        dateModified: DEFAULT_DATE,
    },
    'spamhaus': {
        slug: 'spamhaus',
        name: 'Spamhaus',
        category: 'blacklists',
        shortDefinition: 'The most-consulted DNSBL operator. Their SBL and DBL lists are used by Gmail, Microsoft, and most enterprise filters. Listing crushes deliverability.',
        longDefinition: [
            'Spamhaus is the most consequential DNSBL operator. Their two major lists are SBL (Spamhaus Block List - IPs known to send spam) and DBL (Domain Block List - domains used in spam). Both are consulted by Gmail, Microsoft, and most enterprise mail filters as part of inbound spam scoring.',
            'A Spamhaus listing is severe but recoverable. Listings happen for many reasons: hitting spam traps, hosting compromised infrastructure, sustained complaint patterns, or operating from a network range with multiple listed IPs. Delisting requires submitting a request via the Spamhaus website after fixing the underlying cause; turnaround is typically 24-72 hours if the cause is genuinely addressed.',
        ],
        relatedTerms: ['dnsbl', 'blacklist-removal', 'sender-reputation'],
        sameAs: 'https://www.spamhaus.org/',
        dateModified: DEFAULT_DATE,
    },
    'blacklist-removal': {
        slug: 'blacklist-removal',
        name: 'Blacklist Removal',
        category: 'blacklists',
        shortDefinition: 'Getting a sending IP or domain removed from a DNSBL after listing. Requires fixing the underlying cause first, then a delisting request to the operator.',
        longDefinition: [
            'Blacklist removal is the process of getting a sending IP or domain delisted from a DNSBL. The procedure: identify the underlying cause (spam-trap hit, high complaint rate, compromised mailbox, etc.), fix it definitively, then submit a delisting request via the operator\'s web form or API.',
            'Submitting a delisting request without fixing the cause typically gets the listing re-applied within hours, often with a longer cooldown. Operators want evidence the issue is resolved - documentation of list cleaning, change to suppression policy, proof of investigated source.',
            'Most blacklist operators offer one free delisting per 24-72 hours; repeated listings within a short window get escalated to manual review with longer turnarounds.',
        ],
        relatedTerms: ['dnsbl', 'spamhaus', 'sender-reputation'],
        relatedBlog: ['how-to-remove-domain-from-blacklist'],
        dateModified: DEFAULT_DATE,
    },
    'feedback-loop': {
        slug: 'feedback-loop',
        name: 'Feedback Loop',
        expansion: 'FBL',
        category: 'blacklists',
        shortDefinition: 'Signal from an ISP when a recipient marks a message as spam. The FBL is how senders learn complaint rates - the most-damaging deliverability signal.',
        longDefinition: [
            'A Feedback Loop (FBL) is a signal an ISP sends back to a sender when one of its recipients clicks "Mark as Spam" in the inbox. The FBL message arrives as a structured DSN-like format with the original recipient and a complaint code, letting the sender suppress that recipient and adjust sending behavior.',
            'Major ISPs run FBLs: Microsoft (junk button on Outlook.com / Hotmail), Yahoo (mailing list, FBL feed), Google (limited - Postmaster Tools aggregates rather than per-recipient). Enrollment is per-IP and requires a postmaster@ or abuse@ address on a domain that reverse-resolves to the sending IP.',
            'Complaint rate is the deadliest deliverability signal. Above 0.1% sustained complaint rate, ISPs filter aggressively; above 0.3%, expect spam-folder placement to collapse. Suppress every FBL-reported address immediately.',
        ],
        relatedTerms: ['dnsbl', 'sender-reputation', 'spam-folder'],
        dateModified: DEFAULT_DATE,
    },

    // ─── LinkedIn / multi-channel ───────────────────────────────────
    'linkedin-outreach': {
        slug: 'linkedin-outreach',
        name: 'LinkedIn Outreach',
        category: 'linkedin',
        shortDefinition: 'Outbound prospecting via LinkedIn - connection requests, follow-up messages, and InMails. Typically used alongside cold email in a multi-channel cadence.',
        longDefinition: [
            'LinkedIn outreach is outbound prospecting via LinkedIn rather than email. Three primary mechanisms: connection requests (free, but capped at 30-100/day depending on account warmth), 1st-degree messages (after a connection is accepted), and InMails (paid Sales Navigator feature; reach users without a connection).',
            'For cold outreach, LinkedIn is usually paired with email - the prospect receives a connection request, an email, and a LinkedIn message over a single sequence. The deliverability constraints are different: LinkedIn has aggressive automation defenses and rate limits, while email has spam-filter and reputation constraints.',
        ],
        relatedTerms: ['cross-channel-halt', 'unipile', 'inmail'],
        relatedProducts: ['super-linkedin'],
        relatedBlog: ['24-7-linkedin-outreach-agents'],
        dateModified: DEFAULT_DATE,
    },
    'cross-channel-halt': {
        slug: 'cross-channel-halt',
        name: 'Cross-Channel Halt',
        category: 'linkedin',
        shortDefinition: 'When a prospect replies on one channel (LinkedIn or email), queued touches on the other channel auto-pause. Prevents the post-reply scheduled-send bug.',
        longDefinition: [
            'Cross-channel halt is the practice of treating a lead as one unit across multiple channels (LinkedIn + email + phone) so that a reply on any one channel pauses outreach on all others. The implementation requires workspace-level lead identity - the same lead record carries touches from every channel, and reply events on any channel propagate to the others.',
            'The failure mode without cross-channel halt: a prospect replies positively on LinkedIn, has a great conversation with sales, and then receives a scheduled cold email two days later asking why they have not replied. Every outbound team that runs multi-channel without halt logic hits this bug eventually.',
            'In Superkabe, cross-channel halt is automatic between Super LinkedIn and the Sequencer. Halt policy is operator-configurable: any-reply (default - safest), positive-only (uses reply intent classification), or manual review.',
        ],
        relatedTerms: ['linkedin-outreach', 'unipile', 'sequence'],
        relatedProducts: ['super-linkedin'],
        relatedBlog: ['cross-channel-reply-leakage'],
        dateModified: DEFAULT_DATE,
    },
    'unipile': {
        slug: 'unipile',
        name: 'Unipile',
        category: 'linkedin',
        shortDefinition: 'Unified messaging API handling LinkedIn auth and message sending at scale. Connection layer behind Super LinkedIn, lemlist, Apollo, and others.',
        longDefinition: [
            'Unipile is a unified messaging API that wraps LinkedIn (and other messaging platforms) with stable authentication and rate-aware send mechanics. Cold-outreach platforms (Super LinkedIn, lemlist, Apollo, Hyperreach) use Unipile rather than building LinkedIn integration directly because the auth model is more resilient than direct API access - sessions survive password rotations, MFA challenges, and most of the defensive friction LinkedIn applies to bulk-outreach tools.',
            'The trade-off is a third-party hop in the auth chain, but the operational reliability gain is substantial. Super LinkedIn uses Unipile as the connection layer.',
        ],
        relatedTerms: ['linkedin-outreach', 'cross-channel-halt'],
        relatedProducts: ['super-linkedin'],
        sameAs: 'https://www.unipile.com/',
        dateModified: DEFAULT_DATE,
    },
    'inmail': {
        slug: 'inmail',
        name: 'InMail',
        category: 'linkedin',
        shortDefinition: 'LinkedIn\'s paid messaging feature - send messages to users you are not connected to, requires Sales Navigator. Monthly cap and credit-refund model on no-response.',
        longDefinition: [
            'InMail is LinkedIn\'s paid feature for sending messages to users without a prior connection. Requires Sales Navigator subscription; credits are capped per month (typically 50-150 depending on tier). Unused credits roll over up to a small cap; LinkedIn refunds credits for InMails that go 90 days without a response on some plans.',
            'For cold outreach, InMail is a high-cost, high-signal touch - the recipient gets a clear "this person is a sales prospect" indicator, but it also bypasses the connection-request gate. Best reserved for high-value prospects in a multi-touch cadence rather than the default channel.',
        ],
        relatedTerms: ['linkedin-outreach'],
        relatedProducts: ['super-linkedin'],
        dateModified: DEFAULT_DATE,
    },

    // ─── Superkabe product-specific ─────────────────────────────────
    'super-protect': {
        slug: 'super-protect',
        name: 'Super Protect',
        category: 'product',
        shortDefinition: 'Superkabe\'s deliverability protection layer - auto-pause on bounce-rate threshold, 5-phase healing pipeline, ESP-aware routing, 400+ DNSBL monitoring, all running automatically.',
        longDefinition: [
            'Super Protect is the deliverability protection layer Superkabe ships as part of the platform. It runs continuously alongside the Sequencer and Super LinkedIn, watching every mailbox\'s send behavior and intervening before reputation damage compounds.',
            'Components: bounce-rate auto-pause (3% threshold with 60-send minimum and 5-bounce safety net), the 5-phase healing pipeline (Pause to Quarantine to Restricted Send to Warm Recovery to Healthy), ESP-aware mailbox routing, 400+ DNSBL monitoring, DNS health checks (SPF/DKIM/DMARC/MX), domain status cascade, dedicated IP add-on integration.',
            'The differentiator vs passive monitoring: Super Protect ENFORCES the rules rather than reporting them. A mailbox crossing 3% bounce rate is paused, not flagged. A paused mailbox is healed through structured gates, not left to operator action.',
        ],
        relatedTerms: ['healing-pipeline', 'esp-routing', 'sender-reputation', 'dnsbl'],
        relatedProducts: ['email-deliverability-protection', 'b2b-sender-reputation-management', 'automated-domain-healing'],
        dateModified: DEFAULT_DATE,
    },
    'super-sequencer': {
        slug: 'super-sequencer',
        name: 'Super Sequencer',
        category: 'product',
        shortDefinition: 'Superkabe\'s native cold-email sequencer - multi-step sequences, sticky mailbox per lead, ESP-aware routing, RFC 5322 threading, Unibox reply triage.',
        longDefinition: [
            'Super Sequencer is Superkabe\'s native cold-email sending engine. It sends from your own Gmail, Microsoft 365, or custom SMTP mailboxes; the platform layers AI sequencing, multi-mailbox routing, validation, and threading on top.',
            'Key properties: sticky mailbox per lead (all steps for one lead route through the same mailbox to preserve thread continuity), RFC 5322 threading headers (In-Reply-To and References set correctly on follow-up steps), ESP-aware routing (mailbox picked based on 30-day performance for the lead\'s recipient ESP), Unibox reply triage (inbound replies surfaced for operator triage and analytics).',
        ],
        relatedTerms: ['sequence', 'sticky-mailbox', 'esp-routing', 'message-id'],
        relatedProducts: ['unlimited-multi-mailbox-sending', 'ai-cold-email-sequences'],
        dateModified: DEFAULT_DATE,
    },
    'super-linkedin': {
        slug: 'super-linkedin',
        name: 'Super LinkedIn',
        category: 'product',
        shortDefinition: 'Superkabe\'s LinkedIn outreach module - HeyReach-parity sending plus a 4-agent supervisor stack (signal, ICP, enrichment, icebreaker) plus cross-channel halt with the Sequencer.',
        longDefinition: [
            'Super LinkedIn is the LinkedIn outreach module of Superkabe. It pairs HeyReach-class sending (safe daily caps, connection-then-message cadence, Unipile-backed authentication) with a 4-agent supervisor stack: signal agent (24/7 ICP-matching activity monitor), ICP agent (fit classifier), enrichment agent (Clay-as-waterfall), icebreaker agent (opener writer with quality gate).',
            'Leads are workspace-level - a single lead can have a LinkedIn touch and an email touch in progress simultaneously, and a reply on either channel halts the other automatically. This is the cross-channel halt that prevents the most common multi-channel reply-leakage bug.',
        ],
        relatedTerms: ['linkedin-outreach', 'cross-channel-halt', 'unipile', 'inmail'],
        relatedProducts: ['super-linkedin'],
        relatedBlog: ['24-7-linkedin-outreach-agents', 'superkabe-vs-heyreach'],
        dateModified: DEFAULT_DATE,
    },
    'resilience-score': {
        slug: 'resilience-score',
        name: 'Resilience Score',
        category: 'product',
        shortDefinition: '0-100 score per mailbox tracking healing performance. Drops on pause; rebuilds during recovery; tunes the pace of future healing curves.',
        longDefinition: [
            'The Resilience Score is a 0-100 per-mailbox score that summarizes the mailbox\'s healing-pipeline history. Each pause event drops the score by 15-25 points; each successful graduation through the pipeline gradually restores it. The score then tunes the pace of future healing - a mailbox with a strong resilience score graduates faster the next time it is paused; one with a weak score takes longer.',
            'The Resilience Score is a confidence signal more than a punitive one. It is one of several factors operators see in the dashboard alongside infrastructure score, bounce-rate trend, and DNS status.',
        ],
        relatedTerms: ['healing-pipeline', 'sender-reputation'],
        relatedProducts: ['automated-domain-healing'],
        dateModified: DEFAULT_DATE,
    },
    'five-phase-healing': {
        slug: 'five-phase-healing',
        name: '5-Phase Healing',
        category: 'product',
        shortDefinition: 'Structured Pause -> Quarantine -> Restricted Send -> Warm Recovery -> Healthy progression in Super Protect. Each transition gated by quantitative criteria.',
        longDefinition: [
            'The 5-phase healing pipeline is Super Protect\'s structured recovery flow for paused mailboxes. The phases:',
            'Pause - mailbox is fully stopped, cooldown timer running (1 hour minimum, exponential escalation).',
            'Quarantine - cooldown elapsed; system re-validates DNS, blacklist status, connection health. Mailbox stays here indefinitely if signals are not clean.',
            'Restricted Send - mailbox can send, capped at warmup_limit (typically 10-20/day initially). Must hit clean-send minimum to advance.',
            'Warm Recovery - send cap increases gradually; bounce + complaint floor verified.',
            'Healthy - full daily_send_limit restored; mailbox dispatches at production volume.',
            'Each transition has explicit quantitative gates - nothing advances on a timer alone.',
        ],
        relatedTerms: ['healing-pipeline', 'quarantine', 'cooldown', 'resilience-score'],
        relatedProducts: ['automated-domain-healing'],
        dateModified: DEFAULT_DATE,
    },
    'suppression-mode': {
        slug: 'suppression-mode',
        name: 'Suppression Mode',
        category: 'product',
        shortDefinition: 'Workspace setting controlling cross-channel reply suppression - CLASSIFIED (intent-based), ALL (any reply halts), or OFF (no cross-channel halt).',
        longDefinition: [
            'Suppression mode is a workspace-level setting controlling how Superkabe handles cross-channel reply suppression. Three modes:',
            'CLASSIFIED (default) - a reply on one channel halts the other channel only when the reply intent is classified as positive, qualified, or referral. Out-of-office and negative replies do not halt.',
            'ALL - any reply on any channel halts the others, regardless of intent. Safest mode.',
            'OFF - no cross-channel halt. Each channel runs independently. Useful for testing or for sequences where the channels intentionally do not coordinate.',
            'The mode is set per-workspace and changing it is a consequential action - Superkabe writes an audit log entry on every mode change.',
        ],
        relatedTerms: ['cross-channel-halt', 'linkedin-outreach'],
        relatedProducts: ['super-linkedin'],
        dateModified: DEFAULT_DATE,
    },
};

/**
 * Helper: get a flat array of all terms (for index page iteration).
 */
export const allGlossaryTerms = Object.values(glossaryTerms);

/**
 * Helper: group terms by category for the index page.
 */
export interface GlossaryCategoryMeta {
    key: GlossaryCategory;
    label: string;
    description: string;
}

export const GLOSSARY_CATEGORIES: GlossaryCategoryMeta[] = [
    { key: 'authentication', label: 'Authentication & DNS', description: 'SPF, DKIM, DMARC, BIMI, MX, and the DNS infrastructure email trust is built on.' },
    { key: 'deliverability', label: 'Deliverability', description: 'Bounce types, SMTP codes, and the failure modes that drive sender reputation.' },
    { key: 'reputation', label: 'Sender Reputation', description: 'How ISPs score senders and how to monitor your standing.' },
    { key: 'validation', label: 'Email Validation', description: 'Catch-all detection, role-based addresses, spam traps, and the pre-send filter pipeline.' },
    { key: 'infrastructure', label: 'Cold Email Infrastructure', description: 'Warm-up, cooldown, healing, and the operational mechanics of running cold outreach at scale.' },
    { key: 'sending', label: 'Sending Infrastructure', description: 'Dedicated IPs, shared pools, sending domains, tracking domains, ESPs.' },
    { key: 'sequencer', label: 'Sequencer Concepts', description: 'Sequences, steps, variants, sticky mailbox, ESP routing, and the dispatch mechanics behind every send.' },
    { key: 'threading', label: 'Threading & Unibox', description: 'Message-ID, In-Reply-To, References - the RFC 5322 plumbing that makes follow-up sends land in the same conversation.' },
    { key: 'compliance', label: 'Compliance', description: 'CAN-SPAM, GDPR, CASL, List-Unsubscribe - the regulatory layer cold outreach operates inside.' },
    { key: 'blacklists', label: 'Blacklists & DNSBLs', description: 'Spamhaus, DNSBLs, feedback loops, and the negative-signal infrastructure receivers consult.' },
    { key: 'linkedin', label: 'LinkedIn & Multi-Channel', description: 'LinkedIn outreach, InMail, Unipile, and cross-channel halt mechanics.' },
    { key: 'product', label: 'Superkabe Product', description: 'Super Protect, Super Sequencer, Super LinkedIn, and the Superkabe-specific concepts in the dashboard.' },
];

export function getTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
    return allGlossaryTerms.filter(t => t.category === category);
}
