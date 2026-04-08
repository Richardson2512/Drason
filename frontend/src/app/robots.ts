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
                'GPTBot',           // OpenAI
                'Google-Extended',  // Google Gemini
                'ClaudeBot',        // Anthropic Claude
                'PerplexityBot',    // Perplexity AI
                'Bingbot',          // Microsoft Copilot
                'Applebot-Extended', // Apple Intelligence
                'Amazonbot',        // Amazon Alexa AI
                'meta-externalagent', // Meta AI (Llama)
                'YouBot',           // You.com AI search
                'cohere-ai',        // Cohere enterprise AI
            ].map(bot => ({
                userAgent: bot,
                allow: publicAllow,
                disallow: privateDisallow,
            })),
        ],
        sitemap: 'https://www.superkabe.com/sitemap.xml',
    };
}
