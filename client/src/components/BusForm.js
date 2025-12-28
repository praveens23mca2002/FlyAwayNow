import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Modal, Row, Form, Col, message } from "antd";
import { axiosInstance } from "../helpers/axiosInstance";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";

function BusForm({
  showBusForm,
  setShowBusForm,
  type = "add",
  getData,
  selectedBus,
  setSelectedBus,
}) {
  const dispatch = useDispatch();
  const [cities, setCities] = useState([]);

  const onFinish = async (values) => {
    console.log("Form Values:", values); // Check if `ac` is included
    try {
      dispatch(ShowLoading());
      let response = null;
      if (type === "add") {
        response = await axiosInstance.post("/api/buses/add-bus", values);
      } else {
        response = await axiosInstance.put(
          `/api/buses/${selectedBus._id}`,
          values
        );
      }
      if (response.data.success) {
        message.success(response.data.message);
      } else {
        message.error(response.data.message);
      }
      getData();
      setShowBusForm(false);
      setSelectedBus(null);
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    axiosInstance.get("/api/cities/get-all-cities").then((response) => {
      setCities(response.data.data);
    });
  }, []);

  return (
    <Modal
      width={800}
      title={type === "add" ? "Add Bus" : "Update Bus"}
      visible={showBusForm}
      onCancel={() => {
        setSelectedBus(null);
        setShowBusForm(false);
      }}
      footer={false}
    >
      <Form layout="vertical" onFinish={onFinish} initialValues={selectedBus}>
        {/* First Row */}
        <Row gutter={[16, 16]}>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Bus Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter bus name",
                },
              ]}
            >
              <input
                type="text"
                className="block border border-blue-500 w-full p-2 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Bus Number"
              name="busNumber"
              rules={[
                {
                  required: true,
                  message: "Please input bus number!",
                },
              ]}
            >
              <input
                type="text"
                className="block border border-blue-500 w-full p-2 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="AC/Non-AC"
              name="ac"
              rules={[
                {
                  required: true,
                  message: "Please select AC or Non-AC!",
                },
              ]}
            >
              <select className="block border border-blue-500 w-full p-2 rounded-lg">
                <option value="">Select</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Capacity"
              name="capacity"
              rules={[
                {
                  required: true,
                  message: "Please input bus capacity!",
                },
              ]}
            >
              <input
                type="number"
                className="block border border-blue-500 w-full p-2 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="From"
              name="from"
              rules={[
                {
                  required: true,
                  message: "Please choose an option",
                },
              ]}
            >
              <select className="block border border-blue-500 w-full p-2 rounded-lg">
                <option value="">From</option>
                {cities.map((data, index) => (
                  <option key={index} value={data.city}>
                    {data.city}
                  </option>
                ))}
              </select>
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="To"
              name="to"
              rules={[
                {
                  required: true,
                  message: "Please choose an option",
                },
              ]}
            >
              <select className="block border border-blue-500 w-full p-2 rounded-lg">
                <option value="">To</option>
                {cities.map((data, index) => (
                  <option key={index} value={data.city}>
                    {data.city}
                  </option>
                ))}
              </select>
            </Form.Item>
          </Col>
        </Row>

        {/* Second Row */}
        <Row gutter={[16, 16]}>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Departure"
              name="departure"
              rules={[
                {
                  required: true,
                  message: "Please input departure time!",
                },
              ]}
            >
              <input
                type="time"
                className="block border border-blue-500 w-full p-2 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Arrival"
              name="arrival"
              rules={[
                {
                  required: true,
                  message: "Please input arrival time!",
                },
              ]}
            >
              <input
                type="time"
                className="block border border-blue-500 w-full p-2 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Journey Date"
              name="journeyDate"
              rules={[
                {
                  required: true,
                  message: "Please input journey date!",
                },
              ]}
            >
              <input
                min={new Date().toISOString().split("T")[0]}
                type="date"
                className="block border border-blue-500 w-full p-2 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Price"
              name="price"
              rules={[
                {
                  required: true,
                  message: "Please input price!",
                },
              ]}
            >
              <input
                type="number"
                className="block border border-blue-500 w-full p-2 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Status"
              name="status"
              rules={[
                {
                  required: true,
                  message: "Please select status!",
                },
              ]}
            >
              <select className="block border border-blue-500 w-full p-2 rounded-lg">
                <option value="Yet to start">Yet To Start</option>
                <option value="Running">Running</option>
                <option disabled value="Completed">
                  Completed
                </option>
              </select>
            </Form.Item>
          </Col>
        </Row>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Save
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default BusForm;