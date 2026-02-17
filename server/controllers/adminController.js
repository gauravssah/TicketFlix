import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";



// API to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({ success: true, isAdmin: true })
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true });
        const activeShowsRaw = await Show.find({
            showDateTime: { $gte: new Date() }
        }).populate("movie");

        const activeShows = activeShowsRaw.filter(show => show.movie != null);

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser,
        }

        res.json({ success: true, dashboardData });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });

    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const showsRaw = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });
        const shows = showsRaw.filter(show => show.movie != null);

        res.json({ success: true, shows })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}


// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({ createdAt: -1 })

        res.json({ success: true, bookings })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to delete a show
export const deleteShow = async (req, res) => {
    try {
        const { showId } = req.params;

        const show = await Show.findById(showId);
        if (!show) {
            return res.json({ success: false, message: "Show not found" });
        }

        // Check if there are paid bookings for this show
        const paidBookings = await Booking.countDocuments({ show: showId, isPaid: true });
        if (paidBookings > 0) {
            return res.json({ success: false, message: `Cannot delete: ${paidBookings} paid booking(s) exist for this show` });
        }

        // Delete any unpaid bookings for this show
        await Booking.deleteMany({ show: showId, isPaid: false });

        // Delete the show
        await Show.findByIdAndDelete(showId);

        res.json({ success: true, message: "Show deleted successfully" });
    } catch (error) {
        console.error("Delete Show Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}
