import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'],
            },
            {
                userAgent: 'GPTBot',
                allow: ['/docs/', '/blog/', '/product/', '/infrastructure-playbook', '/pricing', '/open-source'],
                disallow: ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'],
            },
            {
                userAgent: 'Google-Extended',
                allow: ['/docs/', '/blog/', '/product/', '/infrastructure-playbook', '/pricing', '/open-source'],
                disallow: ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/docs/', '/blog/', '/product/', '/infrastructure-playbook', '/pricing', '/open-source'],
                disallow: ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/docs/', '/blog/', '/product/', '/infrastructure-playbook', '/pricing', '/open-source'],
                disallow: ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'],
            },
            {
                userAgent: 'Bingbot',
                allow: ['/docs/', '/blog/', '/product/', '/infrastructure-playbook', '/pricing', '/open-source'],
                disallow: ['/dashboard/', '/api/', '/login', '/signup', '/onboarding'],
            },
        ],
        sitemap: 'https://www.superkabe.com/sitemap.xml',
    };
}
