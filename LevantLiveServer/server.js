const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.BASE_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || '';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Flight Schema (Matches the main app's ActiveFlight model loosely for telemetry updates)
const activeFlightSchema = new mongoose.Schema({
  pilot_id: { type: String, required: true, index: true },
  flight_number: { type: String, required: true },
  callsign: { type: String, required: true },
  aircraft_type: String,
  departure_icao: String,
  arrival_icao: String,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  altitude: { type: Number, default: 0 },
  ground_speed: { type: Number, default: 0 },
  heading: { type: Number, default: 0 },
  phase: { type: String, default: 'boarding' },
  status: { type: String, default: 'boarding' },
  last_update: { type: Date, default: Date.now, index: true },
}, { strict: false }); // Allow extra fields if needed

const ActiveFlight = mongoose.models.ActiveFlight || mongoose.model('ActiveFlight', activeFlightSchema);

// REST Fallback for ACARS that don't support WebSockets well
app.post('/api/telemetry', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  // TODO: Validate API Key in production
  if (!apiKey || apiKey !== process.env.ACARS_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  const telemetryData = req.body;
  
  if (!telemetryData.pilot_id || !telemetryData.latitude || !telemetryData.longitude) {
      return res.status(400).json({ error: 'Missing required telemetry data' });
  }

  try {
      await processTelemetry(telemetryData);
      res.status(200).json({ success: true });
  } catch (error) {
      console.error('Error processing REST telemetry:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Process incoming telemetry data (from WS or REST)
async function processTelemetry(data) {
  data.last_update = new Date();
  
  // Upsert the flight data in MongoDB
  const flight = await ActiveFlight.findOneAndUpdate(
    { pilot_id: data.pilot_id },
    { $set: data },
    { upsert: true, new: true }
  );

  // Broadcast to all connected web clients (Live Map)
  io.emit('flight_update', flight);
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send all active flights to newly connected web clients
  socket.on('request_all_flights', async () => {
      try {
          // Get flights updated in the last 15 minutes to avoid stale data
          const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
          const flights = await ActiveFlight.find({ last_update: { $gte: fifteenMinsAgo } });
          socket.emit('all_flights', flights);
      } catch (err) {
          console.error('Error fetching all flights:', err);
      }
  });

  // ACARS sending telemetry via WebSocket
  socket.on('telemetry_update', async (data) => {
      // Basic validation
      if (data && data.pilot_id && data.apiKey === process.env.ACARS_API_KEY) {
          // Remove API key from data before saving/broadcasting
          delete data.apiKey;
          await processTelemetry(data);
      } else {
          console.warn('Invalid or unauthorized telemetry update received');
      }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development
  server.listen(PORT, () => {
    console.log(`Live telemetry server running on port ${PORT}`);
  });
}
