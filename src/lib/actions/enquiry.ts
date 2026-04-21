"use server";

import dbConnect from "@/lib/db";
import Enquiry, { IEnquiry } from "@/models/Enquiry";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

export async function submitEnquiry(data: Partial<IEnquiry>) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        const newEnquiry = await Enquiry.create(data);
        
        // 1. Send confirmation email to customer
        if (data.email) {
            try {
                await sendEmail({
                    to: data.email,
                    subject: "Enquiry Received - Clarke & Coleman Pharmacy",
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h2 style="color: #1d4ed8;">Hello ${data.name},</h2>
                            <p>Thank you for contacting Clarke & Coleman Pharmacy. We have received your enquiry and will get back to you as soon as possible.</p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Your Enquiry Details:</h3>
                                <p><strong>Subject:</strong> ${data.subject || "General Enquiry"}</p>
                                <p><strong>Message:</strong> ${data.message}</p>
                            </div>
                            <p>Best regards,</p>
                            <p><strong>Clarke & Coleman Pharmacy Team</strong></p>
                        </div>
                    `
                });
            } catch (err) {
                console.error("Customer enquiry email failed:", err);
            }
        }

        // 2. Send notification email to admin
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
        if (adminEmail) {
            try {
                await sendEmail({
                    to: adminEmail,
                    subject: `New Enquiry from ${data.name}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h2 style="color: #1d4ed8;">New Enquiry Received</h2>
                            <p>A new enquiry has been submitted through the website.</p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Name:</strong> ${data.name}</p>
                                <p><strong>Email:</strong> ${data.email}</p>
                                <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
                                <p><strong>Subject:</strong> ${data.subject || "General Enquiry"}</p>
                                <p><strong>Message:</strong> ${data.message}</p>
                            </div>
                            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" style="background: #1d4ed8; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">View in Admin Dashboard</a></p>
                        </div>
                    `
                });
            } catch (err) {
                console.error("Admin enquiry notification failed:", err);
            }
        }

        revalidatePath("/admin/enquiries");
        return { success: true, data: JSON.parse(JSON.stringify(newEnquiry)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getEnquiries() {
    const conn = await dbConnect();
    if (!conn) return [];
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(enquiries));
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        return [];
    }
}

export async function getEnquiryById(id: string) {
    const conn = await dbConnect();
    if (!conn) return null;
    try {
        const enquiry = await Enquiry.findById(id).lean();
        return enquiry ? JSON.parse(JSON.stringify(enquiry)) : null;
    } catch (error) {
        console.error("Error fetching enquiry by id:", error);
        return null;
    }
}

export async function updateEnquiryStatus(id: string, status: IEnquiry["status"]) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        revalidatePath("/admin/enquiries");
        return { success: true, data: JSON.parse(JSON.stringify(updatedEnquiry)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEnquiry(id: string) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        await Enquiry.findByIdAndDelete(id);
        revalidatePath("/admin/enquiries");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
