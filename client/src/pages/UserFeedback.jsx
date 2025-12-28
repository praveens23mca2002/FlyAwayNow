import React, { useState, useEffect } from "react";
import { message, Rate } from "antd"; // Import Rate from antd
import { axiosInstance } from "../helpers/axiosInstance";
import PageTitle from "../components/PageTitle";

function UserFeedback({ user }) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0); // State for star rating
  const [feedbacks, setFeedbacks] = useState([]);

  // Fetch all feedbacks when the component mounts
  useEffect(() => {
    getFeedbacks();
  }, []);

  const getFeedbacks = async () => {
    try {
      const response = await axiosInstance.get("/api/feedback/all");
      if (response.data.success) {
        setFeedbacks(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error fetching feedbacks!");
    }
  };

  const submitFeedback = async () => {
    const userId = localStorage.getItem("user_id");

    if (!feedback) {
      message.error("Please enter your feedback!");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/feedback/submit", {
        userId: userId,
        message: feedback,
        rating: rating, // Include rating in the request
      });

      if (response.data.success) {
        message.success("Feedback submitted successfully!");
        setFeedback("");
        setRating(0); // Reset rating after submission
        // Refresh the feedback list after submission
        getFeedbacks();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong!");
    }
  };

  return (
    <div className="p-5">
      <PageTitle title="Send Feedback" />
      <textarea
        className="border w-full p-3 rounded-md"
        rows="5"
        placeholder="Write your feedback here..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <div className="mt-3">
        <Rate
          value={rating}
          onChange={(value) => setRating(value)} // Update rating state
        />
      </div>
      <button
        className="bg-blue-500 text-white px-5 py-2 rounded mt-3"
        onClick={submitFeedback}
      >
        Submit
      </button>

      {/* Display all feedbacks */}
      <div className="mt-8">
        <PageTitle title="All Feedbacks" />
        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="border p-4 rounded-md">
                <p className="font-semibold">
                  {fb.userId?.name || "Anonymous"} ({fb.userId?.email || "No email"})
                </p>
                <p className="text-lg text-gray-700">{fb.message}</p>
                <div className="mt-2">
                  <Rate disabled value={fb.rating || 0} /> {/* Display star rating */}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(fb.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No feedbacks available.</p>
        )}
      </div>
    </div>
  );
}

export default UserFeedback;