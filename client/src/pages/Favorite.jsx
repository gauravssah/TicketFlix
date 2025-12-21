import React from "react";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";

function Favorite() {
  const { favoriteMovies } = useAppContext();

  return favoriteMovies.length > 0 ? (
    <div className=" relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      {" "}
      <BlurCircle top="150px" left="0px" />{" "}
      <BlurCircle bottom="50px" right="50px" />{" "}
      <h1 className=" text-lg font-medium my-4">Your Favorite Movies</h1>{" "}
      <div className=" flex flex-wrap max-sm:justify-center gap-8">
        {" "}
        {favoriteMovies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}{" "}
      </div>{" "}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      {" "}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        {" "}
        No Movies Available 🎬{" "}
      </h1>{" "}
      <p className="text-gray-400 max-w-md">
        {" "}
        It looks like there are no movies available right now. Try again later.{" "}
      </p>{" "}
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-primary cursor-pointer hover:bg-primary-dull transition rounded-full font-medium"
      >
        {" "}
        Refresh Page{" "}
      </button>{" "}
    </div>
  );
}
export default Favorite;
