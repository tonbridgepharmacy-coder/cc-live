import dbConnect from "@/lib/db";
import LoginAudit, { type LoginAuditStatus } from "@/models/LoginAudit";

type RecordLoginAuditInput = {
    userId?: string;
    email: string;
    role?: "admin" | "user";
    status: LoginAuditStatus;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
};

type GetLoginAuditsOptions = {
    limit?: number;
    status?: LoginAuditStatus;
    email?: string;
};

export async function recordLoginAudit(input: RecordLoginAuditInput) {
    try {
        await dbConnect();
        await LoginAudit.create({
            userId: input.userId,
            email: input.email.toLowerCase(),
            role: input.role,
            status: input.status,
            reason: input.reason,
            authMethod: "credentials",
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        });
    } catch (error) {
        // Do not fail login flow if audit write fails.
        console.error("Failed to record login audit:", error);
    }
}

export async function getLoginAudits(options: GetLoginAuditsOptions = {}) {
    const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);

    await dbConnect();

    const query: {
        status?: LoginAuditStatus;
        email?: string;
    } = {};

    if (options.status) {
        query.status = options.status;
    }

    if (options.email?.trim()) {
        query.email = options.email.trim().toLowerCase();
    }

    return LoginAudit.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}
