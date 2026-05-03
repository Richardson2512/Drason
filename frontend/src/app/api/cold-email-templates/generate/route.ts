/**
 * POST /api/cold-email-templates/generate
 *
 * Generates a customized cold email using OpenAI gpt-4.1-mini.
 *
 * Two modes:
 *   1. customize  — adapt an existing library template to the user's context
 *   2. standalone — generate a fresh email from scratch (no template basis)
 *
 * Returns a streaming text/event-stream response so the UI can render tokens
 * as they arrive. Rate-limited to GUEST_DAILY_LIMIT generations per day per
 * (cookie + IP), reset at UTC midnight.
 */

import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import {
    checkAndConsume,
    clientIpFromHeaders,
    GUEST_DAILY_LIMIT,
} from '@/lib/aiGenerationRateLimit';
import { getTemplateBySlug, type ColdEmailTemplate } from '@/data/coldEmailTemplates';

/**
 * Server-side check for the presence of the `token` auth cookie. We don't
 * verify the JWT here — backend revalidates on every real product action.
 * This only gates the guest rate limiter: if a user is authenticated they
 * get unlimited generations, otherwise they get GUEST_DAILY_LIMIT/day.
 */
function hasAuthCookie(cookieHeader: string | null | undefined): boolean {
    if (!cookieHeader) return false;
    for (const part of cookieHeader.split(';')) {
        const [name, value] = part.trim().split('=');
        if (name === 'token' && value && value.length > 0) return true;
    }
    return false;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============================================================================
// SCHEMA
// ============================================================================

interface CustomizeRequest {
    mode: 'customize';
    templateSlug: string;
    yourCompany: string;          // "what your company does"
    yourValueProp: string;        // one-line value prop
    targetIndustry?: string;
    targetRole?: string;
    tone?: string;
}

interface StandaloneRequest {
    mode: 'standalone';
    goal: string;                 // introduction, follow-up, breakup, etc.
    framework?: string;           // aida, pas, bab, qvc, etc.
    yourCompany: string;
    yourValueProp: string;
    targetIndustry?: string;
    targetRole?: string;
    tone?: string;
    length?: 'micro' | 'short' | 'medium';
}

type GenerateRequest = CustomizeRequest | StandaloneRequest;

// ============================================================================
// VALIDATION
// ============================================================================

const FIELD_MAX = 280;

function sanitize(value: unknown): string {
    if (typeof value !== 'string') return '';
    // Trim, collapse whitespace, hard cap length to prevent prompt-injection bombs.
    return value.trim().replace(/\s+/g, ' ').slice(0, FIELD_MAX);
}

function validate(body: unknown): { ok: true; data: GenerateRequest } | { ok: false; error: string } {
    if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body' };
    const b = body as Record<string, unknown>;
    const mode = b.mode;

    const yourCompany = sanitize(b.yourCompany);
    const yourValueProp = sanitize(b.yourValueProp);
    if (!yourCompany || yourCompany.length < 3) return { ok: false, error: 'yourCompany is required (min 3 chars)' };
    if (!yourValueProp || yourValueProp.length < 5) return { ok: false, error: 'yourValueProp is required (min 5 chars)' };

    const common = {
        yourCompany,
        yourValueProp,
        targetIndustry: sanitize(b.targetIndustry) || undefined,
        targetRole: sanitize(b.targetRole) || undefined,
        tone: sanitize(b.tone) || undefined,
    };

    if (mode === 'customize') {
        const templateSlug = sanitize(b.templateSlug);
        if (!templateSlug) return { ok: false, error: 'templateSlug is required' };
        const template = getTemplateBySlug(templateSlug);
        if (!template) return { ok: false, error: 'Template not found' };
        return { ok: true, data: { mode: 'customize', templateSlug, ...common } };
    }

    if (mode === 'standalone') {
        const goal = sanitize(b.goal);
        if (!goal) return { ok: false, error: 'goal is required' };
        const length = b.length === 'micro' || b.length === 'short' || b.length === 'medium'
            ? b.length : undefined;
        return {
            ok: true,
            data: {
                mode: 'standalone',
                goal,
                framework: sanitize(b.framework) || undefined,
                length,
                ...common,
            },
        };
    }

    return { ok: false, error: 'Invalid mode (must be "customize" or "standalone")' };
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

const SYSTEM_PROMPT = `You are an expert cold email copywriter. You write short, direct, high-reply-rate cold emails for B2B audiences.

Rules you MUST follow:
- Total length: under the requested word count.
- No "I hope this finds you well", no "I wanted to reach out", no filler openers.
- Be specific. Use the user's value prop verbatim where it fits naturally.
- Personalization tokens: use {{first_name}}, {{company}}, {{title}}, and {{custom.X}} for custom fields. Do NOT invent placeholder names — use the tokens.
- Single low-friction CTA at the end.
- No spammy language ("limited time", "act now", excessive exclamations).
- Output format must be EXACTLY:

SUBJECT: <subject line, under 60 chars>

BODY:
<email body with line breaks>

Do not output anything before SUBJECT: or after the body. No commentary.`;

function buildCustomizePrompt(req: CustomizeRequest, template: ColdEmailTemplate): string {
    return `Customize this cold email template for the user's specific context.

ORIGINAL TEMPLATE:
Subject: ${template.subject}
Body:
${template.body}

ORIGINAL PROMPT THAT BUILT IT:
${template.prompt}

USER CONTEXT:
- What the user's company does: ${req.yourCompany}
- One-line value proposition: ${req.yourValueProp}
- Target industry: ${req.targetIndustry || 'not specified'}
- Target role: ${req.targetRole || 'not specified'}
- Tone preference: ${req.tone || template.tone}

Adapt the original template to the user's context. Keep the structure, framework, and approach of the original. Replace the generic placeholders with the user's actual value prop and target context. Keep it under ${template.length === 'micro' ? '50' : template.length === 'short' ? '120' : '180'} words.`;
}

function buildStandalonePrompt(req: StandaloneRequest): string {
    const lengthGuide = req.length === 'micro' ? '50' : req.length === 'medium' ? '180' : '120';
    return `Write a cold email from scratch for this user's specific context.

GOAL: ${req.goal}
${req.framework ? `FRAMEWORK: Use the ${req.framework} framework.` : ''}

USER CONTEXT:
- What the user's company does: ${req.yourCompany}
- One-line value proposition: ${req.yourValueProp}
- Target industry: ${req.targetIndustry || 'general B2B'}
- Target role: ${req.targetRole || 'decision maker'}
- Tone: ${req.tone || 'direct and professional'}

Keep it under ${lengthGuide} words. Single low-friction CTA at the end. Use personalization tokens ({{first_name}}, {{company}}, etc.) for any names or specifics.`;
}

// ============================================================================
// HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
    // 1. Validate input
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return jsonError(400, 'Invalid JSON body');
    }
    const validation = validate(body);
    if (!validation.ok) return jsonError(400, validation.error);
    const data = validation.data;

    // 2. Check rate limit (cookie + IP fallback) — but skip entirely for
    //    signed-in users. The presence of the auth `token` cookie is enough
    //    here; backend revalidates auth on any actual product action. We're
    //    only deciding whether to apply the guest quota.
    const cookieHeader = request.headers.get('cookie');
    const ip = clientIpFromHeaders(request.headers);
    const isAuthed = hasAuthCookie(cookieHeader);

    let limit: ReturnType<typeof checkAndConsume> | null = null;
    if (!isAuthed) {
        limit = checkAndConsume(cookieHeader, ip);
        if (!limit.allowed) {
            return new Response(
                JSON.stringify({
                    error: limit.reason || 'Rate limit exceeded',
                    code: 'RATE_LIMITED',
                    resetAt: limit.resetAt,
                    limit: GUEST_DAILY_LIMIT,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Reset': String(Math.floor(limit.resetAt / 1000)),
                    },
                },
            );
        }
    }

    // 3. Build prompt
    let userPrompt: string;
    if (data.mode === 'customize') {
        const template = getTemplateBySlug(data.templateSlug);
        if (!template) return jsonError(404, 'Template not found');
        userPrompt = buildCustomizePrompt(data, template);
    } else {
        userPrompt = buildStandalonePrompt(data);
    }

    // 4. Verify OpenAI key configured
    if (!process.env.OPENAI_API_KEY) {
        return jsonError(503, 'AI generation is not configured. Please set OPENAI_API_KEY.');
    }

    // 5. Stream from OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
    try {
        stream = await openai.chat.completions.create({
            model: process.env.OPENAI_GENERATE_MODEL || 'gpt-4.1-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 600,
            stream: true,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'OpenAI request failed';
        return jsonError(502, `Generation failed: ${msg}`);
    }

    // 6. Pipe the stream as text/event-stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            // Send initial metadata frame so the client can render quota info.
            // For authed users, signal "unlimited" so the UI hides quota chips.
            const meta = limit
                ? {
                      authed: false,
                      remaining: limit.remaining,
                      limit: GUEST_DAILY_LIMIT,
                      resetAt: limit.resetAt,
                  }
                : {
                      authed: true,
                      remaining: -1,
                      limit: -1,
                      resetAt: 0,
                  };
            controller.enqueue(encoder.encode(`event: meta\ndata: ${JSON.stringify(meta)}\n\n`));

            try {
                for await (const chunk of stream) {
                    const delta = chunk.choices[0]?.delta?.content;
                    if (delta) {
                        controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ delta })}\n\n`));
                    }
                }
                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'stream error';
                controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: msg })}\n\n`));
            } finally {
                controller.close();
            }
        },
    });

    const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // disable proxy buffering
    });
    if (limit?.setCookie) headers.append('Set-Cookie', limit.setCookie);

    return new Response(readable, { status: 200, headers });
}

function jsonError(status: number, error: string): Response {
    return new Response(JSON.stringify({ error }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
