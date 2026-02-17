import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// ✅ TMDB Config (one time)
const tmdbConfig = {
    timeout: 10000,
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
};

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get(
            "https://api.themoviedb.org/3/movie/now_playing",
            tmdbConfig
        );

        res.json({ success: true, movies: data.results });
    } catch (error) {
        console.log("TMDB Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get upcoming movies from TMDB API
export const getUpcomingMovies = async (req, res) => {
    try {
        const { data } = await axios.get(
            "https://api.themoviedb.org/3/movie/upcoming",
            tmdbConfig
        );

        res.json({ success: true, movies: data.results });
    } catch (error) {
        console.log("TMDB Upcoming Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to search movies from TMDB API
export const searchMovies = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim().length === 0) {
            return res.json({ success: true, movies: [] });
        }

        const { data } = await axios.get(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
            tmdbConfig
        );

        // Return top 8 results with relevant fields
        const movies = data.results.slice(0, 8).map((m) => ({
            id: m.id,
            title: m.title,
            poster_path: m.poster_path,
            backdrop_path: m.backdrop_path,
            release_date: m.release_date,
            vote_average: m.vote_average,
            overview: m.overview,
        }));

        res.json({ success: true, movies });
    } catch (error) {
        console.log("TMDB Search Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get movie details from TMDB (for movies not in local DB)
export const getMovieDetails = async (req, res) => {
    try {
        const { movieId } = req.params;

        const [movieRes, creditsRes] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, tmdbConfig),
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, tmdbConfig),
        ]);

        const m = movieRes.data;
        const credits = creditsRes.data;

        const movie = {
            _id: m.id,
            title: m.title,
            overview: m.overview,
            poster_path: m.poster_path,
            backdrop_path: m.backdrop_path,
            genres: m.genres,
            casts: credits.cast || [],
            release_date: m.release_date,
            original_language: m.original_language,
            tagline: m.tagline || "",
            vote_average: m.vote_average,
            runtime: m.runtime,
        };

        res.json({ success: true, movie });
    } catch (error) {
        console.log("TMDB Details Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to add a new show to the database
export const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice, sectionPrices } = req.body;

        let movie = await Movie.findById(movieId);

        if (!movie) {
            // Fetch movie details and credits from TMDB API
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, tmdbConfig),
                axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/credits`,
                    tmdbConfig
                ),
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            };

            // Add movie to the database
            movie = await Movie.create(movieDetails);
        }

        const showsToCreate = [];

        showsInput.forEach((show) => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;

                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    sectionPrices: sectionPrices || { premium: showPrice, gold: showPrice, silver: showPrice },
                    occupiedSeats: {},
                });
            });
        });

        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        res.json({ success: true, message: "Show Added Successfully." });
    } catch (error) {
        console.log("Add Show Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get all shows from the database
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } })
            .populate("movie")
            .sort({ showDateTime: 1 });

        // Filter unique movies (skip shows whose movie was deleted)
        const uniqueShows = new Map();
        shows.forEach((show) => {
            if (show.movie) {
                uniqueShows.set(show.movie._id.toString(), show.movie);
            }
        });

        res.json({ success: true, shows: Array.from(uniqueShows.values()) });
    } catch (error) {
        console.error("Get Shows Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get a single show from the database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;

        // get all upcoming shows for the movie
        const shows = await Show.find({
            movie: movieId,
            showDateTime: { $gte: new Date() },
        }).sort({ showDateTime: 1 });

        const movie = await Movie.findById(movieId);

        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) dateTime[date] = [];

            dateTime[date].push({
                time: show.showDateTime,
                showId: show._id,
                sectionPrices: show.sectionPrices,
            });
        });

        res.json({ success: true, movie, dateTime });
    } catch (error) {
        console.error("Get Show Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};
