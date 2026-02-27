import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How to assess your outbound email infrastructure before sending your first campaign',
    description: 'Stop guessing about your deliverability. Our new Infrastructure Assessment scores your domains, DNS, and mailbox health before you send a single email.',
    openGraph: {
        title: 'Infrastructure Assessment: Pre-Flight Cold Email Checks',
        description: 'Stop guessing about your deliverability. Our new Infrastructure Assessment scores your domains, DNS, and mailbox health before you send a single email.',
        type: 'article',
        publishedTime: '2024-03-20',
    },
    alternates: {
        canonical: '/blog/introducing-infrastructure-assessment',
    },
};

export default function InfrastructureAssessmentPost() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "How to assess your outbound email infrastructure before sending your first campaign",
        "description": "Stop guessing about your deliverability. Our new Infrastructure Assessment scores your domains, DNS, and mailbox health before you send a single email.",
        "datePublished": "2024-03-20",
        "author": {
            "@type": "Organization",
            "name": "Superkabe"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/introducing-infrastructure-assessment"
        }
    };

    return (
        <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
        <article className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                How to assess your outbound email infrastructure before sending your first campaign
            </h1>

            <p className="lead text-xl text-gray-500 mb-8">
                You wouldn't fly a plane without a pre-flight check. Why are you launching cold email campaigns without one?
            </p>

            {/* Key Takeaways */}
            <div className="not-prose bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-12 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /><path d="m4.93 4.93 14.14 14.14" /><path d="m14.93 4.93-14.14 14.14" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 m-0">Key Takeaways</h3>
                </div>
                <ul className="space-y-3 m-0">
                    <li className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">●</span>
                        <span className="text-gray-700 font-medium">Most outbound campaigns fail because the infrastructure was broken <em>before</em> launch.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">●</span>
                        <span className="text-gray-700 font-medium">Superkabe's new <strong>Infrastructure Assessment</strong> scans DNS, blacklists, and mailbox health automatically.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">●</span>
                        <span className="text-gray-700 font-medium">Get a 0-100 readiness score to know exactly when you're safe to send.</span>
                    </li>
                </ul>
            </div>

            {/* Table of Contents */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Table of Contents</h2>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                    <li><a href="#silent-killer" style={{ color: '#2563EB', textDecoration: 'none' }}>What Is the Silent Killer of Outbound Campaigns?</a></li>
                    <li><a href="#automated-assessment" style={{ color: '#2563EB', textDecoration: 'none' }}>What Is Automated Email Infrastructure Assessment?</a></li>
                    <li><a href="#what-it-scans" style={{ color: '#2563EB', textDecoration: 'none' }}>What Does the Infrastructure Assessment Scan?</a></li>
                    <li><a href="#health-score" style={{ color: '#2563EB', textDecoration: 'none' }}>How Does the 0-100 Infrastructure Health Score Work?</a></li>
                    <li><a href="#first-audit" style={{ color: '#2563EB', textDecoration: 'none' }}>How Do You Run Your First Infrastructure Audit?</a></li>
                </ol>
            </div>

            <p>
                We've seen it happen hundreds of times: A team spends weeks crafting the perfect offer, writing compelling copy, and scraping high-quality leads. They launch the campaign, and... crickets.
            </p>

            <p>
                The problem wasn't the copy. It wasn't the offer. It was the <strong>infrastructure</strong>.
            </p>

            <h2 id="silent-killer" className="text-3xl font-bold mt-12 mb-6">What Is the Silent Killer of Outbound Campaigns?</h2>
            <p>
                Email infrastructure is fragile. A single missing DMARC record, a hidden blacklist listing, or a "burned" mailbox from a previous provider can tank your entire operation.
            </p>
            <p>
                Until now, checking this required manual work: using one tool for SPF checks, another for blacklists, and spreadsheets to track mailbox age.
            </p>

            <h2 id="automated-assessment" className="text-3xl font-bold mt-12 mb-6">What Is Automated Email Infrastructure Assessment?</h2>
            <p>
                We built the <strong>Infrastructure Assessment</strong> to solve this. It's an automated auditor that lives inside your Superkabe dashboard.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 my-8">
                <h3 id="what-it-scans" className="text-2xl font-bold text-gray-900 mb-4">What Does the Infrastructure Assessment Scan?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="font-bold text-blue-600 mb-2">1. DNS Configuration</h4>
                        <p className="text-sm text-gray-600">Validates SPF, DKIM, and DMARC records. Checks for syntax errors and lookup limits.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="font-bold text-red-600 mb-2">2. Blacklist Status</h4>
                        <p className="text-sm text-gray-600">Real-time checks against major blocklists like Spamhaus, SORBS, and Barracuda.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="font-bold text-green-600 mb-2">3. Mailbox Health</h4>
                        <p className="text-sm text-gray-600">Analyzes bounce history and sending patterns to detect "burned" accounts.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="font-bold text-purple-600 mb-2">4. Provider Setup</h4>
                        <p className="text-sm text-gray-600">Verifies that domains are properly connected to Google/Outlook workspaces.</p>
                    </div>
                </div>
            </div>

            <h2 id="health-score" className="text-3xl font-bold mt-12 mb-6">How Does the 0-100 Infrastructure Health Score Work?</h2>
            <p>
                We boil everything down to a simple <strong>Health Score</strong>.
            </p>
            <ul>
                <li><strong>90-100 (Excellent):</strong> You are ready to scale.</li>
                <li><strong>70-89 (Good):</strong> Monitoring recommended, but safe to send.</li>
                <li><strong>0-69 (Critical):</strong> DO NOT SEND. You have structural issues that will cause immediate deliverability failures.</li>
            </ul>

            <h2 id="first-audit" className="text-3xl font-bold mt-12 mb-6">How Do You Run Your First Infrastructure Audit?</h2>
            <p>
                This feature is available today for all active workspaces.
            </p>
            <ol>
                <li>Go to your <strong>Infrastructure Dashboard</strong>.</li>
                <li>Click the <strong>"Run Assessment"</strong> button.</li>
                <li>Wait 30-60 seconds for the scan to complete.</li>
                <li>Review your report and apply the suggested fixes.</li>
            </ol>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mt-12 text-center">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Ready to fix your outbound infrastructure?</h3>
                <p className="text-blue-700 mb-6">
                    Log in to Superkabe and run your first free assessment report.
                </p>
                <a href="/dashboard/infrastructure" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                    Run Audit Now
                </a>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe prevents this problem</h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                    Superkabe continuously tracks bounce rates and DNS authentication status, auto-pausing mailboxes and gating domains when risk thresholds are breached, so you detect and prevent domain degradation before it becomes irreversible.
                </p>
            </div>
        </article>
        </>
    );
}
