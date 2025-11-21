const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");

const Children = require("../../DB/models/childrenSchema.js");
const User = require("../../DB/models/userSchema.js");
const Branch = require("../../DB/models/branchSchema.js");
const Classroom = require("../../DB/models/classroomSchema.js");
const Subscription = require("../../DB/models/subscriptionSchema.js");

dotenv.config();

// =======================
// WhatsApp Sender (Meta API)
// =======================
const WA_TOKEN = process.env.WHATSAPP_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WA_VERSION = "v22.0";

async function sendWhatsAppMessage(toNumbers, message) {
  if (!WA_TOKEN || !WA_PHONE_ID) return console.warn("⚠️ WhatsApp credentials missing.");
  const url = `https://graph.facebook.com/${WA_VERSION}/${WA_PHONE_ID}/messages`;

  for (const raw of toNumbers || []) {
    const to = String(raw).replace(/[^0-9]/g, "");
    if (!to) continue;

    try {
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${WA_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`✅ WhatsApp sent to ${to}`);
    } catch (err) {
      console.error("❌ WhatsApp error:", err.response?.data || err.message);
    }
  }
}

// =======================
// Helpers
// =======================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const getGuardianPhones = (child) =>
  (child.guardian || []).map((g) => g.phoneNumber).filter(Boolean);
const ensureSameScope = (child, user) =>
  ["director", "assistant_director"].includes(user.role)
    ? String(child.branch) === String(user.branch) && child.shift === user.shift
    : true;

// =======================
// 1️⃣ إضافة طفل جديد
// =======================
const addChild = async (req, res) => {
  try {
    const u = req.user;
    const {
      childName,
      idNumber,
      dateOfBirth,
      gender,
      guardian,
      branch,
      shift,
      teacherMain,
      subscriptionId,
      subscriptionEnd,
    } = req.body;

    // ========== التحقق الأساسي ==========
    if (!childName || !idNumber || !dateOfBirth || !gender)
      return res.status(400).json({ message: "الاسم، الهوية، الميلاد، الجنس مطلوبة" });

    if (!["بنت", "ولد"].includes(gender))
      return res.status(400).json({ message: "الجنس يجب أن يكون (بنت) أو (ولد)" });

    if (!Array.isArray(guardian) || guardian.length < 2)
      return res.status(400).json({ message: "يجب إدخال بيانات وليي أمر اثنين على الأقل" });

    for (const g of guardian) {
      if (!g.guardianName || !g.relationship || !g.phoneNumber)
        return res.status(400).json({ message: "كل وليّ أمر يحتاج (الاسم/العلاقة/الرقم)" });
    }

    if (!isValidId(subscriptionId))
      return res.status(400).json({ message: "subscriptionId غير صالح" });

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || !subscription.isActive)
      return res.status(400).json({ message: "الاشتراك غير متاح" });

    // ========== الأدمن ==========
    if (u.role === "admin") {
      if (!branch || !shift || !teacherMain)
        return res.status(400).json({ message: "branch / shift / teacherMain مطلوبة" });

      const [b, teacher] = await Promise.all([
        Branch.findById(branch),
        User.findById(teacherMain),
      ]);

      if (!b) return res.status(404).json({ message: "الفرع غير موجود" });
      if (!teacher || teacher.role !== "teacher")
        return res.status(400).json({ message: "teacherMain ليس معلماً صالحاً" });

      const classroomId = teacher.classroom;
      if (!classroomId)
        return res.status(400).json({ message: "المعلّم لا يملك فصلًا بعد" });

      const child = await Children.create({
        childName,
        idNumber,
        dateOfBirth,
        gender,
        guardian,
        branch,
        shift,
        teacherMain,
        classroom: classroomId,
        subscription: subscription._id,
        subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : null,
        status: "مؤكد",
      });

      await Classroom.findByIdAndUpdate(classroomId, {
        $addToSet: { children: child._id },
      });

      const phones = getGuardianPhones(child);
      const msg = `✅ تم تأكيد تسجيل الطفل ${child.childName} في اشتراك ${subscription.name}.\nالمدة: ${subscription.durationType}\nالسعر: ${subscription.price} ريال.`;
      await sendWhatsAppMessage(phones, msg);

      return res.status(201).json({
        message: "تمت إضافة الطفل بنجاح ✅",
        child,
      });
    }

    // ========== المدير / المساعد ==========
    if (["director", "assistant_director"].includes(u.role)) {
      if (!teacherMain)
        return res.status(400).json({ message: "teacherMain مطلوب" });

      const teacher = await User.findById(teacherMain);
      if (!teacher || teacher.role !== "teacher")
        return res.status(400).json({ message: "teacherMain ليس معلماً صالحاً" });

      const classroomId = teacher.classroom;
      if (!classroomId)
        return res.status(400).json({ message: "المعلّم لا يملك فصلًا بعد" });

      const child = await Children.create({
        childName,
        idNumber,
        dateOfBirth,
        gender,
        guardian,
        branch: u.branch,
        shift: u.shift,
        teacherMain,
        classroom: classroomId,
        subscription: subscription._id,
        subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : null,
        status: "مؤكد",
      });

      await Classroom.findByIdAndUpdate(classroomId, {
        $addToSet: { children: child._id },
      });

      const phones = getGuardianPhones(child);
      const msg = `✅ تم تأكيد تسجيل الطفل ${child.childName} في اشتراك ${subscription.name}.\nالمدة: ${subscription.durationType}\nالسعر: ${subscription.price} ريال.`;
      await sendWhatsAppMessage(phones, msg);

      return res.status(201).json({
        message: "تمت إضافة الطفل بنجاح ✅",
        child,
      });
    }

    return res.status(403).json({ message: "ليس لديك صلاحية لإضافة طفل" });

  } catch (error) {
    console.error("addChild error:", error);
    res.status(500).json({ message: "حدث خطأ أثناء الإضافة ❌", error: error.message });
  }
};



// اضافة طفل من البارنتس
const addChildParent = async (req, res) => {
  try {
    const {
      childName,
      idNumber,
      dateOfBirth,
      gender,
      guardian,
      branch,
      shift,
      subscriptionId,
      subscriptionEnd,
    } = req.body;

    // نفس التحققات
    if (!childName || !idNumber || !dateOfBirth || !gender)
      return res.status(400).json({ message: "الاسم، الهوية، الميلاد، الجنس مطلوبة" });

    if (!["بنت", "ولد"].includes(gender))
      return res.status(400).json({ message: "الجنس يجب أن يكون (بنت) أو (ولد)" });

    if (!Array.isArray(guardian) || guardian.length < 2)
      return res.status(400).json({ message: "يجب إدخال بيانات وليي أمر اثنين على الأقل" });

    const b = await Branch.findById(branch);
    if (!b) return res.status(404).json({ message: "الفرع غير موجود" });

    const child = await Children.create({
      childName,
      idNumber,
      dateOfBirth,
      gender,
      guardian,
      branch,
      shift,
      subscription: subscriptionId,
      subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : null,
      status: "مضاف",
    });

    return res.status(201).json({
      message: "تم استلام طلب تسجيل الطفل بنجاح بانتظار موافقة الإدارة",
      child,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء الإضافة ❌",
      error: error.message,
    });
  }
};



// =======================
// 2️⃣ تأكيد طفل بعد موافقة الإدارة
// =======================
const confirmChild = async (req, res) => {
  try {
    const u = req.user;
    const { id } = req.params;
    const { teacherMain } = req.body;

    const child = await Children.findById(id).populate("subscription");
    if (!child) return res.status(404).json({ message: "الطفل غير موجود" });
    if (child.status !== "مضاف")
      return res.status(400).json({ message: "يمكن تأكيد الأطفال بحالة (مضاف) فقط" });

    if (!["director", "assistant_director", "admin"].includes(u.role))
      return res.status(403).json({ message: "صلاحية الإدارة فقط" });

    let teacher = null;
    if (teacherMain) {
      teacher = await User.findById(teacherMain);
      if (!teacher || teacher.role !== "teacher" || !teacher.classroom)
        return res.status(400).json({ message: "teacherMain غير صالح" });
    }

    child.teacherMain = teacher ? teacher._id : child.teacherMain;
    child.classroom = teacher ? teacher.classroom : child.classroom;
    child.status = "مؤكد";
    await child.save();

    const phones = getGuardianPhones(child);
    const msg = `✅ تم تأكيد تسجيل الطفل ${child.childName} في اشتراك ${child.subscription.name}.\nالمدة: ${child.subscription.durationType}\nالسعر: ${child.subscription.price} ريال.`;
    await sendWhatsAppMessage(phones, msg);

    res.status(200).json({ message: "تم تأكيد الطفل ✅", child });
  } catch (error) {
    console.error("confirmChild error:", error);
    res.status(500).json({ message: "حدث خطأ أثناء التأكيد ❌", error: error.message });
  }
};

// =======================
// 3️⃣ تحديث بيانات طفل
// =======================
const updateChild = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (!isValidId(id)) return res.status(400).json({ message: "child id غير صالح" });

    const child = await Children.findById(id);
    if (!child) return res.status(404).json({ message: "الطفل غير موجود" });

    Object.assign(child, update);
    await child.save();
    res.status(200).json({ message: "تم تحديث بيانات الطفل ✅", child });
  } catch (error) {
    res.status(500).json({ message: "خطأ أثناء التحديث ❌", error: error.message });
  }
};

// =======================
// 4️⃣ حذف طفل
// =======================
const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "id غير صالح" });

    const deleted = await Children.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "الطفل غير موجود" });

    if (deleted.classroom)
      await Classroom.findByIdAndUpdate(deleted.classroom, { $pull: { children: deleted._id } });

    if (deleted.teacherMain)
      await User.findByIdAndUpdate(deleted.teacherMain, { $pull: { teacherChildren: deleted._id } });

    res.status(200).json({ message: "تم حذف الطفل ✅" });
  } catch (error) {
    res.status(500).json({ message: "خطأ أثناء الحذف ❌", error: error.message });
  }
};

// =======================
// 5️⃣ تعطيل الأطفال بانتهاء الاشتراك
// =======================
const expireSubscriptions = async (req, res) => {
  try {
    const now = new Date();
    const expired = await Children.find({
      subscriptionEnd: { $lte: now },
      status: { $ne: "غير مفعل" },
    });

    const ids = expired.map((c) => c._id);
    await Children.updateMany({ _id: { $in: ids } }, { $set: { status: "غير مفعل" } });

    await Classroom.updateMany({}, { $pull: { children: { $in: ids } } });
    await User.updateMany({ role: "teacher" }, { $pull: { teacherChildren: { $in: ids } } });

    res.status(200).json({
      message: "تم تعطيل الأطفال ذوي الاشتراكات المنتهية ✅",
      affected: ids.length,
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ أثناء تعطيل الاشتراكات ❌", error: error.message });
  }
};

// =======================
// 6️⃣ عرض الأطفال
// =======================
const getChildren = async (req, res) => {
  try {
    const u = req.user;
    const { status, branch, shift } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (u.role === "admin") {
      if (branch) filter.branch = branch;
      if (shift) filter.shift = shift;
    } else if (["director", "assistant_director"].includes(u.role)) {
      filter.branch = u.branch;
      filter.shift = u.shift;
    }

    const children = await Children.find(filter).populate("teacherMain subscription branch");
    res.status(200).json({ count: children.length, children });
  } catch (error) {
    res.status(500).json({ message: "خطأ أثناء الجلب ❌", error: error.message });
  }
};


const markAllInactive = async (req, res) => {
  try {
    const user = req.user;

    if (!["admin", "director", "assistant_director"].includes(user.role)) {
      return res.status(403).json({ message: "🚫 غير مصرح لك بتنفيذ هذا الإجراء" });
    }

    let filter = {};

    // إذا المدير أو المساعد: فقط أطفال نفس الفرع والشفت
    if (["director", "assistant_director"].includes(user.role)) {
      filter = { branch: user.branch, shift: user.shift };
    }

    const result = await Children.updateMany(filter, { status: "غير مفعل" });

    // حذفهم من الفصول والمعلمين
    const affectedChildren = await Children.find(filter).select("_id");
    const ids = affectedChildren.map((c) => c._id);

    if (ids.length > 0) {
      await Classroom.updateMany({}, { $pull: { children: { $in: ids } } });
      await User.updateMany(
        { role: "teacher" },
        { $pull: { teacherChildren: { $in: ids } } }
      );
    }

    res.status(200).json({
      message: "✅ تم تحويل الأطفال إلى غير مفعلين بنجاح",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء تعطيل الأطفال", error: error.message });
  }
};

const getOneChild = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Children.findById(id).populate("teacherMain subscription branch classroom");

    if (!child) return res.status(404).json({ message: "❌ الطفل غير موجود" });

    // لو المدير أو المساعد فقط يشوف أطفال نفس الفرع والشفت
    if (["director", "assistant_director"].includes(req.user.role)) {
      if (
        String(child.branch) !== String(req.user.branch) ||
        child.shift !== req.user.shift
      ) {
        return res.status(403).json({ message: "🚫 لا يمكنك الوصول إلى هذا الطفل" });
      }
    }

    res.status(200).json({ message: "✅ تم جلب بيانات الطفل", child });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الطفل ❌", error: error.message });
  }
};


module.exports = {
  addChild,
  addChildParent,
  confirmChild,
  updateChild,
  deleteChild,
  expireSubscriptions,
  getChildren,
  markAllInactive,
  getOneChild,
};