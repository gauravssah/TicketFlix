import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  InstagramIcon,
  HeartIcon,
  FilmIcon,
} from "lucide-react";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "Theaters", to: "/theaters" },
  { label: "Favorites", to: "/favorite" },
  { label: "My Bookings", to: "/my-bookings" },
];

const supportLinks = [{ label: "Privacy Policy", to: "/privacy" }];

const contactInfo = [
  { icon: PhoneIcon, text: "+91 98765 43210", href: "tel:+919876543210" },
  {
    icon: MailIcon,
    text: "support@ticketflix.com",
    href: "mailto:support@ticketflix.com",
  },
  { icon: MapPinIcon, text: "India" },
];

const socialLinks = [
  { icon: TwitterIcon, href: "#", label: "Twitter" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
  { icon: GithubIcon, href: "#", label: "GitHub" },
];

function Footer() {
  return (
    <footer className="relative mt-30 w-full text-gray-300 overflow-hidden">
      {/* Gradient Top Border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Glow Effect Behind Footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm px-6 md:px-16 lg:px-36 pt-14 pb-6">
        {/* ============ MAIN FOOTER GRID ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12">
          {/* -------- COL 1: BRAND -------- */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <img alt="TicketFlix Logo" className="h-12" src={assets.logo} />
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-gray-400 max-w-xs">
              Your one-stop destination for booking movie tickets online.
              Discover movies, explore theaters, and book shows instantly.
            </p>

            {/* App Download Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <img
                src={assets.googlePlay}
                alt="Google Play"
                className="h-10 w-auto border border-gray-600 hover:border-primary/60 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
              />
              <img
                src={assets.appStore}
                alt="App Store"
                className="h-10 w-auto border border-gray-600 hover:border-primary/60 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
              />
            </div>
          </div>

          {/* -------- COL 2: QUICK LINKS -------- */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <FilmIcon className="w-4 h-4 text-primary" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* -------- COL 3: SUPPORT -------- */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <HeartIcon className="w-4 h-4 text-primary" />
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* -------- COL 4: CONTACT -------- */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <MailIcon className="w-4 h-4 text-primary" />
              Get in Touch
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <item.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 group-hover:text-white transition-colors duration-200"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 text-gray-400 hover:text-primary transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ============ BOTTOM BAR ============ */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()}{" "}
            <span className="text-gray-400 font-medium">TicketFlix</span>. All
            Rights Reserved.
          </p>

          <p className="text-xs text-gray-500">
            Developed with{" "}
            <HeartIcon className="w-3 h-3 inline text-primary fill-primary" />{" "}
            by{" "}
            <a
              href="https://www.linkedin.com/in/gauravssah/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dull font-medium transition-colors duration-200"
            >
              Gaurav Sah
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
