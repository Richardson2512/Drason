const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../src/app/dashboard/settings/page.tsx');
let content = fs.readFileSync(pageFile, 'utf8');
let lines = content.split('\n');

// Import
const importIndex = lines.findIndex(l => l.includes("import { useRouter }"));
if (importIndex !== -1 && !lines.find(l => l.includes('SystemModeCard'))) {
    lines.splice(importIndex + 1, 0,
        "import SystemModeCard from '@/components/settings/SystemModeCard';",
        "import SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';",
        "import EmailBisonCard from '@/components/settings/EmailBisonCard';"
    );
}

// Re-read lines after mutating for imports to avoid index mapping hell, but actually, I will just apply blanking based on current lines array strings.
let smStart = lines.findIndex(l => l.includes('{/* System Mode Control - Phase 5 */}'));
if (smStart !== -1) {
    let smEnd = smStart;
    while (!lines[smEnd].includes('        {/* Organization Info */}')) smEnd++;
    // Blank out lines between smStart and smEnd - 2 (keeping the extra blank line)
    for (let i = smStart + 1; i < smEnd - 1; i++) {
        lines[i] = '';
    }
    lines[smStart] = '                <SystemModeCard />';
}

let ebStart = lines.findIndex(l => l.includes('{/* EmailBison Integration */}'));
if (ebStart !== -1) {
    let ebEnd = ebStart;
    while (!lines[ebEnd].includes('                        )}')) ebEnd++;
    for (let i = ebStart + 1; i <= ebEnd; i++) {
        lines[i] = '';
    }
    lines[ebStart] = '                        {activeIntegration === "emailbison" && <EmailBisonCard />}';
}

let slackStart = lines.findIndex(l => l.includes('{/* Slack Integration */}'));
if (slackStart !== -1) {
    let slackEnd = slackStart;
    while (!lines[slackEnd].includes('{/* Sync Progress Modal */}')) slackEnd++;

    // Reverse find the last 3 closing divs to be 100% safe
    // Actually, earlier I noted the exact trailing structural lines:
    // 1084:                 </div>
    // 1085:             </div>
    // 1086: 
    // 1087:             {/* Sync Progress Modal */}
    // We only want to blank up to 1083 (the end of the Slack container)!
    // slackEnd is currently at 1087. We want to stop blanking at slackEnd - 4.
    for (let i = slackStart + 1; i <= slackEnd - 4; i++) {
        lines[i] = '';
    }
    lines[slackStart] = '                    <SlackIntegrationCard />';
}

fs.writeFileSync(pageFile, lines.join('\n'));
console.log('Successfully ran foolproof array blanking script.');
