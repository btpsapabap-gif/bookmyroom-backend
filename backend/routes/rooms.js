const express = require("express");

const router = express.Router();

const supabase = require("../supabase");

/* ======================================
   GET ALL ACTIVE ROOMS
====================================== */

router.get("/", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("rooms")
            .select("*")
            .eq("active", true)
            .order("id");

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            rooms: data

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

/* ======================================
   GET ROOM BY ID
====================================== */

router.get("/:id", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("rooms")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) {

            return res.status(404).json({

                success: false,

                message: "Room not found"

            });

        }

        res.json({

            success: true,

            room: data

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