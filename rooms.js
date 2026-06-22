const express = require("express");

const router = express.Router();

const supabase =
  require("../supabase");

router.get("/", async (req, res) => {

  const { data, error } =
    await supabase
      .from("rooms")
      .select("*")
      .order("room_no");

  if (error) {
    return res
      .status(500)
      .json(error);
  }

  res.json(data);

});

module.exports = router;