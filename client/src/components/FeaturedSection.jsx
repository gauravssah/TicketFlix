// Import arrow icons from lucide-react
import { ArrowRight, ArrowUpIcon } from "lucide-react";

// Import React for building the component
import React, { useRef } from "react";

// Import navigation hook from React Router
import { useNavigate } from "react-router-dom";

// Import custom background blur component
import BlurCircle from "./BlurCircle";

// Import MovieCard component to display each movie
import MovieCard from "./MovieCard";
import { useAppContext } from "../context/AppContext";

// Featured Movies / Now Showing Section Component
function FeaturedSection() {
  // Hook used for programmatic navigation
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const { shows } = useAppContext();

  return (
    // ---------------- MAIN FEATURED SECTION CONTAINER ----------------
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      {/* ---------------- TOP HEADER SECTION ---------------- */}
      <div className="relative flex items-center justify-between pt-20 pb-6 sm:pb-10">
        <BlurCircle top="0" right="-80px" />

        {/* Section Title */}
        <div>
          <p className="text-white font-semibold text-xl sm:text-lg">
            Now Showing
          </p>
          <p className="text-gray-500 text-xs mt-1 sm:hidden">
            Swipe to explore
          </p>
        </div>

        {/* View All Button */}
        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          View All
          <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
        </button>
      </div>

      {/* ---------------- MOVIE CARDS — MOBILE: horizontal snap scroll, DESKTOP: grid ---------------- */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 mt-2 sm:mt-8
          max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory
          max-sm:scroll-smooth max-sm:-mx-6 max-sm:px-6 max-sm:pb-6 no-scrollbar
          sm:flex-wrap sm:justify-start"
      >
        {shows.slice(0, 6).map((show) => (
          <div
            key={show._id}
            className="max-sm:snap-start max-sm:shrink-0 max-sm:w-[75vw] max-sm:max-w-[300px]"
          >
            <MovieCard movie={show} />
          </div>
        ))}
      </div>

      {/* Mobile scroll indicator dots */}
      <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
        {shows.slice(0, 6).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === 0 ? "w-5 bg-primary" : "w-1.5 bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* ---------------- SHOW MORE BUTTON ---------------- */}
      <div className="flex justify-center mt-14 sm:mt-20">
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
