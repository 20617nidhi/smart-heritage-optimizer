// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Heritage Backend Server is Running");
});

/* =========================
   HERITAGE DATA
========================= */
const heritagePlaces = [
  { id: 1, name: "Taj Mahal", city: "Agra" },
  { id: 2, name: "Red Fort", city: "Delhi" },
  { id: 3, name: "Qutub Minar", city: "Delhi" },
  { id: 4, name: "Amber Fort", city: "Jaipur" },
  { id: 5, name: "Hawa Mahal", city: "Jaipur" },
  // Add more places here
];

/* =========================
   HERITAGE ENDPOINTS
========================= */
// Get all heritage places
app.get("/heritage", (req, res) => {
  res.json(heritagePlaces);
});

// Search heritage by city or name
app.get("/heritage/search", (req, res) => {
  const { q } = req.query; // ?q=Agra or ?q=Taj Mahal
  if (!q) return res.json([]);

  const results = heritagePlaces.filter(place =>
    place.name.toLowerCase().includes(q.toLowerCase()) ||
    place.city.toLowerCase().includes(q.toLowerCase())
  );
  res.json(results);
});

/* =========================
   PREDICTION API
========================= */
app.post("/predict", (req, res) => {
  const { city, site } = req.body;

  if (!city || !site) {
    return res.status(400).json({ error: "City and heritage site are required" });
  }

  const timeSlots = ["8:00 AM – 10:00 AM", "10:00 AM – 12:00 PM", "12:00 PM – 2:00 PM", "2:00 PM – 4:00 PM"];
  const trafficLevels = ["Light", "Moderate", "Heavy"];
  const clearanceRules = ["No Clearance Required", "Security Check Required", "Special Permit Required"];

  const response = {
    city,
    site,
    bestSlot: timeSlots[Math.floor(Math.random() * timeSlots.length)],
    traffic: trafficLevels[Math.floor(Math.random() * trafficLevels.length)],
    clearance: clearanceRules[Math.floor(Math.random() * clearanceRules.length)],
    confidence: "85%"
  };

  res.json(response);
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
