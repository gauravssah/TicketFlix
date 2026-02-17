import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from 'stripe';
import { inngest } from "../inngest/index.js";
import { sendBookingEmail } from "../configs/nodemailer.js";

const RESERVATION_MINUTES = 10;

// Helper: Release expired unpaid reservations for a show
const releaseExpiredSeats = async (showId) => {
    try {
        const expiredBookings = await Booking.find({
            show: showId,
            isPaid: false,
            reservedUntil: { $lte: new Date() },
        });

        if (expiredBookings.length === 0) return;

        const showData = await Show.findById(showId);
        if (!showData) return;

        const bookingIds = [];

        for (const booking of expiredBookings) {
            // Remove these seats from occupiedSeats
            for (const seat of booking.bookedSeats) {
                if (showData.occupiedSeats[seat]) {
                    delete showData.occupiedSeats[seat];
                }
            }
            bookingIds.push(booking._id);
        }

        showData.markModified('occupiedSeats');
        await showData.save();

        // Delete expired bookings
        await Booking.deleteMany({ _id: { $in: bookingIds } });
    } catch (error) {
        console.error('releaseExpiredSeats error:', error.message);
    }
};


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

        // First release any expired seats for this show
        await releaseExpiredSeats(showId);

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

        if (!isAvailable) {
            return res.json({ success: false, message: "Selected Seats are not available." })
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

        // Create a new booking with reservation timer
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: calculateAmount(showData, selectedSeats),
            bookedSeats: selectedSeats,
            reservedUntil,
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
            // Stripe requires minimum 30 min; our server enforces 10-min reservation separately
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        })

        booking.paymentLink = session.url
        await booking.save()

        // Trigger Inngest function to auto-release seats after 10 min if unpaid
        await inngest.send({
            name: "booking/seats.reserved",
            data: {
                bookingId: booking._id.toString(),
                showId: showId,
            },
        });

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

        // Release expired seats first
        await releaseExpiredSeats(showId);

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
        console.log('🔍 verifyPayment called with sessionId:', sessionId);

        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

        // Retrieve the checkout session from Stripe
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
        console.log('💳 Stripe payment_status:', session.payment_status, '| bookingId:', session.metadata?.bookingId);

        if (session.payment_status === 'paid') {
            const bookingId = session.metadata.bookingId;

            // Update booking as paid
            const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentLink: ""
            }, { new: true });

            if (!updatedBooking) {
                console.error('❌ Booking not found in DB:', bookingId, '(may have been cleaned up by reservation timer)');
                return res.json({ success: true, message: "Payment verified but booking was expired" });
            }

            console.log('✅ Booking marked as paid:', bookingId);

            // Send confirmation email directly
            try {
                const booking = await Booking.findById(bookingId)
                    .populate("user")
                    .populate({
                        path: "show",
                        populate: { path: "movie", model: "Movie" },
                    });

                console.log('📧 Email data — User:', booking?.user?.name, '|', booking?.user?.email,
                    '| Movie:', booking?.show?.movie?.title);

                if (booking && booking.user?.email) {
                    await sendBookingEmail(booking.toObject());
                } else {
                    console.error('❌ Missing email data — user:', !!booking?.user, 'email:', booking?.user?.email);
                }
            } catch (emailErr) {
                console.error('❌ Email send failed:', emailErr.message);
            }

            return res.json({ success: true, message: "Payment verified successfully" });
        }

        res.json({ success: false, message: "Payment not completed" });

    } catch (error) {
        console.log('❌ verifyPayment error:', error.message);
        res.json({ success: false, message: error.message });
    }
};
