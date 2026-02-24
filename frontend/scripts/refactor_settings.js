const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, '../src/app/dashboard/settings/page.tsx');
let content = fs.readFileSync(pageFile, 'utf8');

// Insert imports at the top
content = content.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport SystemModeCard from '@/components/settings/SystemModeCard';\nimport SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';\nimport EmailBisonCard from '@/components/settings/EmailBisonCard';");

// 1. Remove Slack logic
content = content.replace(/const \[slackConnected.*?setMsg\(''\);\n    };\n/s, '');
content = content.replace(/const handleDisconnectSlack = async \(\) => \{.*?window.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\n    };\n/s, '');
content = content.replace(/\{\/\* Slack Integration \*\/\}.*?Slack integration disconnected successfully.*?<\/div>\n                            \)}/s, '<SlackIntegrationCard />');

// 2. Remove System Mode logic
content = content.replace(/const \[systemMode, setSystemMode\] = useState\('observe'\);/s, '');
content = content.replace(/const handleSystemModeChange = async.*?finally \{\n            setLoading\(false\);\n        \}\n    \};\n/s, '');
content = content.replace(/const modeDescriptions: Record.*?icon: '🛡️'\n        }\n    };\n/s, '');
content = content.replace(/\{\/\* System Mode Control - Phase 5 \*\/\}.*?System Mode.*?Switch to <strong.*?<\/strong> out of staging.*?<\/div>\n            \)}/s, '<SystemModeCard />');

// 3. Remove EmailBison Logic
content = content.replace(/const \[ebApiKey, setEbApiKey\] = useState\(''\);/, '');
content = content.replace(/const handleSaveEmailBison = async \(e: React.FormEvent\) => \{.*?finally \{\n            setLoading\(false\);\n        \}\n    \};\n/s, '');
content = content.replace(/\{\/\* EmailBison Integration \*\/\}.*?activeIntegration === 'emailbison'.*?EmailBison API Key.*?<\/form>\n                        \)}/s, '{ activeIntegration === "emailbison" && <EmailBisonCard /> }');

fs.writeFileSync(pageFile, content);
console.log('Successfully injected modular cards into settings/page.tsx');
