import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import { releaseStock } from "@/lib/actions/inventory";
import { sendEmail } from "@/lib/email";
import { format } from "date-fns";
import Vaccine from "@/models/Vaccine";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET not set");
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 }
        );
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }

    await connectToDatabase();

    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const appointmentId = paymentIntent.metadata?.appointmentId;

            if (!appointmentId) {
                console.error("No appointmentId in payment metadata");
                break;
            }

            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                console.error("Appointment not found:", appointmentId);
                break;
            }

            // Update appointment to CONFIRMED
            appointment.status = "CONFIRMED";
            appointment.paymentStatus = "PAID";
            appointment.paymentIntentId = paymentIntent.id;
            appointment.lockedUntil = undefined;
            await appointment.save();

            // Send confirmation email
            try {
                const vaccine = await Vaccine.findById(appointment.vaccineId);
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #1a365d; color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; font-size: 24px;">Booking Confirmed ✓</h1>
                            <p style="margin: 8px 0 0; opacity: 0.9;">Clarke & Coleman Pharmacy</p>
                        </div>
                        <div style="padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0;">
                            <p>Dear ${appointment.customerName},</p>
                            <p>Your appointment has been confirmed. Here are your booking details:</p>
                            <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
                                <p><strong>Service:</strong> ${vaccine?.title || "Vaccination"}</p>
                                <p><strong>Date:</strong> ${format(new Date(appointment.slotDate), "EEEE, d MMMM yyyy")}</p>
                                <p><strong>Time:</strong> ${appointment.slotTime}</p>
                                <p><strong>Amount Paid:</strong> £${appointment.amountPaid}</p>
                                <p><strong>Reference:</strong> ${appointment._id}</p>
                            </div>
                            <p><strong>Location:</strong> Clarke & Coleman Pharmacy, London</p>
                            <p style="color: #64748b; font-size: 14px;">
                                If you need to reschedule or cancel, please contact us at least 24 hours in advance.
                            </p>
                        </div>
                        <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
                            <p>Clarke & Coleman Pharmacy | Professional Healthcare Services</p>
                        </div>
                    </div>
                `;

                await sendEmail({
                    to: appointment.customerEmail,
                    subject: `Appointment Confirmed - ${format(new Date(appointment.slotDate), "d MMM yyyy")} at ${appointment.slotTime}`,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // Don't fail the webhook because of email issues
            }

            console.log(`✅ Appointment ${appointmentId} confirmed via Stripe webhook`);
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const appointmentId = paymentIntent.metadata?.appointmentId;

            if (!appointmentId) break;

            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) break;

            // Release inventory
            if (appointment.batchId) {
                await releaseStock(
                    appointment.vaccineId.toString(),
                    appointment.batchId.toString(),
                    appointmentId
                );
            }

            // Update appointment
            appointment.status = "CANCELLED";
            appointment.paymentStatus = "FAILED";
            appointment.lockedUntil = undefined;
            await appointment.save();

            console.log(`❌ Appointment ${appointmentId} cancelled due to payment failure`);
            break;
        }

        case "charge.refunded": {
            const charge = event.data.object;
            const paymentIntentId =
                typeof charge.payment_intent === "string"
                    ? charge.payment_intent
                    : charge.payment_intent?.id;

            if (!paymentIntentId) break;

            const appointment = await Appointment.findOne({ paymentIntentId });
            if (!appointment) break;

            // Release inventory
            if (appointment.batchId) {
                await releaseStock(
                    appointment.vaccineId.toString(),
                    appointment.batchId.toString(),
                    appointment._id.toString()
                );
            }

            appointment.status = "CANCELLED";
            appointment.paymentStatus = "REFUNDED";
            await appointment.save();

            console.log(`💰 Appointment ${appointment._id} refunded`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
