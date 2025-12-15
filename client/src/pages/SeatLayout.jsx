// Core React hooks for state and lifecycle
import React, { useEffect, useState } from "react";

// React Router hooks for navigation & reading URL params
import { useNavigate, useParams } from "react-router-dom";

// Dummy data & assets
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";

// UI Components
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

// Icons
import { ArrowRightIcon, ClockIcon } from "lucide-react";

// Utility to format ISO time
import isoTimeFormat from "../lib/isoTimeFormat";

// Toast notifications
import { toast } from "react-hot-toast";

// ---------------- SEAT LAYOUT PAGE COMPONENT ----------------
function SeatLayout() {
  // Grouping theater rows for layout structure
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  // Extract movie ID & selected date from URL
  const { id, date } = useParams();

  // State to store selected seats by user
  const [selectedSeats, setSelectedSeats] = useState([]);

  // State to store selected show time
  const [selectedTime, setSelectedTime] = useState(null);

  // State to store movie + timing details
  const [show, setShow] = useState(null);

  // Used for programmatic navigation
  const navigate = useNavigate();

  // ---------------- FETCH MOVIE DETAILS ----------------
  const getShow = async () => {
    // Find the movie based on URL ID
    const show = dummyShowsData.find((show) => show._id === id);

    // If found, store movie & datetime mapping in state
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData,
      });
    }
  };

  // ---------------- SEAT SELECTION HANDLER ----------------
  const handleSeatClick = (seatID) => {
    // Do not allow seat selection before time selection
    if (!selectedTime) {
      return toast("Please select time first");
    }

    // Limit seat selection to max 5 seats
    if (!selectedSeats.includes(seatID) && selectedSeats.length > 4) {
      return toast("You can only select 5 seats");
    }

    // Toggle seat selection (add/remove)
    setSelectedSeats(
      (prev) =>
        prev.includes(seatID)
          ? prev.filter((seat) => seat !== seatID) // remove
          : [...prev, seatID] // add
    );
  };

  // ---------------- DYNAMIC SEAT RENDER FUNCTION ----------------
  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatID = `${row}${i + 1}`; // Example: A1, A2, B1 etc.

          return (
            <button
              key={seatID}
              onClick={() => handleSeatClick(seatID)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer
                ${selectedSeats.includes(seatID) && "bg-primary text-white"}`}
            >
              {seatID}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ---------------- PROCEED TO CHECKOUT HANDLER ----------------
  const handleProceed = () => {
    // Prevent checkout without time
    if (!selectedTime) {
      return toast("Please select a show time");
    }

    // Prevent checkout without seats
    if (selectedSeats.length === 0) {
      return toast("Please select at least one seat");
    }

    // Navigate to booking page after validation
    navigate("/my-bookings");

    // (Future Scope: Send selectedSeats & selectedTime to backend)
  };

  // ---------------- ON COMPONENT LOAD ----------------
  useEffect(() => {
    getShow();
  }, []);

  // ---------------- CONDITIONAL RENDERING ----------------
  return show ? (
    // ================= MAIN SEAT LAYOUT UI =================
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* ================= LEFT SIDE: AVAILABLE TIMINGS ================= */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        {/* Heading */}
        <p className="text-lg font-semibold px-6">Available Timings</p>

        {/* Timings List */}
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition 
                ${
                  selectedTime?.time === item.time
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20"
                }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT SIDE: SEAT SELECTION ================= */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        {/* Decorative background blur */}
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        {/* Screen label */}
        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        {/* Seats Layout */}
        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          {/* First seat group */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          {/* Remaining groups */}
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>{group.map((row) => renderSeats(row))}</div>
            ))}
          </div>
        </div>

        {/* ================= PROCEED BUTTON ================= */}
        <button
          onClick={handleProceed}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : (
    // ================= LOADING STATE =================
    <Loading />
  );
}

// Export component
export default SeatLayout;
