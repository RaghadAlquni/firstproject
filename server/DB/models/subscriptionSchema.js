const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // اسم الباقة
  price: { type: Number, required: true }, // السعر
  description: { type: String },
  
  durationType: {
  type: String,
  enum: ["فصلي", "شهري", "اسبوعي"],
  required: true
},
subscriptionStart: { type: Date },

subscriptionEnd: { type: Date },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  },
  shift: {
    type: String,
    enum: ["صباح", "مساء"],
    required: true
  },

  isActive: { type: Boolean, default: true } // حالة التفعيل
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);