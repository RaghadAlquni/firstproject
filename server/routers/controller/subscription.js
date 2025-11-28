const mongoose = require("mongoose");
const Subscription = require("../../DB/models/subscriptionSchema.js");

// ----------------------------------------------------------
// Helper: يتحقق إذا المستخدم نفس الفرع والشفت
// ----------------------------------------------------------
const isSameScope = (sub, user) => {
  if (["director", "assistant_director"].includes(user.role)) {
    return (
      String(sub.branch) === String(user.branch) &&
      sub.shift === user.shift
    );
  }
  return true;
};

// ----------------------------------------------------------
// 1️⃣ إضافة اشتراك جديد
// ----------------------------------------------------------
const addSubscription = async (req, res) => {
  try {
    const user = req.user;
    const { name, price, ageRange, durationType, description, branch, shift } = req.body;

    if (!["admin", "director", "assistant_director"].includes(user.role)) {
      return res.status(403).json({ message: "🚫 غير مصرح لك بإضافة اشتراك" });
    }

    if (!name || !price || !ageRange?.from || !ageRange?.to || !durationType) {
      return res.status(400).json({ message: "❌ جميع الحقول الأساسية مطلوبة" });
    }

    let finalBranch = branch;
    let finalShift = shift;

    if (["director", "assistant_director"].includes(user.role)) {
      finalBranch = user.branch;
      finalShift = user.shift;
    }

    const existing = await Subscription.findOne({
      name,
      branch: finalBranch,
      shift: finalShift
    });

    if (existing) {
      return res.status(400).json({ message: "❌ يوجد اشتراك بنفس الاسم في هذا الفرع والشفت" });
    }

    const newSub = await Subscription.create({
      name,
      price,
      ageRange,
      durationType,
      description,
      branch: finalBranch,
      shift: finalShift,
      createdBy: user._id
    });

    res.status(201).json({ message: "✅ تم إنشاء الاشتراك بنجاح", data: newSub });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء إضافة الاشتراك", error: error.message });
  }
};

// ----------------------------------------------------------
// 2️⃣ تعديل اشتراك جزئي
// ----------------------------------------------------------
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!["admin", "director", "assistant_director"].includes(user.role)) {
      return res.status(403).json({ message: "🚫 غير مصرح لك بتعديل الاشتراكات" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "❌ رقم المعرف غير صالح" });
    }

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ message: "❌ الاشتراك غير موجود" });

    if (!isSameScope(sub, user)) {
      return res.status(403).json({ message: "🚫 لا يمكنك تعديل اشتراك خارج فرعك أو شفتك" });
    }

    const fields = ["name", "price", "ageRange", "durationType", "description", "isActive"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== "") sub[f] = req.body[f];
    });

    await sub.save();
    res.status(200).json({ message: "✅ تم تعديل الاشتراك بنجاح", subscription: sub });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء تعديل الاشتراك", error: error.message });
  }
};

// ----------------------------------------------------------
// 3️⃣ حذف اشتراك
// ----------------------------------------------------------
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!["admin", "director", "assistant_director"].includes(user.role)) {
      return res.status(403).json({ message: "🚫 غير مصرح لك بحذف الاشتراكات" });
    }

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ message: "❌ الاشتراك غير موجود" });

    if (!isSameScope(sub, user)) {
      return res.status(403).json({ message: "🚫 لا يمكنك حذف اشتراك خارج فرعك أو شفتك" });
    }

    await Subscription.findByIdAndDelete(id);
    res.status(200).json({ message: "✅ تم حذف الاشتراك بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء الحذف", error: error.message });
  }
};

// ----------------------------------------------------------
// 4️⃣ عرض كل الاشتراكات
// ----------------------------------------------------------
const getAllSubscriptions = async (req, res) => {
  try {
    const user = req.user;

    let filter = {};

    if (["director", "assistant_director"].includes(user.role)) {
      filter.branch = user.branch;
      filter.shift = user.shift;
    }

    const subs = await Subscription.find(filter)
      .sort({ price: 1 })
      .populate("branch createdBy", "name email role");

    res.status(200).json({
      count: subs.length,
      subscriptions: subs
    });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب الاشتراكات", error: error.message });
  }
};

// ----------------------------------------------------------
// 5️⃣ عرض اشتراك واحد
// ----------------------------------------------------------
const getOneSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "❌ رقم المعرف (ID) غير صالح" });
    }

    const sub = await Subscription.findById(id).populate("branch createdBy", "name email role");
    if (!sub) return res.status(404).json({ message: "❌ الاشتراك غير موجود" });

    if (!isSameScope(sub, user)) {
      return res.status(403).json({ message: "🚫 لا يمكنك عرض اشتراك خارج فرعك أو شفتك" });
    }

    res.status(200).json({
      message: "✅ تم جلب تفاصيل الاشتراك بنجاح",
      subscription: sub
    });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب الاشتراك", error: error.message });
  }
};

// ----------------------------------------------------------
// 6️⃣ جلب الاشتراكات حسب الفرع + الشفت (AddChild يستعملها)
// ----------------------------------------------------------
const getSubscriptionsByBranchAndShift = async (req, res) => {
  try {
    const { branch, shift } = req.query;

    if (!branch || !shift) {
      return res.status(400).json({ message: "❌ يجب تمرير branch و shift" });
    }

    const subs = await Subscription.find({
      branch,
      shift,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({ subscriptions: subs });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب الاشتراكات", error: error.message });
  }
};

// ----------------------------------------------------------
// 7️⃣ جلب جميع الاشتراكات المفعلة لفرع بدون شفت
// ----------------------------------------------------------
const getActiveSubscriptionsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    const subs = await Subscription.find({
      branch: branchId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({ subscriptions: subs });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب الاشتراكات", error: error.message });
  }
};

// ✅ جلب اشتراكات مرتبطة بفرع وشفت المدير أو المساعد
const getMySubscriptions = async (req, res) => {
  try {
    const user = req.user;

    let filter = {};

    if (["director", "assistant_director"].includes(user.role)) {
      filter.branch = user.branch;
      filter.shift = user.shift;
      filter.isActive = true;
    }

    const subscriptions = await Subscription.find(filter).sort({ price: 1 });

    return res.status(200).json({
      subscriptions,
    });
  } catch (error) {
    console.error("❌ Error in getMySubscriptions:", error);
    return res.status(500).json({
      message: "حدث خطأ أثناء جلب الاشتراكات",
    });
  }
};


module.exports = {
  addSubscription,
  updateSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getOneSubscription,
  getSubscriptionsByBranchAndShift,
  getActiveSubscriptionsByBranch,
  getMySubscriptions,
};
