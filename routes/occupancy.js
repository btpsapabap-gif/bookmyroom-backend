const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

router.get("/", async (req, res) => {

  try {

    const {
      data: rooms,
      error: roomsError
    } = await supabase
      .from("rooms")
      .select("*");

    if (roomsError) throw roomsError;

    const {
      data: bookings,
      error: bookingsError
    } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "CONFIRMED");

    if (bookingsError) throw bookingsError;

    res.json({
      success: true,
      rooms,
      bookings
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

module.exports = router;