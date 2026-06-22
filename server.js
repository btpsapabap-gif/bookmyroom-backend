const express =
    require("express");

const cors =
    require("cors");

require("dotenv").config();

const app =
    express();

app.use(cors());

app.use(express.json());

const usersRoute =
    require("./routes/users");

app.use(
    "/api/users",
    usersRoute
);

const uploadRoute =
    require("./routes/upload");

app.use(
    "/api/upload",
    uploadRoute
);

const roomsRoute =
    require("./routes/rooms");

app.use(
    "/api/rooms",
    roomsRoute
);

const occupancyRoute =
    require("./routes/occupancy");

app.use(
    "/api/occupancy",
    occupancyRoute
);

const bookingsRoute =
    require("./routes/bookings");

app.use(
    "/api/bookings",
    bookingsRoute
);

const adminRoute =
    require("./routes/admin");

app.use(
    "/api/admin",
    adminRoute
);
console.log("Before Guests Route");
const guestRoutes =
  require("./routes/guests");
console.log("After Guests Route");
app.use(
    "/api/guests",
     guestRoutes
);
console.log("Guests Route Registered");
app.get(
    "/api/health",
    (req, res) => {
        res.json({
            status: "OK"
        });
    }
);

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});