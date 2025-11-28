const Classroom = require("../../DB/models/classroomSchema.js");
const Branch = require("../../DB/models/branchSchema.js");
const Child = require("../../DB/models/childrenSchema.js")
const User = require("../../DB/models/userSchema");

//  🏫 إنشاء فصل جديد بواسطة المعلم واضافه الكلاس تلقائيا للمعلم 
const addClassroomByTeacher = async (req, res) => {
  try {
    const { className } = req.body;
    const teacher = req.user;

    if (teacher.role !== "teacher") {
      return res.status(403).json({ message: "❌ فقط المعلمين يمكنهم إنشاء الفصول" });
    }

    if (!className || className.trim() === "") {
      return res.status(400).json({ message: "❌ اسم الفصل مطلوب" });
    }

    const existingClassroom = await Classroom.findOne({
      className: className.trim(),
      branch: teacher.branch,
      shift: teacher.shift,
    });

    if (existingClassroom) {
      return res.status(400).json({
        message: `❌ اسم الفصل "${className}" مستخدم مسبقًا في نفس الفرع والشفت`,
      });
    }

    // ✨ إنشاء الكلاس
    const newClassroom = new Classroom({
      className: className.trim(),
      branch: teacher.branch,
      shift: teacher.shift,
      teacherMain: teacher._id,
    });

    await newClassroom.save();

    // ✨ ربط الكلاس في حساب المعلم تلقائيًا
    const teacherData = await User.findById(teacher._id);
    teacherData.classroom = newClassroom._id;   // ← هنا الإضافة التلقائية
    await teacherData.save();

    res.status(201).json({
      message: "✅ تم إنشاء الفصل وربطه بحساب المعلّم بنجاح",
      classroom: newClassroom,
    });

  } catch (error) {
    console.error("Error adding classroom:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الفصل ❌", error: error.message });
  }
};


// 👶 دالة: المعلم يضيف طفل إلى كلاس معين
const addChildToClassroom = async (req, res) => {
  try {
    const { classroomId, fullName, age, gender, parentName, parentPhone } = req.body;
    const teacher = req.user;

    if (teacher.role !== "teacher") {
      return res.status(403).json({ message: "❌ فقط المعلمين يمكنهم إضافة الأطفال" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: "❌ الفصل غير موجود" });

    // ✅ تأكد أن المعلم أحد العاملين في هذا الكلاس (رئيسي أو مساعد)
    const isTeacherOfClass =
      String(classroom.teacherMain) === String(teacher._id) ||
      classroom.teacherAssistants.some(id => String(id) === String(teacher._id));

    if (!isTeacherOfClass) {
      return res.status(403).json({ message: "❌ لا يمكنك إضافة طفل إلى فصل لا تعمل فيه" });
    }

    const newChild = new Child({
      fullName,
      age,
      gender,
      parentName,
      parentPhone,
      branch: classroom.branch,
      shift: classroom.shift,
      teacherMain: classroom.teacherMain,
      classroom: classroom._id,
    });

    await newChild.save();

    classroom.children.push(newChild._id);
    await classroom.save();

    res.status(201).json({
      message: "✅ تم إضافة الطفل بنجاح إلى الفصل",
      child: newChild,
    });
  } catch (error) {
    console.error("❌ Error adding child:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة الطفل ❌", error: error.message });
  }
};

// اضافة معلم مساعد لكلاس
const addAssistantToClassroom = async (req, res) => {
  try {
    const { classroomId, assistantId } = req.body;
    const user = req.user;

    // ✅ تحقق من الصلاحيات
    if (!["admin", "director", "assistant_director", "teacher"].includes(user.role)) {
      return res.status(403).json({ message: "🚫 غير مصرح لك بإضافة معلم مساعد" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: "❌ الفصل غير موجود" });

    // ✅ تحقق من النطاق للمدير والمساعد (نفس الفرع والشفت)
    if (["director", "assistant_director"].includes(user.role)) {
      if (String(classroom.branch) !== String(user.branch) || classroom.shift !== user.shift) {
        return res.status(403).json({ message: "🚫 لا يمكنك التعديل على فصول خارج نطاقك" });
      }
    }

    // ✅ إذا المستخدم معلم لازم يكون هو المعلم الرئيسي للفصل
    if (user.role === "teacher" && String(classroom.teacherMain) !== String(user._id)) {
      return res.status(403).json({ message: "🚫 فقط المعلم الرئيسي يمكنه إضافة مساعد" });
    }

    // ✅ تأكد أن المساعد موجود
    const assistant = await User.findById(assistantId);
    if (!assistant || assistant.role !== "teacher") {
      return res.status(400).json({ message: "❌ المعلم المساعد غير صالح" });
    }

    // ✅ تأكد أنه مو مضاف مسبقًا
    if (classroom.teacherAssistants.includes(assistantId)) {
      return res.status(400).json({ message: "⚠️ المعلم المساعد مضاف مسبقًا" });
    }

    classroom.teacherAssistants.push(assistantId);
    await classroom.save();

    // ✅ تحديث ملف المعلم المساعد
    assistant.assistantClasses = assistant.assistantClasses || [];
    if (!assistant.assistantClasses.includes(classroomId)) {
      assistant.assistantClasses.push(classroomId);
    }
    await assistant.save();

    res.status(200).json({ message: "✅ تمت إضافة المعلم المساعد بنجاح", classroom });
  } catch (error) {
    console.error("❌ Error adding assistant:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة المعلم المساعد ❌", error: error.message });
  }
};

module.exports = { addClassroomByTeacher, addChildToClassroom, addAssistantToClassroom };