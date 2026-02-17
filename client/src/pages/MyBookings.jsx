// React hooks for state management & lifecycle
import React, { useCallback, useEffect, useRef, useState } from "react";

// Reusable UI components
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

// Utility functions for formatting time & date
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { ClockIcon, DownloadIcon, AlertTriangleIcon } from "lucide-react";
import generateTicket from "../lib/generateTicket";

// ─── COUNTDOWN TIMER COMPONENT ───
const CountdownTimer = ({ reservedUntil, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(reservedUntil).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpired?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          onExpired?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 120; // less than 2 minutes
  const progress = timeLeft > 0 ? (timeLeft / (10 * 60)) * 100 : 0;

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-xs font-medium animate-pulse">
        <AlertTriangleIcon className="w-3.5 h-3.5" />
        Reservation expired
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <ClockIcon
          className={`w-3.5 h-3.5 ${isUrgent ? "text-red-400 animate-pulse" : "text-yellow-400"}`}
        />
        <span
          className={`text-xs font-bold tabular-nums ${isUrgent ? "text-red-400" : "text-yellow-400"}`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-gray-500">remaining</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${isUrgent ? "bg-red-500" : "bg-yellow-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ---------------- MY BOOKINGS PAGE COMPONENT ----------------
function MyBookings() {
  // Currency symbol fetched from environment variable
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user, image_base_url } = useAppContext();

  // State to store all user bookings
  const [bookings, setBookings] = useState([]);

  // State to manage loading indicator
  const [isLoading, setIsLoading] = useState(true);

  // ---------------- FETCH USER BOOKINGS ----------------
  const getMyBookings = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }, [axios, getToken]);

  // Handle reservation expiry — remove the booking from UI
  const handleExpired = useCallback((bookingId) => {
    // Small delay so user sees "expired" message briefly
    setTimeout(() => {
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    }, 3000);
  }, []);

  // Load bookings when component mounts
  useEffect(() => {
    if (user) {
      getMyBookings();
    } else {
      setIsLoading(false);
    }
  }, [user, getMyBookings]);

  // ---------------- CONDITIONAL RENDERING ----------------
  return !isLoading ? (
    // ================= MAIN BOOKINGS WRAPPER =================
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      {/* Decorative background blur effects */}
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>

      {/* Page Heading */}
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.length === 0 && (
        <p className="text-gray-400 mt-6">No bookings yet.</p>
      )}

      {/* ================= BOOKINGS LIST ================= */}
      {bookings.map((item) => {
        const isExpired =
          !item.isPaid &&
          item.reservedUntil &&
          new Date(item.reservedUntil).getTime() <= Date.now();

        return (
          // ---------------- SINGLE BOOKING CARD ----------------
          <div
            key={item._id}
            className={`flex flex-col md:flex-row justify-between rounded-lg mt-4 p-2 max-w-3xl transition-all duration-500
              ${
                item.isPaid
                  ? "bg-primary/8 border border-primary/20"
                  : isExpired
                    ? "bg-red-900/10 border border-red-500/20 opacity-60"
                    : "bg-yellow-900/10 border border-yellow-500/20"
              }`}
          >
            {/* ===== LEFT SECTION: MOVIE POSTER + INFO ===== */}
            <div className="flex flex-col md:flex-row">
              {/* Movie Poster */}
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt="poster"
                className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
              />

              {/* Movie Details */}
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">{item.show.movie.title}</p>

                {/* Runtime */}
                <p className="text-gray-400 text-sm">
                  {timeFormat(item.show.movie.runtime)}
                </p>

                {/* Show Date & Time */}
                <p className="text-gray-400 text-sm mt-auto">
                  {dateFormat(item.show.showDateTime)}
                </p>
              </div>
            </div>

            {/* ===== RIGHT SECTION: PAYMENT + SEATS INFO ===== */}
            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              {/* Price & Payment Button */}
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">
                  {currency} {item.amount}
                </p>

                {/* Show "Pay Now" button only if booking is unpaid and not expired */}
                {!item.isPaid ? (
                  isExpired ? (
                    <span className="bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-1.5 mb-3 text-sm rounded-full font-medium">
                      Expired
                    </span>
                  ) : (
                    <Link
                      to={item.paymentLink}
                      className="relative bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer hover:bg-primary-dull transition overflow-hidden group"
                    >
                      <span className="relative z-10">Pay Now</span>
                      <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                    </Link>
                  )
                ) : (
                  <span className="bg-green-600 px-4 py-1.5 mb-3 text-sm rounded-full font-medium text-white">
                    Paid
                  </span>
                )}
              </div>

              {/* Seat Details */}
              <div className="text-sm">
                <p>
                  <span className="text-gray-400">Total Ticket: </span>
                  {item.bookedSeats.length}
                </p>

                <p>
                  <span className="text-gray-400">Seat Number: </span>
                  {item.bookedSeats.join(", ")}
                </p>
              </div>

              {/* Download Ticket Button (only for paid bookings) */}
              {item.isPaid && (
                <button
                  onClick={() => generateTicket(item, currency, image_base_url)}
                  className="flex items-center gap-1.5 mt-3 px-4 py-1.5 text-xs bg-primary/20 hover:bg-primary/40 border border-primary/30 rounded-full font-medium cursor-pointer transition active:scale-95"
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  Download Ticket
                </button>
              )}

              {/* Countdown Timer for unpaid bookings */}
              {!item.isPaid && item.reservedUntil && !isExpired && (
                <div className="mt-3">
                  <CountdownTimer
                    reservedUntil={item.reservedUntil}
                    onExpired={() => handleExpired(item._id)}
                  />
                </div>
              )}

              {!item.isPaid && isExpired && (
                <div className="mt-3 flex items-center gap-1.5 text-red-400 text-xs animate-pulse">
                  <AlertTriangleIcon className="w-3.5 h-3.5" />
                  Reservation expired — seats released
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    // ================= LOADING STATE =================
    <Loading />
  );
}

// Export the component
export default MyBookings;
