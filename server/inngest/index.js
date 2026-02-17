import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { sendBookingEmail } from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url

        }
        await User.create(userData)
    }
)

// Inngest Function to delete user data to a database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)

// Inngest Function to update user data to a database
const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url

        }
        await User.findByIdAndUpdate(id, userData)
    }
)


// Inngest Function to auto-release unpaid seats after 10 minutes
const releaseUnpaidSeats = inngest.createFunction(
    { id: "release-unpaid-seats" },
    { event: "booking/seats.reserved" },
    async ({ event, step }) => {
        const { bookingId, showId } = event.data;

        // Wait 10 minutes before checking payment status
        await step.sleep("wait-for-payment", "10m");

        // After 10 min, check if booking is still unpaid
        const booking = await step.run("check-and-release", async () => {
            const bookingData = await Booking.findById(bookingId);

            // If booking doesn't exist or is already paid, do nothing
            if (!bookingData || bookingData.isPaid) {
                return { released: false, reason: !bookingData ? "booking-deleted" : "already-paid" };
            }

            // Booking is unpaid — release the seats
            const showData = await Show.findById(showId);
            if (showData) {
                for (const seat of bookingData.bookedSeats) {
                    if (showData.occupiedSeats[seat]) {
                        delete showData.occupiedSeats[seat];
                    }
                }
                showData.markModified('occupiedSeats');
                await showData.save();
            }

            // Delete the expired booking
            await Booking.findByIdAndDelete(bookingId);

            return {
                released: true,
                seats: bookingData.bookedSeats,
                showId,
            };
        });

        return booking;
    }
);


// Inngest Function to send booking confirmation email after successful payment
const sendBookingConfirmationEmail = inngest.createFunction(
    { id: "send-booking-confirmation-email" },
    { event: "app.show.booked" },
    async ({ event, step }) => {
        const { bookingId } = event.data;

        // Fetch fully populated booking
        const booking = await step.run("fetch-booking", async () => {
            const data = await Booking.findById(bookingId)
                .populate("user")
                .populate({
                    path: "show",
                    populate: { path: "movie", model: "Movie" },
                });

            if (!data || !data.user?.email) {
                return null;
            }
            return data.toObject();
        });

        if (!booking) {
            return { sent: false, reason: "booking-not-found" };
        }

        // Send the confirmation email
        await step.run("send-email", async () => {
            await sendBookingEmail(booking);
            return { sent: true, email: booking.user.email };
        });

        return { sent: true, bookingId, email: booking.user.email };
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseUnpaidSeats,
    sendBookingConfirmationEmail
];
