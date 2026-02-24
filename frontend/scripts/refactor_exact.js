const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../src/app/dashboard/settings/page.tsx');
let lines = fs.readFileSync(pageFile, 'utf8').split('\n');

function replaceJSXBlockByPrefix(startComment, indentStr, replacement) {
    let startIndex = lines.findIndex(l => l.includes(startComment));
    if (startIndex === -1) return false;

    // Find the end by looking for the matching indentStr + '</div>' or similar
    // We expect the immediate next line (or soon after) to be the opening tag at `indentStr`
    let openIndex = startIndex + 1;
    while (!lines[openIndex].startsWith(indentStr + '<')) {
        openIndex++;
    }

    let stack = 0;
    let i = openIndex;
    let foundStart = false;

    for (; i < lines.length; i++) {
        const line = lines[i];

        // Count all opening and closing tags roughly, but safer: count <div and </div
        // Or even simpler: if we find the exact closing tag at the exact same indentation *after* the stack has gone up and down.
        // Actually, just tracking indentation is enough for Prettier-formatted code.
        if (line.trim().startsWith('<div') || line.trim().startsWith('<form') || line.trim().startsWith('<>')) {
            stack++;
            foundStart = true;
        }
        if (line.trim().startsWith('</div') || line.trim().startsWith('</form') || line.trim().startsWith('</>')) {
            stack--;
        }

        if (foundStart && stack === 0 && line.startsWith(indentStr + '</')) {
            break;
        }
    }

    if (i < lines.length) {
        lines.splice(startIndex, i - startIndex + 1, indentStr + replacement);
        return true;
    }
    return false;
}

replaceJSXBlockByPrefix('{/* System Mode Control - Phase 5 */}', '                ', '<SystemModeCard />');

// EmailBison is wrapped in {activeIntegration === 'emailbison' && ( ... )}
// The wrapper is at 24 spaces, let's find the comment
let ebStart = lines.findIndex(l => l.includes('{/* EmailBison Integration */}'));
if (ebStart !== -1) {
    let ebEnd = ebStart;
    while (!lines[ebEnd].includes('</form>')) ebEnd++;
    // go past </form> to the closing )}
    while (!lines[ebEnd].includes(')}')) ebEnd++;
    lines.splice(ebStart, ebEnd - ebStart + 1, '                        {activeIntegration === "emailbison" && <EmailBisonCard />}');
}

// Slack is at 20 spaces
let slackStart = lines.findIndex(l => l.includes('{/* Slack Integration */}'));
if (slackStart !== -1) {
    let slackEnd = slackStart;
    // Slack ends with </div> that matches the opening <div className="col-span-1 md:col-span-2 premium-card mt-2">
    let stack = 0;
    let started = false;
    for (; slackEnd < lines.length; slackEnd++) {
        if (lines[slackEnd].includes('<div')) { stack++; started = true; }
        if (lines[slackEnd].includes('</div')) stack--;
        if (started && stack === 0) break;
    }
    lines.splice(slackStart, slackEnd - slackStart + 1, '                    <SlackIntegrationCard />');
}

// Imports
const importIndex = lines.findIndex(l => l.includes("import { useRouter }"));
if (importIndex !== -1 && !lines.find(l => l.includes('SystemModeCard'))) {
    lines.splice(importIndex + 1, 0,
        "import SystemModeCard from '@/components/settings/SystemModeCard';",
        "import SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';",
        "import EmailBisonCard from '@/components/settings/EmailBisonCard';"
    );
}

// Strip variables that cause TS Errors
// systemMode
lines = lines.filter(l => !l.includes("const [systemMode, setSystemMode] = useState('observe');"));
lines = lines.filter(l => !l.includes("const modeDescriptions: Record<string, {"));
lines = lines.filter(l => !l.includes("icon: '👀'") && !l.includes("icon: '🛡️'") && !l.includes("title: 'Observe Mode'") && !l.includes("title: 'Enforce Mode'") && !l.includes("desc: 'Risks are logged") && !l.includes("desc: 'Active protection"));
// strip handleSystemModeChange block (lines are rough)
let hmStart = lines.findIndex(l => l.includes("const handleSystemModeChange = async (mode: string) => {"));
if (hmStart !== -1) {
    let hmEnd = hmStart;
    while (!lines[hmEnd].includes("};")) hmEnd++;
    lines.splice(hmStart, hmEnd - hmStart + 1);
}

// emailbison
lines = lines.filter(l => !l.includes("const [ebApiKey, setEbApiKey] = useState('');"));
lines = lines.filter(l => !l.includes("setEmailBisonWebhookUrl("));
let ebHandleStart = lines.findIndex(l => l.includes("const handleSaveEmailBison = async"));
if (ebHandleStart !== -1) {
    let ebHandleEnd = ebHandleStart;
    while (!lines[ebHandleEnd].includes("};")) ebHandleEnd++;
    lines.splice(ebHandleStart, ebHandleEnd - ebHandleStart + 1);
}

fs.writeFileSync(pageFile, lines.join('\n'));
console.log('Successfully applied strict slicing to settings/page.tsx');
