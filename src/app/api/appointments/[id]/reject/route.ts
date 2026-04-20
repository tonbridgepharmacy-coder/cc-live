import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import "@/models/Vaccine";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { releaseStock } from "@/lib/actions/inventory";
import { format } from "date-fns";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { rejectionReason } = await request.json();

        if (!rejectionReason || !rejectionReason.trim()) {
            return NextResponse.json(
                { error: "Rejection reason is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const appointment = await Appointment.findById(id).populate(
            "vaccineId",
            "title"
        );

        if (!appointment) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        // Prevent rejecting already rejected/cancelled/completed appointments
        if (["REJECTED", "CANCELLED", "COMPLETED"].includes(appointment.status)) {
            return NextResponse.json(
                { error: `Cannot reject an appointment that is already ${appointment.status}` },
                { status: 400 }
            );
        }

        // ─── 1. Start refund workflow (must be initiated within 24 hours) ───
        let refundId: string | undefined;
        let refundFailureReason: string | undefined;
        const refundRequired = appointment.paymentStatus === "PAID";

        if (refundRequired) {
            appointment.refundRequestedAt = new Date();
            appointment.paymentStatus = "REFUND_PENDING";

            if (!appointment.paymentIntentId) {
                refundFailureReason =
                    "No payment intent found. Refund must be initiated manually within 24 hours.";
            } else {
                const isMockMode =
                    !process.env.STRIPE_SECRET_KEY ||
                    process.env.STRIPE_SECRET_KEY.includes("mock_key");

                if (isMockMode) {
                    refundId = `mock_refund_${Date.now()}`;
                    appointment.refundInitiatedAt = new Date();
                    appointment.paymentStatus = "REFUNDED";
                    console.log(`🔄 Mock refund initiated for appointment ${id}`);
                } else {
                    try {
                        const refund = await stripe.refunds.create({
                            payment_intent: appointment.paymentIntentId,
                            reason: "requested_by_customer",
                        });
                        refundId = refund.id;
                        appointment.refundInitiatedAt = new Date();
                        appointment.paymentStatus = "REFUNDED";
                        console.log(
                            `💰 Stripe refund initiated: ${refund.id} for appointment ${id}`
                        );
                    } catch (refundError: any) {
                        refundFailureReason =
                            refundError?.message ||
                            "Refund initiation failed. Please process manually within 24 hours.";
                        console.error("Stripe refund failed (manual action required):", refundError);
                    }
                }
            }
        }

        // ─── 2. Release inventory (if batch was reserved) ───
        if (appointment.batchId) {
            try {
                await releaseStock(
                    appointment.vaccineId._id
                        ? appointment.vaccineId._id.toString()
                        : appointment.vaccineId.toString(),
                    appointment.batchId.toString(),
                    id
                );
            } catch (stockError) {
                console.error("Stock release failed (non-blocking):", stockError);
            }
        }

        // ─── 3. Update appointment status ───
        appointment.status = "REJECTED";
        appointment.rejectionReason = rejectionReason.trim();
        appointment.rejectedAt = new Date();
        if (refundId) appointment.refundId = refundId;
        if (refundFailureReason) appointment.refundFailureReason = refundFailureReason;
        appointment.lockedUntil = undefined;
        await appointment.save();

        // ─── 4. Send rejection email to client ───
        try {
            const vaccineName =
                (appointment.vaccineId as any)?.title || "Vaccination";
            const formattedDate = format(
                new Date(appointment.slotDate),
                "EEEE, d MMMM yyyy"
            );
            const refundNote = refundRequired
                ? refundId
                    ? `<div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <p style="margin: 0; color: #065f46; font-weight: 600;">💰 Refund Initiated</p>
                            <p style="margin: 8px 0 0; color: #047857; font-size: 14px;">
                                A full refund of <strong>£${appointment.amountPaid}</strong> has been initiated.
                                Refund completion time depends on your card provider.
                            </p>
                            <p style="margin: 8px 0 0; color: #6b7280; font-size: 12px;">
                                Refund Reference: ${refundId}
                            </p>
                        </div>`
                    : `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <p style="margin: 0; color: #92400e; font-weight: 600;">💰 Refund Processing</p>
                            <p style="margin: 8px 0 0; color: #92400e; font-size: 14px;">
                                Your refund request for <strong>£${appointment.amountPaid}</strong> has been logged and will be initiated within 24 hours.
                            </p>
                        </div>`
                : "";

            const emailHtml = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: linear-gradient(135deg, #991b1b, #dc2626); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Appointment Rejected</h1>
                        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Clarke &amp; Coleman Pharmacy</p>
                    </div>
                    <div style="padding: 32px 24px; background: #fafafa; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
                        <p style="color: #111827; font-size: 16px;">Dear ${appointment.customerName},</p>
                        <p style="color: #374151; line-height: 1.6;">
                            We regret to inform you that your appointment has been <strong>rejected</strong>. 
                            We sincerely apologise for any inconvenience caused.
                        </p>
                        
                        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <h3 style="margin: 0 0 12px; color: #111827; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Service</td>
                                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${vaccineName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Date</td>
                                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formattedDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Time</td>
                                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${appointment.slotTime}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Reference</td>
                                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${appointment._id}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 14px;">Reason for Rejection</p>
                            <p style="margin: 8px 0 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">${rejectionReason.trim()}</p>
                        </div>

                        ${refundNote}

                        <p style="color: #374151; line-height: 1.6; margin-top: 20px;">
                            If you have any questions or would like to rebook, please don't hesitate to contact us:
                        </p>
                        <div style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; color: #374151;">
                                📞 <strong>+44 20 7946 0958</strong><br/>
                                ✉️ <strong>tonbridgepharmacy@gmail.com</strong>
                            </p>
                        </div>
                    </div>
                    <div style="padding: 20px 24px; text-align: center; background: #f3f4f6; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">Clarke &amp; Coleman Pharmacy | Professional Healthcare Services</p>
                        <p style="margin: 4px 0 0; color: #9ca3af; font-size: 11px;">42 Harley Street, London, W1G 9PL</p>
                    </div>
                </div>
            `;

            await sendEmail({
                to: appointment.customerEmail,
                subject: `Appointment Rejected — ${format(new Date(appointment.slotDate), "d MMM yyyy")} at ${appointment.slotTime}`,
                html: emailHtml,
            });

            console.log(`📧 Rejection email sent to ${appointment.customerEmail}`);
        } catch (emailError) {
            console.error("Failed to send rejection email:", emailError);
            // Don't fail the rejection because of email issues — appointment is already rejected
        }

        return NextResponse.json({
            success: true,
            message: "Appointment rejected successfully",
            refundRequired,
            refundInitiated: !!refundId,
            refundId: refundId || null,
            refundPending: refundRequired && !refundId,
        });
    } catch (error: any) {
        console.error("Reject appointment error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
