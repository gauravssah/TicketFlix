// React imports for using component, state and lifecycle hook
import React, { useEffect, useState } from "react";

// React Router hooks for reading URL params and navigation
import { useNavigate, useParams } from "react-router-dom";

// Dummy data for movies and show date/time mappings
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";

// Reusable UI components
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon, CalendarOffIcon } from "lucide-react";

// Utility to format runtime (minutes → 1h 45m)
import timeFormat from "../lib/timeFormat";

// Child components
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";

// ---------------- MOVIE DETAILS PAGE COMPONENT ----------------
function MovieDetails() {
  // For programmatic navigation (e.g. "Show more" button)
  const navigate = useNavigate();

  const {
    shows,
    axios,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    image_base_url,
  } = useAppContext();

  // Read `id` from URL → /movies/:id
  const { id } = useParams();

  // Local state to store current movie/show details
  const [show, setShow] = useState(null);
  // Whether this movie has booking shows or is TMDB-only
  const [hasShows, setHasShows] = useState(false);
  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch current movie data — first try local DB, then fallback to TMDB
  const getShow = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success && data.movie) {
        // Movie exists in local DB (has shows or was added before)
        setShow(data);
        setHasShows(Object.keys(data.dateTime || {}).length > 0);
      } else {
        // Movie not in local DB → fetch from TMDB
        const { data: tmdbData } = await axios.get(`/api/show/tmdb/${id}`);
        if (tmdbData.success && tmdbData.movie) {
          setShow({ movie: tmdbData.movie, dateTime: {} });
          setHasShows(false);
        }
      }
    } catch (error) {
      console.log(error);
      // Try TMDB fallback on any error
      try {
        const { data: tmdbData } = await axios.get(`/api/show/tmdb/${id}`);
        if (tmdbData.success && tmdbData.movie) {
          setShow({ movie: tmdbData.movie, dateTime: {} });
          setHasShows(false);
        }
      } catch (tmdbError) {
        console.log("TMDB fallback also failed:", tmdbError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");

      const { data } = await axios.post(
        "/api/user/update-favorite",
        { movieId: id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );

      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Load movie details whenever `id` changes (i.e. different route)
  useEffect(() => {
    getShow();
  }, [id]);

  // ---------------- CONDITIONAL RENDER: LOADED vs LOADING ----------------
  return show ? (
    // ================= MAIN MOVIE DETAILS WRAPPER =================
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      {/* --------------- TOP SECTION: POSTER + BASIC INFO --------------- */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Movie Poster */}
        <img
          src={image_base_url + show.movie.poster_path}
          alt="poster"
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        {/* Movie Info Panel */}
        <div className="relative flex flex-col gap-3">
          {/* Decorative blur in background */}
          <BlurCircle top="-100px" left="-100px" />

          {/* Language tag */}
          <p className="text-primary">ENGLISH</p>

          {/* Movie Title */}
          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          {/* Rating row */}
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>

          {/* Movie Overview / Description */}
          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          {/* Runtime · Genres · Year */}
          <p>
            {timeFormat(show.movie.runtime)} .{" "}
            {show.movie.genres.map((genre) => genre.name).join(", ")} .{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          {/* --------------- ACTION BUTTONS (CTA) --------------- */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            {/* Watch Trailer (currently UI only) */}
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>

            {/* Scroll to date selection section */}
            {hasShows ? (
              <button
                onClick={() => {
                  document
                    .getElementById("dateSelect")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
              >
                Buy Tickets
              </button>
            ) : (
              <span className="px-6 py-3 text-sm bg-gray-700 text-gray-400 rounded-md font-medium">
                No Shows Available
              </span>
            )}

            {/* Add to favorites (UI only for now) */}
            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 transition ${
                  favoriteMovies.find((movie) => movie._id === id)
                    ? "fill-primary text-primary"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* --------------- CAST SECTION --------------- */}
      <p className="text-lg font-medium mt-20">Your Favorite Cast</p>

      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={image_base_url + cast.profile_path}
                alt="cast profile"
                className="rounded-full h-20 md:h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --------------- DATE & TIME SELECTION (SHOW BOOKING) --------------- */}
      {/* Pass dateTime mapping + current movie id */}
      {hasShows ? (
        <DateSelect dateTime={show.dateTime} id={id} />
      ) : (
        <div className="mt-25 mb-25">
          <div className="flex flex-col items-center justify-center gap-4 p-10 bg-white/5 border border-white/10 rounded-xl text-center">
            <CalendarOffIcon className="w-12 h-12 text-gray-500" />
            <h3 className="text-xl font-semibold text-white">
              No Shows Available
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              This movie doesn't have any scheduled shows for booking right now.
              Check back later or explore other movies currently showing.
            </p>
            <button
              onClick={() => {
                navigate("/movies");
                scrollTo(0, 0);
              }}
              className="mt-2 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Browse Available Movies
            </button>
          </div>
        </div>
      )}

      {/* --------------- RECOMMENDED MOVIES SECTION --------------- */}
      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>

      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      {/* --------------- SHOW MORE BUTTON --------------- */}
      <div className="flex justify-center mt-20 mb-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0); // Scroll to top after navigation (can be made smooth)
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  ) : loading ? (
    // ================= LOADING STATE =================
    <Loading />
  ) : (
    // ================= ERROR STATE (MOVIE NOT FOUND) =================
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Movie Not Found
      </h1>
      <p className="text-gray-400 max-w-md">
        We couldn't find details for this movie. It may have been removed or the
        ID is invalid.
      </p>
      <button
        onClick={() => {
          navigate("/movies");
          scrollTo(0, 0);
        }}
        className="mt-6 px-6 py-3 bg-primary cursor-pointer hover:bg-primary-dull transition rounded-full font-medium"
      >
        Browse Movies
      </button>
    </div>
  );
}

// Exporting for use in router
export default MovieDetails;
