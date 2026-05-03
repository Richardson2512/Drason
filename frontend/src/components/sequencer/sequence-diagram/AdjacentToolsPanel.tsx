'use client';

import Image from 'next/image';
import { ExternalLink, Phone, Linkedin } from 'lucide-react';

/**
 * Side panel showing adjacent tools the user can hand off to AFTER the
 * Superkabe email sequence completes — calls, LinkedIn outreach, etc.
 *
 * Architectural note: these are NOT sequence steps. Superkabe is email-only
 * by design. JustCall handles phone follow-ups; HeyReach handles LinkedIn
 * outreach. They run alongside the email sequence, not inside it.
 *
 * V1 reads org-level connection status — when an integration is connected,
 * the panel shows it as "available for handoff". When not connected, shows
 * a "Connect" CTA.
 */

interface AdjacentTool {
    name: string;
    label: string;
    description: string;
    logo: string;
    icon?: React.ReactNode;
    channel: string;
    connected: boolean;
    /** Where to go to connect / configure */
    settingsHref: string;
}

interface AdjacentToolsPanelProps {
    /** Map of integration name → connected boolean (read from org settings). */
    connectionStatus?: Record<string, boolean>;
}

export default function AdjacentToolsPanel({ connectionStatus = {} }: AdjacentToolsPanelProps) {
    const tools: AdjacentTool[] = [
        {
            name: 'justcall',
            label: 'JustCall',
            channel: 'Voice / SMS',
            description: 'Trigger calls or SMS as a follow-up after the email sequence.',
            logo: '/logos/justcall-icon.png',
            icon: <Phone size={11} strokeWidth={2} />,
            connected: !!connectionStatus.justcall,
            settingsHref: '/dashboard/integrations',
        },
        {
            name: 'heyreach',
            label: 'HeyReach',
            channel: 'LinkedIn',
            description: 'Continue outreach via LinkedIn DMs and connection requests.',
            logo: '/logos/heyreach-icon.png',
            icon: <Linkedin size={11} strokeWidth={2} />,
            connected: !!connectionStatus.heyreach,
            settingsHref: '/dashboard/integrations',
        },
    ];

    return (
        <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #D1CBC5' }}>
            <div className="mb-3">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#6B5E4F]">
                    Adjacent Tools
                </h3>
                <p className="text-[11px] text-[#6B5E4F] mt-0.5 leading-relaxed">
                    Superkabe is email-only by design. Hand off to these tools for follow-ups in other channels.
                </p>
            </div>

            <div className="space-y-2">
                {tools.map((tool) => (
                    <div
                        key={tool.name}
                        className="rounded-lg p-3 flex items-start gap-3"
                        style={{
                            background: tool.connected ? '#F7F2EB' : '#FBFAF7',
                            border: '1px solid #E8E3DC',
                        }}
                    >
                        <div className="shrink-0 w-8 h-8 rounded-md bg-white flex items-center justify-center" style={{ border: '1px solid #E8E3DC' }}>
                            <Image src={tool.logo} alt={tool.label} width={18} height={18} unoptimized />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-xs font-semibold text-[#1E1E2F]">{tool.label}</span>
                                <span className="text-[10px] text-[#6B5E4F] inline-flex items-center gap-1">
                                    {tool.icon}
                                    {tool.channel}
                                </span>
                            </div>
                            <p className="text-[10px] text-[#6B5E4F] leading-relaxed mb-1.5">
                                {tool.description}
                            </p>
                            {tool.connected ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1F6F3A]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F3A]" />
                                    Connected
                                </span>
                            ) : (
                                <a
                                    href={tool.settingsHref}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E1E2F] hover:underline"
                                >
                                    Connect <ExternalLink size={9} strokeWidth={2.25} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
