import { Helmet } from "react-helmet";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../helpers/axiosInstance";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import Bus from "../components/Bus";
import { Row, Col, message } from "antd";
import { Link } from "react-router-dom";

function Index() {
  const dispatch = useDispatch();
  const [buses, setBuses] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({});

  const getBusesByFilter = useCallback(async () => {
    dispatch(ShowLoading());
    const from = filters.from;
    const to = filters.to;
    const journeyDate = filters.journeyDate;
    try {
      const { data } = await axiosInstance.post(
        `/api/buses/get?from=${from}&to=${to}&journeyDate=${journeyDate}`
      );

      setBuses(data.data);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response.data.message);
    }
  }, [filters, dispatch]);

  useEffect(() => {
    axiosInstance.get("/api/cities/get-all-cities").then((response) => {
      setCities(response.data.data);
    });
  }, []);

  useCallback(() => {
    if (filters.from && filters.to && filters.journeyDate) {
      getBusesByFilter();
    }
  }, [filters.from, filters.to, filters.journeyDate, getBusesByFilter]);

  return (
    <>
      <Helmet>
        <title>Fly-Away-Now</title>
      </Helmet>
      <div className="h-screen flex bg-gray-900">
        <div
          className="hero min-h-screen lg:flex w-full lg:w-3/4"
          style={{
            backgroundImage: `url("https://i.pinimg.com/736x/7e/f2/4d/7ef24db3928b30fd17586d85d5c1e912.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
        >
          <div className="flex items-center h-full w-full">
            <div className="h-screen overflow-auto overflow-x-hidden">
              <div className="bg-opacity-80">
                <Row gutter={[15, 15]}>
                  {buses.map((bus, index) => {
                    return (
                      <div key={index} className="w-screen p-10 ">
                        <Bus bus={bus} />
                      </div>
                    );
                  })}
                </Row>
              </div>
            </div>
          </div>
        </div>

        {/* Centered content and "Check your tickets" button */}
        <div className="hero-content text-center text-neutral-content flex flex-col justify-center items-center">
          <div className="max-w-md">
            <div className="flex justify-center"></div>

            <h1 className="mb-5 text-5xl text-white font-bold">
              Fly-Away-Now
            </h1>
            <p className="mb-5 text-xl text-white">
              is a platform that allows you to book your bus tickets online and
              in a very easy way.
            </p>
            <Link
              to="/login"
              className="relative inline-flex items-center justify-start
                px-10 py-3 overflow-hidden font-bold rounded-full
                group"
            >
              <span className="w-32 h-32 rotate-45 translate-x-12 -translate-y-2 absolute left-0 top-0 bg-white opacity-[3%]"></span>
              <span className="absolute top-0 left-0 w-48 h-48 -mt-1 transition-all duration-500 ease-in-out rotate-45 -translate-x-56 -translate-y-24 bg-blue-600 opacity-100 group-hover:translate-x-1"></span>
              <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white">
                Check your tickets
              </span>
              <span className="absolute inset-0 border-2 border-blue-600 rounded-full"></span>
            </Link>
          </div>
        </div>

        {/* Address details at the bottom right side */}
        <div className="absolute bottom-0 right-0 p-5 text-white w-64 text-right">
  <p className="text-lg font-semibold mb-2">Contact Us</p> {/* Heading with reduced margin-bottom */}
  <p className="text-sm text-right"> {/* Align text to the left for better readability */}
    No: 6, Near Madhu Medical,
    <br />
    Palayakottai Road, 
    <br />
    Kangayam-638701
    <br />
    Ph: +91 99655 58115
  </p>
</div>
      </div>
    </>
  );
}

export default Index;