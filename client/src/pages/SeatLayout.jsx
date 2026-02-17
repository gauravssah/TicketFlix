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
import { ArrowRightIcon, ClockIcon, LoaderCircleIcon } from "lucide-react";

// Utility to format ISO time
import isoTimeFormat from "../lib/isoTimeFormat";

// Toast notifications
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

// ─── SEAT SECTIONS CONFIG ───
const seatSections = {
  premium: {
    label: "Premium",
    rows: ["A", "B"],
    color: "yellow-400",
    bgSelected: "bg-yellow-500",
    borderColor: "border-yellow-500/60",
    bgHover: "hover:bg-yellow-500/10",
    desc: "Front rows · Best view",
  },
  gold: {
    label: "Gold",
    rows: ["C", "D", "E", "F"],
    color: "purple-400",
    bgSelected: "bg-primary",
    borderColor: "border-primary/60",
    bgHover: "hover:bg-primary/10",
    desc: "Middle section · Popular",
  },
  silver: {
    label: "Silver",
    rows: ["G", "H", "I", "J"],
    color: "gray-400",
    bgSelected: "bg-gray-500",
    borderColor: "border-gray-500/60",
    bgHover: "hover:bg-gray-500/10",
    desc: "Back rows · Value",
  },
};

// helper: get section key from seat id
const getSeatSection = (seatId) => {
  const row = seatId.charAt(0).toUpperCase();
  if (["A", "B"].includes(row)) return "premium";
  if (["C", "D", "E", "F"].includes(row)) return "gold";
  return "silver";
};

// ---------------- SEAT LAYOUT PAGE COMPONENT ----------------
function SeatLayout() {
  const currency = import.meta.env.VITE_CURRENCY;

  // Extract movie ID & selected date from URL
  const { id, date } = useParams();

  // State
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate();
  const { axios, getToken, user } = useAppContext();

  // Current section prices from selected time
  const prices = selectedTime?.sectionPrices || {
    premium: 0,
    gold: 0,
    silver: 0,
  };

  // ─── FETCH SHOW ───
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

  // ─── SEAT CLICK ───
  const handleSeatClick = (seatID) => {
    if (!selectedTime) return toast("Please select time first");
    if (occupiedSeats.includes(seatID)) return;
    if (!selectedSeats.includes(seatID) && selectedSeats.length >= 10)
      return toast("You can select max 10 seats");

    setSelectedSeats((prev) =>
      prev.includes(seatID)
        ? prev.filter((seat) => seat !== seatID)
        : [...prev, seatID],
    );
  };

  // ─── CALCULATE TOTAL ───
  const totalAmount = selectedSeats.reduce((sum, seat) => {
    const section = getSeatSection(seat);
    return sum + (prices[section] || 0);
  }, 0);

  // ─── RENDER SEATS FOR A ROW ───
  const renderSeats = (row, sectionKey, count = 9) => {
    const section = seatSections[sectionKey];
    return (
      <div key={row} className="flex gap-1.5 sm:gap-2 mt-1.5">
        {Array.from({ length: count }, (_, i) => {
          const seatID = `${row}${i + 1}`;
          const isSelected = selectedSeats.includes(seatID);
          const isOccupied = occupiedSeats.includes(seatID);

          return (
            <button
              disabled={isOccupied}
              key={seatID}
              onClick={() => handleSeatClick(seatID)}
              className={`relative h-7 w-7 sm:h-8 sm:w-8 rounded text-[10px] sm:text-xs font-medium cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? `${section.bgSelected} text-white border ${section.borderColor} scale-105 shadow-lg`
                    : isOccupied
                      ? "opacity-25 cursor-not-allowed border border-red-500/40 bg-red-900/20 text-gray-500 line-through"
                      : `border ${section.borderColor} ${section.bgHover} text-gray-300`
                }`}
            >
              {isOccupied ? "✕" : seatID}
            </button>
          );
        })}
      </div>
    );
  };

  // ─── RENDER A FULL SECTION ───
  const renderSection = (sectionKey) => {
    const section = seatSections[sectionKey];
    const rowPairs = [];
    for (let i = 0; i < section.rows.length; i += 2) {
      rowPairs.push(section.rows.slice(i, i + 2));
    }

    return (
      <div key={sectionKey} className="w-full mb-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm bg-${section.color}`} />
            <span className={`text-sm font-semibold text-${section.color}`}>
              {section.label}
            </span>
            <span className="text-[10px] text-gray-500">{section.desc}</span>
          </div>
          {selectedTime && (
            <span className={`text-sm font-bold text-${section.color}`}>
              {currency} {prices[sectionKey]}
            </span>
          )}
        </div>

        {/* Rows */}
        <div className="flex flex-col items-center gap-0.5">
          {sectionKey === "premium" ? (
            // Premium: centered single block
            <div className="flex flex-col items-center gap-0.5">
              {section.rows.map((row) => renderSeats(row, sectionKey))}
            </div>
          ) : (
            // Gold & Silver: 2-column layout with aisle
            <div className="grid grid-cols-2 gap-6 sm:gap-10">
              {rowPairs.map((pair, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  {pair.map((row) => renderSeats(row, sectionKey))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section divider */}
        <div className="mt-4 border-b border-dashed border-gray-700/50" />
      </div>
    );
  };

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime.showId}`,
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

      setIsBooking(true);

      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime.showId,
          selectedSeats,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
        setIsBooking(false);
      }
    } catch (error) {
      toast.error(error.message);
      setIsBooking(false);
    }
  };

  useEffect(() => {
    getShow();
  }, []);

  useEffect(() => {
    if (selectedTime) {
      setSelectedSeats([]);
      getOccupiedSeats();
    }
  }, [selectedTime]);

  // ─── RENDER ───
  return show ? (
    <div className="flex flex-col md:flex-row px-4 sm:px-6 md:px-16 lg:px-32 py-28 md:pt-44 gap-8">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <div className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-28 h-max">
        {/* Timings */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
          <p className="text-lg font-semibold">Available Timings</p>
          <div className="mt-4 space-y-1">
            {show.dateTime[date].map((item) => (
              <div
                key={item.time}
                onClick={() => setSelectedTime(item)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition 
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

        {/* Price Legend */}
        {selectedTime && (
          <div className="bg-white/5 border border-gray-700/40 rounded-xl p-5">
            <p className="text-sm font-semibold mb-3">Seat Categories</p>
            {Object.entries(seatSections).map(([key, sec]) => (
              <div
                key={key}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm bg-${sec.color}`} />
                  <span className="text-xs text-gray-300">{sec.label}</span>
                </div>
                <span className={`text-xs font-bold text-${sec.color}`}>
                  {currency} {prices[key]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Selected Seats Summary */}
        {selectedSeats.length > 0 && (
          <div className="bg-white/5 border border-gray-700/40 rounded-xl p-5">
            <p className="text-sm font-semibold mb-3">Your Selection</p>
            <div className="space-y-1.5">
              {selectedSeats.map((seat) => {
                const sec = getSeatSection(seat);
                return (
                  <div
                    key={seat}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-300">
                      {seat} ({seatSections[sec].label})
                    </span>
                    <span className="font-medium">
                      {currency} {prices[sec]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50 text-sm font-bold">
              <span>Total</span>
              <span className="text-primary">
                {currency} {totalAmount}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ RIGHT: SEAT LAYOUT ═══ */}
      <div className="relative flex-1 flex flex-col items-center">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        {/* Screen */}
        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-8">SCREEN SIDE</p>

        {/* Sections */}
        <div className="flex flex-col items-center w-full max-w-2xl text-xs text-gray-300">
          {renderSection("premium")}
          {renderSection("gold")}
          {renderSection("silver")}
        </div>

        {/* Seat Legend */}
        <div className="flex items-center gap-6 mt-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded border border-gray-500/60" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-primary border border-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-red-900/20 border border-red-500/40 opacity-40" />
            <span>Occupied</span>
          </div>
        </div>

        {/* Proceed Button */}
        {selectedSeats.length > 0 && (
          <button
            onClick={bookTickets}
            disabled={isBooking}
            className={`flex items-center justify-center gap-2 mt-12 px-10 py-3 text-sm rounded-full font-medium shadow-lg shadow-primary/20 transition-all duration-300
              ${
                isBooking
                  ? "bg-primary/60 cursor-not-allowed scale-95"
                  : "bg-primary hover:bg-primary-dull cursor-pointer active:scale-95"
              }`}
          >
            {isBooking ? (
              <>
                <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                <span>Redirecting to Payment...</span>
              </>
            ) : (
              <>
                Pay {currency} {totalAmount}
                <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  ) : (
    <Loading />
  );
}

export default SeatLayout;
