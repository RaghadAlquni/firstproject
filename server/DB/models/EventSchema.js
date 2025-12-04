const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: { type: String, required: true },

    date: { type: Date, required: true },

    type: {
      type: String,
      enum: ["event", "news"],
      required: true,
    },

    visibility: {
      type: String,
      enum: ["center", "public"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverImage: { type: String, default: null },

    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
