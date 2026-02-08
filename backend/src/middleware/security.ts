/**
 * Security Middleware
 * 
 * Implements Phase 6: Security & Access Control
 * - RBAC (Admin, Operator, Viewer roles)
 * - API key scoped permissions
 * - Rate limiting protection
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { UserRole, ApiScope } from '../types';

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIG = {
    windowMs: 60000,           // 1 minute window
    maxRequests: 100,          // 100 requests per window
    maxRequestsPerKey: 1000,   // API keys get higher limit
    cleanupIntervalMs: 300000  // Clean up every 5 minutes
};

// Periodic cleanup of expired entries
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}, RATE_LIMIT_CONFIG.cleanupIntervalMs);

/**
 * Rate limiting middleware.
 */
export function rateLimit(req: Request, res: Response, next: NextFunction): void {
    const identifier = getClientIdentifier(req);
    const now = Date.now();
    const isApiKey = req.headers.authorization?.startsWith('Bearer ');
    const maxRequests = isApiKey
        ? RATE_LIMIT_CONFIG.maxRequestsPerKey
        : RATE_LIMIT_CONFIG.maxRequests;

    let entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetAt < now) {
        entry = {
            count: 1,
            resetAt: now + RATE_LIMIT_CONFIG.windowMs
        };
        rateLimitStore.set(identifier, entry);
    } else {
        entry.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', entry.resetAt);

    if (entry.count > maxRequests) {
        res.status(429).json({
            error: 'Too Many Requests',
            retryAfter: Math.ceil((entry.resetAt - now) / 1000)
        });
        return;
    }

    next();
}

function getClientIdentifier(req: Request): string {
    // Use API key if present, otherwise IP
    const apiKey = req.headers.authorization?.replace('Bearer ', '');
    if (apiKey) {
        return `key:${apiKey.substring(0, 16)}`;
    }
    return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
}

// ============================================================================
// RBAC (Role-Based Access Control)
// ============================================================================

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: [
        'users:read', 'users:write', 'users:delete',
        'org:read', 'org:write',
        'settings:read', 'settings:write',
        'leads:read', 'leads:write', 'leads:delete',
        'campaigns:read', 'campaigns:write',
        'audit:read',
        'webhooks:manage'
    ],
    [UserRole.OPERATOR]: [
        'leads:read', 'leads:write',
        'campaigns:read', 'campaigns:write',
        'settings:read',
        'audit:read'
    ],
    [UserRole.VIEWER]: [
        'leads:read',
        'campaigns:read',
        'audit:read'
    ]
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole | undefined, permission: string): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Require specific permission middleware.
 */
export function requirePermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const role = req.orgContext?.role;

        if (!hasPermission(role, permission)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `Permission '${permission}' required`,
                yourRole: role || 'none'
            });
            return;
        }

        next();
    };
}

/**
 * Require specific role middleware.
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const role = req.orgContext?.role;

        if (!role || !allowedRoles.includes(role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `One of these roles required: ${allowedRoles.join(', ')}`,
                yourRole: role || 'none'
            });
            return;
        }

        next();
    };
}

// ============================================================================
// API KEY SCOPE VALIDATION
// ============================================================================

const SCOPE_TO_PERMISSIONS: Record<ApiScope, string[]> = {
    [ApiScope.LEADS_READ]: ['leads:read'],
    [ApiScope.LEADS_WRITE]: ['leads:read', 'leads:write'],
    [ApiScope.CAMPAIGNS_READ]: ['campaigns:read'],
    [ApiScope.CAMPAIGNS_WRITE]: ['campaigns:read', 'campaigns:write'],
    [ApiScope.SETTINGS_READ]: ['settings:read'],
    [ApiScope.SETTINGS_WRITE]: ['settings:read', 'settings:write'],
    [ApiScope.AUDIT_READ]: ['audit:read'],
    [ApiScope.WEBHOOKS]: ['webhooks:manage']
};

/**
 * Validate API key has required scope.
 */
export async function validateApiKeyScope(
    apiKeyId: string,
    requiredScope: ApiScope
): Promise<boolean> {
    const apiKey = await prisma.apiKey.findUnique({
        where: { id: apiKeyId },
        select: { scopes: true, revoked_at: true, expires_at: true }
    });

    if (!apiKey) return false;
    if (apiKey.revoked_at) return false;
    if (apiKey.expires_at && apiKey.expires_at < new Date()) return false;

    return apiKey.scopes.includes(requiredScope);
}

/**
 * Require API key scope middleware.
 */
export function requireScope(scope: ApiScope) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'API key required' });
            return;
        }

        const apiKey = authHeader.substring(7);
        const keyHash = hashApiKey(apiKey);

        const keyRecord = await prisma.apiKey.findFirst({
            where: { key_hash: keyHash },
            select: { id: true, scopes: true, revoked_at: true, expires_at: true }
        });

        if (!keyRecord) {
            res.status(401).json({ error: 'Invalid API key' });
            return;
        }

        if (keyRecord.revoked_at) {
            res.status(401).json({ error: 'API key has been revoked' });
            return;
        }

        if (keyRecord.expires_at && keyRecord.expires_at < new Date()) {
            res.status(401).json({ error: 'API key has expired' });
            return;
        }

        if (!keyRecord.scopes.includes(scope)) {
            res.status(403).json({
                error: 'Insufficient scope',
                required: scope,
                available: keyRecord.scopes
            });
            return;
        }

        next();
    };
}

/**
 * Hash an API key for storage/lookup.
 */
function hashApiKey(key: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(key).digest('hex');
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Apply security headers middleware.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
}

// ============================================================================
// EXPORTS
// ============================================================================

export const security = {
    rateLimit,
    requirePermission,
    requireRole,
    requireScope,
    hasPermission,
    validateApiKeyScope,
    securityHeaders
};
