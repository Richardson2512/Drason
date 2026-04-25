#!/usr/bin/env node

/**
 * Superkabe MCP Server
 *
 * Connects Claude (or any MCP-compatible AI agent) to the Superkabe cold email platform.
 * Runs over stdio transport. Authenticated via SUPERKABE_API_KEY environment variable.
 *
 * Usage:
 *   SUPERKABE_API_KEY=sk_live_... SUPERKABE_API_URL=https://api.superkabe.com node dist/index.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────

const API_KEY = process.env.SUPERKABE_API_KEY;
const API_URL = (process.env.SUPERKABE_API_URL || "http://localhost:4000").replace(/\/$/, "");

if (!API_KEY) {
    console.error("FATAL: SUPERKABE_API_KEY environment variable is required");
    process.exit(1);
}

// ────────────────────────────────────────────────────────────────────
// HTTP client
// ────────────────────────────────────────────────────────────────────

async function api(method: string, path: string, body?: unknown): Promise<any> {
    const url = `${API_URL}/api/v1${path}`;
    const headers: Record<string, string> = {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
    };

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json?.error || `API returned ${res.status}`);
    }

    return json;
}

function formatJson(data: unknown): string {
    return JSON.stringify(data, null, 2);
}

function textResult(text: string): { content: { type: "text"; text: string }[] } {
    return { content: [{ type: "text" as const, text }] };
}

function errorResult(error: unknown): { content: { type: "text"; text: string }[]; isError: true } {
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
}

// ────────────────────────────────────────────────────────────────────
// Server
// ────────────────────────────────────────────────────────────────────

const server = new McpServer(
    { name: "superkabe", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: get_account
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "get_account",
    {
        title: "Get Account Info",
        description: "Get Superkabe account information including current plan, usage counts, and tier limits. Use this first to understand the user's account state.",
    },
    async () => {
        try {
            const result = await api("GET", "/account");
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: import_leads
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "import_leads",
    {
        title: "Import Leads",
        description: "Import a list of leads into Superkabe. Each lead must have an email. Returns created/duplicate/error counts and lead IDs for use in campaigns.",
        inputSchema: z.object({
            leads: z.array(z.object({
                email: z.string().describe("Lead email address (required)"),
                persona: z.string().optional().describe("Lead persona/role e.g. 'cto', 'founder', 'marketing'"),
                source: z.string().optional().describe("Where this lead came from e.g. 'zoominfo', 'apollo', 'manual'"),
                lead_score: z.number().optional().describe("Lead score 0-100, defaults to 50"),
            })).describe("Array of leads to import (max 5000)"),
        }),
    },
    async ({ leads }) => {
        try {
            const result = await api("POST", "/leads/bulk", { leads });
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: list_leads
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "list_leads",
    {
        title: "List Leads",
        description: "List leads in Superkabe with optional filters. Returns paginated results with lead details, validation status, and engagement stats.",
        inputSchema: z.object({
            page: z.number().optional().describe("Page number (default 1)"),
            limit: z.number().optional().describe("Results per page, max 100 (default 50)"),
            status: z.string().optional().describe("Filter by status: held, active, paused, blocked"),
            validation_status: z.string().optional().describe("Filter by validation: valid, risky, invalid, unknown, pending"),
            search: z.string().optional().describe("Search by email address"),
        }),
    },
    async ({ page, limit, status, validation_status, search }) => {
        try {
            const params = new URLSearchParams();
            if (page) params.set("page", String(page));
            if (limit) params.set("limit", String(limit));
            if (status) params.set("status", status);
            if (validation_status) params.set("validation_status", validation_status);
            if (search) params.set("search", search);
            const qs = params.toString();
            const result = await api("GET", `/leads${qs ? `?${qs}` : ""}`);
            return textResult(formatJson({ data: result.data, meta: result.meta }));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: get_lead
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "get_lead",
    {
        title: "Get Lead Details",
        description: "Get full details for a single lead by ID, including validation results and engagement history.",
        inputSchema: z.object({
            lead_id: z.string().describe("The lead ID"),
        }),
    },
    async ({ lead_id }) => {
        try {
            const result = await api("GET", `/leads/${lead_id}`);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: validate_leads
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "validate_leads",
    {
        title: "Validate Lead Emails",
        description: "Trigger email validation on a set of leads. Provide either lead IDs or email addresses. Validation runs asynchronously — use list_leads to check results after a few seconds.",
        inputSchema: z.object({
            lead_ids: z.array(z.string()).optional().describe("Array of lead IDs to validate"),
            emails: z.array(z.string()).optional().describe("Array of email addresses to validate (must already exist in Superkabe)"),
        }),
    },
    async ({ lead_ids, emails }) => {
        try {
            const body: any = {};
            if (lead_ids && lead_ids.length > 0) body.lead_ids = lead_ids;
            else if (emails && emails.length > 0) body.emails = emails;
            else return errorResult("Provide either lead_ids or emails");
            const result = await api("POST", "/leads/validate", body);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: get_validation_results
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "get_validation_results",
    {
        title: "Get Validation Analytics",
        description: "Get email validation analytics — total validated count and breakdown by status (valid, risky, invalid, unknown).",
    },
    async () => {
        try {
            const result = await api("GET", "/validation/results");
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: create_campaign
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "create_campaign",
    {
        title: "Create Campaign",
        description: "Create a new email campaign with sequence steps and optionally assign leads. Each step is an email in the sequence. Returns the campaign ID.",
        inputSchema: z.object({
            name: z.string().describe("Campaign name"),
            steps: z.array(z.object({
                subject: z.string().describe("Email subject line. Can use {{first_name}}, {{company}} etc."),
                body_html: z.string().describe("Email body as HTML. Can use {{first_name}}, {{company}} etc."),
                body_text: z.string().optional().describe("Plain text version of the email body"),
                delay_days: z.number().optional().describe("Days to wait before sending this step (0 for first step, default 2)"),
                delay_hours: z.number().optional().describe("Additional hours to wait"),
                variants: z.array(z.object({
                    label: z.string().optional().describe("Variant label e.g. 'A', 'B'"),
                    subject: z.string().describe("Variant subject line"),
                    body_html: z.string().describe("Variant body HTML"),
                    weight: z.number().optional().describe("A/B split weight percentage (default 50)"),
                })).optional().describe("A/B test variants for this step"),
            })).describe("Email sequence steps (at least 1)"),
            lead_ids: z.array(z.string()).optional().describe("Lead IDs to assign to this campaign"),
            schedule: z.object({
                timezone: z.string().optional().describe("IANA timezone e.g. 'America/New_York' (default UTC)"),
                start_time: z.string().optional().describe("Daily send window start e.g. '09:00' (default 09:00)"),
                end_time: z.string().optional().describe("Daily send window end e.g. '17:00' (default 17:00)"),
                days: z.array(z.string()).optional().describe("Active days e.g. ['mon','tue','wed','thu','fri']"),
                daily_limit: z.number().optional().describe("Max emails per day (default 50)"),
                send_gap_minutes: z.number().optional().describe("Minutes between each email per mailbox (default 17). Higher = more natural to spam filters"),
            }).optional().describe("Campaign schedule settings"),
        }),
    },
    async ({ name, steps, lead_ids, schedule }) => {
        try {
            const result = await api("POST", "/campaigns", { name, steps, lead_ids, schedule });
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: list_campaigns
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "list_campaigns",
    {
        title: "List Campaigns",
        description: "List all email campaigns with their status, lead count, step count, and schedule info.",
    },
    async () => {
        try {
            const result = await api("GET", "/campaigns");
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: get_campaign
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "get_campaign",
    {
        title: "Get Campaign Details",
        description: "Get full details of a campaign including all sequence steps, variants, and the first 100 assigned leads.",
        inputSchema: z.object({
            campaign_id: z.string().describe("The campaign ID"),
        }),
    },
    async ({ campaign_id }) => {
        try {
            const result = await api("GET", `/campaigns/${campaign_id}`);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: update_campaign
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "update_campaign",
    {
        title: "Update Campaign",
        description: "Update a campaign's name, schedule, or daily limit. Campaign must be paused or in draft — cannot update while active.",
        inputSchema: z.object({
            campaign_id: z.string().describe("The campaign ID"),
            name: z.string().optional().describe("New campaign name"),
            daily_limit: z.number().optional().describe("New daily send limit"),
            schedule_timezone: z.string().optional().describe("New timezone"),
            schedule_start_time: z.string().optional().describe("New send window start e.g. '09:00'"),
            schedule_end_time: z.string().optional().describe("New send window end e.g. '17:00'"),
            schedule_days: z.array(z.string()).optional().describe("New active days"),
        }),
    },
    async ({ campaign_id, ...updates }) => {
        try {
            const result = await api("PATCH", `/campaigns/${campaign_id}`, updates);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: launch_campaign
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "launch_campaign",
    {
        title: "Launch Campaign",
        description: "Launch a campaign to start sending emails. The campaign must have at least one sequence step and one assigned lead.",
        inputSchema: z.object({
            campaign_id: z.string().describe("The campaign ID to launch"),
        }),
    },
    async ({ campaign_id }) => {
        try {
            const result = await api("POST", `/campaigns/${campaign_id}/launch`);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: pause_campaign
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "pause_campaign",
    {
        title: "Pause Campaign",
        description: "Pause an active campaign to stop sending. Can be resumed later by launching again.",
        inputSchema: z.object({
            campaign_id: z.string().describe("The campaign ID to pause"),
        }),
    },
    async ({ campaign_id }) => {
        try {
            const result = await api("POST", `/campaigns/${campaign_id}/pause`);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: get_campaign_report
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "get_campaign_report",
    {
        title: "Get Campaign Report",
        description: "Get performance metrics for a campaign: total leads, emails sent, replies, reply rate, and lead status breakdown.",
        inputSchema: z.object({
            campaign_id: z.string().describe("The campaign ID"),
        }),
    },
    async ({ campaign_id }) => {
        try {
            const result = await api("GET", `/campaigns/${campaign_id}/report`);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: get_campaign_replies
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "get_campaign_replies",
    {
        title: "Get Campaign Replies",
        description: "List all replies received for a campaign. Shows contact email, name, subject, body, and when the reply was received.",
        inputSchema: z.object({
            campaign_id: z.string().describe("The campaign ID"),
        }),
    },
    async ({ campaign_id }) => {
        try {
            const result = await api("GET", `/campaigns/${campaign_id}/replies`);
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: send_reply
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "send_reply",
    {
        title: "Send Reply",
        description: "Send a reply to a lead through a connected mailbox. Requires a thread_id from get_campaign_replies. The reply is sent from the original mailbox that received the inbound message.",
        inputSchema: z.object({
            thread_id: z.string().describe("The email thread ID to reply to"),
            body_html: z.string().optional().describe("Reply body as HTML"),
            body_text: z.string().optional().describe("Reply body as plain text (used if body_html not provided)"),
        }),
    },
    async ({ thread_id, body_html, body_text }) => {
        try {
            const result = await api("POST", "/replies", { thread_id, body_html, body_text });
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: list_mailboxes
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "list_mailboxes",
    {
        title: "List Mailboxes",
        description: "List all mailboxes in your Superkabe account with their health status, send counts, bounce counts, warmup status, and recovery phase.",
    },
    async () => {
        try {
            const result = await api("GET", "/mailboxes");
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ════════════════════════════════════════════════════════════════════
// TOOL: list_domains
// ════════════════════════════════════════════════════════════════════

server.registerTool(
    "list_domains",
    {
        title: "List Domains",
        description: "List all domains in your Superkabe account with their health status, bounce rate trends, engagement stats, and recovery phase.",
    },
    async () => {
        try {
            const result = await api("GET", "/domains");
            return textResult(formatJson(result.data));
        } catch (e) { return errorResult(e); }
    }
);

// ────────────────────────────────────────────────────────────────────
// Start
// ────────────────────────────────────────────────────────────────────

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Superkabe MCP Server v1.0.0 connected (${API_URL})`);
}

main().catch((err) => {
    console.error("Fatal error starting Superkabe MCP server:", err);
    process.exit(1);
});
