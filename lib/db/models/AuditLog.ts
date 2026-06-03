import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema(
  {
    adminEmail: { type: String, required: true },
    ip: { type: String },
    action: { type: String, enum: ["CREATE", "UPDATE", "DELETE"], required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    capped: { size: 10_000_000, max: 50_000 },
  }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;
