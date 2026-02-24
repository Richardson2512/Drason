const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../src/app/dashboard/settings/page.tsx');
let content = fs.readFileSync(pageFile, 'utf8');

// 1. Remove stray systemMode usage in active integrations
content = content.replace(/\{systemMode ===.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\}/gs, (match) => {
    if (match.includes('modeDescriptions')) {
        return '';
    }
    return match;
});

// Remove trailing modeDescriptions mentions
content = content.replace(/.*modeDescriptions.*/g, '');
content = content.replace(/.*systemMode.*/g, '');
content = content.replace(/.*setSystemMode.*/g, '');

// 2. Remove stray ebApiKey usages
content = content.replace(/.*ebApiKey.*/g, '');
content = content.replace(/.*handleSaveEmailBison.*/g, '');
content = content.replace(/.*setEmailBisonWebhookUrl.*/g, '');

// Ensure imports were added correctly previously
if (!content.includes('SystemModeCard')) {
    content = content.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport SystemModeCard from '@/components/settings/SystemModeCard';\nimport SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';\nimport EmailBisonCard from '@/components/settings/EmailBisonCard';");
}


// Clean up trailing empty object fragments
fs.writeFileSync(pageFile, content);
console.log('Cleaned up stray states from settings/page.tsx');
