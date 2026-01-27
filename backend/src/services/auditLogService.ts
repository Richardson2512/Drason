import { prisma } from '../index';

export const logAction = async (
    entity: string,
    entityId: string | null,
    trigger: string,
    action: string,
    details?: string
) => {
    try {
        const log = await prisma.auditLog.create({
            data: {
                entity,
                entity_id: entityId,
                trigger,
                action,
                details,
                timestamp: new Date(),
            },
        });
        console.log(`[AUDIT] ${entity} ${action}: ${details || ''}`);
        return log;
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Non-blocking failure for audit logging, but should be noted
    }
};
