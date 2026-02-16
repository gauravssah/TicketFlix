import React from "react";
import BlurCircle from "../components/BlurCircle";
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  MonitorIcon,
  ArmchairIcon,
  PopcornIcon,
  WifiIcon,
  ParkingCircleIcon,
  StarIcon,
} from "lucide-react";

const theaterInfo = {
  name: "TicketFlix Cinema",
  address: "123 Movie Street, Entertainment City, India",
  phone: "+91 98765 43210",
  hours: "10:00 AM - 11:30 PM (Mon - Sun)",
  rating: 4.8,
  reviews: 2450,
};

const seatCategories = [
  {
    name: "Premium",
    color: "yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    rows: "A - B",
    seats: 18,
    desc: "Front rows with recliner seats, personal armrests, and the most immersive viewing angle.",
  },
  {
    name: "Gold",
    color: "purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    rows: "C - F",
    seats: 36,
    desc: "Middle section with plush cushioned seats. The most popular choice for perfect viewing distance.",
  },
  {
    name: "Silver",
    color: "gray-400",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30",
    rows: "G - J",
    seats: 36,
    desc: "Back rows with comfortable standard seats. Great value with a full screen view.",
  },
];

const amenities = [
  { icon: MonitorIcon, label: "4K Dolby Screen" },
  { icon: ArmchairIcon, label: "Recliner Seats" },
  { icon: PopcornIcon, label: "Snack Bar" },
  { icon: WifiIcon, label: "Free Wi-Fi" },
  { icon: ParkingCircleIcon, label: "Parking" },
];

function Theaters() {
  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="100px" left="0px" />
      <BlurCircle bottom="100px" right="0px" />

      {/* Header */}
      <h1 className="text-2xl font-bold">Our Theater</h1>
      <p className="text-gray-400 mt-2">
        Experience movies like never before at TicketFlix Cinema
      </p>

      {/* Theater Info Card */}
      <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {theaterInfo.name}
              <span className="flex items-center gap-1 text-sm font-normal text-yellow-400">
                <StarIcon className="w-4 h-4 fill-yellow-400" />
                {theaterInfo.rating}
                <span className="text-gray-500">
                  ({theaterInfo.reviews.toLocaleString()} reviews)
                </span>
              </span>
            </h2>
            <div className="mt-3 space-y-1.5 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-primary" />
                {theaterInfo.address}
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-primary" />
                {theaterInfo.phone}
              </p>
              <p className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-primary" />
                {theaterInfo.hours}
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-3">
            {amenities.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-gray-300"
              >
                <item.icon className="w-4 h-4 text-primary" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seat Categories */}
      <h2 className="text-lg font-semibold mt-12 mb-6">Seat Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {seatCategories.map((cat) => (
          <div
            key={cat.name}
            className={`p-5 rounded-xl ${cat.bgColor} border ${cat.borderColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-bold text-${cat.color}`}>
                {cat.name}
              </h3>
              <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                Rows {cat.rows}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{cat.desc}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">{cat.seats} seats</span>
              <ArmchairIcon className={`w-5 h-5 text-${cat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Seating Map Visual */}
      <h2 className="text-lg font-semibold mt-12 mb-6">Seating Layout</h2>
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
        {/* Screen */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-3/4 max-w-md h-2 bg-linear-to-r from-transparent via-primary to-transparent rounded-full" />
          <p className="text-xs text-gray-500 mt-2 tracking-widest">
            SCREEN SIDE
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4 max-w-lg mx-auto">
          {seatCategories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-4">
              <span
                className={`w-20 text-sm font-medium text-${cat.color} text-right`}
              >
                {cat.name}
              </span>
              <div className="flex-1 flex gap-1">
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-sm bg-${cat.color}/30`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 w-14">{cat.rows}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-8 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-yellow-400/30" /> Premium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-400/30" /> Gold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gray-400/30" /> Silver
          </span>
        </div>
      </div>

      {/* Info note */}
      <p className="text-center text-sm text-gray-500 mt-8">
        90 total seats · Dolby Atmos Sound · 4K Laser Projection
      </p>
    </div>
  );
}

export default Theaters;
