"use server";

import { sendEmail } from "@/lib/email";

export async function sendManualMail({
    to,
    subject,
    message,
    customerName
}: {
    to: string;
    subject: string;
    message: string;
    customerName: string;
}) {
    if (!to || !subject || !message) {
        return { success: false, message: "Recipient, subject, and message are required." };
    }

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #0d4a3e; margin: 0;">Clarke & Coleman Pharmacy</h2>
            </div>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Dear ${customerName},</p>
            <div style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px; white-space: pre-wrap;">
                ${message}
            </div>
            <div style="border-top: 1px solid #e1e1e1; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">Kind regards,</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #0d4a3e;">Clarke & Coleman Pharmacy</p>
                <p style="margin: 5px 0 0 0;">Tonbridge Pharmacy</p>
            </div>
        </div>
    `;

    try {
        const result = await sendEmail({ to, subject, html });
        if (result.success) {
            return { success: true, message: "Email sent successfully!" };
        } else {
            return { success: false, message: "Failed to send email." };
        }
    } catch (error: any) {
        console.error("Manual mail error:", error);
        return { success: false, message: error.message || "Something went wrong." };
    }
}
