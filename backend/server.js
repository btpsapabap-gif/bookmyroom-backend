require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* =====================================
   MIDDLEWARE
===================================== */

app.use(cors());

app.use(express.json());

/* =====================================
   ROUTES
===================================== */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/guests", require("./routes/guests"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/admin"));

/* =====================================
   HEALTH CHECK
===================================== */

app.get("/", (req, res) => {

    res.json({

        success: true,

        application: "BookMyRoom API",

        version: "1.0.0",

        status: "Running"

    });

});

/* =====================================
   404 HANDLER
===================================== */

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API endpoint not found"

    });

});

/* =====================================
   GLOBAL ERROR HANDLER
===================================== */

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

});

/* =====================================
   START SERVER
===================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("==================================");
    console.log(" BookMyRoom API Started");
    console.log("==================================");
    console.log(` Server : http://localhost:${PORT}`);
    console.log(` Health : http://localhost:${PORT}/`);
    console.log("==================================");

});