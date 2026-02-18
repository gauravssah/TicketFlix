// React hooks for component state
import React, { useState, useRef, useEffect, useCallback } from "react";

// React Router for navigation and links
import { Link, useNavigate } from "react-router-dom";

// Project assets (logo etc.)
import { assets } from "../assets/assets";

// Icons from lucide-react
import {
  MenuIcon,
  SearchIcon,
  TicketPlus,
  XIcon,
  LoaderIcon,
  TicketIcon,
  LayoutDashboard,
} from "lucide-react";

// Clerk authentication hooks & components
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

function Navbar() {
  const { favoriteMovies, shows, image_base_url, axios, isAdmin } =
    useAppContext();

  // State to control mobile menu open/close
  const [isOpen, setIsOpen] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Get current logged-in user from Clerk
  const { user } = useUser();

  // Open Clerk's Sign-In modal
  const { openSignIn } = useClerk();

  // Programmatic navigation
  const navigate = useNavigate();

  // Build a set of movie IDs that have active shows (bookable)
  const bookableMovieIds = new Set(shows.map((movie) => String(movie._id)));

  // Handle navigation click (scroll to top + close mobile menu)
  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  // Toggle search overlay
  const toggleSearch = () => {
    setSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
      return !prev;
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeSearch();
    };
    if (searchOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Debounced TMDB search
  const searchTMDB = useCallback(
    (query) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!query.trim()) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const { data } = await axios.get(
            `/api/show/search?query=${encodeURIComponent(query)}`,
          );
          if (data.success) {
            setSearchResults(data.movies);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setSearching(false);
        }
      }, 400);
    },
    [axios],
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchTMDB(value);
  };

  // Handle selecting a search result
  const handleSelectMovie = (movieId) => {
    closeSearch();
    navigate(`/movies/${movieId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // Main Navbar Container (fixed at top)
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-transparent">
      {/* ------------------- LOGO SECTION ------------------- */}
      <Link to="/" className="max-md:flex-1" onClick={handleNavClick}>
        <img src={assets.logo} alt="logo" className="w-45 h-auto" />
      </Link>

      {/* ------------------- NAVIGATION LINKS (DESKTOP + MOBILE) ------------------- */}
      <div
        className={`
          md:flex md:items-center md:gap-8 md:px-8 md:py-3 md:rounded-full
          max-md:fixed max-md:top-0 max-md:left-0 max-md:w-full max-md:h-screen
          max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-8
          max-md:text-lg max-md:font-medium
          backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20
          overflow-hidden
          ${isOpen ? "max-md:flex" : "max-md:hidden"}
        `}
      >
        {/* Close icon for mobile menu */}
        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        {/* Navigation Links */}
        <Link onClick={handleNavClick} to="/">
          Home
        </Link>
        <Link onClick={handleNavClick} to="/movies">
          Movies
        </Link>
        <Link onClick={handleNavClick} to="/theaters">
          Theaters
        </Link>
        <Link onClick={handleNavClick} to="/releases">
          Releases
        </Link>
        {favoriteMovies.length > 0 && (
          <Link onClick={handleNavClick} to="/favorite">
            Favorites
          </Link>
        )}
      </div>

      {/* ------------------- RIGHT SECTION (SEARCH + AUTH) ------------------- */}
      <div className="flex items-center gap-5 sm:gap-8">
        {/* Search Icon */}
        <SearchIcon
          className="w-6 h-6 cursor-pointer hover:text-primary transition-colors"
          onClick={toggleSearch}
        />

        {/* If user is NOT logged in → Show Login Button */}
        {!user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          /* If user IS logged in → Show User Profile Button */
          <UserButton>
            {/* Custom Dropdown Menu Items */}
            <UserButton.MenuItems>
              {isAdmin && (
                <UserButton.Action
                  label="Dashboard"
                  labelIcon={<LayoutDashboard width={15} />}
                  onClick={() => navigate("/admin")}
                />
              )}
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus width={15} />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      {/* ------------------- MOBILE MENU ICON ------------------- */}
      <MenuIcon
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(true)}
      />

      {/* =================== SEARCH OVERLAY =================== */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Search Panel */}
          <div
            ref={searchRef}
            className="relative w-full max-w-lg mx-4 mt-20 sm:mt-28 bg-[#0f0a1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-primary/15 overflow-hidden animate-[fadeSlideDown_0.2s_ease-out]"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/10">
              <SearchIcon className="w-5 h-5 text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search any movie..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 outline-none"
                autoComplete="off"
              />
              {searching ? (
                <LoaderIcon className="w-4 h-4 text-primary animate-spin shrink-0" />
              ) : (
                searchQuery && (
                  <XIcon
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white shrink-0"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      inputRef.current?.focus();
                    }}
                  />
                )
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
              {searchQuery.trim() === "" ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <SearchIcon className="w-8 h-8 text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 text-center">
                    Search from millions of movies
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Powered by TMDB</p>
                </div>
              ) : searching ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <LoaderIcon className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm text-gray-400">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((movie) => {
                    const isBookable = bookableMovieIds.has(String(movie.id));
                    return (
                      <div
                        key={movie.id}
                        className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => handleSelectMovie(movie.id)}
                      >
                        {/* Poster */}
                        {movie.poster_path ? (
                          <img
                            src={image_base_url + movie.poster_path}
                            alt={movie.title}
                            className="w-11 h-16 object-cover rounded-lg shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="w-11 h-16 rounded-lg shrink-0 bg-white/5 border border-white/10 flex items-center justify-center">
                            <SearchIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-medium truncate">
                              {movie.title}
                            </p>
                            {isBookable && (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded-full">
                                <TicketIcon className="w-2.5 h-2.5" />
                                Book
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                            {movie.release_date && (
                              <span>
                                {new Date(movie.release_date).getFullYear()}
                              </span>
                            )}
                            {movie.vote_average > 0 && (
                              <span>⭐ {movie.vote_average.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <p className="text-sm text-gray-500 text-center">
                    No movies found for "
                    <span className="text-gray-300">{searchQuery}</span>"
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-gray-600">
                Press ESC to close
              </span>
              <span className="text-[10px] text-gray-600 flex items-center gap-1">
                <TicketIcon className="w-2.5 h-2.5 text-green-500" />= Bookable
                now
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
