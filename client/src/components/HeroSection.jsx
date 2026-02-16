// Import React for creating the component
import React, { useEffect, useState } from "react";

// Import icons from lucide-react icon library
import { ArrowRight, CalendarIcon, ClockIcon } from "lucide-react";

// Import navigation hook from React Router
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";

// Hero Section Component
function HeroSection() {
  const navigate = useNavigate();
  const { axios, image_base_url } = useAppContext();

  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Fetch upcoming movies from TMDB
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const { data } = await axios.get("/api/show/upcoming");
        if (data.success && data.movies.length > 0) {
          // Only keep movies that have a backdrop image
          const filtered = data.movies.filter((m) => m.backdrop_path);
          setMovies(filtered.slice(0, 8));
        }
      } catch (error) {
        console.error("Hero fetch error:", error);
      }
    };
    fetchUpcoming();
  }, []);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
        setFade(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies]);

  const movie = movies[currentIndex];

  // Fallback while loading
  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const genres = movie.genre_ids ? "" : "";
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "";

  return (
    // ---------------- MAIN HERO CONTAINER ----------------
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${fade ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `url(${image_base_url + movie.backdrop_path})`,
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30" />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 h-full transition-all duration-500 ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        {/* Movie Title */}
        <h1 className="text-4xl md:text-[65px] md:leading-18 font-semibold max-w-[600px] drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Movie Meta Info */}
        <div className="flex items-center gap-4 text-gray-300">
          {year && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4.5 h-4.5" /> {year}
            </div>
          )}
          <span className="text-sm text-gray-400">
            {movie.original_language?.toUpperCase()}
          </span>
        </div>

        {/* Movie Description */}
        <p className="max-w-md text-gray-300 line-clamp-3">{movie.overview}</p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/movies")}
          className="flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Explore Movies
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Dots indicator */}
        {movies.length > 1 && (
          <div className="flex gap-2 mt-4">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setFade(false);
                  setTimeout(() => {
                    setCurrentIndex(i);
                    setFade(true);
                  }, 400);
                }}
                className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                  i === currentIndex
                    ? "bg-primary w-6"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroSection;
