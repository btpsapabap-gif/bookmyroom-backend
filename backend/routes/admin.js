const express = require("express");

const router = express.Router();

const supabase = require("../supabase");

/* ==========================================
   ADMIN DASHBOARD
========================================== */

router.get("/dashboard", async (req, res) => {

    try {

        /* --------------------------
           TOTAL ROOMS
        -------------------------- */

        const {

            count: totalRooms

        } = await supabase

            .from("rooms")

            .select("*", {

                count: "exact",

                head: true

            });

        /* --------------------------
           TOTAL BOOKINGS
        -------------------------- */

        const {

            count: totalBookings

        } = await supabase

            .from("bookings")

            .select("*", {

                count: "exact",

                head: true

            });

        /* --------------------------
           TOTAL GUESTS
        -------------------------- */

        const {

            count: totalGuests

        } = await supabase

            .from("guests")

            .select("*", {

                count: "exact",

                head: true

            });

        /* --------------------------
           REVENUE
        -------------------------- */

        const {

            data: revenueData

        } = await supabase

            .from("bookings")

            .select("total_amount")

            .eq("status", "CONFIRMED");

        const totalRevenue =

            revenueData.reduce(

                (sum, booking) =>

                    sum + Number(booking.total_amount),

                0

            );

        /* --------------------------
           RECENT BOOKINGS
        -------------------------- */

        const {

            data: recentBookings,

            error

        } = await supabase

            .from("bookings")

            .select("*")

            .order(

                "booking_date",

                {

                    ascending: false

                }

            )

            .limit(10);

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            dashboard: {

                totalRooms,

                totalBookings,

                totalGuests,

                totalRevenue,

                recentBookings

            }

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
   OCCUPANCY
========================================== */

router.get("/occupancy", async (req, res) => {

    try {

        const {

            data,

            error

        } = await supabase

            .from("bookings")

            .select(`
                *,
                rooms (
                    room_name,
                    floor,
                    room_type
                )
            `)

            .eq(

                "status",

                "CONFIRMED"

            )

            .order(

                "from_date"

            );

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            occupancy: data

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