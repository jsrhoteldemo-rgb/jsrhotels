import { prisma } from '../db.js';

export async function logActivity({ admin, action, entityType, entityId = null, beforeJson = null, afterJson = null }) {
  if (!admin) return;

  await prisma.activityLog.create({
    data: {
      adminId: admin.id,
      adminFullName: admin.fullName,
      action,
      entityType,
      entityId,
      beforeJson,
      afterJson,
    },
  });
}
