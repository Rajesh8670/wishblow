const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const Celebration = require("./models/Celebration.cjs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Serve static files from dist folder
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

app.get("/api/health", async (_req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ ok: true, mongoState });
});

app.post("/api/celebrations", async (req, res) => {
  try {
    const celebration = await Celebration.create(req.body);
    res.status(201).json({ id: celebration._id.toString() });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to create celebration"
    });
  }
});

app.get("/api/celebrations/:id", async (req, res) => {
  try {
    const celebration = await Celebration.findById(req.params.id).lean();

    if (!celebration) {
      return res.status(404).json({ error: "Celebration not found" });
    }

    return res.json({
      id: celebration._id.toString(),
      name: celebration.name,
      age: celebration.age,
      message: celebration.message,
      senderName: celebration.senderName || "",
      relationshipTag: celebration.relationshipTag || "",
      photoUrl: celebration.photoUrl || null,
      memoryPhotos: celebration.memoryPhotos || [],
      wishText: celebration.wishText,
      audioUrl: celebration.audioUrl || null,
      bgmUrl: celebration.bgmUrl || null
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to load celebration"
    });
  }
});

// Fallback to index.html for SPA routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const start = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your environment before starting the server.");
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || "wishblow"
  });

  app.listen(PORT, () => {
    console.log(`Wishblow API running on http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
