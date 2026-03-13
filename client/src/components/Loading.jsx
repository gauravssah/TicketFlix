import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function Loading() {
  const { nextUrl } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axios } = useAppContext();

  const verifyAndRedirect = async () => {
    let bookingMessage = null;

    try {
      const sessionId = searchParams.get("session_id");

      // If there's a Stripe session_id, verify the payment first
      if (sessionId) {
        const { data } = await axios.post("/api/booking/verify-payment", {
          sessionId,
        });

        if (
          data?.success &&
          ["sent", "already-sent"].includes(data?.emailStatus) &&
          data?.email
        ) {
          bookingMessage = {
            email: data.email,
            status: data.emailStatus,
          };
        }
      }
    } catch (error) {
      console.log(error);
    }

    // Redirect after verification (or after a delay)
    if (nextUrl) {
      setTimeout(() => {
        navigate("/" + nextUrl, {
          state: bookingMessage ? { bookingMessage } : undefined,
        });
      }, 3000);
    }
  };

  useEffect(() => {
    if (nextUrl) {
      verifyAndRedirect();
    }
  }, []);

  return (
    <div className=" flex justify-center items-center h-[80vh]">
      <div className=" animate-spin rounded-full h-14 w-14 border-2 border-t-primary"></div>
    </div>
  );
}

export default Loading;
