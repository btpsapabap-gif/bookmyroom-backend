const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

/* ==========================
GET BOOKINGS
========================== */

router.get("/", async (req, res) => {

try {

const { data, error } =
  await supabase
    .from("bookings")
    .select("*")
    .order(
      "booking_date",
      { ascending: false }
    );

if (error) {

  return res.status(500).json({
    success: false,
    message: error.message
  });

}

res.json(data);

} catch (err) {

res.status(500).json({
  success: false,
  message: err.message
});

}

});

/* ==========================
CREATE BOOKING
========================== */

router.post("/", async (req, res) => {

try {

const booking = req.body;

const today =
  new Date();

today.setHours(
  0, 0, 0, 0
);

const newFrom =
  new Date(
    booking.from_date
  );

const newTo =
  new Date(
    booking.to_date
  );

/* --------------------------
   DATE VALIDATION
-------------------------- */

if (newFrom < today) {

  return res.status(400).json({
    success: false,
    message:
      "Past dates are not allowed"
  });

}

if (newTo <= newFrom) {

  return res.status(400).json({
    success: false,
    message:
      "To Date must be after From Date"
  });

}

/* --------------------------
   DEFAULT VALUES
-------------------------- */

booking.booking_date =
  new Date().toISOString();

booking.status =
  booking.status ||
  "CONFIRMED";

booking.user_type =
  booking.user_type ||
  "INTERNAL";

/* --------------------------
   ROOM CONFLICT CHECK
-------------------------- */

const {
  data: existingBookings,
  error: checkError
} = await supabase
  .from("bookings")
  .select("*")
  .eq(
    "room_id",
    booking.room_id
  )
  .eq(
    "status",
    "CONFIRMED"
  );

if (checkError) {

  return res.status(500).json({
    success: false,
    message:
      checkError.message
  });

}

const conflict =
  existingBookings.some(
    existing => {

      const existingFrom =
        new Date(
          existing.from_date
        );

      const existingTo =
        new Date(
          existing.to_date
        );

      return (
        newFrom < existingTo &&
        newTo > existingFrom
      );

    }
  );

if (conflict) {

  return res.status(400).json({
    success: false,
    message:
      "Room already booked for selected dates"
  });

}

/* --------------------------
   CREATE BOOKING
-------------------------- */

const {
  data,
  error
} = await supabase
  .from("bookings")
  .insert([booking])
  .select();

if (error) {

  return res.status(500).json({
    success: false,
    message:
      error.message
  });

}

res.json({
  success: true,
  booking: data[0]
});

} catch (err) {

res.status(500).json({
  success: false,
  message:
    err.message
});

}

});

/* ==========================
DELETE BOOKING
========================== */

router.delete("/:id", async (req, res) => {

try {

const { error } =
  await supabase
    .from("bookings")
    .delete()
    .eq(
      "id",
      req.params.id
    );

if (error) {

  return res.status(500).json({
    success: false,
    message:
      error.message
  });

}

res.json({
  success: true
});

} catch (err) {

res.status(500).json({
  success: false,
  message:
    err.message
});

}

});

module.exports = router;