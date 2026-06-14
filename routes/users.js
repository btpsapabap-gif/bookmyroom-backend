const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

router.post("/login", async (req, res) => {

  try {

    const {
      employee_id,
      name
    } = req.body;

    if (!employee_id || !name) {

      return res.status(400).json({
        success: false,
        message: "Employee ID and Name required"
      });

    }

    const {
      data: existingUser,
      error
    } = await supabase
      .from("users")
      .select("*")
      .eq("employee_id", employee_id)
      .single();

    if (
      existingUser &&
      !error
    ) {

      return res.json({
        success: true,
        user: existingUser
      });

    }

    const {
      data: newUser,
      error: insertError
    } = await supabase
      .from("users")
      .insert([
        {
          employee_id,
          name
        }
      ])
      .select()
      .single();

    if (insertError) {

      return res.status(500).json(
        insertError
      );

    }

    res.json({
      success: true,
      user: newUser
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

module.exports = router;