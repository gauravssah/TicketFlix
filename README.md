# 🎬 TicketFlix — Online Movie Ticket Booking System

🚀 **Live Demo:** [https://ticketflix-eight.vercel.app](https://ticketflix-eight.vercel.app)

👤 **Author LinkedIn:** [gauravssah](https://www.linkedin.com/in/gauravssah)

A **full-stack**, production-ready movie ticket booking platform built with the **MERN stack** (MongoDB, Express.js, React, Node.js). Users can browse movies, select seats across tiered sections, pay securely via **Stripe**, and receive PDF tickets and email confirmations — all powered by **Clerk** authentication, **TMDB** movie data, **Inngest** background jobs, and deployed on **Vercel**.

---

## 📑 Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Features](#4-features)
5. [System Architecture](#5-system-architecture)
6. [Database Schema Explanation](#6-database-schema-explanation)
7. [API Endpoints Explanation](#7-api-endpoints-explanation)
8. [Authentication Flow](#8-authentication-flow)
9. [Seat Selection Logic](#9-seat-selection-logic)
10. [Payment Integration Process](#10-payment-integration-process)
11. [Tech Stack](#11-tech-stack)
12. [Folder Structure Explanation](#12-folder-structure-explanation)
13. [Installation Steps](#13-installation-steps)
14. [Environment Variables](#14-environment-variables)
15. [Deployment Guide](#15-deployment-guide)
16. [Future Scope](#16-future-scope)
17. [Conclusion](#17-conclusion)

---

## 1. Introduction

**TicketFlix** is a modern, real-time movie ticket booking system that replicates the core experience of platforms like BookMyShow and Fandango. It enables users to discover currently playing and upcoming movies (via the TMDB API), select showtimes, choose their preferred seats from a multi-tier layout (Premium / Gold / Silver), and complete payment through Stripe Checkout. Upon successful payment, users receive a beautifully designed PDF ticket download and an email confirmation.

The platform includes a fully functional **Admin Dashboard** where administrators can add new shows by searching TMDB, manage existing shows, view booking analytics, and monitor revenue — all protected behind role-based access control using Clerk's private metadata.

---

## 2. Problem Statement

Traditional movie ticket booking involves standing in long queues, limited showtime visibility, and no real-time seat availability. Even many online solutions lack:

- **Real-time seat locking** — Multiple users may attempt to book the same seats simultaneously, leading to double-booking conflicts.
- **Automatic reservation expiry** — If a user abandons payment, seats remain unavailable indefinitely.
- **Tiered pricing** — Different seat sections (front, middle, back) often need different price points, which many systems don't support.
- **Unified movie data** — Manually entering movie details is error-prone and time-consuming for administrators.
- **Secure, role-based admin access** — Admin panels are often protected by weak, home-grown authentication.

TicketFlix addresses all of these issues with a robust, production-grade architecture.

---

## 3. Objectives

| #   | Objective                                                                                   |
| --- | ------------------------------------------------------------------------------------------- |
| 1   | Build a responsive, modern UI for browsing movies and booking tickets                       |
| 2   | Integrate real-time movie data from the **TMDB API**                                        |
| 3   | Implement a **multi-tier seat selection** system with live availability                     |
| 4   | Process payments securely via **Stripe Checkout** with webhook verification                 |
| 5   | Auto-release unpaid seat reservations after a **10-minute timeout** using Inngest           |
| 6   | Send booking confirmation **emails** with styled HTML templates via Nodemailer (Brevo SMTP) |
| 7   | Generate downloadable **PDF tickets** on the client using jsPDF                             |
| 8   | Provide a protected **Admin Dashboard** for show and booking management                     |
| 9   | Use **Clerk** for authentication with role-based access control via private metadata        |
| 10  | Deploy both client and server independently on **Vercel**                                   |

---

## 4. Features

### 🎥 User Features

| Feature                         | Description                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Movie Discovery**             | Browse now-playing and upcoming movies fetched live from TMDB                                             |
| **Movie Search**                | Debounced global search across millions of TMDB movies with bookable indicators                           |
| **Movie Details**               | Full movie info — poster, backdrop, tagline, genres, cast, rating, runtime                                |
| **Showtime Selection**          | View available showtimes grouped by date for each movie                                                   |
| **Tiered Seat Selection**       | Interactive seat map with **Premium** (rows A–B), **Gold** (rows C–F), and **Silver** (rows G–J) sections |
| **Real-time Seat Availability** | Occupied seats are greyed out; selections are locked instantly to prevent double-booking                  |
| **Stripe Checkout**             | Secure payment flow via Stripe Checkout sessions with automatic redirect                                  |
| **10-Minute Reservation**       | Seats are held for 10 minutes; auto-released if payment isn't completed                                   |
| **PDF Ticket Download**         | Generate a premium-styled landscape PDF ticket with movie details, seats, and QR-style info               |
| **Email Confirmation**          | HTML email with full booking details sent upon successful payment                                         |
| **Favorites**                   | Mark/unmark movies as favorites (stored in Clerk private metadata)                                        |
| **Booking History**             | View all past and current bookings with status and payment link for pending ones                          |
| **Responsive Design**           | Fully responsive UI across mobile, tablet, and desktop                                                    |

### 🛠️ Admin Features

| Feature                    | Description                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| **Admin Dashboard**        | Overview of total bookings, revenue, active shows, and registered users                         |
| **Add Shows**              | Search TMDB movies, select dates and times, set section-based pricing, and create shows         |
| **List Shows**             | View and manage all upcoming shows with the ability to delete shows (if no paid bookings exist) |
| **List Bookings**          | View all bookings across all users with payment status and booking details                      |
| **Role-Based Access**      | Only users with `role: "admin"` in Clerk private metadata can access `/admin` routes            |
| **Dashboard Quick Access** | Admin users see a "Dashboard" link in their Clerk profile dropdown                              |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                        │
│                                                                     │
│  ClerkProvider → BrowserRouter → AppProvider → App                  │
│                                                                     │
│  Pages: Home, Movies, MovieDetails, SeatLayout, MyBookings,        │
│         Favorites, Theaters, Releases, Admin/*                      │
│                                                                     │
│  State: AppContext (user, isAdmin, shows, favorites, tokens)        │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS (Axios + Bearer Token)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVER (Express.js + Node.js)                   │
│                                                                     │
│  Middleware: clerkMiddleware() → CORS → JSON Parser                 │
│                                                                     │
│  Routes:                                                            │
│    /api/show/*       → TMDB proxy + Show CRUD                      │
│    /api/booking/*    → Seat reservation + Stripe Checkout           │
│    /api/admin/*      → Dashboard data + Admin CRUD (protectAdmin)  │
│    /api/user/*       → Bookings + Favorites                        │
│    /api/stripe       → Stripe Webhook handler (raw body)           │
│    /api/inngest      → Inngest event handler                       │
│                                                                     │
│  Background Jobs (Inngest):                                         │
│    • Sync Clerk user events (create/update/delete)                 │
│    • Auto-release unpaid seats after 10 min                        │
│    • Send booking confirmation emails                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB Atlas)                        │
│                                                                     │
│  Collections: users, movies, shows, bookings                       │
│                                                                     │
│  External Services:                                                 │
│    • TMDB API (movie data)                                         │
│    • Stripe (payments)                                             │
│    • Clerk (authentication)                                        │
│    • Inngest (background jobs)                                     │
│    • Brevo SMTP (transactional emails)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User opens app** → ClerkProvider initializes auth state → AppContext fetches shows and favorites.
2. **User browses movies** → Client fetches TMDB data via server proxy endpoints.
3. **User selects a show** → Client fetches occupied seats for that show from the database.
4. **User selects seats** → Prices are calculated client-side based on section (Premium/Gold/Silver).
5. **User clicks "Book Now"** → Server creates a booking, marks seats as occupied, creates a Stripe Checkout session, and triggers an Inngest reservation timer.
6. **User pays on Stripe** → Stripe webhook marks booking as paid and sends a confirmation email.
7. **If user doesn't pay within 10 min** → Inngest function auto-releases the reserved seats and deletes the booking.

---

## 6. Database Schema Explanation

### 6.1 User Schema

| Field   | Type   | Description                                              |
| ------- | ------ | -------------------------------------------------------- |
| `_id`   | String | Clerk user ID (e.g., `user_2x...`) — acts as primary key |
| `name`  | String | User's full name from Clerk                              |
| `email` | String | Primary email from Clerk                                 |
| `image` | String | Profile image URL from Clerk                             |

> **Note:** Users are synced automatically from Clerk via Inngest webhook functions (`clerk/user.created`, `clerk/user.updated`, `clerk/user.deleted`).

### 6.2 Movie Schema

| Field               | Type   | Description                             |
| ------------------- | ------ | --------------------------------------- |
| `_id`               | String | TMDB movie ID (e.g., `798645`)          |
| `title`             | String | Movie title                             |
| `overview`          | String | Plot synopsis                           |
| `poster_path`       | String | TMDB poster image path                  |
| `backdrop_path`     | String | TMDB backdrop image path                |
| `release_date`      | String | Release date (YYYY-MM-DD)               |
| `original_language` | String | Original language code                  |
| `tagline`           | String | Movie tagline                           |
| `genres`            | Array  | Array of genre objects `{ id, name }`   |
| `casts`             | Array  | Array of cast objects from TMDB credits |
| `vote_average`      | Number | TMDB rating (0–10)                      |
| `runtime`           | Number | Runtime in minutes                      |

> Movies are created automatically when an admin adds a show for a movie not yet in the database.

### 6.3 Show Schema

| Field           | Type                | Description                                              |
| --------------- | ------------------- | -------------------------------------------------------- |
| `_id`           | ObjectId            | Auto-generated MongoDB ID                                |
| `movie`         | String (ref: Movie) | Reference to the Movie document                          |
| `showDateTime`  | Date                | Exact date and time of the show                          |
| `showPrice`     | Number              | Base ticket price                                        |
| `sectionPrices` | Object              | `{ premium, gold, silver }` — per-section pricing        |
| `occupiedSeats` | Object              | Dynamic map of `{ "A1": "userId", "C5": "userId", ... }` |

> `occupiedSeats` uses `{ minimize: false }` in Mongoose to persist even when the object is empty.

### 6.4 Booking Schema

| Field           | Type               | Description                                                      |
| --------------- | ------------------ | ---------------------------------------------------------------- |
| `_id`           | ObjectId           | Auto-generated MongoDB ID                                        |
| `user`          | String (ref: User) | Clerk user ID who made the booking                               |
| `show`          | String (ref: Show) | Show ID for this booking                                         |
| `amount`        | Number             | Total amount calculated from section prices                      |
| `bookedSeats`   | Array              | Array of seat IDs like `["A1", "A2", "C5"]`                      |
| `isPaid`        | Boolean            | Payment status (default: `false`)                                |
| `paymentLink`   | String             | Stripe Checkout URL (cleared after payment)                      |
| `reservedUntil` | Date               | Expiration timestamp for the reservation (10 min after creation) |
| `createdAt`     | Date               | Timestamp (auto via `timestamps: true`)                          |
| `updatedAt`     | Date               | Timestamp (auto via `timestamps: true`)                          |

---

## 7. API Endpoints Explanation

### 7.1 Show Routes (`/api/show`)

| Method | Endpoint            | Auth   | Description                                                  |
| ------ | ------------------- | ------ | ------------------------------------------------------------ |
| `GET`  | `/now-playing`      | Admin  | Fetch now-playing movies from TMDB (for admin show creation) |
| `GET`  | `/upcoming`         | Public | Fetch upcoming movies from TMDB                              |
| `GET`  | `/search?query=...` | Public | Search movies on TMDB (debounced, returns top 8)             |
| `GET`  | `/tmdb/:movieId`    | Public | Get full movie details + credits from TMDB                   |
| `POST` | `/add`              | Admin  | Create new show(s) — auto-creates Movie if not in DB         |
| `GET`  | `/all`              | Public | Get all upcoming shows with populated movie data             |
| `GET`  | `/:movieId`         | Public | Get all upcoming shows for a specific movie                  |

### 7.2 Booking Routes (`/api/booking`)

| Method | Endpoint          | Auth   | Description                                                 |
| ------ | ----------------- | ------ | ----------------------------------------------------------- |
| `POST` | `/create`         | User   | Reserve seats, create booking, initiate Stripe Checkout     |
| `GET`  | `/seats/:showId`  | Public | Get occupied seats for a show (releases expired ones first) |
| `POST` | `/verify-payment` | User   | Verify Stripe session and mark booking as paid              |

### 7.3 Admin Routes (`/api/admin`)

| Method   | Endpoint        | Auth  | Description                                           |
| -------- | --------------- | ----- | ----------------------------------------------------- |
| `GET`    | `/is-admin`     | Admin | Check if current user has admin role                  |
| `GET`    | `/dashboard`    | Admin | Get dashboard stats (bookings, revenue, shows, users) |
| `GET`    | `/all-shows`    | Admin | Get all upcoming shows for management                 |
| `GET`    | `/all-bookings` | Admin | Get all bookings with user and show details           |
| `DELETE` | `/show/:showId` | Admin | Delete a show (blocked if paid bookings exist)        |

### 7.4 User Routes (`/api/user`)

| Method | Endpoint           | Auth | Description                                                   |
| ------ | ------------------ | ---- | ------------------------------------------------------------- |
| `GET`  | `/bookings`        | User | Get current user's bookings (cleans up expired ones)          |
| `POST` | `/update-favorite` | User | Toggle a movie as favorite (stored in Clerk private metadata) |
| `GET`  | `/favorite`        | User | Get all favorite movies for current user                      |

### 7.5 Webhook Routes

| Method | Endpoint       | Auth             | Description                                            |
| ------ | -------------- | ---------------- | ------------------------------------------------------ |
| `POST` | `/api/stripe`  | Stripe Signature | Stripe webhook for `checkout.session.completed` events |
| `POST` | `/api/inngest` | Inngest SDK      | Inngest event handler for background functions         |

---

## 8. Authentication Flow

TicketFlix uses **Clerk** for authentication — a complete, hosted auth solution that handles sign-up, sign-in, session management, and user profiles out of the box.

### Flow Overview

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Client   │────▶│   Clerk UI   │────▶│  Clerk API   │────▶│  JWT     │
│  (React)  │◀────│  (SignIn /   │◀────│  (Session)   │◀────│  Token   │
│           │     │  UserButton) │     │              │     │          │
└──────────┘     └──────────────┘     └──────────────┘     └────┬─────┘
                                                                 │
                                                    Bearer Token │
                                                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         SERVER (Express)                             │
│                                                                      │
│  clerkMiddleware() → parses JWT from Authorization header            │
│                    → populates req.auth() with { userId }            │
│                                                                      │
│  protectAdmin middleware:                                            │
│    1. Extract userId from req.auth()                                │
│    2. Fetch user from Clerk API: clerkClient.users.getUser(userId)  │
│    3. Check user.privateMetadata.role === 'admin'                   │
│    4. If not admin → return 403                                     │
│    5. If admin → next()                                             │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Concepts

1. **ClerkProvider** wraps the entire React app, providing auth context to all components.
2. **`useUser()`** hook gives access to the current user object on the client.
3. **`useAuth().getToken()`** generates a short-lived JWT for API requests.
4. **`clerkMiddleware()`** on the server validates the JWT and populates `req.auth()`.
5. **`protectAdmin`** middleware fetches the full Clerk user and checks `privateMetadata.role === 'admin'`.
6. **Clerk Webhooks** (via Inngest) sync user data to MongoDB on create, update, and delete events.

### Admin Role Assignment

Admin access is controlled via Clerk's **Private Metadata** (set in the Clerk Dashboard):

```json
{
  "role": "admin",
  "favorites": ["798645", "1291608", "840464"]
}
```

Only users with `role: "admin"` in their private metadata can access admin routes. The "Dashboard" link appears in the Clerk UserButton dropdown only for admin users.

---

## 9. Seat Selection Logic

### Seat Layout Configuration

The theater has **10 rows** (A–J) with **10 seats per row**, organized into three pricing tiers:

| Tier        | Rows       | Position | Color  | Description                   |
| ----------- | ---------- | -------- | ------ | ----------------------------- |
| **Premium** | A, B       | Front    | Yellow | Best view, highest price      |
| **Gold**    | C, D, E, F | Middle   | Purple | Most popular, mid-range price |
| **Silver**  | G, H, I, J | Back     | Gray   | Value seats, lowest price     |

### Seat ID Format

Each seat is identified as `{Row}{Number}`, e.g., `A1`, `C5`, `J10`.

### Selection Flow

```
1. User selects a showtime
   └─▶ Client fetches GET /api/booking/seats/:showId
       └─▶ Server releases expired reservations first
           └─▶ Returns array of occupied seat IDs

2. User clicks available seats
   └─▶ Client calculates total based on section prices
       └─▶ Premium seats × premium price
       └─▶ Gold seats × gold price
       └─▶ Silver seats × silver price

3. User clicks "Book Now"
   └─▶ POST /api/booking/create { showId, selectedSeats }
       └─▶ Server double-checks availability
       └─▶ Creates booking with 10-min reservation
       └─▶ Marks seats in show.occupiedSeats
       └─▶ Creates Stripe Checkout session
       └─▶ Triggers Inngest timer event
       └─▶ Returns Stripe Checkout URL
```

### Anti–Double-Booking Strategy

1. **Immediate seat locking** — When a booking is created, seats are instantly marked in `show.occupiedSeats` before the Stripe session is created.
2. **Expired reservation cleanup** — Before returning occupied seats or creating bookings, the server runs `releaseExpiredSeats()` to free seats from timed-out unpaid bookings.
3. **Inngest background timer** — A dedicated Inngest function waits 10 minutes, then checks if the booking is still unpaid. If so, it removes seats from `occupiedSeats` and deletes the booking.
4. **Atomic checks** — `checkSeatsAvailability()` verifies none of the selected seats are already occupied before proceeding.

---

## 10. Payment Integration Process

### Stripe Checkout Flow

```
┌──────────┐    POST /api/booking/create     ┌──────────┐
│  Client   │───────────────────────────────▶│  Server   │
│           │◀── { url: stripe_checkout_url } │           │
└─────┬─────┘                                └─────┬─────┘
      │                                            │
      │ Redirect to Stripe                         │ Creates Stripe
      ▼                                            │ Checkout Session
┌──────────┐                                       │
│  Stripe   │                                      │
│  Checkout │                                      │
│  Page     │                                      │
└─────┬─────┘                                      │
      │                                            │
      │ Payment Success                            │
      ├──────── Redirect to /loading/my-bookings ──┤
      │                                            │
      │                                            ▼
      │         Webhook: checkout.session.completed
      │         ┌──────────────────────────────────────┐
      └────────▶│  POST /api/stripe (Stripe Webhook)   │
                │  • Verify signature with svix          │
                │  • Mark booking.isPaid = true          │
                │  • Send confirmation email              │
                └──────────────────────────────────────┘
```

### Payment Verification (Dual Strategy)

1. **Stripe Webhook** (`/api/stripe`) — Server-side, triggered automatically by Stripe on `checkout.session.completed`. Marks booking as paid and sends email.
2. **Client-side Verification** (`/api/booking/verify-payment`) — When the user is redirected back, the client sends the `session_id` to verify payment status. This acts as a fallback in case the webhook is delayed.

### Reservation Expiry

- Seats are reserved for **10 minutes** (`RESERVATION_MINUTES = 10`).
- Stripe's minimum session expiry is 30 minutes, but the server enforces its own 10-minute timer via Inngest.
- If payment is not completed within 10 minutes, the Inngest `releaseUnpaidSeats` function:
  1. Waits 10 minutes (`step.sleep("wait-for-payment", "10m")`)
  2. Checks if booking is still unpaid
  3. Removes seats from `show.occupiedSeats`
  4. Deletes the expired booking

---

## 11. Tech Stack

### Frontend

| Technology           | Version | Why It Was Used                                                                                                   |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| **React**            | 19.2.0  | Component-based UI with hooks for state management. React 19 offers improved performance and concurrent features. |
| **Vite**             | 7.2.4   | Blazing-fast dev server with HMR and optimized production builds. Significantly faster than CRA/Webpack.          |
| **Tailwind CSS**     | 4.1.17  | Utility-first CSS framework for rapid, consistent, responsive styling without writing custom CSS files.           |
| **React Router DOM** | 7.10.1  | Client-side routing with nested routes for the admin panel and dynamic movie/seat pages.                          |
| **Clerk React**      | 5.58.0  | Pre-built auth components (`SignIn`, `UserButton`) and hooks (`useUser`, `useAuth`) for seamless authentication.  |
| **Axios**            | 1.13.2  | Promise-based HTTP client with interceptors, automatic JSON parsing, and clean API for REST calls.                |
| **Lucide React**     | 0.556.0 | Modern, tree-shakable icon library with consistent, clean design.                                                 |
| **React Hot Toast**  | 2.6.0   | Lightweight, customizable toast notifications for success/error feedback.                                         |
| **React Player**     | 2.16.0  | Embedded video player for movie trailers from YouTube/other sources.                                              |
| **jsPDF**            | 4.1.0   | Client-side PDF generation for premium-styled downloadable movie tickets.                                         |

### Backend

| Technology        | Version | Why It Was Used                                                                                                       |
| ----------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| **Node.js**       | —       | JavaScript runtime for the server. Enables full-stack JS and a unified developer experience.                          |
| **Express.js**    | 5.2.1   | Minimalist, flexible web framework. Express 5 brings async error handling and improved routing.                       |
| **MongoDB**       | —       | NoSQL database ideal for flexible schemas like dynamic `occupiedSeats` maps and varied movie data.                    |
| **Mongoose**      | 9.0.1   | Elegant MongoDB ODM with schema validation, population, and middleware hooks.                                         |
| **Clerk Express** | 1.7.57  | Server-side Clerk SDK for JWT verification (`clerkMiddleware`) and user management (`clerkClient`).                   |
| **Stripe**        | 20.1.0  | Industry-standard payment processing with Checkout sessions, webhooks, and PCI compliance.                            |
| **Inngest**       | 3.47.0  | Serverless background job framework for event-driven workflows (seat release timers, email sending, Clerk user sync). |
| **Nodemailer**    | 8.0.1   | Email sending library configured with Brevo SMTP for transactional booking confirmation emails.                       |
| **Svix**          | 1.82.0  | Webhook signature verification library used by Clerk/Stripe for secure webhook validation.                            |
| **Axios**         | 1.13.2  | Used server-side to make requests to the TMDB API for movie data.                                                     |
| **CORS**          | 2.8.5   | Enable Cross-Origin Resource Sharing between the separately deployed frontend and backend.                            |
| **dotenv**        | 17.2.3  | Load environment variables from `.env` files for secure configuration management.                                     |

### External Services

| Service                | Purpose                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **TMDB API**           | Source of truth for movie data — now playing, upcoming, search, details, credits             |
| **Stripe**             | Payment processing — Checkout sessions, webhooks, payment verification                       |
| **Clerk**              | Authentication — sign-up/sign-in UI, session management, JWT tokens, user metadata, webhooks |
| **Inngest**            | Background job orchestration — seat release timers, user sync, email sending                 |
| **Brevo (Sendinblue)** | SMTP relay for transactional emails (booking confirmations)                                  |
| **Vercel**             | Deployment platform for both frontend (static) and backend (serverless)                      |
| **MongoDB Atlas**      | Cloud-hosted MongoDB database                                                                |

---

## 12. Folder Structure Explanation

```
📦 01 Movie Ticket Booking
├── 📁 client/                          # React Frontend Application
│   ├── index.html                      # Entry HTML (Vite injects the app here)
│   ├── package.json                    # Frontend dependencies and scripts
│   ├── vite.config.js                  # Vite configuration (React + Tailwind plugins)
│   ├── vercel.json                     # Vercel SPA rewrite rules
│   ├── eslint.config.js                # ESLint configuration
│   │
│   ├── 📁 public/                      # Static assets (favicon, manifest)
│   │   └── site.webmanifest            # PWA manifest
│   │
│   └── 📁 src/                         # Source code
│       ├── App.jsx                     # Root component — routing, layout switching
│       ├── main.jsx                    # Entry point — ClerkProvider, BrowserRouter, AppProvider
│       ├── index.css                   # Global styles (Tailwind imports)
│       │
│       ├── 📁 assets/                  # Static assets (images, logos)
│       │   └── assets.js               # Asset imports and exports
│       │
│       ├── 📁 components/              # Reusable UI components
│       │   ├── Navbar.jsx              # Main navigation bar with search, auth, admin link
│       │   ├── Footer.jsx              # Site footer
│       │   ├── Loading.jsx             # Loading/redirect component (post-payment)
│       │   ├── MovieCard.jsx           # Movie display card
│       │   ├── BlurCircle.jsx          # Decorative blur circle effect
│       │   ├── DateSelect.jsx          # Date picker for showtimes
│       │   ├── HeroSection.jsx         # Homepage hero banner
│       │   ├── FeaturedSection.jsx     # Featured movies section
│       │   ├── TrailersSection.jsx     # Movie trailers section (React Player)
│       │   │
│       │   └── 📁 admin/              # Admin-specific components
│       │       ├── AdminNavbar.jsx     # Admin panel top navigation
│       │       ├── AdminSidebar.jsx    # Admin panel side navigation
│       │       └── Title.jsx           # Admin page title component
│       │
│       ├── 📁 context/                 # React Context for global state
│       │   └── AppContext.jsx          # App-wide state: user, isAdmin, shows, favorites, API helpers
│       │
│       ├── 📁 lib/                     # Utility functions
│       │   ├── dateFormat.js           # Date formatting helpers
│       │   ├── timeFormat.js           # Time formatting helpers
│       │   ├── isoTimeFormat.js        # ISO time parsing
│       │   ├── kConverter.js           # Number to K/M converter (e.g., 1000 → 1K)
│       │   └── generateTicket.js       # PDF ticket generator using jsPDF
│       │
│       └── 📁 pages/                   # Page-level components (routes)
│           ├── Home.jsx                # Homepage — hero, featured, trailers
│           ├── Movies.jsx              # All bookable movies grid
│           ├── MovieDetails.jsx        # Single movie detail page + showtimes
│           ├── SeatLayout.jsx          # Seat selection + booking page
│           ├── MyBookings.jsx          # User booking history + PDF download
│           ├── Favorite.jsx            # User's favorite movies
│           ├── Theaters.jsx            # Theater information
│           ├── Releases.jsx            # Upcoming releases from TMDB
│           ├── PrivacyPolicy.jsx       # Privacy policy page
│           │
│           └── 📁 admin/              # Admin pages
│               ├── Layout.jsx          # Admin layout wrapper (navbar + sidebar + outlet)
│               ├── Dashboard.jsx       # Admin dashboard with stats
│               ├── AddShows.jsx        # Add new shows (TMDB search + form)
│               ├── ListShows.jsx       # Manage existing shows
│               └── ListBookings.jsx    # View all user bookings
│
├── 📁 server/                          # Express.js Backend Application
│   ├── server.js                       # Entry point — Express app, middleware, routes
│   ├── package.json                    # Backend dependencies and scripts
│   ├── vercel.json                     # Vercel serverless deployment config
│   │
│   ├── 📁 configs/                     # Configuration files
│   │   ├── db.js                       # MongoDB connection (Mongoose)
│   │   └── nodemailer.js              # Email transporter + HTML email template
│   │
│   ├── 📁 models/                      # Mongoose schemas/models
│   │   ├── User.js                    # User model (synced from Clerk)
│   │   ├── Movie.js                   # Movie model (from TMDB)
│   │   ├── Show.js                    # Show model (showtime + pricing + seats)
│   │   └── Booking.js                 # Booking model (user + show + payment)
│   │
│   ├── 📁 controllers/                # Route handler logic
│   │   ├── showController.js          # TMDB API integration + show CRUD
│   │   ├── bookingController.js       # Seat booking + Stripe + reservation
│   │   ├── adminController.js         # Dashboard data + admin CRUD
│   │   ├── userController.js          # User bookings + favorites (Clerk metadata)
│   │   └── stripeWebhooks.js         # Stripe webhook handler
│   │
│   ├── 📁 routes/                      # Express route definitions
│   │   ├── showRoutes.js              # /api/show/* routes
│   │   ├── bookingRoutes.js           # /api/booking/* routes
│   │   ├── adminRoutes.js             # /api/admin/* routes
│   │   └── userRoutes.js              # /api/user/* routes
│   │
│   ├── 📁 middleware/                  # Custom Express middleware
│   │   └── auth.js                    # protectAdmin — Clerk role verification
│   │
│   └── 📁 inngest/                     # Background job definitions
│       └── index.js                   # Inngest functions (user sync, seat release, email)
│
└── README.md                           # This file
```

---

## 13. Installation Steps

### Prerequisites

- **Node.js** v18+ installed
- **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Stripe** account ([stripe.com](https://stripe.com))
- **Clerk** account ([clerk.com](https://clerk.com))
- **TMDB** API key ([themoviedb.org](https://www.themoviedb.org/settings/api))
- **Inngest** account ([inngest.com](https://www.inngest.com)) — or use `npx inngest-cli@latest dev` for local development
- **Brevo** account ([brevo.com](https://www.brevo.com)) for SMTP — or any SMTP provider

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ticketflix.git
cd ticketflix
```

### Step 2: Install Server Dependencies

```bash
cd server
npm install
```

### Step 3: Install Client Dependencies

```bash
cd ../client
npm install
```

### Step 4: Configure Environment Variables

Create `.env` files in both `server/` and `client/` directories. See [Section 14](#14-environment-variables) for details.

### Step 5: Set Up Clerk

1. Create a Clerk application at [clerk.com](https://dashboard.clerk.com)
2. Copy the **Publishable Key** and **Secret Key**
3. Configure a **Webhook Endpoint** pointing to `<your-server-url>/api/inngest` with events: `user.created`, `user.updated`, `user.deleted`
4. Set **Private Metadata** for admin users:
   ```json
   { "role": "admin" }
   ```

### Step 6: Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Copy the **Secret Key** from the Dashboard
3. Set up a **Webhook Endpoint** pointing to `<your-server-url>/api/stripe` with event: `checkout.session.completed`
4. Copy the **Webhook Signing Secret**

### Step 7: Set Up Inngest (Local Development)

```bash
npx inngest-cli@latest dev
```

This starts the Inngest Dev Server at `http://localhost:8288`. Register your app at `http://localhost:3000/api/inngest`.

### Step 8: Start the Server

```bash
cd server
npm run server
```

Server runs at `http://localhost:3000`.

### Step 9: Start the Client

```bash
cd client
npm run dev
```

Client runs at `http://localhost:5173`.

---

## 14. Environment Variables

### Server (`server/.env`)

```env
# ──── MongoDB ────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net

# ──── Clerk ────
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY

# ──── Stripe ────
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# ──── TMDB ────
TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.xxxxxxxxxxxxxxxxxx  # Bearer token (Read Access Token)

# ──── Inngest ────
INNGEST_EVENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
INNGEST_SIGNING_KEY=signkey-xxxxxxxxxxxxxxxx

# ──── Email (Brevo SMTP) ────
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-login
SMTP_PASS=your-brevo-smtp-password
SENDER_EMAIL=noreply@yourdomain.com
```

### Client (`client/.env`)

```env
# ──── Clerk ────
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# ──── Backend URL ────
VITE_BASE_URL=http://localhost:3000

# ──── TMDB Image Base URL ────
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500

# ──── Currency Symbol ────
VITE_CURRENCY=$
```

> **Security Note:** Never commit `.env` files to version control. Add them to `.gitignore`.

---

## 15. Deployment Guide

Both the frontend and backend are configured for **Vercel** deployment as separate projects.

### Deploy the Backend (Server)

1. Push `server/` to a GitHub repository (or as part of the monorepo).

2. Import the project in [Vercel](https://vercel.com):
   - **Root Directory:** `server`
   - **Framework Preset:** Other
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

3. The `vercel.json` in `server/` routes all requests to `server.js`:

   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```

4. Add all **server environment variables** in Vercel's project settings.

5. Update Clerk and Stripe webhook URLs to point to the deployed server URL.

### Deploy the Frontend (Client)

1. Push `client/` to a GitHub repository.

2. Import the project in Vercel:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`

3. The `vercel.json` in `client/` handles SPA routing:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

4. Add all **client environment variables** in Vercel's project settings.
   - Update `VITE_BASE_URL` to the deployed backend URL.

### Post-Deployment Checklist

- [ ] Update `VITE_BASE_URL` in client env to the production server URL
- [ ] Update Clerk webhook endpoint to production server URL
- [ ] Update Stripe webhook endpoint to production server URL
- [ ] Register Inngest app with production server URL
- [ ] Verify CORS settings allow the production frontend domain
- [ ] Test end-to-end booking flow (seat selection → payment → email)

---

## 16. Future Scope

| Enhancement                     | Description                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| **Multiple Theaters**           | Support for multiple theater locations with different seat layouts per screen            |
| **Showtime Conflict Detection** | Prevent overlapping shows for the same theater/screen                                    |
| **Dynamic Seat Layout**         | Admin-configurable seat maps (different row counts, VIP boxes, wheelchair accessibility) |
| **Coupon/Promo Codes**          | Stripe coupon integration for discounts and promotional offers                           |
| **Ratings & Reviews**           | Allow users to rate and review movies after watching                                     |
| **Push Notifications**          | Web push notifications for booking confirmations and upcoming shows                      |
| **Multi-language Support**      | i18n for supporting multiple languages across the UI                                     |
| **Analytics Dashboard**         | Advanced admin analytics — revenue trends, popular movies, peak booking times            |
| **Refund Management**           | Admin-initiated refunds via Stripe with automated seat release                           |
| **Mobile App**                  | React Native version for iOS and Android                                                 |
| **QR Code Tickets**             | Generate scannable QR codes on tickets for theater entry validation                      |
| **Social Login**                | Additional OAuth providers (Google, GitHub, Apple) via Clerk                             |
| **Waitlist Feature**            | Allow users to join a waitlist for sold-out shows                                        |
| **Seat Recommendations**        | AI-powered seat suggestions based on user preferences                                    |

---

## 17. Conclusion

**TicketFlix** is a comprehensive, production-grade movie ticket booking system that demonstrates the power of modern full-stack JavaScript development. The project showcases:

- **Real-time data integration** with the TMDB API for movie discovery
- **Secure authentication** and role-based access control with Clerk
- **Complex business logic** including tiered seat pricing, reservation timeouts, and double-booking prevention
- **Production payment processing** with Stripe Checkout and webhook-based verification
- **Event-driven architecture** with Inngest for background jobs (seat release, user sync, email delivery)
- **Professional UX** with PDF ticket generation, email confirmations, and responsive design
- **Deployment-ready** configuration for Vercel with separate frontend and backend deployments

The architecture is modular, scalable, and follows industry best practices — making it an excellent foundation for a real-world movie booking platform or a portfolio-worthy full-stack project.

---

<p align="center">
  Built with ❤️ using the MERN Stack
  <br/>
  <strong>MongoDB · Express.js · React · Node.js</strong>
  <br/><br/>
  Powered by Clerk · Stripe · TMDB · Inngest · Vercel
</p>
