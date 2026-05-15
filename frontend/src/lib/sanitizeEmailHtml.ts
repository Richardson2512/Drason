/**
 * Shared HTML sanitizer for email-body rendering.
 *
 * Used wherever the dashboard pipes an untrusted (inbound reply) or
 * partially-trusted (operator-authored or AI-generated) HTML body into
 * `dangerouslySetInnerHTML`. The strict profile keeps text formatting +
 * links + images and strips every script vector - event handlers, style
 * tags, inline JS schemes - so a phishing-shaped reply or a coworker's
 * cheeky template can't pop a prompt in another user's browser.
 *
 * Call sites that must use this:
 *   - app/dashboard/sequencer/unibox  (inbound replies - highest risk)
 *   - components/sequencer/SequencesTab  (AI-generated sequence steps)
 *   - components/sequencer/AIAssistPanel  (AI email previews)
 *   - app/dashboard/sequencer/templates (template card previews)
 *
 * DO NOT inline a different sanitizer in any of those - keep this central.
 */

import DOMPurify from 'isomorphic-dompurify';

const PURIFY_OPTIONS = {
    ALLOWED_TAGS: [
        'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'table',
        'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul', 'blockquote', 'code',
    ],
    ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'style', 'class', 'width', 'height',
        'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
        'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
        'button', 'meta', 'link',
    ],
    FORBID_ATTR: [
        'onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur',
        'onchange', 'onsubmit', 'formaction',
    ],
    ADD_ATTR: ['target', 'rel'],
};

export function sanitizeEmailHtml(html: string | null | undefined): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, PURIFY_OPTIONS);
}
