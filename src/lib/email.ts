import nodemailer from "nodemailer";

// SMTP configuration - supports Gmail (default) or any custom SMTP
const transportConfig: any = {
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: parseInt(process.env.EMAIL_TIMEOUT || "10000"),
    greetingTimeout: parseInt(process.env.EMAIL_TIMEOUT || "10000"),
};

// If custom SMTP host is provided, use it; otherwise default to Gmail service
if (process.env.EMAIL_HOST) {
    transportConfig.host = process.env.EMAIL_HOST;
    transportConfig.port = parseInt(process.env.EMAIL_PORT || "587");
    transportConfig.secure = process.env.EMAIL_SECURE === "true"; // true for 465, false for others
} else {
    transportConfig.service = "gmail";
}

const transporter = nodemailer.createTransport(transportConfig);

const fromName = process.env.EMAIL_FROM_NAME || "Clarke & Coleman Pharmacy";

export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    try {
        const info = await transporter.sendMail({
            from: `"${fromName}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
