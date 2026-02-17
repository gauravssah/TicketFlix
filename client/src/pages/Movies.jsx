// Import React for building the component
import React from "react";

// Import reusable Movie Card component
import MovieCard from "../components/MovieCard";

// Import background blur design component
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";

// Movies Page Component
function Movies() {
  const { shows } = useAppContext();

  // Check if movies are available in the data
  return shows.length > 0 ? (
    // ---------------- MOVIES LIST SECTION ----------------
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      {/* Decorative Blur Effects */}
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Section Title */}
      <h1 className="text-lg font-medium my-4">Now Showing</h1>

      {/* ---------------- MOVIE CARDS GRID ---------------- */}
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.map((movie) => (
          <MovieCard
            movie={movie} // Passing movie data as prop
            key={movie._id} // Unique key for React list rendering
          />
        ))}
      </div>
    </div>
  ) : (
    // ---------------- EMPTY STATE (NO MOVIES AVAILABLE) ----------------
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      {/* Empty State Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        No Movies Available 🎬
      </h1>

      {/* User Guidance Message */}
      <p className="text-gray-400 max-w-md">
        It looks like there are no movies available right now. Try again later.
      </p>

      {/* Reload Button */}
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-primary cursor-pointer hover:bg-primary-dull transition rounded-full font-medium"
      >
        Refresh Page
      </button>
    </div>
  );
}

// Exporting the Movies component
export default Movies;
