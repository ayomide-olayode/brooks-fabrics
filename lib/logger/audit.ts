import connectDB from "@/lib/db/mongoose";
import AuditLog from "@/lib/db/models/AuditLog";
import { logger } from "@/lib/logger";

interface AuditLogParams {
  adminEmail: string;
  ip?: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown> | null;
}

export function logAdminAction({
  adminEmail,
  ip,
  action,
  resource,
  resourceId,
  details,
}: AuditLogParams): void {
  // Fire and forget: the caller does not await this
  connectDB()
    .then(() =>
      AuditLog.create({
        adminEmail,
        ip,
        action,
        resource,
        resourceId,
        details,
      })
    )
    .catch((err) => {
      logger.error("Audit log write failed", { error: err });
    });
}
