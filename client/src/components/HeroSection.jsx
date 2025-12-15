// Import React for creating the component
import React from "react";

// Import project assets (images, logos, etc.)
import { assets } from "../assets/assets";

// Import icons from lucide-react icon library
import { ArrowRight, CalendarIcon, ClockIcon } from "lucide-react";

// Import navigation hook from React Router
import { useNavigate } from "react-router-dom";

// Hero Section Component
function HeroSection() {
  // Hook used for programmatic navigation (redirect on button click)
  const navigate = useNavigate();

  return (
    // ---------------- MAIN HERO CONTAINER ----------------
    // Full screen background image with left-aligned content
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
      {/* ---------------- MOVIE BRAND LOGO ---------------- */}
      <img
        src={assets.marvelLogo}
        alt="logo"
        className="max-h-11 lg:h-11 mt-20"
      />

      {/* ---------------- MOVIE TITLE ---------------- */}
      <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
        Guardians <br />
        of the Galaxy
      </h1>

      {/* ---------------- MOVIE META INFO ---------------- */}
      {/* Genre | Release Year | Duration */}
      <div className="flex items-center gap-4 text-gray-300">
        {/* Movie Genre */}
        <span>Action | Adventure | Sci-Fi </span>

        {/* Release Year */}
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4.5 h-4.5" /> 2018
        </div>

        {/* Movie Duration */}
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4.5 h-4.5" /> 2h 8m
        </div>
      </div>

      {/* ---------------- MOVIE DESCRIPTION ---------------- */}
      <p className="max-w-md text-gray-300">
        In a post-apoclyptic world where cities ride on wheels and consume each
        other to survive, two people meet in London and try to stop a
        conspiracy.
      </p>

      {/* ---------------- CALL TO ACTION BUTTON ---------------- */}
      {/* Redirects user to Movies page */}
      <button
        onClick={() => navigate("/movies")}
        className="flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
      >
        Explore Movies
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Exporting the component for use in other files
export default HeroSection;
