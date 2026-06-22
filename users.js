const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

router.post("/", async (req, res) => {

  try {

    const {
      employee_id,
      name,
      role
    } = req.body;

    const { data: existing } =
      await supabase
        .from("users")
        .select("*")
        .eq("employee_id", employee_id)
        .single();

    if (existing) {

      return res.status(400).json({
        success: false,
        message: "Employee already exists"
      });

    }

    const { data, error } =
      await supabase
        .from("users")
        .insert([{
          employee_id,
          name,
          role
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
      user: data[0]
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

module.exports = router;