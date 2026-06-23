const express = require("express");
const router = express.Router();

const supabase =
  require("../supabase");

/* REGISTER */

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        name,
        mobile,
        email,
        id_proof_type,
        id_proof_no,
        address
      } = req.body;

      const {
        data: existing
      } = await supabase
        .from("external_users")
        .select("*")
        .eq("mobile", mobile);

      if (
        existing &&
        existing.length > 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Mobile already registered"
        });

      }

      const {
        data,
        error
      } = await supabase
        .from("external_users")
        .insert([{
          name,
          mobile,
          email,
          id_proof_type,
          id_proof_no,
          address
        }])
        .select();

      if (error) {

        return res.status(500).json(error);

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

  }
);

/* LOGIN */

router.post(
  "/login",
  async (req, res) => {

    const { mobile } =
      req.body;

    const {
      data,
      error
    } = await supabase
      .from("external_users")
      .select("*")
      .eq("mobile", mobile)
      .single();

    if (
      error ||
      !data
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Mobile not registered"
      });

    }

    res.json({
      success: true,
      user: data
    });

  }
);

module.exports = router;