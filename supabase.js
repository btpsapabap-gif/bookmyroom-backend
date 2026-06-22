const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const { createClient } =
  require("@supabase/supabase-js");

console.log(
  "SUPABASE_URL:",
  process.env.SUPABASE_URL
);

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

module.exports = supabase;