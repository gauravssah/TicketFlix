// Core React hooks for state and lifecycle
import React, { useEffect, useState } from "react";

// React Router hooks for navigation & reading URL params
import { useNavigate, useParams } from "react-router-dom";

// Dummy data & assets
import { assets } from "../assets/assets";

// UI Components
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";

// Icons
import { ArrowRightIcon, ClockIcon } from "lucide-react";

// Utility to format ISO time
import isoTimeFormat from "../lib/isoTimeFormat";

// Toast notifications
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

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

  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Used for programmatic navigation
  const navigate = useNavigate();

  const { axios, getToken, user } = useAppContext();

  // ---------------- FETCH MOVIE DETAILS ----------------
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---------------- SEAT SELECTION HANDLER ----------------
  const handleSeatClick = (seatID) => {
    if (!selectedTime) return toast("Please select time first");

    if (occupiedSeats.includes(seatID)) return;

    if (!selectedSeats.includes(seatID) && selectedSeats.length > 4)
      return toast("You can only select 5 seats");

    setSelectedSeats((prev) =>
      prev.includes(seatID)
        ? prev.filter((seat) => seat !== seatID)
        : [...prev, seatID]
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
              disabled={occupiedSeats.includes(seatID)}
              key={seatID}
              onClick={() => handleSeatClick(seatID)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer
                ${selectedSeats.includes(seatID) && "bg-primary text-white"}
                ${
                  occupiedSeats.includes(seatID) &&
                  "opacity-40 cursor-not-allowed"
                }
                `}
            >
              {seatID}
            </button>
          );
        })}
      </div>
    </div>
  );

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/bookings/seats/${selectedTime.showId}` // ✅ REAL Mongo ID
      );

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");

      if (!selectedTime || !selectedSeats.length)
        return toast.error("Please select a time and seats");

      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime.showId,
          selectedSeats,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ---------------- ON COMPONENT LOAD ----------------
  useEffect(() => {
    getShow();
  }, []);

  useEffect(() => {
    if (selectedTime) {
      setSelectedSeats([]);
      getOccupiedSeats();
    }
  }, [selectedTime]);

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
          onClick={bookTickets}
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
