import React, { useEffect, useState } from "react";
import { Table, message, Rate } from "antd"; // Import Rate from antd
import { axiosInstance } from "../../helpers/axiosInstance";
import PageTitle from "../../components/PageTitle";

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);

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

  useEffect(() => {
    getFeedbacks();
  }, []);

  const columns = [
    {
      title: "User Name",
      dataIndex: ["userId", "name"],
    },
    {
      title: "Email",
      dataIndex: ["userId", "email"],
    },
    {
      title: "Feedback",
      dataIndex: "message",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      render: (rating) => <Rate disabled value={rating || 0} />, // Display star rating
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="p-5">
      <PageTitle title="User Feedback" />
      <Table columns={columns} dataSource={feedbacks} rowKey="_id" />
    </div>
  );
}

export default AdminFeedback;