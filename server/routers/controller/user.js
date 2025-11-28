const User = require("../../DB/models/userSchema");
const bcrypt = require("bcrypt");
require("dotenv").config();
const nodemailer = require("nodemailer");
const Child = require("../../DB/models/childrenSchema.js");
const Branch = require("../../DB/models/branchSchema.js");
const mongoose = require("mongoose");


// 📧 إرسال الإيميل للمستخدم الجديد
const sendUserEmail = async (email, tempPassword, fullName) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Childcare System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "بيانات تسجيل الدخول الخاصة بك",
      html: `
        <div style="direction: rtl; text-align: right; font-family: sans-serif;">
          <h3>مرحبًا ${fullName} 👋</h3>
          <p>تم إنشاء حسابك في نظام الحضانة.</p>
          <p><strong>كلمة المرور المؤقتة:</strong> ${tempPassword}</p>
          <p>الرجاء تسجيل الدخول وتغيير كلمة المرور في أقرب وقت.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ فشل إرسال الإيميل:", error);
  }
};


// ➕ إضافة مستخدم جديد (Admin / Director / Assistant Director / Teacher / Assistant Teacher / Parent)
const addUser = async (req, res) => {
  try {
    const { fullName, email, idNumber, phone, role, branch, shift } = req.body;
    const requestingUser = req.user;

    // ✅ تحقق من الحقول الأساسية
    if (!fullName || !email || !idNumber || !phone || !role) {
      return res.status(400).json({ message: "❌ الحقول الأساسية مطلوبة" });
    }

    // ✅ تحقق من الدور
    const validRoles = [
      "admin",
      "director",
      "assistant_director",
      "teacher",
      "assistant_teacher",
    
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "❌ دور المستخدم غير صالح" });
    }

    // ✅ تحقق من التكرار
    const existingUser = await User.findOne({ $or: [{ idNumber }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "❌ رقم الهوية أو البريد الإلكتروني مستخدم مسبقًا" });
    }

    // ✅ السماح فقط للأدوار المصرح لها بالإضافة
    if (!["admin", "director", "assistant_director"].includes(requestingUser.role)) {
      return res.status(403).json({ message: "🚫 غير مصرح لك بإضافة مستخدمين" });
    }

    let assignedBranch = null;
    let assignedShift = null;

    // 🔹 الأدمن يحددها يدويًا
    if (requestingUser.role === "admin") {
      if (role !== "admin") {
        if (!branch || !shift) {
          return res.status(400).json({ message: "❌ يجب تحديد الفرع والشفت" });
        }
        assignedBranch = branch;
        assignedShift = shift;
      }
    }

    // 🔹 المدير أو المساعد يورث فرعه وشفته
    if (["director", "assistant_director"].includes(requestingUser.role)) {
      assignedBranch = requestingUser.branch;
      assignedShift = requestingUser.shift;
    }

    // ✅ توليد كلمة مرور مؤقتة
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ إنشاء المستخدم الجديد
    const newUser = new User({
      fullName,
      email,
      idNumber,
      phone,
      password: hashedPassword,
      role,
      branch: assignedBranch,
      shift: assignedShift,
    });

    await newUser.save();

    // =====================================================
    // 🔹 الربط التلقائي بناءً على الفرع والشفت
    // =====================================================

    // نبحث عن المدير في نفس الفرع والشفت
    const director = await User.findOne({
      role: "director",
      branch: assignedBranch,
      shift: assignedShift,
    });

    // نبحث عن المدير المساعد في نفس الفرع والشفت (قد يكون موجود)
    const assistantDirector = await User.findOne({
      role: "assistant_director",
      branch: assignedBranch,
      shift: assignedShift,
    });

    // ✅ لو أضفنا مدير مساعد:
    // يربط بالمدير مباشرة ويحدث علاقة managedAssistants
    if (role === "assistant_director" && director) {
      newUser.directorId = director._id;
      await newUser.save();

      if (!director.managedAssistants) director.managedAssistants = [];
      if (!director.managedAssistants.includes(newUser._id)) {
        director.managedAssistants.push(newUser._id);
        await director.save();
      }
    }

    // ✅ لو أضفنا معلم أو مساعد معلم:
    // يربط بالمدير والمدير المساعد (إن وجدوا)
    if (["teacher", "assistant_teacher"].includes(role)) {
      if (director) {
        newUser.directorId = director._id;
        await newUser.save();

        if (!director.managedTeachers) director.managedTeachers = [];
        if (!director.managedTeachers.includes(newUser._id)) {
          director.managedTeachers.push(newUser._id);
          await director.save();
        }
      }

      if (assistantDirector) {
        newUser.assistantDirectorId = assistantDirector._id;
        await newUser.save();
      }
    }

    // =====================================================
    // 🔹 تحديث الفرع
    // =====================================================
    if (assignedBranch && role !== "admin" && role !== "parent") {
      const branchDoc = await Branch.findById(assignedBranch);
      if (branchDoc) {
        if (!branchDoc.directors) branchDoc.directors = [];
        if (!branchDoc.assistant_directors) branchDoc.assistant_directors = [];
        if (!branchDoc.teachers) branchDoc.teachers = [];
        if (!branchDoc.assistant_teachers) branchDoc.assistant_teachers = [];

        switch (role) {
          case "director":
            branchDoc.directors.push({ user: newUser._id, shift: assignedShift });
            break;
          case "assistant_director":
            branchDoc.assistant_directors.push(newUser._id);
            break;
          case "teacher":
            branchDoc.teachers.push(newUser._id);
            break;
          case "assistant_teacher":
            branchDoc.assistant_teachers.push(newUser._id);
            break;
        }

        await branchDoc.save();
      }
    }

    // =====================================================
    // 🔹 إرسال الإيميل
    // =====================================================
    await sendUserEmail(email, tempPassword, fullName);

    res.status(201).json({
      message: `✅ تمت إضافة ${role} وربطه تلقائيًا بالمدير والمساعد المناسبين`,
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Error adding user:", error);
    res.status(500).json({
      message: "❌ حدث خطأ أثناء إضافة المستخدم",
      error: error.message,
    });
  }
};


const getUser = async (req, res) => {
  try {
    const userId = req.user._id; // جاي من الميدل وير حق التوكن

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "⚠️ المستخدم غير موجود" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("❌ خطأ في جلب بيانات المستخدم:", error);
    res.status(500).json({
      message: "❌ حدث خطأ أثناء جلب بيانات المستخدم",
      error: error.message
    });
  }
};

//  جلب جميع المعلمين الرئيسيين
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .populate("directorId", "fullName email")
      .populate("assistantDirectorId", "fullName email");

    if (!teachers.length)
      return res.status(404).json({ message: "⚠️ لا يوجد معلمين" });

    res.status(200).json({ count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب المعلمين", error: error.message });
  }
};



// جلب معلم رئيسي واحد
const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await User.findOne({ _id: id, role: "teacher" })
      .select("-password")
      .populate("directorId", "fullName email shift role")
      .populate("assistantDirectorId", "fullName email role");

    if (!teacher) return res.status(404).json({ message: "⚠️ المعلم غير موجود" });

    const childrenCount = await Child.countDocuments({ teacherMain: id });

    res.status(200).json({ teacher, childrenCount });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب بيانات المعلم", error: error.message });
  }
};


// جلب جميع المعلمين المساعدين
const getAssistantTeachers = async (req, res) => {
  try {
    const assistants = await User.find({ role: "assistant_teacher" })
      .select("-password")
      .populate("directorId", "fullName email")
      .populate("assistantDirectorId", "fullName email")
      .populate("assistantClasses", "className branch shift");

    if (!assistants.length)
      return res.status(404).json({ message: "⚠️ لا يوجد معلمين مساعدين" });

    res.status(200).json({ count: assistants.length, assistants });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب المعلمين المساعدين", error: error.message });
  }
};


// جلب معلم مساعد واحد
const getAssistantTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const assistant = await User.findOne({ _id: id, role: "assistant_teacher" })
      .select("-password")
      .populate("assistantClasses", "className branch shift");

    if (!assistant)
      return res.status(404).json({ message: "⚠️ المعلم المساعد غير موجود" });

    res.status(200).json(assistant);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب المعلم المساعد", error: error.message });
  }
};


// جلب كل المدراء
const getAllDirectors = async (req, res) => {
  try {
    const directors = await User.find({ role: "director" })
      .select("-password")
      .populate("assistantDirectorId", "fullName email");

    if (!directors.length)
      return res.status(404).json({ message: "⚠️ لا يوجد مديرين" });

    res.status(200).json({ count: directors.length, directors });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب المديرين", error: error.message });
  }
};


// جلب مدير واحد
const getDirector = async (req, res) => {
  try {
    const { id } = req.params;
    const director = await User.findOne({ _id: id, role: "director" }).select("-password");

    if (!director)
      return res.status(404).json({ message: "⚠️ المدير غير موجود" });

    res.status(200).json(director);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب بيانات المدير", error: error.message });
  }
};


// جلب كل المديرين المساعدين
const getAllAssistantDirectors = async (req, res) => {
  try {
    const assistants = await User.find({ role: "assistant_director" })
      .select("-password")
      .populate("directorId", "fullName email");

    if (!assistants.length)
      return res.status(404).json({ message: "⚠️ لا يوجد مديرين مساعدين" });

    res.status(200).json({ count: assistants.length, assistants });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب المديرين المساعدين", error: error.message });
  }
};


// جلب مدير مساعد واحد
const getAssistantDirector = async (req, res) => {
  try {
    const { id } = req.params;
    const assistant = await User.findOne({ _id: id, role: "assistant_director" })
      .select("-password")
      .populate("directorId", "fullName email");

    if (!assistant)
      return res.status(404).json({ message: "⚠️ المدير المساعد غير موجود" });

    res.status(200).json(assistant);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب بيانات المدير المساعد", error: error.message });
  }
};

const getDirectorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // نجيب المدير ومعاه العلاقات كاملة
    const director = await User.findById(id)
      .populate({
        path: "managedAssistants",
        select: "fullName email idNumber role shift branch",
        populate: {
          path: "branch",
          select: "branchName city district"
        }
      })
      .populate({
        path: "managedTeachers",
        select: "fullName email idNumber role shift branch",
        populate: {
          path: "branch",
          select: "branchName city district"
        }
      })
      .populate({
        path: "branch",
        select: "branchName city district"
      });

    if (!director) {
      return res.status(404).json({ message: "❌ المدير غير موجود" });
    }

    res.status(200).json({
      message: "✅ تم جلب بيانات المدير بنجاح",
      data: {
        _id: director._id,
        fullName: director.fullName,
        email: director.email,
        idNumber: director.idNumber,
        role: director.role,
        branch: director.branch,
        shift: director.shift,
        assistantsCount: director.managedAssistants.length,
        teachersCount: director.managedTeachers.length,
        managedAssistants: director.managedAssistants,
        managedTeachers: director.managedTeachers
      }
    });
  } catch (error) {
    console.error("❌ Error fetching director details:", error);
    res.status(500).json({
      message: "❌ حدث خطأ أثناء جلب بيانات المدير",
      error: error.message
    });
  }
};

// ✅ جلب المعلمين التابعين للمدير أو المساعد فقط
const getManagedTeachers = async (req, res) => {
  try {
    const user = req.user;

    if (!["director", "assistant_director"].includes(user.role)) {
      return res
        .status(403)
        .json({ message: "❌ هذا الإجراء متاح للمدير أو المساعد فقط" });
    }

    const director = await User.findById(user._id).populate(
      "managedTeachers",
      "_id fullName"
    );

    res.status(200).json({
      teachers: director.managedTeachers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ خطأ أثناء جلب المعلمين" });
  }
};


module.exports = {
  addUser,
  getUser,
  getTeachers,
  getTeacher,
  getAssistantTeachers,
  getAssistantTeacher,
  getAllDirectors,
  getDirector,
  getAllAssistantDirectors,
  getAssistantDirector,
  getDirectorDetails,
  getManagedTeachers
};