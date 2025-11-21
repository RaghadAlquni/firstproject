const Branch = require("../../DB/models/branchSchema.js");
const Child = require("../../DB/models/childrenSchema.js")
const User = require("../../DB/models/userSchema");

// 1️⃣ new Branch
const addBranch = async (req, res) => {
  try {
    const {
      branchName,
      city,
      district,
      locationLink,
      images,
      workingHours,
      contactNumber,
      ageRange,
      services
    } = req.body;

    // ✅ التحقق من الحقول الأساسية فقط
    if (!branchName || !city || !district || !locationLink || !contactNumber) {
      return res.status(400).json({ message: "❌ يجب تعبئة جميع الحقول الأساسية" });
    }

    const newBranch = new Branch({
      branchName,
      city,
      district,
      locationLink,
      images: images || [],
      workingHours: workingHours || [],
      contactNumber,
      ageRange: ageRange || { from: null, to: null },
      services: services || [],
      directors: [], // 👈 نبدأها فاضية
      assistantDirectors: [],
      teachers: [],
      assistantTeachers: []
    });

    await newBranch.save();

    res.status(201).json({
      message: "✅ تم إضافة الفرع بنجاح",
      branch: newBranch
    });
  } catch (error) {
    console.error("❌ Error adding branch:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء إضافة الفرع",
      error: error.message
    });
  }
};


// 2️⃣ جلب كل الفروع + المدراء والمعلمين والمساعدين
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate({
        path: "directors.user",
        select: "fullName email shift role"
      })
      .populate("assistant_directors", "fullName email role shift") // ✅ اسم مطابق للسكيما
      .populate("teachers", "fullName email role shift")             // 👍 كان صحيح
      .populate("assistant_teachers", "fullName email role shift")   // ✅ اسم مطابق للسكيما
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "✅ تم جلب جميع الفروع مع التفاصيل",
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    console.error("❌ Error fetching branches:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء جلب الفروع ❌",
      error: error.message,
    });
  }
};


// 3️⃣ جلب فرع واحد فقط حسب الـid
const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate({
        path: "directors.user",
        select: "fullName email shift role"
      })
      .populate("assistantDirectors", "fullName email role shift")
      .populate("teachers", "fullName email role shift")
      .populate("assistantTeachers", "fullName email role shift");

    if (!branch) {
      return res.status(404).json({ message: "الفرع غير موجود ❌" });
    }

    res.status(200).json({
      message: "✅ تم جلب بيانات الفرع مع التفاصيل",
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء جلب بيانات الفرع ❌",
      error: error.message,
    });
  }
};

// 4️⃣ تعديل بيانات فرع
const updateBranch = async (req, res) => {
  try {
    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: "الفرع غير موجود ❌" });
    }

    res.status(200).json({
      message: "✅ تم تحديث بيانات الفرع بنجاح",
      data: updatedBranch,
    });
  } catch (error) {
    res.status(400).json({
      message: "❌ حدث خطأ أثناء تحديث بيانات الفرع",
      error: error.message,
    });
  }
};

// 5️⃣ عرض تفاصيل فرع محدد (مع الإحصائيات)
const getBranchDetails = async (req, res) => {
  try {
    const branchId = req.params.id;
    const user = req.user;

    if (!branchId || branchId.length !== 24) {
      return res.status(400).json({ message: "❌ معرّف الفرع غير صالح" });
    }

    // 🔒 تحقق من الصلاحية (المدير/المساعد فقط يشوفون فرعهم)
    if (
      (user.role === "director" || user.role === "assistant_director") &&
      user.branch.toString() !== branchId
    ) {
      return res.status(403).json({
        message: "🚫 لا يمكنك الوصول إلى بيانات فرع آخر غير فرعك",
      });
    }

    const branch = await Branch.findById(branchId)
      .populate({
        path: "directors.user",
        select: "fullName email shift role"
      })
      .populate("assistantDirectors", "fullName email role shift")
      .populate("teachers", "fullName email role shift")
      .populate("assistantTeachers", "fullName email role shift");

    if (!branch) {
      return res.status(404).json({ message: "الفرع غير موجود ❌" });
    }

    const teachersCount = await User.countDocuments({ branch: branchId, role: "teacher" });
    const assistantTeacherCount = await User.countDocuments({ branch: branchId, role: "assistant_teacher" });
    const directorCount = await User.countDocuments({ branch: branchId, role: "director" });
    const assistantDirectorCount = await User.countDocuments({ branch: branchId, role: "assistant_director" });
    const childrenCount = await Child.countDocuments({ branch: branchId });

    res.status(200).json({
      message: "✅ تفاصيل الفرع",
      branch,
      stats: {
        teachersCount,
        assistantTeacherCount,
        directorCount,
        assistantDirectorCount,
        childrenCount
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ حدث خطأ أثناء جلب تفاصيل الفرع",
      error: error.message,
    });
  }
};

// 6️⃣ إحصائيات فرع (مختصرة)
const getBranchStats = async (req, res) => {
  try {
    const branchId = req.params.id;
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "الفرع غير موجود ❌" });

    const teachersCount = await User.countDocuments({ branch: branchId, role: "teacher" });
    const assistantTeacherCount = await User.countDocuments({ branch: branchId, role: "assistant_teacher" });
    const directorCount = await User.countDocuments({ branch: branchId, role: "director" });
    const assistantDirectorCount = await User.countDocuments({ branch: branchId, role: "assistant_director" });
    const childrenCount = await Child.countDocuments({ branch: branchId });

    res.status(200).json({
      message: "✅ إحصائيات الفرع",
      branchName: branch.branchName,
      stats: { teachersCount, assistantTeacherCount, directorCount, assistantDirectorCount, childrenCount }
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات ❌", error: error.message });
  }
};

// 7️⃣ حذف فرع
const deleteBranch = async (req, res) => {
  try {
    const branchId = req.params.id;
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({ message: "الفرع غير موجود ❌" });
    }

    await Branch.findByIdAndDelete(branchId);

    res.status(200).json({ message: "✅ تم حذف الفرع بنجاح" });
  } catch (error) {
    res.status(500).json({
      message: "❌ حدث خطأ أثناء حذف الفرع",
      error: error.message,
    });
  }
};


module.exports = {
    addBranch, getAllBranches, getBranchById, updateBranch, getBranchDetails, getBranchStats, deleteBranch
};