// Import arrow icons from lucide-react
import { ArrowRight, ArrowUpIcon } from "lucide-react";

// Import React for building the component
import React from "react";

// Import navigation hook from React Router
import { useNavigate } from "react-router-dom";

// Import custom background blur component
import BlurCircle from "./BlurCircle";

// Import dummy movie/show data
import { dummyShowsData } from "../assets/assets";

// Import MovieCard component to display each movie
import MovieCard from "./MovieCard";
import { useAppContext } from "../context/AppContext";

// Featured Movies / Now Showing Section Component
function FeaturedSection() {
  // Hook used for programmatic navigation
  const navigate = useNavigate();

  const { shows } = useAppContext();

  return (
    // ---------------- MAIN FEATURED SECTION CONTAINER ----------------
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      {/* ---------------- TOP HEADER SECTION ---------------- */}
      {/* Contains section title + View All button */}
      <div className="relative flex items-center justify-between pt-20 pb-10">
        {/* Decorative Blur Effect in Background */}
        <BlurCircle top="0" right="-80px" />

        {/* Section Title */}
        <p className="text-gray-300 font-medium text-lg">Now Showing</p>

        {/* View All Button → Redirects to Movies Page */}
        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          View All
          {/* Right Arrow with hover animation */}
          <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
        </button>
      </div>

      {/* ---------------- MOVIE CARD GRID ---------------- */}
      {/* Display only first 4 movies from dummy data */}
      <div className="flex flex-wrap max-sm:justify-center gap-8 mt-8">
        {shows.slice(0, 4).map((show) => (
          <MovieCard key={show._id} movie={show} />
        ))}
      </div>

      {/* ---------------- SHOW MORE BUTTON ---------------- */}
      {/* Navigates to full Movies page and scrolls to top */}
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  );
}

// Exporting component for use in other parts of the app
export default FeaturedSection;
