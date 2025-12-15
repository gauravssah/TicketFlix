// Import star icon for rating display
import { StarIcon } from "lucide-react";

// Import React for creating the component
import React from "react";

// Import navigation hook from React Router
import { useNavigate } from "react-router-dom";

// Utility function to format movie duration (minutes → hours & minutes)
import timeFormat from "../lib/timeFormat";

// MovieCard Component receives a single movie as a prop
function MovieCard({ movie }) {
  // Hook used for programmatic navigation
  const navigate = useNavigate();

  return (
    // ---------------- MAIN MOVIE CARD CONTAINER ----------------
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66">
      {/* ---------------- MOVIE POSTER / THUMBNAIL ---------------- */}
      {/* On click → Navigate to movie detail page & scroll to top */}
      <img
        onClick={() => {
          navigate(`/movies/${movie._id}`);
          scrollTo(0, 0);
        }}
        src={movie.backdrop_path}
        alt="logo"
        className="rounded-lg h-52 w-full object-cover object-bottom-right cursor-pointer"
      />

      {/* ---------------- MOVIE TITLE ---------------- */}
      {/* truncate → prevents text overflow */}
      <p className="font-semibold mt-2 truncate">{movie.title}</p>

      {/* ---------------- MOVIE META DETAILS ---------------- */}
      {/* Release Year | Genres | Runtime */}
      <p>
        {new Date(movie.release_date).getFullYear()} .{" "}
        {movie.genres
          .slice(0, 2) // Only showing first two genres
          .map((genre) => genre.name) // Extract genre names
          .join(" | ")}{" "}
        {/* Join with separator */}. {timeFormat(movie.runtime)}{" "}
        {/* Convert runtime into readable format */}
      </p>

      {/* ---------------- BOTTOM SECTION (CTA + RATING) ---------------- */}
      <div className="flex items-center justify-between mt-4 pb-3">
        {/* ---------------- BUY TICKETS BUTTON ---------------- */}
        {/* Redirects user to movie detail page */}
        <button
          onClick={() => {
            navigate(`/movies/${movie._id}`);
            scrollTo(0, 0);
          }}
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        {/* ---------------- MOVIE RATING ---------------- */}
        <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
          <StarIcon className="w-4 h-4 text-primary fill-primary" />
          {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </div>
  );
}

// Exporting component for usage in other files
export default MovieCard;
