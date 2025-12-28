// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { HideLoading, ShowLoading } from "../redux/alertsSlice";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import { message } from "antd";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// const stripePromise = loadStripe("pk_test_51QyVsmP8gkHsfJwVux8XkdlQ7aDi97m7iKHAcAV5rk0KQpBGVhNZ9sCHXqekv7GsE5SxUliu4K36SxbdgLWvSrmx00ztPeDccv"); // Replace with your Stripe publishable key

// function BookNow() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { busId } = useParams();
//   const [bus, setBus] = useState(null);
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [clientSecret, setClientSecret] = useState("");
//   const stripe = useStripe();
//   const elements = useElements();
//   const params = useParams();
//   const [totalAmount, setTotalAmount] = useState(0); 


//   useEffect(() => {
//     const fetchBusDetails = async () => {
//       dispatch(ShowLoading());
//       try {
//         const response = await axios.get(`http://localhost:5000/api/buses/${params.id}`);
//         dispatch(HideLoading());
//         if (response.data.success) {
//           setBus(response.data.data);
//         } else {
//           message.error(response.data.message);
//         }
//       } catch (error) {
//         dispatch(HideLoading());
//         message.error(error.message);
//       }
//     };

//     fetchBusDetails();
//   }, [busId, dispatch, params.id]);  


//   useEffect(() => {
//     // Update total amount whenever selectedSeats or bus price changes
//     if (bus) {
//       setTotalAmount(bus.price * selectedSeats.length);
//     }
//   }, [selectedSeats, bus]);


//   const handleCheckout = async () => {
//     if (selectedSeats.length === 0) return message.error("Please select at least one seat!");

//     try {
//       dispatch(ShowLoading());
//       const response = await axios.post("http://localhost:5000/api/stripe/create-payment-intent", {
//         amount: totalAmount * 100, 
//       });

//       dispatch(HideLoading());

//       if (response.data.clientSecret) {
//         setClientSecret(response.data.clientSecret);
//       } else {
//         message.error("Failed to create payment intent");
//       }
//     } catch (error) {
//       dispatch(HideLoading());
//       message.error(error.message);
//     }
//   };

//   const handlePayment = async () => {
//     if (!stripe || !elements) return;

//     dispatch(ShowLoading());
//     const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: {
//         card: elements.getElement(CardElement),
//       },
//     });

//     dispatch(HideLoading());

//     if (error) {
//       message.error(error.message);
//     } else if (paymentIntent.status === "succeeded") {
//       message.success("Payment successful!");

//       // Retrieve userId from localStorage
//       const userId = localStorage.getItem("user_id");
//       console.log("User ID:", userId);

//       if (!userId) {
//         message.error("User ID not found!");
//         return;
//       }

//       try {
//         dispatch(ShowLoading());
//         const bookingResponse = await axios.post(
//           `http://localhost:5000/api/bookings/book-seat/${userId}`,
//           {
//             bus: bus._id,
//             seats: selectedSeats,
//             totalAmount: totalAmount, 
//           }
//         );

//         dispatch(HideLoading());

//         console.log("Booking Response:", bookingResponse.data);

//         if (bookingResponse.data.success) {
//           message.success("Seat booked successfully!");
//           navigate("/bookings");
//         } else {
//           message.error("Booking failed!");
//         }
//       } catch (bookingError) {
//         dispatch(HideLoading());
//         console.error("Error booking seat:", bookingError);
//         message.error("Error booking seat: " + bookingError.message);
//       }
//     }
//   };



//   return (
//     <div className="m-5">
//       {bus ? (
//         <>
//           <h2 className="text-2xl">{bus.name}</h2>
//           <p>From: {bus.from} → To: {bus.to}</p>
//           <p>Price per seat: ₹{bus.price}</p>

//           <h3>Select Seats:</h3>
//           <div>
//             {bus &&
//               Array.from({ length: Math.ceil(bus.capacity / 4) }, (_, rowIndex) => {
                
//                 const seatsInRow = Array.from({ length: 4 }, (_, seatIndex) => rowIndex * 4 + seatIndex + 1).filter(
//                   (seat) => seat <= bus.capacity
//                 );

//                 const rowElements = [];

//                 seatsInRow.forEach((seat, index) => {
//                   rowElements.push(
//                     <button
//                       key={seat}
//                       className={`m-2 p-2 border rounded ${
//                         bus.seatsBooked.includes(seat)
//                           ? "bg-red-500 text-white cursor-not-allowed"
//                           : selectedSeats.includes(seat)
//                             ? "bg-green-500"
//                             : "bg-gray-300"
//                       }`}
//                       disabled={bus.seatsBooked.includes(seat)}
//                       onClick={() =>
//                         setSelectedSeats((prev) =>
//                           prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
//                         )
//                       }
//                     >
//                       {seat}
//                     </button>
//                   );

//                   if (index === 1) {
//                     rowElements.push(<div key={`gap-${rowIndex}`} className="w-1/5"></div>);
//                   }
//                 });


//                 return (
//                   <div key={rowIndex} className="flex items-center w-full mb-2">
//                     {rowElements}
//                   </div>
//                 );
//               })}
//           </div>

//           <p style={{color:'green'}}>Total Amount: ₹{totalAmount}</p> 

//           {!clientSecret ? (
//             <button
//               disabled={selectedSeats.length === 0}
//               onClick={handleCheckout}
//               className="mt-4 p-2 bg-blue-500 text-white"
//             >
//               Pay with Stripe
//             </button>
//           ) : (
//             <div className="mt-4">
//               <CardElement className="p-2 border" />
//               <button onClick={handlePayment} className="mt-4 p-2 bg-green-500 text-white">
//                 Confirm Payment
//               </button>
//             </div>
//           )}
//         </>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// }

// export default function BookNowWithStripe() {
//   return (
//     <Elements stripe={stripePromise}>
//       <BookNow />
//     </Elements>
//   );
// }

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import "./BookNow.css"; 

const stripePromise = loadStripe("pk_test_51QyVsmP8gkHsfJwVux8XkdlQ7aDi97m7iKHAcAV5rk0KQpBGVhNZ9sCHXqekv7GsE5SxUliu4K36SxbdgLWvSrmx00ztPeDccv"); // Replace with your Stripe publishable key

function BookNow() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { busId } = useParams();
    const [bus, setBus] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [clientSecret, setClientSecret] = useState("");
    const stripe = useStripe();
    const elements = useElements();
    const params = useParams();
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchBusDetails = async () => {
            dispatch(ShowLoading());
            try {
                const response = await axios.get(`http://localhost:5000/api/buses/${params.id}`);
                dispatch(HideLoading());
                if (response.data.success) {
                    setBus(response.data.data);
                } else {
                    message.error(response.data.message);
                }
            } catch (error) {
                dispatch(HideLoading());
                message.error(error.message);
            }
        };

        fetchBusDetails();
    }, [busId, dispatch, params.id]);

    useEffect(() => {
        // Update total amount whenever selectedSeats or bus price changes
        if (bus) {
            setTotalAmount(bus.price * selectedSeats.length);
        }
    }, [selectedSeats, bus]);

    const handleCheckout = async () => {
        if (selectedSeats.length === 0) return message.error("Please select at least one seat!");

        try {
            dispatch(ShowLoading());
            const response = await axios.post("http://localhost:5000/api/stripe/create-payment-intent", {
                amount: totalAmount * 100,
            });

            dispatch(HideLoading());

            if (response.data.clientSecret) {
                setClientSecret(response.data.clientSecret);
            } else {
                message.error("Failed to create payment intent");
            }
        } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
        }
    };

    const handlePayment = async () => {
        if (!stripe || !elements) return;

        dispatch(ShowLoading());
        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });

        dispatch(HideLoading());

        if (error) {
            message.error(error.message);
        } else if (paymentIntent.status === "succeeded") {
            message.success("Payment successful!");

            // Retrieve userId from localStorage
            const userId = localStorage.getItem("user_id");
            console.log("User ID:", userId);

            if (!userId) {
                message.error("User ID not found!");
                return;
            }

            try {
                dispatch(ShowLoading());
                const bookingResponse = await axios.post(
                    `http://localhost:5000/api/bookings/book-seat/${userId}`,
                    {
                        bus: bus._id,
                        seats: selectedSeats,
                        totalAmount: totalAmount,
                    }
                );

                dispatch(HideLoading());

                console.log("Booking Response:", bookingResponse.data);

                if (bookingResponse.data.success) {
                    message.success("Seat booked successfully!");
                    navigate("/bookings");
                } else {
                    message.error("Booking failed!");
                }
            } catch (bookingError) {
                dispatch(HideLoading());
                console.error("Error booking seat:", bookingError);
                message.error("Error booking seat: " + bookingError.message);
            }
        }
    };

    // Custom styling for Stripe CardElement
    const cardElementOptions = {
        style: {
            base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                    color: "#aab7c4",
                },
            },
            invalid: {
                color: "#9e2146",
            },
        },
    };

    return (
        <div className="m-5">
            {bus ? (
                <>
                    <h2 className="text-2xl">{bus.name}</h2>
                    <p>From: {bus.from} → To: {bus.to}</p>
                    <p>Price per seat: ₹{bus.price}</p>

                    {/* Seat Status Legend */}
                    <div className="seat-status">
                        <div>
                            <div className="available"></div>
                            <span>Available</span>
                        </div>
                        <div>
                            <div className="booked"></div>
                            <span>Booked</span>
                        </div>
                        <div>
                            <div className="selected"></div>
                            <span>Selected</span>
                        </div>
                    </div>

                    <h3>Select Seats:</h3>
                    <div className="bus-seats-container">
                        {Array.from({ length: bus.capacity }, (_, index) => index + 1).map((seat) => (
                            <button
                                key={seat}
                                className={`seat ${bus.seatsBooked.includes(seat)
                                    ? "booked"
                                    : selectedSeats.includes(seat)
                                        ? "selected"
                                        : ""
                                    }`}
                                disabled={bus.seatsBooked.includes(seat)}
                                onClick={() => {
                                    setSelectedSeats((prev) =>
                                        prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
                                    );
                                }}
                            >
                                {seat}
                            </button>
                        ))}
                    </div>

                    <p style={{ color: 'green' }}>Total Amount: ₹{totalAmount}</p>

                    {!clientSecret ? (
                        <button
                            disabled={selectedSeats.length === 0}
                            onClick={handleCheckout}
                            className="mt-4 p-2 bg-blue-500 text-white"
                        >
                            Pay with Stripe
                        </button>
                    ) : (
                        <div className="mt-4">
                            <div className="payment-form">
                                <h3 className="text-xl mb-4">Payment Details</h3>
                                <CardElement
                                    options={cardElementOptions}
                                    className="p-4 border rounded-lg shadow-sm"
                                />
                                <button
                                    onClick={handlePayment}
                                    className="mt-4 p-2 bg-green-500 text-white w-full rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default function BookNowWithStripe() {
    return (
        <Elements stripe={stripePromise}>
            <BookNow />
        </Elements>
    );
}