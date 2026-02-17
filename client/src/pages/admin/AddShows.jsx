import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import {
  CheckIcon,
  DeleteIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

// Memoized Movie Card to prevent unnecessary re-renders
const MovieCard = React.memo(
  ({ movie, isSelected, onSelect, imageBaseUrl }) => (
    <div
      className="relative max-w-40 min-w-[140px] cursor-pointer hover:opacity-90 hover:-translate-y-1 transition duration-300"
      onClick={() => onSelect(movie.id)}
    >
      <div className="relative rounded-lg overflow-hidden">
        {movie.poster_path ? (
          <img
            src={imageBaseUrl + movie.poster_path}
            alt={movie.title}
            className="w-full object-cover brightness-90"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-500 text-xs text-center p-2">
            No Poster
          </div>
        )}

        <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
          <p className="flex items-center gap-1 text-gray-400">
            <StarIcon className="w-4 h-4 text-primary fill-primary" />
            {movie.vote_average?.toFixed(1) || "N/A"}
          </p>
          {movie.vote_count != null && (
            <p className="text-gray-300">
              {kConverter(movie.vote_count)} Votes
            </p>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
          <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
      )}

      <p className="font-medium truncate">{movie.title}</p>
      <p className="text-gray-400 text-sm">{movie.release_date}</p>
    </div>
  ),
);

const AddShows = () => {
  const { axios, getToken, user, image_base_url, fetchShows } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [sectionPrices, setSectionPrices] = useState({
    premium: "",
    gold: "",
    silver: "",
  });
  const [addingShow, setAddingShow] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);

  const fetchNowPlayingMovies = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/show/now-playing", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error("Error fetching movies: ", error);
    }
  }, [axios, getToken]);

  // Debounced search function
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);

      // Clear previous timer
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // Debounce: wait 400ms after user stops typing
      searchTimerRef.current = setTimeout(async () => {
        try {
          const { data } = await axios.get(
            `/api/show/search?query=${encodeURIComponent(query.trim())}`,
          );
          if (data.success) {
            setSearchResults(data.movies);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 400);
    },
    [axios],
  );

  // Cleanup search timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  }, []);

  const handleSelectMovie = useCallback((movieId) => {
    setSelectedMovie(movieId);
  }, []);

  const handleDateTimeAdd = useCallback(() => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  }, [dateTimeInput]);

  const handleRemoveTime = useCallback((date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setAddingShow(true);

      if (
        !selectedMovie ||
        Object.keys(dateTimeSelection).length === 0 ||
        !sectionPrices.premium ||
        !sectionPrices.gold ||
        !sectionPrices.silver
      ) {
        setAddingShow(false);
        return toast("Missing required fields");
      }

      const showsInput = Object.entries(dateTimeSelection).map(
        ([date, time]) => ({ date, time }),
      );

      const avgPrice = Math.round(
        (Number(sectionPrices.premium) +
          Number(sectionPrices.gold) +
          Number(sectionPrices.silver)) /
          3,
      );

      const payload = {
        movieId: selectedMovie,
        showsInput,
        showPrice: avgPrice,
        sectionPrices: {
          premium: Number(sectionPrices.premium),
          gold: Number(sectionPrices.gold),
          silver: Number(sectionPrices.silver),
        },
      };

      const { data } = await axios.post("/api/show/add", payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        toast.success(data.message);
        // Clear ALL form fields including dateTimeInput
        setSelectedMovie(null);
        setDateTimeSelection({});
        setDateTimeInput("");
        setSectionPrices({ premium: "", gold: "", silver: "" });
        setSearchQuery("");
        setSearchResults([]);
        // Refresh global shows so Movies/Home pages update instantly
        fetchShows();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submission error: ", error);
      toast.error("An error occurred. Please try again.");
    }
    setAddingShow(false);
  }, [
    selectedMovie,
    dateTimeSelection,
    sectionPrices,
    axios,
    getToken,
    fetchShows,
  ]);

  // Memoize dateTimeSelection entries for rendering
  const dateTimeEntries = useMemo(
    () => Object.entries(dateTimeSelection),
    [dateTimeSelection],
  );

  // Find selected movie name for display
  const selectedMovieName = useMemo(() => {
    if (!selectedMovie) return null;
    const fromNowPlaying = nowPlayingMovies.find((m) => m.id === selectedMovie);
    if (fromNowPlaying) return fromNowPlaying.title;
    const fromSearch = searchResults.find((m) => m.id === selectedMovie);
    if (fromSearch) return fromSearch.title;
    return null;
  }, [selectedMovie, nowPlayingMovies, searchResults]);

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user, fetchNowPlayingMovies]);

  // Movies to display (now playing or search results)
  const displayMovies = searchQuery.trim() ? searchResults : nowPlayingMovies;
  const sectionTitle = searchQuery.trim()
    ? `Search Results${isSearching ? " (searching...)" : ""}`
    : "Now Playing Movies";

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      {/* Movie Search Bar */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">
          Search Any Movie
        </label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-lg w-full max-w-md">
          <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type movie name to search..."
            className="outline-none bg-transparent w-full"
          />
          {searchQuery && (
            <XIcon
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white shrink-0"
              onClick={clearSearch}
            />
          )}
        </div>
      </div>

      {/* Selected movie indicator */}
      {selectedMovieName && (
        <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 rounded-lg text-sm">
          <CheckIcon className="w-4 h-4" />
          Selected: <span className="font-semibold">{selectedMovieName}</span>
        </div>
      )}

      <p className="mt-6 text-lg font-medium">{sectionTitle}</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {isSearching && displayMovies.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">Searching...</p>
          ) : displayMovies.length === 0 && searchQuery.trim() ? (
            <p className="text-gray-400 text-sm py-4">
              No movies found for "{searchQuery}"
            </p>
          ) : (
            displayMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isSelected={selectedMovie === movie.id}
                onSelect={handleSelectMovie}
                imageBaseUrl={image_base_url}
              />
            ))
          )}
        </div>
      </div>

      {/* Section-based pricing inputs */}

      <div className="mt-8">
        <label className="block text-sm font-medium mb-3">Section Prices</label>
        <div className="flex flex-wrap gap-4">
          {/* Premium */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-yellow-400">
              Premium (Rows A-B)
            </span>
            <div className="inline-flex items-center gap-2 border border-yellow-500/40 bg-yellow-500/5 px-3 py-2 rounded-md">
              <p className="text-yellow-400 text-sm">{currency}</p>
              <input
                min={0}
                type="number"
                value={sectionPrices.premium}
                onChange={(e) =>
                  setSectionPrices((p) => ({ ...p, premium: e.target.value }))
                }
                placeholder="Price"
                className="outline-none w-24 bg-transparent"
              />
            </div>
          </div>
          {/* Gold */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-primary">
              Gold (Rows C-F)
            </span>
            <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/5 px-3 py-2 rounded-md">
              <p className="text-primary text-sm">{currency}</p>
              <input
                min={0}
                type="number"
                value={sectionPrices.gold}
                onChange={(e) =>
                  setSectionPrices((p) => ({ ...p, gold: e.target.value }))
                }
                placeholder="Price"
                className="outline-none w-24 bg-transparent"
              />
            </div>
          </div>
          {/* Silver */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400">
              Silver (Rows G-J)
            </span>
            <div className="inline-flex items-center gap-2 border border-gray-500/40 bg-gray-500/5 px-3 py-2 rounded-md">
              <p className="text-gray-400 text-sm">{currency}</p>
              <input
                min={0}
                type="number"
                value={sectionPrices.silver}
                onChange={(e) =>
                  setSectionPrices((p) => ({ ...p, silver: e.target.value }))
                }
                placeholder="Price"
                className="outline-none w-24 bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Selection */}

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Select Date and Time
        </label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md"
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display selected times */}

      {dateTimeEntries.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2">Selected Date-Time</h2>
          <ul className="space-y-3">
            {dateTimeEntries.map(([date, times]) => (
              <li key={date}>
                <div className="font-medium">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{time}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={addingShow}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
      >
        {addingShow ? "Adding..." : "Add Show"}
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;
