import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import { CalendarIcon, ClockIcon, StarIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";

function Releases() {
  const { axios, image_base_url } = useAppContext();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcoming = async () => {
    try {
      const { data } = await axios.get("/api/show/upcoming");
      if (data.success) {
        setMovies(data.movies);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading />;

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="100px" left="0px" />
      <BlurCircle bottom="100px" right="0px" />

      {/* Header */}
      <h1 className="text-2xl font-bold">Upcoming Releases</h1>
      <p className="text-gray-400 mt-2">
        Movies coming soon to theaters near you
      </p>

      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            No Upcoming Movies
          </h2>
          <p className="text-gray-400 max-w-md">
            Check back later for new releases.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:-translate-y-1 transition duration-300"
            >
              {/* Poster */}
              <div className="relative overflow-hidden">
                <img
                  src={
                    movie.backdrop_path
                      ? image_base_url + movie.backdrop_path
                      : movie.poster_path
                        ? image_base_url + movie.poster_path
                        : ""
                  }
                  alt={movie.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />
                {/* Release date badge */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs">
                  <CalendarIcon className="w-3 h-3 text-primary" />
                  {new Date(movie.release_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white truncate">
                  {movie.title}
                </h3>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  {movie.vote_average > 0 && (
                    <span className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                  {movie.genre_ids && (
                    <span className="text-gray-500">
                      {movie.original_language?.toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                  {movie.overview || "Details coming soon..."}
                </p>

                {/* Days until release */}
                {(() => {
                  const days = Math.ceil(
                    (new Date(movie.release_date) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  );
                  if (days > 0) {
                    return (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium">
                        <ClockIcon className="w-3.5 h-3.5" />
                        Releasing in {days} {days === 1 ? "day" : "days"}
                      </div>
                    );
                  }
                  return (
                    <div className="mt-3 text-xs text-green-400 font-medium">
                      Now in theaters
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Releases;
