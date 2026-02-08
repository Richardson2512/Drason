/**
 * Organization Context Middleware
 * 
 * Provides multi-tenancy support by extracting and validating organization context
 * from requests. All database queries should be scoped to the organization.
 * 
 * Section 3 of Infrastructure Audit: Multi-Tenancy (Mandatory)
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { OrgContext, UserRole } from '../types';

// Extend Express Request to include organization context
declare global {
    namespace Express {
        interface Request {
            orgContext?: OrgContext;
        }
    }
}

/**
 * Default organization ID for development/single-tenant mode.
 * In production, this should not be used and proper auth is required.
 */
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || '123e4567-e89b-12d3-a456-426614174000';

/**
 * Middleware to extract organization context from request.
 * 
 * Checks in order:
 * 1. X-Organization-ID header
 * 2. API key (extracts org from key lookup)
 * 3. Falls back to DEFAULT_ORG_ID in development
 */
export const extractOrgContext = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let organizationId: string | undefined;
        let userId: string | undefined;
        let role: UserRole | undefined;

        // 1. Check for explicit organization header
        const orgHeader = req.headers['x-organization-id'];
        if (orgHeader && typeof orgHeader === 'string') {
            organizationId = orgHeader;
        }

        // 2. Check for API key authentication
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const apiKey = authHeader.substring(7);
            const keyData = await validateApiKey(apiKey);
            if (keyData) {
                organizationId = keyData.organizationId;
                // API keys don't have userId, but have scopes
            }
        }

        // 3. Development fallback - create default org if needed
        if (!organizationId && process.env.NODE_ENV !== 'production') {
            organizationId = DEFAULT_ORG_ID;

            // Ensure default org exists in development
            await ensureDefaultOrganization(organizationId);
        }


        // Debugging LOG
        console.log(`[ORG_CONTEXT] Using OrgID: ${organizationId} | Env: ${process.env.NODE_ENV} | Valid: ${!!organizationId}`);

        if (!organizationId) {
            res.status(401).json({
                error: 'Organization context required',
                message: 'Provide X-Organization-ID header or valid API key'
            });
            return;
        }

        // Set context on request
        req.orgContext = {
            organizationId,
            userId,
            role
        };

        next();
    } catch (error) {
        console.error('[ORG_CONTEXT] Error extracting context:', error);
        next(error);
    }
};

/**
 * Validate an API key and return organization context.
 * Returns null if key is invalid or expired.
 */
async function validateApiKey(apiKey: string): Promise<{ organizationId: string; scopes: string[] } | null> {
    // TODO: Implement proper key hashing and validation
    // For now, we'll do a simple lookup (keys should be hashed in production)

    // Hash the key for lookup
    const crypto = await import('crypto');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const key = await prisma.apiKey.findUnique({
        where: { key_hash: keyHash }
    });

    if (!key) return null;
    if (key.revoked_at) return null;
    if (key.expires_at && key.expires_at < new Date()) return null;

    // Update last used timestamp
    await prisma.apiKey.update({
        where: { id: key.id },
        data: { last_used_at: new Date() }
    });

    return {
        organizationId: key.organization_id,
        scopes: key.scopes
    };
}

/**
 * Ensure the default organization exists for development.
 */
async function ensureDefaultOrganization(orgId: string): Promise<void> {
    const existing = await prisma.organization.findUnique({
        where: { id: orgId }
    });

    if (!existing) {
        await prisma.organization.create({
            data: {
                id: orgId,
                name: 'Superkabe Default Org',
                slug: 'superkabe-default',
                system_mode: 'observe'
            }
        });
        console.log('[ORG_CONTEXT] Created default organization for development');
    }
}

/**
 * Require a specific role for the route.
 * Used with requireAuth middleware.
 */
export const requireRole = (requiredRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.orgContext) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Role hierarchy: admin > operator > viewer
        const roleHierarchy: Record<UserRole, number> = {
            [UserRole.ADMIN]: 3,
            [UserRole.OPERATOR]: 2,
            [UserRole.VIEWER]: 1
        };

        const userRoleLevel = req.orgContext.role ? roleHierarchy[req.orgContext.role] : 0;
        const requiredRoleLevel = roleHierarchy[requiredRole];

        if (userRoleLevel < requiredRoleLevel) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: requiredRole,
                current: req.orgContext.role
            });
        }

        next();
    };
};

/**
 * Helper to get organization ID from request.
 * Throws if not available.
 */
export function getOrgId(req: Request): string {
    if (!req.orgContext?.organizationId) {
        throw new Error('Organization context not available');
    }
    return req.orgContext.organizationId;
}
