const Attendance = require("../../DB/models/attendanceSchema");
const User = require("../../DB/models/userSchema");
const moment = require("moment-timezone");
const Children = require("../../DB/models/childrenSchema");


// ---------------------------------------------------------
// 🔵 EMPLOYEE CHECK-IN (يحفظ التاريخ الحقيقي بتوقيت الرياض)
// ---------------------------------------------------------
const employeeCheckIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const branchId = req.user.branch;

    const now = moment().tz("Asia/Riyadh"); // الآن الحقيقي بالسعودية
    const todayStart = now.clone().startOf("day").toDate(); // بداية اليوم (2 ديسمبر مثلاً)

    const allowedRoles = [
      "director",
      "assistant_director",
      "teacher",
      "assistant_teacher",
    ];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not allowed to check attendance",
      });
    }

    // منع تكرار التحضير
    const existing = await Attendance.findOne({
      userType: "employee",
      employee: userId,
      date: todayStart,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You already checked in today" });
    }

    const attendance = await Attendance.create({
      userType: "employee",
      employee: userId,
      branch: branchId,
      shift: req.user.shift,
      date: todayStart, // تاريخ اليوم الصحيح
      status: "present",
      checkIn: now.toDate(),
    });

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 🔵 DAILY ATTENDANCE (Admin)
// ---------------------------------------------------------
const getEmployeesAttendance = async (req, res) => {
  try {
    const { date, branch, shift } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    // 🟢 قراءة التاريخ بتوقيت الرياض فقط
    const targetDate = moment
      .tz(date, "YYYY-MM-DD", "Asia/Riyadh")
      .startOf("day");

    const today = moment().tz("Asia/Riyadh").startOf("day");

    const allowedRoles = [
      "director",
      "assistant_teacher",
      "teacher",
      "assistant_director",
    ];

    // فلتر الموظفين
    const userFilter = { role: { $in: allowedRoles } };
    if (branch) userFilter.branch = branch;
    if (shift) userFilter.shift = shift;

    const employees = await User.find(userFilter);

    // فلتر الحضور
    const dayStart = targetDate.clone().startOf("day").toDate();
    const dayEnd = targetDate.clone().endOf("day").toDate();

    const attendanceFilter = {
      userType: "employee",
      date: { $gte: dayStart, $lte: dayEnd },
    };
    if (branch) attendanceFilter.branch = branch;
    if (shift) attendanceFilter.shift = shift;

    const attendanceRecords = await Attendance.find(attendanceFilter);

    const map = {};
    attendanceRecords.forEach((r) => {
      map[r.employee.toString()] = r;
    });

    const result = employees.map((emp) => {
      const record = map[emp._id.toString()];
      const isToday = targetDate.isSame(today);

      return {
        employee: {
          _id: emp._id,
          fullName: emp.fullName,
          role: emp.role,
          branch: emp.branch,
          shift: emp.shift,
        },
        status: record ? record.status : isToday ? "no-record" : "absent",
        checkIn: record ? record.checkIn : null,
      };
    });

    res.status(200).json({
      date: targetDate.format("YYYY-MM-DD"),
      total: result.length,
      records: result,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 🔵 MONTHLY ATTENDANCE (Admin)
// ---------------------------------------------------------
const getMonthlyEmployeesAttendance = async (req, res) => {
  try {
    let { branch, shift, month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "month and year are required" });
    }

    month = Number(month);
    year = Number(year);

    const start = moment
      .tz(`${year}-${month}-01`, "YYYY-MM-DD", "Asia/Riyadh")
      .startOf("day");

    const end = start.clone().endOf("month");
    const daysInMonth = end.date();

    const today = moment().tz("Asia/Riyadh").startOf("day");

    const allowedRoles = [
      "director",
      "assistant_director",
      "teacher",
      "assistant_teacher",
    ];

    const userFilter = { role: { $in: allowedRoles } };
    if (branch) userFilter.branch = branch;
    if (shift) userFilter.shift = shift;

    const employees = await User.find(userFilter);

    const attendanceFilter = {
      userType: "employee",
      date: { $gte: start.toDate(), $lte: end.toDate() },
    };
    if (branch) attendanceFilter.branch = branch;
    if (shift) attendanceFilter.shift = shift;

    const attendances = await Attendance.find(attendanceFilter);

    const result = employees.map((emp) => {
      const monthMap = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const currentDay = moment
          .tz(`${year}-${month}-${d}`, "YYYY-MM-DD", "Asia/Riyadh")
          .startOf("day");

        if (currentDay.isSame(today)) monthMap[d] = "no-record";
        else if (currentDay.isBefore(today)) monthMap[d] = "absent";
        else monthMap[d] = "no-record";
      }

      attendances
        .filter((a) => a.employee.toString() === emp._id.toString())
        .forEach((a) => {
          const day = moment(a.date).tz("Asia/Riyadh").date();
          monthMap[day] = a.status;
        });

      return {
        employee: {
          _id: emp._id,
          fullName: emp.fullName,
          role: emp.role,
          branch: emp.branch,
          shift: emp.shift,
        },
        month: monthMap,
      };
    });

    res.status(200).json({
      month,
      year,
      daysInMonth,
      totalEmployees: result.length,
      records: result,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 🔵 DIRECTOR — DAILY ATTENDANCE
// ---------------------------------------------------------
const getDirectorDailyAttendance = async (req, res) => {
  try {
    const directorId = req.user._id;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: "date is required" });

    const director = await User.findById(directorId)
      .populate("managedTeachers")
      .populate("managedAssistants");

    if (!director)
      return res.status(404).json({ message: "Director not found" });

    const staff = [...director.managedTeachers, ...director.managedAssistants];

    const targetDate = moment
      .tz(date, "YYYY-MM-DD", "Asia/Riyadh")
      .startOf("day");

    const start = targetDate.startOf("day").toDate();
    const end = targetDate.endOf("day").toDate();
    const today = moment().tz("Asia/Riyadh").startOf("day");

    const records = await Attendance.find({
      userType: "employee",
      employee: { $in: staff.map((s) => s._id) },
      date: { $gte: start, $lte: end },
    });

    const map = {};
    records.forEach((r) => {
      map[r.employee.toString()] = r;
    });

    const result = staff.map((emp) => {
      const record = map[emp._id.toString()];
      const isToday = targetDate.isSame(today);

      return {
        employee: {
          _id: emp._id,
          fullName: emp.fullName,
          role: emp.role,
        },
        status: record ? record.status : isToday ? "no-record" : "absent",
        checkIn: record ? record.checkIn : null,
      };
    });

    res.status(200).json({
      date: targetDate.format("YYYY-MM-DD"),
      total: result.length,
      records: result,
    });
  } catch (err) {
    console.log("Director Daily Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// 🔵 DIRECTOR — MONTHLY ATTENDANCE
// ---------------------------------------------------------
const getDirectorMonthlyAttendance = async (req, res) => {
  try {
    const directorId = req.user._id;
    let { month, year } = req.query;

    if (!month || !year)
      return res.status(400).json({ message: "month & year are required" });

    month = Number(month);
    year = Number(year);

    const start = moment
      .tz(`${year}-${month}-01`, "YYYY-MM-DD", "Asia/Riyadh")
      .startOf("day");

    const end = start.clone().endOf("month");
    const daysInMonth = end.date();
    const today = moment().tz("Asia/Riyadh").startOf("day");

    const director = await User.findById(directorId)
      .populate("managedTeachers")
      .populate("managedAssistants");

    if (!director)
      return res.status(404).json({ message: "Director not found" });

    const staff = [...director.managedTeachers, ...director.managedAssistants];

    const attendances = await Attendance.find({
      userType: "employee",
      employee: { $in: staff.map((s) => s._id) },
      date: { $gte: start.toDate(), $lte: end.toDate() },
    });

    const result = staff.map((emp) => {
      const monthMap = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = moment
          .tz(`${year}-${month}-${d}`, "YYYY-MM-DD", "Asia/Riyadh")
          .startOf("day");

        if (dayDate.isSame(today)) monthMap[d] = "no-record";
        else if (dayDate.isBefore(today)) monthMap[d] = "absent";
        else monthMap[d] = "no-record";
      }

      attendances
        .filter((a) => a.employee.toString() === emp._id.toString())
        .forEach((a) => {
          const day = moment(a.date).tz("Asia/Riyadh").date();
          monthMap[day] = a.status;
        });

      return {
        employee: {
          _id: emp._id,
          fullName: emp.fullName,
          role: emp.role,
        },
        month: monthMap,
      };
    });

    res.status(200).json({
      month,
      year,
      daysInMonth,
      totalEmployees: result.length,
      records: result,
    });
  } catch (err) {
    console.log("Director Monthly Error:", err);
    res.status(500).json({ message: err.message });
  }
};


//تحضير المعلمة للطفل
const teacherCheckInChild = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { childIds } = req.body;

    if (!childIds || !Array.isArray(childIds) || childIds.length === 0) {
      return res.status(400).json({ message: "childIds array is required" });
    }

    const now = moment().tz("Asia/Riyadh");
    const todayStart = now.clone().startOf("day").toDate();

    let results = [];

    for (const childId of childIds) {
      // 🔍 1) التأكد من وجود الطفل
      const child = await Children.findById(childId);

      if (!child) {
        results.push({ childId, status: "failed", reason: "Child not found" });
        continue;
      }

      // 🔍 2) حالة الطفل لازم تكون "مؤكد"
      if (child.status !== "مؤكد") {
        results.push({ childId, status: "failed", reason: "Child not confirmed" });
        continue;
      }

      // 🔍 3) تأكد أن هذا المعلم فعلاً مسؤول عنه
      const isMainTeacher =
        child.teacherMain &&
        child.teacherMain.toString() === teacherId.toString();

      const isAssistantTeacher =
        Array.isArray(child.teacherAssistant) &&
        child.teacherAssistant.some(
          (t) => t && t.toString() === teacherId.toString()
        );

      if (!isMainTeacher && !isAssistantTeacher) {
        results.push({
          childId,
          status: "failed",
          reason: "Teacher not assigned to this child",
        });
        continue;
      }

      // 🔍 4) منع تكرار تحضير نفس الطفل في نفس اليوم
      const existing = await Attendance.findOne({
        userType: "child",
        child: childId,
        teacher: teacherId,
        date: todayStart,
      });

      if (existing) {
        results.push({
          childId,
          status: "failed",
          reason: "Already checked-in today",
        });
        continue;
      }

      // 🔵 5) إنشاء الحضور
      const attendance = await Attendance.create({
        userType: "child",
        child: childId,
        teacher: teacherId,
        branch: child.branch,
        shift: child.shift,
        date: todayStart,
        status: "present",
        checkIn: now.toDate(),
      });

      results.push({
        childId,
        status: "success",
        attendance,
      });
    }

    res.status(201).json({
      message: "Attendance processing complete",
      results,
    });

  } catch (err) {
    console.log("Teacher Child Attendance Error:", err);
    res.status(500).json({ message: err.message });
  }
};



// عرض جميع الاطفال للمعلم
const getTeacherChildrenWithAttendance = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const branchId = req.user.branch;
    let { month, year, classroomId } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "month & year are required" });
    }

    month = Number(month);
    year = Number(year);

    const start = moment
      .tz(`${year}-${month}-01`, "YYYY-MM-DD", "Asia/Riyadh")
      .startOf("day");

    const end = start.clone().endOf("month");
    const daysInMonth = end.date();
    const today = moment().tz("Asia/Riyadh").startOf("day");

    // ------------------------------- فلتر الأطفال -------------------------------
    const filter = {
      status: "مؤكد",
      branch: branchId,
      $or: [
        { teacherMain: teacherId },
        { teacherAssistant: teacherId },
      ],
    };

    if (classroomId && classroomId !== "all") {
      filter.classroom = classroomId;
    }

    const children = await Children.find(filter)
      .populate("classroom", "className")
      .populate("branch", "name");

    if (!children.length) {
      return res.status(200).json({
        message: "No children found",
        totalChildren: 0,
        records: [],
      });
    }

    // ------------------------------- جلب الحضور -------------------------------
    const attendances = await Attendance.find({
      userType: "child",
      teacher: teacherId,
      branch: branchId,
      date: { $gte: start.toDate(), $lte: end.toDate() },
    });

    // ------------------------------- بناء النتيجة -------------------------------
    const result = children.map((child) => {
      const monthMap = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = moment
          .tz(`${year}-${month}-${d}`, "YYYY-MM-DD", "Asia/Riyadh")
          .startOf("day");

        if (dayDate.isSame(today)) monthMap[d] = "no-record";
        else if (dayDate.isBefore(today)) monthMap[d] = "absent";
        else monthMap[d] = "no-record";
      }

      attendances
        .filter((a) => a.child.toString() === child._id.toString())
        .forEach((a) => {
          const day = moment(a.date).tz("Asia/Riyadh").date();
          monthMap[day] = "present";
        });

      return {
        child: {
          _id: child._id,
          name: child.childName,
          classroom: child.classroom?.className || "—",
          branch: child.branch?.name || "—",
        },
        month: monthMap,
      };
    });

    res.status(200).json({
      month,
      year,
      daysInMonth,
      totalChildren: result.length,
      records: result,
    });

  } catch (err) {
    console.log("Teacher Monthly Error:", err);
    res.status(500).json({ message: err.message });
  }
};


const getDailyChildrenWithAttendance = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const branchId = req.user.branch;
    const { classroomId } = req.query;

    const filter = {
      status: "مؤكد",
      branch: branchId,
      $or: [
        { teacherMain: teacherId },
        { teacherAssistant: teacherId },
      ],
    };

    if (classroomId && classroomId !== "all") {
      filter.classroom = classroomId;
    }

    const children = await Children.find(filter)
      .populate("classroom", "className")
      .populate("branch", "name");

    const now = moment().tz("Asia/Riyadh");
    const todayStart = now.clone().startOf("day").toDate();
    const todayEnd = now.clone().endOf("day").toDate();

    const attendanceRecords = await Attendance.find({
      userType: "child",
      teacher: teacherId,
      branch: branchId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    const map = {};
    attendanceRecords.forEach((a) => {
      map[a.child.toString()] = a;
    });

    const result = children.map((child) => ({
      child: {
        _id: child._id,
        childName: child.childName,
        classroom: child.classroom?.className || "—",
      },
      attendanceStatus: map[child._id] ? "present" : "not-checked",
    }));

    res.status(200).json({
      total: result.length,
      records: result,
    });

  } catch (err) {
    console.log("Daily Children Error:", err);
    res.status(500).json({ message: err.message });
  }
};


const getTeacherClassrooms = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const branchId = req.user.branch;

    const classrooms = await Children.find({
      status: "مؤكد",
      branch: branchId,
      $or: [
        { teacherMain: teacherId },
        { teacherAssistant: teacherId }
      ]
    })
      .populate("classroom", "className")
      .select("classroom");

    const unique = [
      ...new Map(
        classrooms
          .filter((c) => c.classroom)
          .map((c) => [c.classroom._id, c.classroom])
      ).values(),
    ];

    res.status(200).json(unique);
  } catch (err) {
    console.log("Classroom Filter Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET director child attendance (daily)
const getDirectorDailyChildAttendance = async (req, res) => {
  try {
    const director = req.user;
    const { date, teacherId } = req.query;

    if (!["director", "assistant_director"].includes(director.role)) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    if (!date) {
      return res.status(400).json({ message: "التاريخ مطلوب" });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    const isPast = selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // 1️⃣ احضار معلمات المديرة
    const mgr = await User.findById(director._id).populate("managedTeachers");
    const managedTeachers = mgr.managedTeachers.map((t) => t._id.toString());

    // 2️⃣ احضار الأطفال المؤكدين فقط
    let childQuery = {
      teacherMain: { $in: managedTeachers },
      status: "مؤكد",
    };

    if (teacherId) childQuery.teacherMain = teacherId;

    const children = await Children.find(childQuery)
      .populate("teacherMain", "fullName")
      .lean();

    // 3️⃣ احضار الحضور لليوم المحدد
    const attendance = await Attendance.find({
      userType: "child",
      date: {
        $gte: new Date(date + "T00:00:00"),
        $lte: new Date(date + "T23:59:59"),
      },
    }).lean();

    // 4️⃣ تجهيز السجلات
    const records = children.map((child) => {
      const record = attendance.find(
        (r) => r.child?.toString() === child._id.toString()
      );

      let status;
      let checkIn = record ? record.checkIn : null;

      if (record) {
        status = record.status;
      } else if (isPast) {
        status = "absent"; // يوم سابق → غياب
      } else {
        status = "no-record"; // اليوم أو المستقبل
      }

      return {
        child: { _id: child._id, name: child.childName },
        teacher: child.teacherMain?.fullName || "—",
        status,
        checkIn,
      };
    });

    res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};


// GET director child attendance (Monthly)
const getDirectorMonthlyChildAttendance = async (req, res) => {
  try {
    const director = req.user;
    const { month, year, teacherId } = req.query;

    if (!["director", "assistant_director"].includes(director.role)) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    if (!month || !year) {
      return res.status(400).json({ message: "month و year مطلوبة" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const today = new Date();

    // 1️⃣ معلمات المديرة
    const mgr = await User.findById(director._id).populate("managedTeachers");
    const managedTeachers = mgr.managedTeachers.map((t) => t._id.toString());

    // 2️⃣ الأطفال المؤكدين
    let childQuery = {
      teacherMain: { $in: managedTeachers },
      status: "مؤكد",
    };

    if (teacherId) childQuery.teacherMain = teacherId;

    const childrenList = await Children.find(childQuery)
      .populate("teacherMain", "fullName")
      .lean();

    const children = childrenList;

    // 3️⃣ احضار حضور الشهر
    const attendance = await Attendance.find({
      userType: "child",
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    const daysInMonth = new Date(year, month, 0).getDate();

    // 4️⃣ تجهيز السجلات الشهرية
    const records = children.map((child) => {
      const monthDays = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const record = attendance.find((r) => {
          if (!r.child) return false;

          const dDate = new Date(r.date);

          return (
            r.child.toString() === child._id.toString() &&
            dDate.getDate() === d
          );
        });

        if (record) {
          monthDays[d] = record.status;
        } else {
          const thisDay = new Date(year, month - 1, d);
          const isPast =
            thisDay <
            new Date(today.getFullYear(), today.getMonth(), today.getDate());

          monthDays[d] = isPast ? "absent" : "no-record";
        }
      }

      return {
        child: { _id: child._id, name: child.childName },
        teacher: child.teacherMain?.fullName || "—",
        month: monthDays,
      };
    });

    res.json({ daysInMonth, records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

module.exports = {
  getDirectorDailyChildAttendance,
  getDirectorMonthlyChildAttendance,
};



module.exports = {
  employeeCheckIn,
  getEmployeesAttendance,
  getMonthlyEmployeesAttendance,
  getDirectorDailyAttendance,
  getDirectorMonthlyAttendance,
  teacherCheckInChild,
  getTeacherChildrenWithAttendance,
  getDailyChildrenWithAttendance,
  getTeacherClassrooms,
  getDirectorDailyChildAttendance,
  getDirectorMonthlyChildAttendance,
};
