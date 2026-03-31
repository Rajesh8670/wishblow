const mongoose = require("mongoose");

const CelebrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 150 },
    message: { type: String, required: true, trim: true },
    senderName: { type: String, required: true, trim: true },
    relationshipTag: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: null },
    memoryPhotos: { type: [String], default: [] },
    wishText: { type: String, required: true, trim: true },
    audioUrl: { type: String, default: null },
    bgmUrl: { type: String, default: null }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.models.Celebration || mongoose.model("Celebration", CelebrationSchema);
