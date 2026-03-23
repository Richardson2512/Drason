import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface LeadStats {
    total: number;
    active: number;
    held: number;
    paused: number;
    bounced: number;
}

interface CampaignStats {
    total: number;
    active: number;
    paused: number;
    completed: number;
}

interface MailboxStats {
    total: number;
    healthy: number;
    warning: number;
    paused: number;
}

interface DomainStats {
    total: number;
    healthy: number;
    warning: number;
    paused: number;
}

export interface EntityStats {
    leads: LeadStats;
    campaigns: CampaignStats;
    mailboxes: MailboxStats;
    domains: DomainStats;
}

export function useEntityStats() {
    const [stats, setStats] = useState<EntityStats | null>(null);

    useEffect(() => {
        apiClient<EntityStats>('/api/dashboard/entity-stats')
            .then(setStats)
            .catch(err => console.error('Failed to fetch entity stats:', err));
    }, []);

    return stats;
}
