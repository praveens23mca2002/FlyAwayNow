import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../helpers/axiosInstance";
import { message, Table, Modal } from "antd";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import PageTitle from "../components/PageTitle";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import { Helmet } from "react-helmet";

function Bookings() {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const dispatch = useDispatch();

  const getBookings = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.get(
        `/api/bookings/${localStorage.getItem("user_id")}`,
        {}
      );
      dispatch(HideLoading());
      if (response.data.success) {
        const mappedData = response.data.data.map((booking) => {
          return {
            ...booking,
            ...booking.bus,
            key: booking._id,
            user: booking.user.name,
            isCancelled: booking.isCancelled || false,
            userObj: booking.user,
            busObj: booking.bus
          };
        });
        setBookings(mappedData);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch]);

  const CancelBooking = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.key === bookingId);
      if (!booking) {
        message.error("Booking not found");
        return;
      }

      Modal.confirm({
        title: "Confirm Cancellation",
        content: "Are you sure you want to cancel this booking?",
        okText: "Yes, Cancel",
        cancelText: "No",
        onOk: async () => {
          try {
            dispatch(ShowLoading());
            const response = await axiosInstance.delete(
              `/api/bookings/${bookingId}/${booking.userObj._id}/${booking.busObj._id}`,
              {}
            );
            dispatch(HideLoading());
            if (response.data.success) {
              message.success(response.data.message);
              getBookings();
            } else {
              message.error(response.data.message);
            }
          } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
          }
        }
      });
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Bus Name",
      dataIndex: "name",
      key: "bus",
    },
    {
      title: "Full Name",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Bus Number",
      dataIndex: "busNumber",
      key: "bus",
    },
    {
      title: "Journey Date",
      dataIndex: "journeyDate",
      render: (journeyDate) => moment(journeyDate).format("DD/MM/YYYY"),
    },
    {
      title: "Journey Time",
      dataIndex: "departure",
      render: (departure) => moment(departure, "HH:mm").format("hh:mm A"),
    },
    {
      title: "Seats",
      dataIndex: "seats",
      render: (seats) => seats.join(", "),
    },
    {
      title: "Status",
      dataIndex: "isCancelled",
      render: (isCancelled) => (
        <span className={isCancelled ? "text-red-500" : "text-green-500"}>
          {isCancelled ? "Cancelled" : "Confirmed"}
        </span>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="flex gap-2">
          <button
            className={`underline text-base ${record.isCancelled ? "text-gray-400 cursor-not-allowed" : "text-green-500 hover:text-green-700 cursor-pointer"}`}
            onClick={() => {
              if (!record.isCancelled) {
                setSelectedBooking(record);
                setShowPrintModal(true);
              }
            }}
            disabled={record.isCancelled}
          >
            View
          </button>
          {!record.isCancelled && (
            <button
              className="underline text-base text-red-500 hover:text-red-700 cursor-pointer"
              onClick={() => CancelBooking(record.key)}
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <Helmet>
        <title>Bookings</title>
      </Helmet>

      <div className="p-5">
        <PageTitle title="Bookings" />
        <Table 
          columns={columns} 
          dataSource={bookings}
          rowClassName={(record) => record.isCancelled ? "bg-gray-50" : ""}
        />

        {showPrintModal && (
          <Modal
            width={500}
            title={`Ticket Details ${selectedBooking?.isCancelled ? '(Cancelled)' : ''}`}
            onCancel={() => {
              setShowPrintModal(false);
              setSelectedBooking(null);
            }}
            open={showPrintModal}
            okText="Print"
            onOk={handlePrint}
            okButtonProps={{ disabled: selectedBooking?.isCancelled }}
          >
            <div ref={componentRef} className="p-4">
              {selectedBooking?.isCancelled && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  <p className="font-semibold">This ticket has been cancelled and is no longer valid.</p>
                </div>
              )}
              <div className={`border rounded-lg shadow-md ${selectedBooking?.isCancelled ? 'opacity-75' : ''}`}>
                <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-4 border-b rounded-t-lg relative">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedBooking?.name} - Ticket
                  </h3>
                  <img
                    src="https://img.icons8.com/ios11/512w/40C057/approval.png"
                    alt="Verified"
                    className={`w-10 h-10 absolute top-2 right-2 ${selectedBooking?.isCancelled ? 'hidden' : ''}`}
                  />
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Passenger:</p>
                      <p className="text-gray-800">{selectedBooking?.user}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bus Number:</p>
                      <p className="text-gray-800">{selectedBooking?.busNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">From:</p>
                      <p className="text-gray-800">{selectedBooking?.from}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">To:</p>
                      <p className="text-gray-800">{selectedBooking?.to}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Departure:</p>
                      <p className="text-gray-800">
                        {moment(selectedBooking?.departure, "HH:mm").format("hh:mm A")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Arrival:</p>
                      <p className="text-gray-800">
                        {moment(selectedBooking?.arrival, "HH:mm").format("hh:mm A")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Journey Date:</p>
                      <p className="text-gray-800">
                        {moment(selectedBooking?.journeyDate).format("DD/MM/YYYY")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Seats:</p>
                      <p className="text-gray-800">
                        {selectedBooking?.seats.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">AC/Non-AC:</p>
                      <p className="text-gray-800">{selectedBooking?.ac}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Price:</p>
                      <p className="text-gray-800">
                        ₹{selectedBooking?.price * selectedBooking?.seats.length}
                      </p>
                    </div>
                    {selectedBooking?.isCancelled && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-600">Cancellation Date:</p>
                        <p className="text-gray-800">
                          {moment(selectedBooking?.updatedAt).format("DD/MM/YYYY hh:mm A")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-2 text-center text-xs text-white rounded-b-lg">
                  {selectedBooking?.isCancelled ? 'Booking cancelled' : 'Thank you for booking with us!'}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}

export default Bookings;