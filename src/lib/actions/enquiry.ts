"use server";

import dbConnect from "@/lib/db";
import Enquiry, { IEnquiry } from "@/models/Enquiry";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { generateGoogleCalendarTemplateLink } from "@/lib/googleCalendar";

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
                // Generate a calendar link for tomorrow as a default follow-up date
                const followUpDate = new Date();
                followUpDate.setDate(followUpDate.getDate() + 1);
                const gcalLink = generateGoogleCalendarTemplateLink({
                    serviceTitle: `Follow up: ${data.name}`,
                    slotDate: followUpDate,
                    slotTime: "10:00",
                    details: `Enquiry follow-up with ${data.name}. \nEmail: ${data.email}\nPhone: ${data.phone || "N/A"}\n\nMessage: ${data.message}`,
                });

                await sendEmail({
                    to: adminEmail,
                    subject: `New Enquiry from ${data.name}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                            <div style="background: #1d4ed8; color: white; padding: 20px;">
                                <h2 style="margin: 0;">New Enquiry Received</h2>
                            </div>
                            <div style="padding: 24px;">
                                <p>A new enquiry has been submitted through the website.</p>
                                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #edf2f7;">
                                    <p style="margin: 0 0 8px;"><strong>Name:</strong> ${data.name}</p>
                                    <p style="margin: 0 0 8px;"><strong>Email:</strong> ${data.email}</p>
                                    <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
                                    <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${data.subject || "General Enquiry"}</p>
                                    <p style="margin: 0;"><strong>Message:</strong><br/>${data.message}</p>
                                </div>
                                <div style="display: flex; gap: 12px; margin-top: 24px;">
                                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" style="background: #1d4ed8; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View in Admin Panel</a>
                                    <a href="${gcalLink}" style="background: #f1f5f9; color: #1e293b; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; border: 1px solid #e2e8f0;">🗓️ Add to Calendar</a>
                                </div>
                            </div>
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
