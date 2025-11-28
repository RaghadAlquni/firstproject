// DB/models/expenseSchema.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    // مبلغ المصروف
    amount: {
      type: Number,
      required: true,
    },

    // تصنيف المصروف
    category: {
      type: String,
      enum: [
        "رواتب",
        "إيجار",
        "فواتير",
        "مواد تعليمية",
        "صيانة",
        "تسويق",
        "أخرى",
      ],
      default: "أخرى",
    },

    // وصف اختياري
    description: {
      type: String,
      trim: true,
    },

    // الفرع + الفترة (لو له فترة محددة)
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

    // مسؤول الصرف
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
