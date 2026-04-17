import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How to Upload CSV Leads | Superkabe Help',
    description: 'Step-by-step guide to uploading CSV lead lists into Superkabe for validation, ESP classification, and campaign routing.',
    alternates: { canonical: '/docs/help/csv-upload' },
    openGraph: {
        title: 'How to Upload CSV Leads | Superkabe Help',
        description: 'Step-by-step guide to uploading CSV lead lists into Superkabe for validation, ESP classification, and campaign routing.',
        url: '/docs/help/csv-upload',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function CsvUploadPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How to Upload CSV Leads
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Upload lead lists directly into Superkabe for validation, ESP classification, and routing to campaigns
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Go to <strong>Dashboard &rarr; Email Validation &rarr; Upload CSV</strong>. Drop your CSV file, confirm column mapping, and Superkabe validates every email, classifies each recipient by ESP (Gmail, Microsoft, Yahoo), and lets you route valid leads to any campaign.
                </p>
                <p className="text-blue-700 text-sm">
                    You can also use this as standalone validation &mdash; upload, validate, and export a clean list without routing to any campaign.
                </p>
            </div>

            <h2 id="csv-format" className="text-3xl font-bold mb-6 text-gray-900">CSV Format Requirements</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-8">
                <p className="text-gray-600 mb-4">Only the <strong>email</strong> column is required. Everything else is optional:</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono mb-4">
                    email, first_name, last_name, company, title, lead_score<br />
                    john@acme.com, John, Doe, Acme Inc, VP Sales, 85<br />
                    sara@bigcorp.com, Sara, Chen, BigCorp, Director Marketing, 72
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-gray-700 font-semibold">Column</th>
                                <th className="px-4 py-2 text-gray-700 font-semibold">Required</th>
                                <th className="px-4 py-2 text-gray-700 font-semibold">Auto-detected variants</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr><td className="px-4 py-2 font-bold text-gray-900">email</td><td className="px-4 py-2 text-emerald-600 font-medium">Yes</td><td className="px-4 py-2 text-gray-500">email, e-mail, email_address, work email, mail</td></tr>
                            <tr><td className="px-4 py-2 font-bold text-gray-900">first_name</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2 text-gray-500">first_name, firstname, first name, fname</td></tr>
                            <tr><td className="px-4 py-2 font-bold text-gray-900">last_name</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2 text-gray-500">last_name, lastname, last name, lname, surname</td></tr>
                            <tr><td className="px-4 py-2 font-bold text-gray-900">company</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2 text-gray-500">company, company_name, organization, org, account</td></tr>
                            <tr><td className="px-4 py-2 font-bold text-gray-900">title / persona</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2 text-gray-500">persona, title, job_title, role, position</td></tr>
                            <tr><td className="px-4 py-2 font-bold text-gray-900">lead_score</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2 text-gray-500">lead_score, score, rating (defaults to 50)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <h2 id="upload-steps" className="text-3xl font-bold mb-6 text-gray-900">Upload Steps</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Step 1 &mdash; Open Upload Modal</h3>
                    <p className="text-gray-600 text-sm">Navigate to <strong>Dashboard &rarr; Email Validation</strong> and click <strong>Upload CSV</strong>. Optionally pre-select a target campaign &mdash; or leave it as &ldquo;Decide after validation&rdquo; to route manually later.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Step 2 &mdash; Drop CSV and Confirm Mapping</h3>
                    <p className="text-gray-600 text-sm">Drag and drop your file or click to browse. Superkabe parses the headers and auto-detects which columns map to which fields. Review the detected mapping and adjust any that are wrong. A 3-row preview shows how data will be interpreted.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Step 3 &mdash; Validation Runs</h3>
                    <p className="text-gray-600 text-sm">Click <strong>Confirm &amp; Validate</strong>. Superkabe processes each lead through the full validation pipeline (syntax, MX, disposable, catch-all, conditional API probe) and classifies the recipient ESP. A progress bar shows real-time valid/invalid/risky counts.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Step 4 &mdash; Review Results</h3>
                    <p className="text-gray-600 text-sm">After processing, the results table shows every lead with status (valid, risky, invalid, duplicate), validation score, ESP bucket (Gmail, Microsoft, Yahoo, Other), and rejection reason if applicable. Filter by status or ESP, search by email.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Step 5 &mdash; Route or Export</h3>
                    <p className="text-gray-600 text-sm">Select valid leads using checkboxes and click <strong>Route to Campaign</strong> to push them to Smartlead, Instantly, or EmailBison. Or click <strong>Export Clean List</strong> to download a CSV of valid leads only. <strong>Full Results</strong> exports all statuses with scores.</p>
                </div>
            </div>

            <h2 id="duplicates" className="text-3xl font-bold mb-6 text-gray-900">How Duplicates Are Handled</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-12">
                <ul className="space-y-3 text-gray-600">
                    <li><strong>Within the same upload</strong> &mdash; if the same email appears twice in one CSV, the second row is marked as &ldquo;Duplicate within this upload&rdquo; and skipped. No credit spent.</li>
                    <li><strong>Across uploads</strong> &mdash; if the same email was uploaded in a previous batch, it is marked as &ldquo;Previously uploaded&rdquo; with the prior validation status. No credit spent.</li>
                    <li><strong>Already in a campaign</strong> &mdash; if the lead already exists in Superkabe and is active in a campaign, it is flagged as a duplicate.</li>
                </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/email-validation" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How Does Email Validation Work?</a>
                    <a href="/docs/help/validation-credits" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How Do Validation Credits Work?</a>
                    <a href="/docs/help/esp-routing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How Does ESP-Aware Routing Work?</a>
                </div>
            </div>
        </div>
    );
}
