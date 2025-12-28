import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../helpers/axiosInstance";
import { message, Table, Select, Button, Modal, DatePicker, Row, Col } from "antd";
import { HideLoading, ShowLoading } from "../../redux/alertsSlice";
import PageTitle from "../../components/PageTitle";
import moment from "moment";
import { Helmet } from "react-helmet";
import * as XLSX from "xlsx";

const { Option } = Select;
const { RangePicker } = DatePicker;

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showCancelled, setShowCancelled] = useState("");
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [reportFilter, setReportFilter] = useState("all");
  const [busFilter, setBusFilter] = useState(null);
  const [uniqueBuses, setUniqueBuses] = useState([]);
  const dispatch = useDispatch();

  const getBookings = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      let url = `/api/bookings/get-all-booking`;

      if (showCancelled !== "") {
        url += `?showCancelled=${showCancelled}`;
      }
      const response = await axiosInstance.get(url);

      dispatch(HideLoading());

      if (response.data.success) {
        const mappedData = response.data.data.map((booking) => {
          return {
            ...booking,
            ...booking.bus,
            key: booking._id,
            bookingTime: moment(booking.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          };
        });
        setBookings(mappedData);
        setFilteredBookings(mappedData);
        
        // Extract unique buses for filter
        const buses = [...new Set(mappedData.map(item => item.name))];
        setUniqueBuses(buses.map(name => ({
          name,
          id: mappedData.find(item => item.name === name)._id
        })));
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch, showCancelled]);

  const columns = [
    {
      title: "Bus Name",
      dataIndex: "name",
      key: "bus",
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
    },
    {
      title: "Full Name",
      dataIndex: "user",
      render: (user) => `${user.name}`,
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
      title: "Booking Time",
      dataIndex: "createdAt",
      render: (createdAt) => moment(createdAt).format("DD/MM/YYYY hh:mm A"),
    },
    {
      title: "Seats",
      dataIndex: "seats",
      render: (seats) => seats.join(", "),
    },
    {
      title: "AC/Non-AC",
      dataIndex: "ac",
      render: (ac) => (
        <span>
          {ac || "N/A"}
        </span>
      ),
    },
    {
      title: "Cancelled",
      dataIndex: "isCancelled",
      key: "isCancelled",
      render: (isCancelled) => (isCancelled ? "Yes" : "No"),
    },
  ];

  const reportColumns = [
    {
      title: "User Name",
      dataIndex: "user",
      render: (user) => user.name,
      fixed: 'left',
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "user",
      render: (user) => user.email,
      width: 200,
    },
    {
      title: "From",
      dataIndex: "from",
      width: 120,
    },
    {
      title: "To",
      dataIndex: "to",
      width: 120,
    },
    {
      title: "Booking Time",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY hh:mm A"),
      width: 180,
    },
    {
      title: "Journey Date",
      dataIndex: "journeyDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
      width: 120,
    },
    {
      title: "Bus Name",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "Bus Number",
      dataIndex: "busNumber",
      width: 120,
    },
    {
      title: "Seats",
      dataIndex: "seats",
      render: (seats) => seats.join(", "),
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "isCancelled",
      render: (isCancelled) => (
        <span className={isCancelled ? "text-red-500" : "text-green-500"}>
          {isCancelled ? "Cancelled" : "Confirmed"}
        </span>
      ),
      width: 120,
    },
    {
      title: "Amount",
      dataIndex: "price",
      render: (price, record) => `₹${price * record.seats.length}`,
      width: 100,
    },
  ];

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      filtered = filtered.filter(booking => {
        const bookingDate = moment(booking.createdAt);
        return bookingDate.isBetween(startDate, endDate, null, '[]');
      });
    }

    if (reportFilter === "confirmed") {
      filtered = filtered.filter(booking => !booking.isCancelled);
    } else if (reportFilter === "cancelled") {
      filtered = filtered.filter(booking => booking.isCancelled);
    }

    if (busFilter) {
      filtered = filtered.filter(booking => booking.name === busFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, dateRange, reportFilter, busFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleReportFilterChange = (value) => {
    setReportFilter(value);
  };

  const handleBusFilterChange = (value) => {
    setBusFilter(value);
  };

  const resetBusFilter = () => {
    setBusFilter(null);
  };

  const exportToExcel = () => {
    // Prepare the data for Excel export
    const excelData = filteredBookings.map(booking => ({
      "User Name": booking.user.name,
      "Email": booking.user.email,
      "From": booking.from,
      "To": booking.to,
      "Booking Time": moment(booking.createdAt).format("DD/MM/YYYY hh:mm A"),
      "Journey Date": moment(booking.journeyDate).format("DD/MM/YYYY"),
      "Bus Name": booking.name,
      "Bus Number": booking.busNumber,
      "Seats": booking.seats.join(", "),
      "Status": booking.isCancelled ? "Cancelled" : "Confirmed",
      "Amount": `₹${booking.price * booking.seats.length}`
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings Report");
    
    // Generate the Excel file
    XLSX.writeFile(workbook, `bookings_report_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
    
    message.success("Excel report downloaded successfully");
  };

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  const handleCancelledChange = (value) => {
    setShowCancelled(value);
  };

  return (
    <>
      <Helmet>
        <title>User Bookings</title>
      </Helmet>
      <div className="p-5">
        <PageTitle title="Bookings" />

        <div style={{ marginBottom: 16, display: 'flex', gap: '16px' }}>
          <Select
            defaultValue=""
            style={{ width: 200 }}
            onChange={handleCancelledChange}
          >
            <Option value="">All Bookings</Option>
            <Option value="true">Cancelled Bookings</Option>
            <Option value="false">Non-Cancelled Bookings</Option>
          </Select>
          
          <Button 
            type="primary" 
            onClick={() => setIsReportVisible(true)}
          >
            Generate Report
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={bookings} 
          scroll={{ x: true }}
        />

        <Modal
          title="Bookings Report"
          visible={isReportVisible}
          onCancel={() => {
            setIsReportVisible(false);
            setDateRange([]);
            setReportFilter("all");
            setBusFilter(null);
            setFilteredBookings(bookings);
          }}
          footer={null}
          width="90%"
        >
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
                onChange={handleDateRangeChange}
                value={dateRange}
                ranges={{
                  'Today': [moment().startOf('day'), moment().endOf('day')],
                  'This Week': [moment().startOf('week'), moment().endOf('week')],
                  'This Month': [moment().startOf('month'), moment().endOf('month')],
                }}
              />
            </Col>
            <Col span={5}>
              <Select
                style={{ width: '100%' }}
                value={reportFilter}
                onChange={handleReportFilterChange}
              >
                <Option value="all">All Bookings</Option>
                <Option value="confirmed">Confirmed Only</Option>
                <Option value="cancelled">Cancelled Only</Option>
              </Select>
            </Col>
            <Col span={5}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Bus"
                value={busFilter}
                onChange={handleBusFilterChange}
                allowClear
                onClear={resetBusFilter}
              >
                {uniqueBuses.map(bus => (
                  <Option key={bus.id} value={bus.name}>
                    {bus.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={exportToExcel}>
                Export to Excel
              </Button>
            </Col>
          </Row>
          
          <Table 
            columns={reportColumns} 
            dataSource={filteredBookings} 
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500 }}
          />
          
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button 
              onClick={() => {
                setIsReportVisible(false);
                setDateRange([]);
                setReportFilter("all");
                setBusFilter(null);
                setFilteredBookings(bookings);
              }}
            >
              Close
            </Button>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default AdminBookings;