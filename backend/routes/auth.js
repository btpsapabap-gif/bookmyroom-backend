console.log("AUTH.JS EXECUTED");
const express = require("express");
const router = express.Router();

const supabase = require("../supabase");
const bcrypt = require("bcrypt");

/* ======================================
   ADMIN LOGIN
====================================== */
router.get("/test", (req, res) => {

    res.json({

        success: true,

        message: "Auth Route Working"

    });

});

router.post("/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message: "Username and Password required"

            });

        }

        const {
            data: user,
            error
        } = await supabase

            .from("users")

            .select("*")

            .eq("username", username)

            .single();

        if (error || !user) {

            return res.status(401).json({

                success: false,

                message: "Invalid Username"

            });

        }

        /* MVP */

        if (user.password !== password) {

            return res.status(401).json({

                success: false,

                message: "Invalid Password"

            });

        }

        res.json({

            success: true,

            user: {

                id: user.id,

                username: user.username,

                name: user.name,

                role: user.role

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

module.exports = router;