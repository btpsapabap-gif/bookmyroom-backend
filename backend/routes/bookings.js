const express = require("express");

const router = express.Router();

const supabase = require("../supabase");

/* ==========================================
   GET ALL BOOKINGS
========================================== */

router.get("/", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("booking_date", { ascending: false });

        if (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }

        res.json({
            success: true,
            bookings: data
        });

    }

    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

/* ==========================================
   MY BOOKINGS
========================================== */

router.get("/my/:mobile", async (req, res) => {

    try {

        const { data, error } = await supabase

            .from("bookings")

            .select("*")

            .eq("mobile", req.params.mobile)

            .order("booking_date", {

                ascending: false

            });

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            bookings: data

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

/* ==========================================
   CREATE BOOKING
========================================== */

router.post("/", async (req, res) => {

    try {

        const booking = req.body;

        /* Mandatory Fields */

        if (
            !booking.room_id ||
            !booking.from_date ||
            !booking.to_date
        ) {

            return res.status(400).json({

                success: false,

                message: "Room and Dates are required."

            });

        }

        const fromDate = new Date(booking.from_date);

        const toDate = new Date(booking.to_date);

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (fromDate < today) {

            return res.status(400).json({

                success: false,

                message: "Past booking is not allowed."

            });

        }

        if (toDate <= fromDate) {

            return res.status(400).json({

                success: false,

                message: "Invalid To Date."

            });

        }

        if (

            !booking.id_proof ||

            !booking.id_proof_no

        ) {

            return res.status(400).json({

                success: false,

                message: "ID Proof is mandatory."

            });

        }

        /* ---------------------------------
           GET ROOM
        ---------------------------------- */

        const {

            data: room,

            error: roomError

        } = await supabase

            .from("rooms")

            .select("*")

            .eq("id", booking.room_id)

            .single();

        if (roomError || !room) {

            return res.status(400).json({

                success: false,

                message: "Room not found."

            });

        }

        if (

            !booking.people ||

            booking.people < 1 ||

            booking.people > room.capacity

        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid number of guests."

            });

        }

        /* ---------------------------------
           CHECK ROOM CONFLICT
        ---------------------------------- */

        const {

            data: existingBookings,

            error: checkError

        } = await supabase

            .from("bookings")

            .select("*")

            .eq("room_id", booking.room_id)

            .eq("status", "CONFIRMED");

        if (checkError) {

            return res.status(500).json({

                success: false,

                message: checkError.message

            });

        }

        const overlap = existingBookings.some(existing => {

            const existingFrom = new Date(existing.from_date);

            const existingTo = new Date(existing.to_date);

            return (

                fromDate < existingTo &&

                toDate > existingFrom

            );

        });

        if (overlap) {

            return res.status(400).json({

                success: false,

                message: "Room already booked for selected dates."

            });

        }

        /* ---------------------------------
           CALCULATE DAYS
        ---------------------------------- */

        const diffDays = Math.ceil(

            (toDate - fromDate) /

            (1000 * 60 * 60 * 24)

        );

        booking.total_amount =

            diffDays *

            Number(room.price);

        booking.booking_date =

            new Date().toISOString();

        booking.status =

            "CONFIRMED";

        /* ---------------------------------
            BOOKING TYPE
        ---------------------------------- */

        booking.booking_type =

            booking.booking_type || "Guest";

        /* ---------------------------------
           INSERT BOOKING
        ---------------------------------- */

        const {

            data,

            error

        } = await supabase

            .from("bookings")

            .insert([booking])

            .select()

            .single();

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            booking: data

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});


/* ==========================================
   CANCEL BOOKING
========================================== */

router.delete("/:id", async (req, res) => {

    try {

        const { error } = await supabase

            .from("bookings")

            .update({

                status: "CANCELLED"

            })

            .eq("id", req.params.id);

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            message: "Booking cancelled."

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;