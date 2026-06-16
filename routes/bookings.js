const express = require("express");

const router = express.Router();

const supabase =
  require("../supabase");

// GET BOOKINGS

router.get("/", async (req, res) => {

  const { data, error } =
    await supabase
      .from("bookings")
      .select("*")
      .order(
        "booking_date",
        { ascending: false }
      );

  if (error) {
    return res
      .status(500)
      .json(error);
  }

  res.json(data);

});

// CREATE BOOKING

router.post("/", async (req, res) => {

  try {

    const booking = req.body;

    // Check existing bookings
    const { data: existingBookings, error: checkError } =
      await supabase
        .from("bookings")
        .select("*")
        .eq("room_id", booking.room_id)
        .eq("status", "CONFIRMED");

    if (checkError) {
      return res.status(500).json(checkError);
    }

    const newFrom =
      new Date(booking.from_date);

    const newTo =
      new Date(booking.to_date);

    const conflict =
      existingBookings.some(existing => {

        const existingFrom =
          new Date(existing.from_date);

        const existingTo =
          new Date(existing.to_date);

        return (
          newFrom <= existingTo &&
          newTo >= existingFrom
        );

      });

    if (conflict) {

      return res.status(400).json({
        success: false,
        message:
          "Room already booked for selected dates"
      });

    }

    const { data, error } =
      await supabase
        .from("bookings")
        .insert([booking])
        .select();

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
      booking: data[0]
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

// DELETE BOOKING

router.delete("/:id",
  async (req, res) => {

    const { error } =
      await supabase
        .from("bookings")
        .delete()
        .eq(
          "id",
          req.params.id
        );

    if (error) {
      return res
        .status(500)
        .json(error);
    }

    res.json({
      success: true
    });

});

module.exports = router;