// React hooks for state management & lifecycle
import React, { useEffect, useState } from "react";

// Dummy booking data (temporary data source)
import { dummyBookingData } from "../assets/assets";

// Reusable UI components
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

// Utility functions for formatting time & date
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";

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
  // Simulates fetching bookings from backend/API
  const getMyBookings = async () => {
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
  };

  // Load bookings when component mounts
  useEffect(() => {
    if (user) {
      getMyBookings();
    }
  }, [user]);

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

      {/* ================= BOOKINGS LIST ================= */}
      {bookings.map((item, index) => (
        // ---------------- SINGLE BOOKING CARD ----------------
        <div
          key={index}
          className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
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

              {/* Show "Pay Now" button only if booking is unpaid */}
              {!item.isPaid && (
                <button className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer">
                  Pay Now
                </button>
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
          </div>
        </div>
      ))}
    </div>
  ) : (
    // ================= LOADING STATE =================
    <Loading />
  );
}

// Export the component
export default MyBookings;
