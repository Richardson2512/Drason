const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../src/app/dashboard/settings/page.tsx');
let lines = fs.readFileSync(pageFile, 'utf8').split('\n');

function replaceBlock(startComment, replacementString) {
    let startIndex = lines.findIndex(l => l.includes(startComment));
    if (startIndex === -1) return false;

    // Find the opening tag of the block right after the comment
    let openIndex = startIndex + 1;
    while (!lines[openIndex].includes('<div') && !lines[openIndex].includes('{activeIntegration')) {
        openIndex++;
    }

    let stack = 0;
    let foundStart = false;
    let i = openIndex;

    // If it's a dynamic block like {activeIntegration === 'emailbison' && ( <div... 
    let isDynamic = lines[openIndex].includes('{');

    for (; i < lines.length; i++) {
        const str = lines[i];

        // Count { and } or <div and </div depending on block type
        if (isDynamic) {
            stack += (str.match(/\{/g) || []).length;
            stack -= (str.match(/\}/g) || []).length;

            if (stack > 0) foundStart = true;
            if (foundStart && stack === 0) break;
        } else {
            // For JSX tags, we count the opening and closing matching.
            // But actually, just relying on indentation or a simple regex is safer.
            // Wait, for <div style={{ background: '#FFFFFF' }}>, counting <div and </div works.
            stack += (str.match(/<div/g) || []).length;
            stack -= (str.match(/<\/div>/g) || []).length;

            if (stack > 0) foundStart = true;
            if (foundStart && stack === 0) break;
        }
    }

    if (i < lines.length) {
        // We found the end!
        lines.splice(startIndex, i - startIndex + 1, replacementString);
        return true;
    }
    return false;
}

replaceBlock('{/* System Mode Control - Phase 5 */}', '                        <SystemModeCard />');
replaceBlock('{/* Slack Integration */}', '                        <SlackIntegrationCard />');
// EmailBison is wrapped in {activeIntegration === 'emailbison' && ( ... )}
replaceBlock('{/* EmailBison Integration */}', '                        {activeIntegration === "emailbison" && <EmailBisonCard />}');

// Insert imports
const importIndex = lines.findIndex(l => l.includes("import { useRouter }"));
if (importIndex !== -1 && !lines.find(l => l.includes('SystemModeCard'))) {
    lines.splice(importIndex + 1, 0,
        "import SystemModeCard from '@/components/settings/SystemModeCard';",
        "import SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';",
        "import EmailBisonCard from '@/components/settings/EmailBisonCard';"
    );
}

// Clean up unused state manually by replacing the whole hooks
fs.writeFileSync(pageFile, lines.join('\n'));
console.log('Successfully injected modular cards into settings/page.tsx via bracket-stack parser');
