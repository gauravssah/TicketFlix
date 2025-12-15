// React hooks for component state
import React, { useState } from "react";

// React Router for navigation and links
import { Link, useNavigate } from "react-router-dom";

// Project assets (logo etc.)
import { assets } from "../assets/assets";

// Icons from lucide-react
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";

// Clerk authentication hooks & components
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

function Navbar() {
  // State to control mobile menu open/close
  const [isOpen, setIsOpen] = useState(false);

  // Get current logged-in user from Clerk
  const { user } = useUser();

  // Open Clerk's Sign-In modal
  const { openSignIn } = useClerk();

  // Programmatic navigation
  const navigate = useNavigate();

  // Handle navigation click (scroll to top + close mobile menu)
  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
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
        <Link onClick={handleNavClick} to="/favorite">
          Favorites
        </Link>
      </div>

      {/* ------------------- RIGHT SECTION (SEARCH + AUTH) ------------------- */}
      <div className="flex items-center gap-8">
        {/* Search Icon (Hidden on Mobile) */}
        <SearchIcon className="max-md:hidden w-6 h-6 cursor-pointer" />

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
    </div>
  );
}

export default Navbar;
