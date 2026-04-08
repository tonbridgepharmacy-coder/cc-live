import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
    try {
        const { amount, currency = "gbp" } = await request.json();

        if (!amount) {
            return NextResponse.json(
                { error: "Amount is required" },
                { status: 400 }
            );
        }

        // Check if we are in Mock Mode (Build time mock key or no key)
        const isMockMode =
            !process.env.STRIPE_SECRET_KEY ||
            process.env.STRIPE_SECRET_KEY.includes("mock_key");

        if (isMockMode) {
            console.log("Mock Payment Mode Active");
            // Return a fake client secret (or just a flag to frontend)
            return NextResponse.json({
                clientSecret: "mock_secret_" + Date.now(),
                isMock: true,
            });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in pence/cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            isMock: false,
        });
    } catch (error: any) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
