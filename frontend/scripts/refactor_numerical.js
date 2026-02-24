const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../src/app/dashboard/settings/page.tsx');
let lines = fs.readFileSync(pageFile, 'utf8').split('\n');

// 1. Remove Slack (Lines 894 to 1084 => Index 893 to 1083)
lines.splice(893, 1083 - 893 + 1, '                    <SlackIntegrationCard />');

// 2. Remove EmailBison (Lines 660 to 728 => Index 659 to 727)
lines.splice(659, 727 - 659 + 1, '                        {activeIntegration === "emailbison" && <EmailBisonCard />}');

// 3. Remove System Mode (Lines 290 to 389 => Index 289 to 388)
lines.splice(289, 388 - 289 + 1, '                <SystemModeCard />');

// 4. Inject Imports
const importIndex = lines.findIndex(l => l.includes("import { useRouter }"));
if (importIndex !== -1) {
    lines.splice(importIndex + 1, 0,
        "import SystemModeCard from '@/components/settings/SystemModeCard';",
        "import SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';",
        "import EmailBisonCard from '@/components/settings/EmailBisonCard';"
    );
}

// 5. Clean up unused states precisely by line loops to avoid regex fragments
// systemMode
lines = lines.filter(l => !l.includes("const [systemMode, setSystemMode] = useState('observe');"));
const mdStart = lines.findIndex(l => l.includes("const modeDescriptions: Record<string"));
if (mdStart !== -1) {
    let mdEnd = mdStart;
    while (!lines[mdEnd].includes("};")) mdEnd++;
    lines.splice(mdStart, mdEnd - mdStart + 1);
}
const smStart = lines.findIndex(l => l.includes("const handleSystemModeChange = async (mode: string) => {"));
if (smStart !== -1) {
    let smEnd = smStart;
    while (!lines[smEnd].includes("};")) smEnd++;
    lines.splice(smStart, smEnd - smStart + 1);
}

// emailbison
lines = lines.filter(l => !l.includes("const [ebApiKey, setEbApiKey] = useState('');"));
lines = lines.filter(l => !l.includes("setEmailBisonWebhookUrl("));
const ebStart = lines.findIndex(l => l.includes("const handleSaveEmailBison = async"));
if (ebStart !== -1) {
    let ebEnd = ebStart;
    while (!lines[ebEnd].includes("};")) ebEnd++;
    lines.splice(ebStart, ebEnd - ebStart + 1);
}
// Delete ebKeySetting loading logic inside useEffect
const ebUseStart = lines.findIndex(l => l.includes("const ebKeySetting = settingsData.find((s: any) => s.key === 'EMAILBISON_API_KEY');"));
if (ebUseStart !== -1) {
    lines.splice(ebUseStart, 2);
}

// slack state
lines = lines.filter(l => !l.includes("const [slackConnected, setSlackConnected] = useState(false);"));
lines = lines.filter(l => !l.includes("const [slackChannels, setSlackChannels] = useState<{ id: string, name: string }[]>([]);"));
lines = lines.filter(l => !l.includes("const [slackAlertsChannel, setSlackAlertsChannel] = useState('');"));
lines = lines.filter(l => !l.includes("const [slackAlertsStatus, setSlackAlertsStatus] = useState('active');"));
lines = lines.filter(l => !l.includes("const [slackAlertsLastError, setSlackAlertsLastError] = useState('');"));
lines = lines.filter(l => !l.includes("const [slackAlertsLastErrorAt, setSlackAlertsLastErrorAt] = useState('');"));
lines = lines.filter(l => !l.includes("const [loadingChannels, setLoadingChannels] = useState(false);"));
lines = lines.filter(l => !l.includes("const [savingChannel, setSavingChannel] = useState(false);"));
lines = lines.filter(l => !l.includes("const [disconnectingSlack, setDisconnectingSlack] = useState(false);"));
lines = lines.filter(l => !l.includes("const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);"));

const slUseStart = lines.findIndex(l => l.includes("const slackSetting = settingsData.find((s: any) => s.key === 'SLACK_CONNECTED');"));
if (slUseStart !== -1) {
    lines.splice(slUseStart, 16); // Removes the whole "if (isSlackConnected)" block
}

const sluStart = lines.findIndex(l => l.includes("if (slackConnected) {"));
if (sluStart !== -1) {
    // wait, sluStart is inside a useEffect
    // Find useEffect around it
    const ueStart = sluStart - 1; // useEffect(() => {
    let ueEnd = ueStart;
    let stack = 0;
    let started = false;
    for (; ueEnd < lines.length; ueEnd++) {
        if (lines[ueEnd].includes('{')) { stack += (lines[ueEnd].match(/\{/g) || []).length; started = true; }
        if (lines[ueEnd].includes('}')) stack -= (lines[ueEnd].match(/\}/g) || []).length;
        if (started && stack === 0) break;
    }
    lines.splice(ueStart, ueEnd - ueStart + 1);
}

const slSaveStart = lines.findIndex(l => l.includes("const handleSaveSlackChannel = async"));
if (slSaveStart !== -1) {
    let smEnd = slSaveStart;
    while (!lines[smEnd].includes("};")) smEnd++;
    lines.splice(slSaveStart, smEnd - slSaveStart + 1);
}
const slDiscStart = lines.findIndex(l => l.includes("const handleDisconnectSlack = async"));
if (slDiscStart !== -1) {
    let smEnd = slDiscStart;
    while (!lines[smEnd].includes("};")) smEnd++;
    lines.splice(slDiscStart, smEnd - slDiscStart + 1);
}

fs.writeFileSync(pageFile, lines.join('\n'));
console.log('Successfully completed deterministic numerical AST reduction.');
