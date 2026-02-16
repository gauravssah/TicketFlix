import stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const bookingId = session.metadata.bookingId;

            // Mark booking as paid (seats already occupied at booking time)
            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentLink: ""
            });
        }

        res.json({ received: true });
    } catch (error) {
        console.error(error);
        res.status(500).send("Webhook Error");
    }
};


