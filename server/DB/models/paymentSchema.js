const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  // قيمة الدفع (سعر الاشتراك أو المبلغ)
  amount: {
    type: Number,
    required: true,
  },

  // الطفل اللي تمت إضافة الدفع له (اختياري في حالة الدفعات العامة)
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Children", // اسم الموديل الصحيح عندك
    required: false,
  },

  // الفرع
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },

  // الفترة (مهم جداً في الإحصائيات)
  shift: {
    type: String,
    enum: ["صباح", "مساء"],
    required: true,
  },

  // نوع الدفع
  paymentType: {
    type: String,
    enum: ["تسجيل جديد", "تجديد اشتراك", "دفعة مالية"],
    required: true,
  },

  // الاشتراك نفسه (شهري – فصلي – أسبوعي)
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: false,
  },

  // ملاحظات
  note: {
    type: String,
    trim: true,
  },

  // تاريخ الإضافة
  date: {
    type: Date,
    default: Date.now,
  },

  // من أضاف الدفع (أدمن – مديرة – مساعدة)
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
