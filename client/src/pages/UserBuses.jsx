import React, { useEffect, useState, useCallback } from "react";
import PageTitle from "../components/PageTitle";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../helpers/axiosInstance";
import { message, Table } from "antd";
import { Helmet } from "react-helmet";

function UserBuses() {
  const dispatch = useDispatch();
  const [buses, setBuses] = useState([]);

  const getBuses = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/api/buses/get-all-buses", {});
      dispatch(HideLoading());
      if (response.data.success) {
        console.log(response.data.data); // Log the data to verify the `ac` field
        setBuses(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Bus Number",
      dataIndex: "busNumber",
    },
    {
      title: "From",
      dataIndex: "from",
    },
    {
      title: "To",
      dataIndex: "to",
    },
    {
      title: "Journey Date",
      dataIndex: "journeyDate",
    },
    {
      title: "AC/Non-AC",
      dataIndex: "ac",
      render: (ac) => (ac === "AC" ? "AC" : "Non-AC"), // Handle string values
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        if (status === "Completed") {
          return <span className="text-red-500">{status}</span>;
        } else if (status === "running") {
          return <span className="text-yellow-500">{status}</span>;
        } else {
          return <span className="text-green-500">{status}</span>;
        }
      },
    },
  ];

  useEffect(() => {
    getBuses();
  }, [getBuses]);

  return (
    <>
      <Helmet>
        <title>Available Buses</title>
      </Helmet>
      <div>
        <div className="flex justify-between p-7">
          <PageTitle title="Available Buses" />
        </div>
        <div className="p-7">
          <Table columns={columns} dataSource={buses} pagination={{ pageSize: 7 }} />
        </div>
      </div>
    </>
  );
}

export default UserBuses;