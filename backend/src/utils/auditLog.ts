import prisma from './prismaClient';

export const createAuditLog = async (
  userId: number | null,
  action: string,
  entityType: string,
  entityId?: number,
  metadata?: object,
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadataJson: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err);
  }
};
