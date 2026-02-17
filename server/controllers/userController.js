import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";


// API Controller Function to Get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId;

        // First clean up expired unpaid bookings for this user
        const expiredBookings = await Booking.find({
            user,
            isPaid: false,
            reservedUntil: { $lte: new Date() },
        });

        for (const booking of expiredBookings) {
            const showData = await Show.findById(booking.show);
            if (showData) {
                for (const seat of booking.bookedSeats) {
                    if (showData.occupiedSeats[seat]) {
                        delete showData.occupiedSeats[seat];
                    }
                }
                showData.markModified('occupiedSeats');
                await showData.save();
            }
        }

        if (expiredBookings.length > 0) {
            await Booking.deleteMany({ _id: { $in: expiredBookings.map(b => b._id) } });
        }

        const bookingsRaw = await Booking.find({ user }).populate({
            path: "show",
            populate: { path: 'movie' }
        }).sort({ createdAt: -1 })

        // Filter out bookings where show or movie was deleted
        const bookings = bookingsRaw.filter(b => b.show && b.show.movie);

        res.json({ success: true, bookings })

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API Controller Function to update Favorite Movie in Clerk User MetaData
export const updateFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);

        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        };

        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);
        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: user.privateMetadata });

        res.json({ success: true, message: "Favorite Movies Updated." });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}


// API Controller Function to get Favorite Movie
export const getFavorites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId);
        const favorites = user.privateMetadata.favorites;

        // Getting movies from database
        const movies = await Movie.find({ _id: { $in: favorites } });

        res.json({ success: true, movies });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}
