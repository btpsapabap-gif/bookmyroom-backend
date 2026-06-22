const API_BASE =
  "https://bookmyroom-api-aupi.onrender.com/api";

let currentUser = null;
let rooms = [];
let bookings = [];
let selectedRoom = null;

/* ===========================
   ELEMENTS
=========================== */

const loginSection = document.getElementById("loginSection");
const appContainer = document.getElementById("appContainer");

const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

const loggedUser = document.getElementById("loggedUser");
const logoutBtn = document.getElementById("logoutBtn");

const roomTypeSelect = document.getElementById("roomType");
const floorInput = document.getElementById("floor");

const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");
const peopleInput = document.getElementById("people");

const roomsContainer = document.getElementById("roomsContainer");
const roomCount = document.getElementById("roomCount");

const bookingSection = document.getElementById("bookingSection");

const selectedRoomInput =
  document.getElementById("selectedRoom");

const mobileInput =
  document.getElementById("mobile");

const idProofInput =
  document.getElementById("idProof");

const idProofNoInput =
  document.getElementById("idProofNo");

const idProofImage =
  document.getElementById("idProofImage");

const roomRate =
  document.getElementById("roomRate");

const roomCapacity =
  document.getElementById("roomCapacity");

const totalAmount =
  document.getElementById("totalAmount");

const totalDays =
  document.getElementById("totalDays");

const confirmBookingBtn =
  document.getElementById("confirmBookingBtn");

const bookingsContainer =
  document.getElementById("bookingsContainer");

/* ===========================
Newly added
=========================== */
const employeeBtn =
  document.getElementById("employeeBtn");

const guestBtn =
  document.getElementById("guestBtn");

const employeeLogin =
  document.getElementById("employeeLogin");

const guestSection =
  document.getElementById("guestSection");

guestBtn.addEventListener(
  "click",
  () => {

    employeeLogin.classList.add(
      "hidden"
    );

    guestSection.classList.remove(
      "hidden"
    );

  }
);

document
  .getElementById(
    "registerGuestBtn"
  )
  .addEventListener(
    "click",
    registerGuest
  );

async function registerGuest() {

  const guest_name =
    document.getElementById(
      "guestName"
    ).value;

  const mobile =
    document.getElementById(
      "guestMobile"
    ).value;

  const email =
    document.getElementById(
      "guestEmail"
    ).value;

  const response =
    await fetch(
      `${API_BASE}/guests/register`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          guest_name,
          mobile,
          email
        })
      }
    );

  const result =
    await response.json();

  if (!result.success) {

    alert(result.message);

    return;
  }

  currentUser = {

    id: result.guest.id,
    name: result.guest.guest_name,
    mobile,
    role: "GUEST"

  };

  localStorage.setItem(
    "bookmyroom_user",
    JSON.stringify(currentUser)
  );

  showApp();

  await loadRooms();

  await loadBookings();
}

/* ===========================
   STARTUP
=========================== */

window.addEventListener("load", async () => {

  setupDefaultDates();

  roomTypeChanged();

  const savedUser =
    localStorage.getItem("bookmyroom_user");

  if (savedUser) {

    currentUser =
      JSON.parse(savedUser);

    showApp();

    await loadRooms();

    await loadBookings();
  }
});

/* ===========================
   LOGIN
=========================== */

loginBtn.addEventListener("click", login);

async function login() {

  const employee_id =
    employeeIdInput.value.trim();

  const name =
    employeeNameInput.value.trim();

  if (!employee_id || !name) {

    loginMessage.textContent =
      "Employee ID and Name are required";

    return;
  }

  try {

    loginMessage.textContent =
      "Checking credentials...";

    const response =
      await fetch(
        `${API_BASE}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            employee_id,
            name
          })
        }
      );

    const result =
      await response.json();

    console.log(
      "Login Result:",
      result
    );

    if (!result.success) {

      loginMessage.textContent =
        result.message ||
        "Login failed";

      return;
    }

    currentUser =
      result.user;

    localStorage.setItem(
      "bookmyroom_user",
      JSON.stringify(currentUser)
    );

    loginMessage.textContent =
      "Login successful";

    showApp();

    // Role Based Access
    const adminMenu =
      document.getElementById(
        "adminMenu"
      );

    const occupancyMenu =
      document.getElementById(
        "occupancyMenu"
      );

    const createUserMenu =
      document.getElementById(
        "createUserMenu"
      );

    if (
      currentUser.role !== "ADMIN"
    ) {

      if (adminMenu)
        adminMenu.style.display =
          "none";

      if (occupancyMenu)
        occupancyMenu.style.display =
          "none";

      if (createUserMenu)
        createUserMenu.style.display =
          "none";
    }

    await loadRooms();
    await loadBookings();

  } catch (err) {

    console.error(err);

    loginMessage.textContent =
      "Server connection failed";

  }
}

function showApp() {

  if (
    currentUser.role === "GUEST"
  ) {

    adminMenu.style.display =
      "none";

    occupancyMenu.style.display =
      "none";

    createUserMenu.style.display =
      "none";
  }

  loginSection.classList.add("hidden");
  appContainer.classList.remove("hidden");

  loggedUser.textContent =
    `${currentUser.employee_id} - ${currentUser.name}`;

  document.getElementById(
    "profileCircle"
  ).textContent =
    currentUser.name
      .charAt(0)
      .toUpperCase();
}

/* ===========================
   ROOM TYPE
=========================== */

roomTypeSelect.addEventListener(
  "change",
  roomTypeChanged
);

function roomTypeChanged() {

  if (
    roomTypeSelect.value === "AC"
  ) {

    floorInput.value =
      "First Floor";

  } else {

    floorInput.value =
      "Ground Floor";
  }

  renderRooms();
}

/* ===========================
   DATES
=========================== */

function setupDefaultDates() {

  const today = new Date();

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Default values
  fromDateInput.value = formatDate(today);
  toDateInput.value = formatDate(tomorrow);

  // Prevent past dates
  fromDateInput.min = formatDate(today);
  toDateInput.min = formatDate(tomorrow);
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// When From Date changes
fromDateInput.addEventListener("change", () => {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fromDate = new Date(fromDateInput.value);

  // Block past date selection
  if (fromDate < today) {
    alert("Past dates are not allowed");
    fromDateInput.value = formatDate(today);
    return;
  }

  const nextDay = new Date(fromDate);
  nextDay.setDate(nextDay.getDate() + 1);

  toDateInput.min = formatDate(nextDay);

  if (
    !toDateInput.value ||
    new Date(toDateInput.value) <= fromDate
  ) {
    toDateInput.value = formatDate(nextDay);
  }

  calculateTotal();
});

toDateInput.addEventListener("change", () => {

  const fromDate = new Date(fromDateInput.value);
  const toDate = new Date(toDateInput.value);

  if (toDate <= fromDate) {

    alert("To Date must be after From Date");

    const nextDay = new Date(fromDate);
    nextDay.setDate(nextDay.getDate() + 1);

    toDateInput.value = formatDate(nextDay);
    return;
  }

  calculateTotal();
});

/* ===========================
   LOAD ROOMS
=========================== */

async function loadRooms() {

  try {

    const response =
      await fetch(
        `${API_BASE}/rooms`
      );

    rooms =
      await response.json();

    renderRooms();

  } catch (err) {

    console.error(err);

    alert(
      "Unable to load rooms"
    );
  }
}

/* ===========================
   RENDER ROOMS
=========================== */
function renderRooms() {

  const roomType =
    roomTypeSelect.value;

  const selectedFrom =
    new Date(fromDateInput.value);

  const selectedTo =
    new Date(toDateInput.value);

  const availableRooms =
    rooms.filter(room => {

      // Room type filter
      if (
        room.room_type !== roomType
      ) {
        return false;
      }

      // Booking overlap check
      const isBooked =
        bookings.some(booking => {

          if (
            Number(booking.room_id) !==
            Number(room.id)
          ) {
            return false;
          }

          if (
            booking.status !==
            "CONFIRMED"
          ) {
            return false;
          }

          const bookedFrom =
            new Date(
              booking.from_date
            );

          const bookedTo =
            new Date(
              booking.to_date
            );

          return (
            selectedFrom < bookedTo &&
            selectedTo > bookedFrom
          );

        });

      return !isBooked;

    });

  roomsContainer.innerHTML = "";

  roomCount.textContent =
    `${availableRooms.length} Room(s)`;

  if (
    availableRooms.length === 0
  ) {

    roomsContainer.innerHTML = `
      <div class="empty-state">
        No rooms available
      </div>
    `;

    return;
  }

  availableRooms.forEach(room => {

    const card =
      document.createElement("div");

    card.className =
      "room-card";

    card.innerHTML = `
      <h3>Room ${room.room_no}</h3>

      <p>${room.floor}</p>

      <p>${room.room_type}</p>

      <p>₹${room.rate}</p>

      <p>Capacity ${room.capacity}</p>

      <button class="book-btn">
        Book Now
      </button>
    `;

    card
      .querySelector(".book-btn")
      .addEventListener(
        "click",
        () => selectRoom(room)
      );

    roomsContainer.appendChild(card);

  });

}

/* ===========================
   SELECT ROOM
=========================== */

function selectRoom(room) {

  selectedRoom = room;

  bookingSection.classList.remove(
    "hidden"
  );

  selectedRoomInput.value =
    `Room ${room.room_no}`;

  roomRate.textContent =
    room.rate;

  roomCapacity.textContent =
    room.capacity;

  calculateTotal();
}

fromDateInput.addEventListener("change", async () => {

  const fromDate =
    new Date(fromDateInput.value);

  const nextDay =
    new Date(fromDate);

  nextDay.setDate(
    nextDay.getDate() + 1
  );

  toDateInput.min =
    formatDate(nextDay);

  if (
    new Date(toDateInput.value)
    <= fromDate
  ) {

    toDateInput.value =
      formatDate(nextDay);

  }

  calculateTotal();

  await loadBookings();

  renderRooms();

});

toDateInput.addEventListener("change", async () => {

  calculateTotal();

  await loadBookings();

  renderRooms();

});

function calculateTotal() {

  if (!selectedRoom) return;

  const from =
    new Date(fromDateInput.value);

  const to =
    new Date(toDateInput.value);

  let days =
    Math.ceil(
      (to - from) /
      (1000 * 60 * 60 * 24)
    );

  if (days <= 0) {
    days = 1;
  }

  totalDays.textContent =
    days;

  const total =
    days *
    Number(selectedRoom.rate);

  totalAmount.textContent =
    total.toLocaleString("en-IN");

}

function validateDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fromDate = new Date(fromDateInput.value);
  const toDate = new Date(toDateInput.value);

  if (fromDate < today) {
    alert("From Date cannot be in the past");
    return false;
  }

  if (toDate <= fromDate) {
    alert("To Date must be after From Date");
    return false;
  }

  return true;
}

/* ===========================
   CREATE BOOKING
=========================== */

confirmBookingBtn.addEventListener(
  "click",
  createBooking
);

async function createBooking() {

  if (!validateDates()) {
    return;
  }

  if (!selectedRoom) {
    alert("Select room first");
    return;
  }

  await loadBookings();

  const existingBooking = bookings.find(b =>
    Number(b.room_id) === Number(selectedRoom.id) &&
    b.status === "CONFIRMED" &&
    (
      new Date(fromDateInput.value) < new Date(b.to_date) &&
      new Date(toDateInput.value) > new Date(b.from_date)
    )
  );

  if (existingBooking) {
    alert(
      `Room ${selectedRoom.room_no} is already booked for the selected dates`
    );
    return;
  }

  try {

    let imageUrl = "";

    if (
      idProofImage.files.length > 0
    ) {

      const formData =
        new FormData();

      formData.append(
        "file",
        idProofImage.files[0]
      );

      const uploadResponse =
        await fetch(
          `${API_BASE}/upload/id-proof`,
          {
            method: "POST",
            body: formData
          }
        );

      const uploadResult =
        await uploadResponse.json();

      console.log(
        "Upload Response:",
        uploadResult
      );

      if (!uploadResponse.ok) {

        throw new Error(
          uploadResult.message ||
          "Upload failed"
        );
      }

      imageUrl =
        uploadResult.url || "";

    }

    const payload = {

      employee_id:
        currentUser.employee_id || null,

      booking_type:
        currentUser.role === "GUEST"
          ? "EXTERNAL"
          : "INTERNAL",

      guest_id:
        currentUser.role === "GUEST"
          ? currentUser.id
          : null,

      room_id:
        selectedRoom.id,

      room_no:
        selectedRoom.room_no,

      room_type:
        selectedRoom.room_type,

      booking_date:
        new Date(),

      from_date:
        fromDateInput.value,

      to_date:
        toDateInput.value,

      total_amount:
        Number(
          totalAmount.textContent
            .replace(/,/g, "")
        ),

      people:
        Number(
          peopleInput.value
        ),

      mobile:
        mobileInput.value,

      id_proof:
        idProofInput.value,

      id_proof_no:
        idProofNoInput.value,

      id_proof_image:
        imageUrl,

      status:
        "CONFIRMED"
    };

    const response =
      await fetch(
        `${API_BASE}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(
              payload
            )
        }
      );

    if (!response.ok) {

      throw new Error(
        "Booking failed"
      );
    }

    alert(
      "Booking Confirmed"
    );

    await loadBookings();

    bookingSection.classList.add(
      "hidden"
    );

  } catch (err) {

    console.error(err);

    alert(
      "Booking failed"
    );
  }
}

const registerGuestBtn =
  document.getElementById(
    "registerGuestBtn"
  );

if (registerGuestBtn) {

  registerGuestBtn.addEventListener(
    "click",
    registerGuest
  );

}

/* ===========================
   LOAD BOOKINGS
=========================== */

async function loadBookings() {

  try {

    const response =
      await fetch(
        `${API_BASE}/bookings`
      );

    bookings =
      await response.json();

    renderBookings();
    renderRooms();

  } catch (err) {

    console.error(err);
  }
}

/* ===========================
   RENDER BOOKINGS
=========================== */

function renderBookings() {

  const mine =
    bookings.filter(b => {

      if (
        currentUser.role ===
        "GUEST"
      ) {

        return (
          b.guest_id ===
          currentUser.id
        );

      }

      return (
        b.employee_id ===
        currentUser.employee_id
      );

    });

  bookingsContainer.innerHTML =
    "";

  if (
    mine.length === 0
  ) {

    bookingsContainer.innerHTML =
      `
      <div class="booking-item">
        No bookings found
      </div>
      `;

    return;
  }

  mine.forEach(booking => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "booking-item";

    card.innerHTML = `
      <h4>
        Room ${booking.room_no}
      </h4>

      <p>
        ${booking.room_type}
      </p>

      <p>
         ${booking.from_date || "-"}
      </p>

      <p>
        ${booking.to_date || "-"}
      </p>

      ${booking.id_proof_image
        ? `
  <img
    src="${booking.id_proof_image}"
    style="
      width:100%;
      margin-top:10px;
      border-radius:8px;
    ">
  `
        : ""
      }

      <p>
        ${booking.status}
      </p>

      <button
        class="cancel-btn"
        data-id="${booking.id}">
        Cancel
      </button>
    `;

    bookingsContainer.appendChild(
      card
    );
  });

  document
    .querySelectorAll(
      ".cancel-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () =>
          cancelBooking(
            btn.dataset.id
          )
      );
    });
}

const profileCircle =
  document.getElementById("profileCircle");

const profilePopup =
  document.getElementById("profilePopup");

profileCircle.addEventListener(
  "click",
  () => {
    profilePopup.classList.toggle(
      "show"
    );
  }
);

function getInitials(name) {

  return name
    .trim()
    .split(" ")
    .map(word => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

if (currentUser && currentUser.name) {

  profileCircle.textContent =
    getInitials(currentUser.name);

}

/* ===========================
   CANCEL BOOKING
=========================== */

async function cancelBooking(id) {

  if (
    !confirm(
      "Cancel booking?"
    )
  ) {
    return;
  }

  try {

    await fetch(
      `${API_BASE}/bookings/${id}`,
      {
        method: "DELETE"
      }
    );

    await loadBookings();

  } catch (err) {

    console.error(err);

    alert(
      "Unable to cancel"
    );
  }
}

logoutBtn.addEventListener(
  "click",
  logout
);

function logout() {

  localStorage.removeItem(
    "bookmyroom_user"
  );

  currentUser = null;

  loginSection.classList.remove(
    "hidden"
  );

  appContainer.classList.add(
    "hidden"
  );

  employeeIdInput.value = "";
  employeeNameInput.value = "";

  location.href = "index.html";
}