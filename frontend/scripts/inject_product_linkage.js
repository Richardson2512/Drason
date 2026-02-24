const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../src/app/blog');

const updates = [
    'introducing-infrastructure-assessment',
    'email-deliverability-guide',
    'bounce-rate-deliverability',
    'spf-dkim-dmarc-explained',
    'domain-warming-methodology',
    'email-reputation-lifecycle'
];

const injectionBlock = `
            <div className="mt-16 pt-10 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe prevents this problem</h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                    Superkabe continuously tracks bounce rates and DNS authentication status, auto-pausing mailboxes and gating domains when risk thresholds are breached, so you detect and prevent domain degradation before it becomes irreversible.
                </p>
            </div>
        </article>`;

for (const slug of updates) {
    const postPage = path.join(blogDir, slug, 'page.tsx');
    if (fs.existsSync(postPage)) {
        let content = fs.readFileSync(postPage, 'utf8');

        const targetStr = '        </article>';

        if (content.includes(targetStr) && !content.includes('How Superkabe prevents this problem')) {
            content = content.replace(targetStr, injectionBlock);
            fs.writeFileSync(postPage, content);
            console.log(`Injected product linkage into: ${slug}`);
        } else {
            console.log(`Skipped or failed injection on: ${slug}`);
        }
    }
}
console.log('Finished injecting product linkage into all blog posts.');
