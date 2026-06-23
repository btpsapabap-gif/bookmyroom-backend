const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

/* Register Guest */

const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

/* Register Guest */

router.post("/register", async (req, res) => {

  try {

    const {
      guest_name,
      mobile,
      email,
      password
    } = req.body;

    // Check if mobile already exists

    const { data: existingGuest } =
      await supabase
        .from("guests")
        .select("*")
        .eq("mobile", mobile)
        .single();

    if (existingGuest) {

      return res.status(400).json({
        success: false,
        message: "Mobile number already registered"
      });

    }

    const { data, error } =
      await supabase
        .from("guests")
        .insert([{
          guest_name,
          mobile,
          email,
          password
        }])
        .select();

    if (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }

    res.json({
      success: true,
      guest: data[0]
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

/* Guest Login */

router.post("/login", async (req, res) => {

  try {

    const {
      mobile,
      password
    } = req.body;

    const { data: guest, error } =
      await supabase
        .from("guests")
        .select("*")
        .eq("mobile", mobile)
        .single();

    if (!guest) {

      return res.status(401).json({
        success: false,
        message: "Guest not found"
      });

    }

    if (guest.password !== password) {

      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });

    }

    res.json({
      success: true,
      guest
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

module.exports = router;