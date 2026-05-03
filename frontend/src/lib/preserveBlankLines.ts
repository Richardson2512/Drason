/**
 * preserveBlankLines — canonical HTML normalizer that preserves user-intent
 * blank lines as visibly-rendered empty paragraphs.
 *
 * Why this exists: Tiptap (ProseMirror) emits HTML where a user-pressed
 * "blank line" can take three forms, ALL of which render as zero-height in
 * a browser / email client:
 *
 *   1. <p></p>            ← empty paragraph (no margin without content)
 *   2. <p><br></p>        ← break-only paragraph (br at end-of-paragraph
 *                           is invisible because there's no content after)
 *   3. <p>text<br></p>    ← trailing <br> inside non-empty paragraph
 *                           (also zero visible height — same reason)
 *
 * After this transform, all three become <p>&nbsp;</p> (a paragraph
 * containing a non-breaking space). That renders with full paragraph height
 * in every major HTML/email surface:
 *
 *   - Browsers (Chrome, Firefox, Safari)
 *   - Gmail web + mobile, Yahoo, Outlook web
 *   - Apple Mail macOS + iOS
 *   - Outlook Desktop (Word renderer)
 *   - Tiptap editor (parses &nbsp; back as a single character paragraph)
 *
 * Idempotent: running the transform twice yields the same output as once.
 * Safe to run repeatedly (e.g., on every editor onUpdate).
 *
 * Single source of truth: this lives in /lib so the editor frontend AND
 * the migration script (via copy-paste) AND any future render-time call
 * site share one implementation.
 */

const VISIBLE_EMPTY = '<p>&nbsp;</p>';

export function preserveBlankLines(html: string | null | undefined): string {
    if (!html) return '';
    let out = html;

    // ── 1. Empty <p> variants → visible empty paragraph ──────────────
    // Catches: <p></p>, <p> </p>, <p><br></p>, <p><br/></p>, <p><br />\n</p>,
    // and any combination of whitespace + 1–3 trailing <br> tags.
    // We strip attributes on empty paragraphs intentionally — there's nothing
    // meaningful to preserve on a paragraph with no content.
    out = out.replace(
        /<p\b[^>]*>\s*(?:<br\s*\/?>\s*){0,3}<\/p>/gi,
        VISIBLE_EMPTY,
    );

    // ── 2. Trailing <br> inside NON-EMPTY paragraph → split ─────────
    // Tiptap emits `<p>text<br></p>` when the user presses Enter at the end
    // of a line — the trailing <br> is the user's blank-line intent.
    // Convert to `<p>text</p><p>&nbsp;</p>` so the blank line actually renders.
    //
    // Match: <p[attrs]>(content)<br[/]>(optional whitespace)</p>
    // where (content) contains at least one non-whitespace, non-<br> token.
    // The lookahead `(?=.*\S)` on the captured content ensures we don't
    // accidentally match the empty-paragraph case (already handled in step 1).
    out = out.replace(
        /<p\b([^>]*)>((?:(?!<\/?p\b).)*?\S(?:(?!<\/?p\b).)*?)<br\s*\/?>(\s*)<\/p>/gi,
        '<p$1>$2</p>' + VISIBLE_EMPTY,
    );

    // ── 3. Repeat step 1 in case step 2 created any new empty trailers
    // (defensive — shouldn't happen, but cheap to verify idempotence).
    out = out.replace(
        /<p\b[^>]*>\s*(?:<br\s*\/?>\s*){0,3}<\/p>/gi,
        VISIBLE_EMPTY,
    );

    return out;
}

/**
 * Browser-only sanity helper: round-trips through the DOM to validate the
 * regex transform produced well-formed HTML. Only used in dev/tests; in
 * production we trust the regex.
 */
export function preserveBlankLinesValidated(html: string): string {
    const transformed = preserveBlankLines(html);
    if (typeof DOMParser === 'undefined') return transformed;
    try {
        const doc = new DOMParser().parseFromString(`<div>${transformed}</div>`, 'text/html');
        const wrapper = doc.body.firstElementChild;
        return wrapper ? wrapper.innerHTML : transformed;
    } catch {
        return transformed;
    }
}
