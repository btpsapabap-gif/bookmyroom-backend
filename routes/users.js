const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

router.post("/login", async (req, res) => {

  try {

    const { employee_id } = req.body;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("employee_id", employee_id)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID"
      });
    }

    res.json({
      success: true,
      user: data
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

module.exports = router;