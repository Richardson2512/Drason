/**
 * Free-email-provider denylist used client-side at signup. The list MUST
 * stay in sync with the backend copy at
 * `Drason-backend-staging/src/constants/freeEmailDomains.ts` so the user
 * never sees a server-side rejection that the form didn't warn them about.
 *
 * Server-side is the authoritative gate; this is just for instant feedback.
 */

export const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
    // Google
    'gmail.com',
    'googlemail.com',
    // Microsoft / Outlook
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'hotmail.co.uk',
    'outlook.co.uk',
    'hotmail.fr',
    'live.fr',
    'hotmail.de',
    'live.de',
    'hotmail.it',
    'hotmail.es',
    'live.com.au',
    // Yahoo
    'yahoo.com',
    'yahoo.co.uk',
    'yahoo.fr',
    'yahoo.de',
    'yahoo.it',
    'yahoo.es',
    'yahoo.ca',
    'yahoo.com.au',
    'yahoo.co.in',
    'yahoo.co.jp',
    'ymail.com',
    'rocketmail.com',
    // Apple
    'icloud.com',
    'me.com',
    'mac.com',
    // AOL
    'aol.com',
    'aim.com',
    // Other major consumer providers
    'protonmail.com',
    'proton.me',
    'pm.me',
    'tutanota.com',
    'tutanota.de',
    'gmx.com',
    'gmx.de',
    'gmx.net',
    'gmx.at',
    'gmx.ch',
    'web.de',
    't-online.de',
    'mail.ru',
    'yandex.com',
    'yandex.ru',
    'rambler.ru',
    'qq.com',
    '163.com',
    '126.com',
    'sina.com',
    'naver.com',
    'daum.net',
    'hanmail.net',
    'zoho.com',
    'fastmail.com',
    'fastmail.fm',
    'inbox.com',
]);

export function isFreeEmailDomain(email: string): boolean {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    const at = trimmed.lastIndexOf('@');
    if (at <= 0 || at === trimmed.length - 1) return false;
    return FREE_EMAIL_DOMAINS.has(trimmed.slice(at + 1));
}
