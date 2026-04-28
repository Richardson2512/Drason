import { MetadataRoute } from 'next';

const publicAllow = ['/', '/docs/', '/blog/', '/product/', '/guides/', '/tools/', '/infrastructure-playbook', '/pricing', '/open-source', '/privacy', '/terms'];
const privateDisallow = ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: privateDisallow,
            },
            // Major AI crawlers — explicitly allowed on all public content
            ...[
                'GPTBot',           // OpenAI training crawler
                'OAI-SearchBot',    // OpenAI live-search crawler (ChatGPT browsing) — separate from GPTBot
                'ChatGPT-User',     // OpenAI on-demand fetcher when a user asks ChatGPT to read a URL
                'Google-Extended',  // Google Gemini
                'ClaudeBot',        // Anthropic Claude training
                'Claude-Web',       // Anthropic Claude live-fetch
                'PerplexityBot',    // Perplexity AI
                'Perplexity-User',  // Perplexity on-demand fetcher
                'Bingbot',          // Microsoft Copilot / Bing
                'Applebot-Extended', // Apple Intelligence
                'Amazonbot',        // Amazon Alexa AI
                'meta-externalagent', // Meta AI (Llama)
                'YouBot',           // You.com AI search
                'cohere-ai',        // Cohere enterprise AI
                'Bytespider',       // ByteDance / TikTok AI
            ].map(bot => ({
                userAgent: bot,
                allow: publicAllow,
                disallow: privateDisallow,
            })),
        ],
        sitemap: 'https://www.superkabe.com/sitemap.xml',
    };
}
