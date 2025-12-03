const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["child", "employee"],
      required: true,
    },

    // ⬅️ للطفل
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Children",
      default: null,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ⬅️ للموظف
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    shift: { type: String },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "no-record"],
      default: "present",
    },

    checkIn: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
