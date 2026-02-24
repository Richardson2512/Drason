const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../src/app/blog');

const updates = {
    'introducing-infrastructure-assessment': {
        title: 'How to assess your outbound email infrastructure before sending your first campaign',
        question: 'This guide answers a common question from outbound teams: "How do I know if my domains and mailboxes are actually healthy before I start a live campaign?"'
    },
    'email-deliverability-guide': {
        title: 'How to protect and master your outbound email deliverability',
        question: 'This guide answers a common question from outbound teams: "What are the exact technical requirements and strategies to maintain 95%+ email deliverability at scale?"'
    },
    'bounce-rate-deliverability': {
        title: 'How bounce rates damage sender reputation (and how to prevent it)',
        question: 'This guide answers a common question from outbound teams: "How do bounce rates actually affect my sender reputation over time, and what is a safe threshold?"'
    },
    'spf-dkim-dmarc-explained': {
        title: 'Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams',
        question: 'This guide answers a common question from outbound teams: "How exactly do I configure SPF, DKIM, and DMARC to ensure my cold emails land in the primary inbox?"'
    },
    'domain-warming-methodology': {
        title: 'How to safely warm up new outbound email domains',
        question: 'This guide answers a common question from outbound teams: "What is the correct schedule and methodology for warming up new domains without burning them?"'
    },
    'email-reputation-lifecycle': {
        title: 'How sender reputation is built, damaged, and repaired over time',
        question: 'This guide answers a common question from outbound teams: "Is it possible to recover a burned domain, and how exactly are ISP reputation scores calculated?"'
    }
};

// 1. Update the index page card arrays
const indexPage = path.join(blogDir, 'page.tsx');
let indexContent = fs.readFileSync(indexPage, 'utf8');

for (const [slug, data] of Object.entries(updates)) {
    const regex = new RegExp(`(slug:\\s*'${slug}',\\s*)title:\\s*'[^']+',`, 'g');
    indexContent = indexContent.replace(regex, `$1title: '${data.title.replace(/'/g, "\\'")}',`);
}
fs.writeFileSync(indexPage, indexContent);

// 2. Update each individual blog post
for (const [slug, data] of Object.entries(updates)) {
    const postPage = path.join(blogDir, slug, 'page.tsx');
    if (fs.existsSync(postPage)) {
        let content = fs.readFileSync(postPage, 'utf8');

        // Update metadata title
        content = content.replace(/title:\s*'[^']+',/, `title: '${data.title.replace(/'/g, "\\'")}',`);

        // Update h1 element
        content = content.replace(/<h1 className="[^"]+">\s*([\s\S]*?)\s*<\/h1>/, `<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">\n                    ${data.title}\n                </h1>`);

        // Insert paragraph after the date/read-time p tag:
        const dateRegex = /(<p className="[^"]*text-gray-400[^"]*">\s*[^<]+\s*<\/p>)/;
        const pTags = `<p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">\n                    ${data.question.replace(/"/g, '&quot;')}\n                </p>`;

        if (content.match(dateRegex)) {
            if (!content.includes('bg-blue-50/50 p-6 rounded-2xl border border-blue-100')) {
                content = content.replace(dateRegex, `$1\n\n                ${pTags}`);
            }
        }

        fs.writeFileSync(postPage, content);
    }
}
console.log('Successfully updated blog subheadings and injected AEO questions.');
