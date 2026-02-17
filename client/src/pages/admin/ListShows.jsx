import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { Trash2Icon } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListShows = () => {
  const { axios, getToken, user, fetchShows } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      setShows(data.shows);

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteShow = async (showId) => {
    if (!confirm("Are you sure you want to delete this show?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/show/${showId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success(data.message);
        getAllShows();
        fetchShows();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete show");
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />
      {shows.length === 0 ? (
        <p className="text-gray-400 mt-6">No active shows found.</p>
      ) : (
        <div className="max-w-5xl mt-6 overflow-x-auto">
          <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
            <thead>
              <tr className="bg-primary/20 text-left text-white">
                <th className="p-2 font-medium pl-5">Movie Name</th>
                <th className="p-2 font-medium">Show Time</th>
                <th className="p-2 font-medium">Total Bookings</th>
                <th className="p-2 font-medium">Premium</th>
                <th className="p-2 font-medium">Gold</th>
                <th className="p-2 font-medium">Silver</th>
                <th className="p-2 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm font-light">
              {shows.map((show) => (
                <tr
                  key={show._id}
                  className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 min-w-45 pl-5">
                    {show.movie?.title || "Deleted Movie"}
                  </td>
                  <td className="p-2">{dateFormat(show.showDateTime)}</td>
                  <td className="p-2">
                    {Object.keys(show.occupiedSeats || {}).length}
                  </td>
                  <td className="p-2 text-yellow-400">
                    {currency} {show.sectionPrices?.premium || show.showPrice}
                  </td>
                  <td className="p-2 text-purple-400">
                    {currency} {show.sectionPrices?.gold || show.showPrice}
                  </td>
                  <td className="p-2 text-gray-400">
                    {currency} {show.sectionPrices?.silver || show.showPrice}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDeleteShow(show._id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded cursor-pointer transition"
                      title="Delete show"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  ) : (
    <Loading />
  );
};

export default ListShows;
