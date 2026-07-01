const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const supabase = require("../supabase");

/* ==================================================
   REGISTER GUEST
================================================== */

router.post("/register", async (req, res) => {

    try {

        const {
            guest_name,
            mobile,
            password
        } = req.body;

        /* Validation */

        if (!guest_name || !mobile || !password) {

            return res.status(400).json({

                success: false,

                message: "Guest Name, Mobile and Password are required."

            });

        }

        /* Check duplicate mobile */

        const {
            data: existingGuest,
            error: checkError
        } = await supabase

            .from("guests")

            .select("id")

            .eq("mobile", mobile)

            .maybeSingle();

        if (checkError) {

            return res.status(500).json({

                success: false,

                message: checkError.message

            });

        }

        if (existingGuest) {

            return res.status(400).json({

                success: false,

                message: "Mobile number already registered."

            });

        }

        /* Encrypt password */

        const hashedPassword =
            await bcrypt.hash(password, 10);

        /* Save guest */

        const {
            data,
            error
        } = await supabase

            .from("guests")

            .insert([

                {

                    guest_name,

                    mobile,

                    password: hashedPassword

                }

            ])

            .select()

            .single();

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        res.status(201).json({

            success: true,

            message: "Guest registered successfully.",

            guest: {

                id: data.id,

                guest_name: data.guest_name,

                mobile: data.mobile

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

/* ==================================================
   GUEST LOGIN
================================================== */

router.post("/login", async (req, res) => {

    try {

        const {
            mobile,
            password
        } = req.body;

        if (!mobile || !password) {

            return res.status(400).json({

                success: false,

                message: "Mobile and Password are required."

            });

        }

        const {
            data: guest,
            error
        } = await supabase

            .from("guests")

            .select("*")

            .eq("mobile", mobile)

            .maybeSingle();

        if (error) {

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

        if (!guest) {

            return res.status(401).json({

                success: false,

                message: "Guest not found."

            });

        }

        const validPassword =
            await bcrypt.compare(
                password,
                guest.password
            );

        if (!validPassword) {

            return res.status(401).json({

                success: false,

                message: "Invalid password."

            });

        }

        res.json({

            success: true,

            message: "Login successful.",

            guest: {

                id: guest.id,

                guest_name: guest.guest_name,

                mobile: guest.mobile

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

/* ==================================================
   GET ALL GUESTS (ADMIN)
================================================== */

router.get("/", async (req, res) => {

    try {

        const {
            data,
            error
        } = await supabase

            .from("guests")

            .select("id, guest_name, mobile, created_at")

            .order("created_at", {

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

            guests: data

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