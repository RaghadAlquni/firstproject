const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idNumber: {type: Number, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  phone: { type: String, required: true },
  avatar: { type: String,
  default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKdfaeaWXW2xTASVlNiMqSMtwYeS7swJT-bg&s" },  
  role: {
    type: String,
    enum: ["admin", "director", "assistant_director", "teacher", "assistant_teacher", "parent"],
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: function () {
      // not required for admin
      return this.role !== "admin"; 
    },
  },
  shift: {
    type: String,
    enum: ["صباح", "مساء"],
    // admin لا يشمل شفت محدد
  },
  directorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // يشير للمدير إذا هذا user هو مساعد مدير أو معلم
    default: null,
  },
  assistantDirectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // يشير للمساعد إذا هذا user هو معلم
    default: null,
  },

  // only for teachers each teacher has one or more classroom
  classroom: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Classroom",
  default: null
},
  invite: {
    token: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    used: { type: Boolean, default: false }
  },

  managedAssistants: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],

  assistantClasses: [
  { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }
],

  // true بعد تفعيل الحساب
  teacherChildren: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Children" // الأطفال التابعين للمعلم
    }
  ],
  managedTeachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // المعلمين التابعين للمدير أو مساعد المدير
    }
  ],
  managedChildren: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Children" // الأطفال التابعين للمدير أو مساعد المدير
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);