const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  className: { type: String, required: true },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  shift: {
    type: String,
    enum: ["صباح", "مساء"],
    required: true,
  },
  teacherMain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teacherAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Classroom", classroomSchema);