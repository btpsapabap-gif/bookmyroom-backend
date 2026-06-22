const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

router.get("/dashboard", async (req, res) => {
    try {

        const { data: rooms, error: roomsError } =
            await supabase
                .from("rooms")
                .select("*");

        if (roomsError) throw roomsError;

        const { data: bookings, error: bookingsError } =
            await supabase
                .from("bookings")
                .select("*")
                .order("id", { ascending: false });

        if (bookingsError) throw bookingsError;

        const totalRooms = rooms.length;

        const confirmedBookings =
            bookings.filter(
                b => b.status === "CONFIRMED"
            );

        const bookedRoomIds =
            new Set(
                confirmedBookings.map(
                    b => b.room_id
                )
            );

        const bookedRooms =
            bookedRoomIds.size;

        const availableRooms =
            Math.max(
                totalRooms - bookedRooms,
                0
            );

        const revenue =
            bookings.reduce(
                (sum, booking) =>
                    sum +
                    Number(
                        booking.total_amount || 0
                    ),
                0
            );

        res.json({
            success: true,
            totalRooms,
            bookedRooms,
            availableRooms,
            revenue,
            totalBookings:
                bookings.length,
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

router.get("/search", async (req, res) => {

    try {

        const search =
            req.query.q || "";

        const { data, error } =
            await supabase
                .from("bookings")
                .select("*");

        if (error) throw error;

        const results =
            data.filter(b => {

                return (
                    String(b.employee_id || "")
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    String(b.room_no || "")
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    String(b.mobile || "")
                        .includes(search)

                    ||

                    String(b.status || "")
                        .toLowerCase()
                        .includes(search.toLowerCase())

                    ||

                    String(b.from_date || "")
                        .includes(search)

                    ||

                    String(b.to_date || "")
                        .includes(search)

                );

            });

        res.json(results);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;