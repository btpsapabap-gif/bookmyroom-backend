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

router.post("/login", async (req, res) => {

  try {

    const {
      employee_id,
      name
    } = req.body;

    if (!employee_id || !name) {

      return res.status(400).json({
        success: false,
        message: "Employee ID and Name are required"
      });

    }

    const { data: user, error } =
      await supabase
        .from("users")
        .select("*")
        .eq("employee_id", employee_id)
        .ilike("name", name)
        .single();

    if (error || !user) {

      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or Name"
      });

    }

    res.json({
      success: true,
      user
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

router.post(
  "/register-guest",
  async (req, res) => {

    try {

      const {
        name,
        mobile,
        password
      } = req.body;

      const { data, error } =
        await supabase
          .from("users")
          .insert([
            {
              name,
              mobile,
              password,
              role: "GUEST"
            }
          ])
          .select()
          .single();

      if (error) throw error;

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

  }
);

router.post(
  "/guest-login",
  async (req, res) => {

    try {

      const {
        mobile,
        password
      } = req.body;

      const { data: user, error } =
        await supabase
          .from("users")
          .select("*")
          .eq("mobile", mobile)
          .eq("role", "GUEST")
          .single();

      if (!user) {

        return res.status(401).json({
          success: false,
          message: "Guest not found"
        });

      }

      if (user.password !== password) {

        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });

      }

      res.json({
        success: true,
        user
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }

  }
);

module.exports = router;