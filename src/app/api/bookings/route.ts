import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { format } from "date-fns";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { service, date, time, customer, paymentIntentId } = body;

        // Save to MongoDB
        await dbConnect();

        // Parse date and time to a single Date object
        const bookingDate = new Date(date);
        const [hours, minutes] = time.split(":").map(Number);
        bookingDate.setHours(hours, minutes);

        const newBooking = await Booking.create({
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone || "Not provided",
            serviceName: service.title,
            servicePrice: service.price,
            bookingDate: bookingDate,
            status: "confirmed",
            paymentStatus: paymentIntentId ? "paid" : "unpaid",
            paymentIntentId: paymentIntentId,
            notes: customer.notes || undefined,
        });

        // Send confirmation email
        const emailHtml = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${customer.name},</p>
      <p>Your appointment for <strong>${service.title}</strong> has been confirmed.</p>
      <p><strong>Date:</strong> ${format(new Date(date), "EEEE, d MMMM yyyy")}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Location:</strong> Clarke & Coleman Pharmacy, London</p>
      <br/>
      <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
      <p>Thank you,</p>
      <p>Clarke & Coleman Pharmacy Team</p>
    `;

        await sendEmail({
            to: "kesharijigyashu@gmail.com", // DEMO OVERRIDE: Send to developer
            subject: `[DEMO] Appointment Confirmation - ${customer.name}`,
            html: emailHtml,
        });

        return NextResponse.json({ success: true, message: "Booking created" });
    } catch (error: any) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
