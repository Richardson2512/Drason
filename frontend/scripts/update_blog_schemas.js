const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../src/app/blog');

const updates = {
    'introducing-infrastructure-assessment': {
        title: 'How to assess your outbound email infrastructure before sending your first campaign',
        description: 'Stop guessing about your deliverability. Our new Infrastructure Assessment scores your domains, DNS, and mailbox health before you send a single email.',
    },
    'email-deliverability-guide': {
        title: 'How to protect and master your outbound email deliverability',
        description: 'Everything outbound email operators need to know about sending infrastructure, sender reputation, DNS authentication, domain warming, and protecting deliverability at scale.',
    },
    'bounce-rate-deliverability': {
        title: 'How bounce rates damage sender reputation (and how to prevent it)',
        description: 'Understanding the mechanics of bounce rates, their impact on sender reputation, and how to prevent domain degradation before it becomes irreversible.',
    },
    'spf-dkim-dmarc-explained': {
        title: 'Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams',
        description: 'Technical breakdown of email authentication protocols SPF, DKIM, and DMARC. How they protect sender identity and why misconfiguration causes inbox placement failure.',
    },
    'domain-warming-methodology': {
        title: 'How to safely warm up new outbound email domains',
        description: 'The systematic approach to building sender reputation on new domains, including volume ramp schedules, warming signals, and common mistakes that burn domains.',
    },
    'email-reputation-lifecycle': {
        title: 'How sender reputation is built, damaged, and repaired over time',
        description: 'How email reputation is built, maintained, damaged, and recovered. Covers ISP scoring models, feedback loops, and the point of no return for domain reputation.',
    }
};

for (const [slug, data] of Object.entries(updates)) {
    const postPage = path.join(blogDir, slug, 'page.tsx');
    if (fs.existsSync(postPage)) {
        let content = fs.readFileSync(postPage, 'utf8');

        // 1. Inject canonical path into Next metadata
        const metadataRegex = /export const metadata: Metadata = {([\s\S]*?)};/;
        content = content.replace(metadataRegex, (match, p1) => {
            if (!p1.includes('alternates:')) {
                return `export const metadata: Metadata = {${p1}    alternates: {\n        canonical: '/blog/${slug}',\n    },\n};`;
            }
            return match;
        });

        // 2. Erase old articleSchema completely (up to the semicolon mapping)
        const oldSchemaDefinition = /const articleSchema = {[\s\S]*?(?=const howToSchema|const faqSchema|return \()/;

        let newSchemaString = `const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${data.title.replace(/"/g, '\\"')}",
        "description": "${data.description.replace(/"/g, '\\"')}",
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
            "@id": "https://www.superkabe.com/blog/${slug}"
        }
    };\n\n    `;

        content = content.replace(oldSchemaDefinition, newSchemaString);

        // 3. Update the JSX injection string node
        const injectionTarget = /JSON\.stringify\(articleSchema\)/g;
        content = content.replace(injectionTarget, 'JSON.stringify(blogPostingSchema)');

        fs.writeFileSync(postPage, content);
    }
}
console.log('Successfully replaced all schemas with strict BlogPosting definitions and added canonicals.');
