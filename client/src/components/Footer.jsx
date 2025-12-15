import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="px-6 pt-8 md:px-16 lg:px-36 w-full text-gray-300 bg-black/40">
      {/* ---------------- TOP FOOTER SECTION ---------------- */}
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-600 pb-10">
        {/* -------- LEFT: LOGO + ABOUT -------- */}
        <div className="md:max-w-96">
          <img alt="TicketFlix Logo" className="h-15" src={assets.logo} />

          <p className="mt-6 text-sm leading-relaxed">
            TicketFlix is your one-stop destination for booking movie tickets
            online. Discover the latest movies, explore nearby theaters, watch
            trailers, and book your favorite shows instantly with a seamless
            experience.
          </p>

          {/* App Download Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <img
              src={assets.googlePlay}
              alt="Google Play"
              className="h-10 w-auto border border-white rounded cursor-pointer"
            />
            <img
              src={assets.appStore}
              alt="App Store"
              className="h-10 w-auto border border-white rounded cursor-pointer"
            />
          </div>
        </div>

        {/* -------- RIGHT: LINKS + CONTACT -------- */}
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          {/* Company Links */}
          <div>
            <h2 className="font-semibold mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-white transition">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/theaters" className="hover:text-white transition">
                  Theaters
                </Link>
              </li>
              <li>
                <Link to="/favorite" className="hover:text-white transition">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="font-semibold mb-5">Get in Touch</h2>
            <div className="text-sm space-y-2">
              <p>📞 +91 98765 43210</p>
              <p>📧 support@ticketflix.com</p>
              <p>📍 India</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- BOTTOM COPYRIGHT + DEVELOPER CREDIT ---------------- */}
      <div className="pt-4 text-center text-sm pb-5 space-y-2">
        <p>
          Copyright {new Date().getFullYear()} ©{" "}
          <span className="font-medium">TicketFlix</span>. All Rights Reserved.
        </p>

        {/* ✅ YOUR NAME + LINKEDIN */}
        <p className="text-gray-400">
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/gauravssah/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Gaurav Sah
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
