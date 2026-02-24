const fs = require('fs');
const path = require('path');

const srcAppPath = path.join(__dirname, '..', 'src', 'app');
const targetProductPath = path.join(srcAppPath, 'product');

if (!fs.existsSync(targetProductPath)) {
    fs.mkdirSync(targetProductPath, { recursive: true });
}

const pagesToMove = [
    'email-deliverability-protection',
    'what-is-email-deliverability-protection',
    'sender-reputation-protection-tool',
    'how-to-protect-sender-reputation',
    'b2b-sender-reputation-management',
    'domain-burnout-prevention-tool',
    'how-to-prevent-domain-burnout',
    'automated-domain-healing',
    'outbound-domain-protection',
    'email-infrastructure-protection',
    'cold-email-infrastructure-protection',
    'outbound-email-infrastructure-monitoring',
    'email-infrastructure-health-check',
    'bounce-rate-protection-system',
    'sender-reputation-monitoring',
    'automated-bounce-management',
    'smartlead-infrastructure-protection',
    'smartlead-deliverability-protection',
    'instantly-infrastructure-protection',
    'emailbison-infrastructure-protection',
    'reply-io-deliverability-protection',
    'multi-platform-outbound-protection',
    'case-study-bounce-reduction',
    'case-study-domain-recovery',
    'case-study-infrastructure-protection'
];

for (const slug of pagesToMove) {
    const oldPath = path.join(srcAppPath, slug);
    const newPath = path.join(targetProductPath, slug);

    if (fs.existsSync(oldPath)) {
        // Move directory
        fs.renameSync(oldPath, newPath);

        // Update canonical tag
        const pageTsxPath = path.join(newPath, 'page.tsx');
        if (fs.existsSync(pageTsxPath)) {
            let content = fs.readFileSync(pageTsxPath, 'utf8');
            content = content.replace(`canonical: '/${slug}'`, `canonical: '/product/${slug}'`);
            fs.writeFileSync(pageTsxPath, content);
        }
        console.log(`Moved /${slug} to /product/${slug} and updated canonical.`);
    } else {
        console.log(`Skip: ${slug} does not exist at route level.`);
    }
}
