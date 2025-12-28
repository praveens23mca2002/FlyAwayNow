// import React from "react";
// import { Row, Col } from "antd";

// function SeatSelection({ selectedSeats, setSelectedSeats, bus }) {
//   const capacity = bus.capacity;

//   const selectOrUnselectSeat = (seatNumber) => {
//     if (selectedSeats.includes(seatNumber)) {
//       setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
//     } else {
//       setSelectedSeats([...selectedSeats, seatNumber]);
//     }
//   };
//   return (
//     <div className="m-5">
//       <div className="w-[300px] border-2 text-xl font-bold border-blue-500 rounded p-[10px]">
//         <Row gutter={[10, 10]}>
//           {Array.from(Array(capacity).keys()).map((seat, key) => {
//             let seatClass = `btn btn-outline btn-outline bg-white cursor-pointer hover:bg-blue-600`;
//             selectedSeats.includes(seat + 1);
//             if (selectedSeats.includes(seat + 1)) {
//               seatClass = `btn btn-outline btn-outline bg-blue-500 cursor-pointer `;
//             } else if (bus.seatsBooked.includes(seat + 1)) {
//               seatClass = `btn btn-outline btn-outline bg-red-500 pointer-events-none cursor-not-allowed`;
//             }

//             return (
//               <Col key={key} span={6}>
//                 <div className="flex justify-center items-center">
//                   <div
//                     className={`border-[1px] text-black p-3 ${seatClass}`}
//                     onClick={() => {
//                       selectOrUnselectSeat(seat + 1);
//                     }}
//                   >
//                     {seat + 1}
//                   </div>
//                 </div>
//               </Col>
//             );
//           })}
//         </Row>
//       </div>
//     </div>
//   );
// }

// export default SeatSelection;


// import React from "react";
// import { Row, Col } from "antd";

// function SeatSelection({ selectedSeats, setSelectedSeats, bus }) {
//   const capacity = bus.capacity;

//   const selectOrUnselectSeat = (seatNumber) => {
//     if (selectedSeats.includes(seatNumber)) {
//       setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
//     } else {
//       setSelectedSeats([...selectedSeats, seatNumber]);
//     }
//   };

//   return (
//     <div className="m-5">
//       <div className="w-[300px] border-2 text-xl font-bold border-blue-500 rounded p-[10px]">
//         <Row gutter={[10, 10]}>
//           {/* Loop through the seats, creating rows of 5 seats */}
//           {Array.from(Array(Math.ceil(capacity / 5)).keys()).map((rowIndex) => (
//             <Row key={rowIndex} gutter={[10, 10]} className="w-full">
//               {/* Left side of the row (2 seats) */}
//               {Array.from(Array(2).keys()).map((seatIndex) => {
//                 const seatNumber = rowIndex * 5 + seatIndex + 1;
//                 if (seatNumber > capacity) return null; // Skip seats beyond capacity

//                 let seatClass = `btn btn-outline bg-white cursor-pointer hover:bg-blue-600`;
//                 if (selectedSeats.includes(seatNumber)) {
//                   seatClass = `btn btn-outline bg-blue-500 cursor-pointer`;
//                 } else if (bus.seatsBooked.includes(seatNumber)) {
//                   seatClass = `btn btn-outline bg-red-500 pointer-events-none cursor-not-allowed`;
//                 }

//                 return (
//                   <Col key={seatNumber} span={8}>
//                     <div className="flex justify-center items-center">
//                       <div
//                         className={`border-[1px] text-black p-3 ${seatClass}`}
//                         onClick={() => selectOrUnselectSeat(seatNumber)}
//                       >
//                         {seatNumber}
//                       </div>
//                     </div>
//                   </Col>
//                 );
//               })}

//               {/* Right side of the row (3 seats) */}
//               {Array.from(Array(3).keys()).map((seatIndex) => {
//                 const seatNumber = rowIndex * 5 + 2 + seatIndex + 1;
//                 if (seatNumber > capacity) return null; // Skip seats beyond capacity

//                 let seatClass = `btn btn-outline bg-white cursor-pointer hover:bg-blue-600`;
//                 if (selectedSeats.includes(seatNumber)) {
//                   seatClass = `btn btn-outline bg-blue-500 cursor-pointer`;
//                 } else if (bus.seatsBooked.includes(seatNumber)) {
//                   seatClass = `btn btn-outline bg-red-500 pointer-events-none cursor-not-allowed`;
//                 }

//                 return (
//                   <Col key={seatNumber} span={8}>
//                     <div className="flex justify-center items-center">
//                       <div
//                         className={`border-[1px] text-black p-3 ${seatClass}`}
//                         onClick={() => selectOrUnselectSeat(seatNumber)}
//                       >
//                         {seatNumber}
//                       </div>
//                     </div>
//                   </Col>
//                 );
//               })}
//             </Row>
//           ))}
//         </Row>
//       </div>
//     </div>
//   );
// }

// export default SeatSelection;


import React from "react";
import { Row, Col } from "antd";

function SeatSelection({ selectedSeats, setSelectedSeats, bus }) {
  const capacity = bus.capacity;

  const selectOrUnselectSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  return (
    <div className="m-5">
      <div className="w-[300px] border-2 text-xl font-bold border-blue-500 rounded p-[10px]">
        <Row gutter={[10, 10]}>
          {/* Loop through the seats, creating rows of 4 seats (2 on left, 2 on right) */}
          {Array.from(Array(Math.ceil(capacity / 4)).keys()).map((rowIndex) => (
            <Row key={rowIndex} gutter={[10, 10]} className="w-full flex justify-between">
              {/* Left side (2 seats) */}
              <Col span={10} className="flex gap-2">
                {Array.from(Array(2).keys()).map((seatIndex) => {
                  const seatNumber = rowIndex * 4 + seatIndex + 1;
                  if (seatNumber > capacity) return null;

                  let seatClass = `btn btn-outline bg-white cursor-pointer hover:bg-blue-600`;
                  if (selectedSeats.includes(seatNumber)) {
                    seatClass = `btn btn-outline bg-blue-500 cursor-pointer`;
                  } else if (bus.seatsBooked.includes(seatNumber)) {
                    seatClass = `btn btn-outline bg-red-500 pointer-events-none cursor-not-allowed`;
                  }

                  return (
                    <div
                      key={seatNumber}
                      className={`border-[1px] text-black p-3 ${seatClass}`}
                      onClick={() => selectOrUnselectSeat(seatNumber)}
                    >
                      {seatNumber}
                    </div>
                  );
                })}
              </Col>

              {/* Right side (2 seats) */}
              <Col span={10} className="flex gap-2">
                {Array.from(Array(2).keys()).map((seatIndex) => {
                  const seatNumber = rowIndex * 4 + 2 + seatIndex + 1;
                  if (seatNumber > capacity) return null;

                  let seatClass = `btn btn-outline bg-white cursor-pointer hover:bg-blue-600`;
                  if (selectedSeats.includes(seatNumber)) {
                    seatClass = `btn btn-outline bg-blue-500 cursor-pointer`;
                  } else if (bus.seatsBooked.includes(seatNumber)) {
                    seatClass = `btn btn-outline bg-red-500 pointer-events-none cursor-not-allowed`;
                  }

                  return (
                    <div
                      key={seatNumber}
                      className={`border-[1px] text-black p-3 ${seatClass}`}
                      onClick={() => selectOrUnselectSeat(seatNumber)}
                    >
                      {seatNumber}
                    </div>
                  );
                })}
              </Col>
            </Row>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default SeatSelection;




