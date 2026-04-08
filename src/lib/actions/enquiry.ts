"use server";

import dbConnect from "@/lib/db";
import Enquiry, { IEnquiry } from "@/models/Enquiry";
import { revalidatePath } from "next/cache";

export async function submitEnquiry(data: Partial<IEnquiry>) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        const newEnquiry = await Enquiry.create(data);
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
