import { CalendarIcon, ClockIcon, StarIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";
import { useAppContext } from "../context/AppContext";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { image_base_url } = useAppContext();

  const goToMovie = () => {
    navigate(`/movies/${movie._id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      className="group relative flex flex-col w-64 sm:w-66 rounded-2xl overflow-hidden
        bg-white/5 border border-white/10 backdrop-blur-sm
        hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10
        transition-all duration-300 cursor-pointer"
      onClick={goToMovie}
    >
      {/* Poster */}
      <div className="relative overflow-hidden">
        <img
          src={image_base_url + movie.backdrop_path}
          alt={movie.title}
          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Rating badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
          <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-medium">
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
        {/* Gradient overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/80 to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5 pt-2.5">
        <h3 className="font-semibold text-white truncate text-[15px] leading-tight">
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            {new Date(movie.release_date).getFullYear()}
          </span>
          <span className="text-gray-600">|</span>
          <span>
            {movie.genres
              .slice(0, 2)
              .map((g) => g.name)
              .join(" · ")}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToMovie();
            }}
            className="px-4 py-1.5 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium"
          >
            Buy Tickets
          </button>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <ClockIcon className="w-3 h-3" />
            {timeFormat(movie.runtime)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
