import mongoose, { Schema, Document, Model } from "mongoose";

export type LoginAuditStatus = "SUCCESS" | "FAILED";

export interface ILoginAudit extends Document {
    userId?: mongoose.Types.ObjectId;
    email: string;
    role?: "admin" | "user";
    status: LoginAuditStatus;
    reason?: string;
    authMethod: "credentials";
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LoginAuditSchema = new Schema<ILoginAudit>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        email: { type: String, required: true, lowercase: true, trim: true },
        role: { type: String, enum: ["admin", "user"] },
        status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
        reason: { type: String },
        authMethod: {
            type: String,
            enum: ["credentials"],
            default: "credentials",
            required: true,
        },
        ipAddress: { type: String },
        userAgent: { type: String },
    },
    { timestamps: true }
);

LoginAuditSchema.index({ createdAt: -1 });
LoginAuditSchema.index({ email: 1, createdAt: -1 });
LoginAuditSchema.index({ status: 1, createdAt: -1 });
LoginAuditSchema.index({ role: 1, createdAt: -1 });

const LoginAudit: Model<ILoginAudit> =
    mongoose.models.LoginAudit ||
    mongoose.model<ILoginAudit>("LoginAudit", LoginAuditSchema);

export default LoginAudit;
