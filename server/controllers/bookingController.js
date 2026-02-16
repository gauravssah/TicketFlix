import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from 'stripe';


// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;

    } catch (error) {
        console.log(error.message);
        return false;
    }
}


// Helper to get section for a seat row
const getSeatSection = (seatId) => {
    const row = seatId.charAt(0).toUpperCase();
    if (['A', 'B'].includes(row)) return 'premium';
    if (['C', 'D', 'E', 'F'].includes(row)) return 'gold';
    return 'silver';
};

// Calculate total amount based on seat sections
const calculateAmount = (showData, selectedSeats) => {
    const prices = showData.sectionPrices || {
        premium: showData.showPrice,
        gold: showData.showPrice,
        silver: showData.showPrice,
    };
    return selectedSeats.reduce((total, seat) => {
        const section = getSeatSection(seat);
        return total + (prices[section] || showData.showPrice);
    }, 0);
};


export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

        if (!isAvailable) {
            return res.json({ success: false, message: "Selected Seats are not available." })
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: calculateAmount(showData, selectedSeats),
            bookedSeats: selectedSeats
        })

        // Mark seats as occupied immediately to prevent double booking
        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');
        await showData.save();

        // Stripe Gateway initialize
        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
        })

        booking.paymentLink = session.url
        await booking.save()

        res.json({ success: true, url: session.url });


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}

// Get occupied seats from the Show model
export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({ success: true, occupiedSeats });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


// ✅ Verify payment status with Stripe (works without webhook)
export const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

        // Retrieve the checkout session from Stripe
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const bookingId = session.metadata.bookingId;

            // Update booking as paid
            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentLink: ""
            });

            return res.json({ success: true, message: "Payment verified successfully" });
        }

        res.json({ success: false, message: "Payment not completed" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
