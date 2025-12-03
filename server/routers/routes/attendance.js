const express = require("express");
const { employeeCheckIn, getEmployeesAttendance, getMonthlyEmployeesAttendance, getDirectorDailyAttendance, getDirectorMonthlyAttendance, teacherCheckInChild, getTeacherChildrenWithAttendance, getDailyChildrenWithAttendance, getTeacherClassrooms, getDirectorDailyChildAttendance, getDirectorMonthlyChildAttendance } = require("../controller/attendance")
const authenticate = require("../middleware/authentication.js");
const authorize = require("../middleware/authorization.js");

const attendanceRouter = express.Router()

attendanceRouter.post("/employee/check-in", authenticate, employeeCheckIn);
attendanceRouter.get("/employeesAttendance", authenticate, getEmployeesAttendance);
attendanceRouter.get("/MunthlyEmployeesAttendance", authenticate, getMonthlyEmployeesAttendance);
attendanceRouter.get("/director/attendance/daily", authenticate, getDirectorDailyAttendance);
attendanceRouter.get("/director/attendance/monthly", authenticate, getDirectorMonthlyAttendance);

//  child Check-in
attendanceRouter.post("/childCheckIn", authenticate, teacherCheckInChild);
//جلب التحضير الشهري للاطفال 
attendanceRouter.get("/teacherChildrenAttendance", authenticate, getTeacherChildrenWithAttendance);
//جلب التحضير اليومي للاطفال
attendanceRouter.get("/dailyChildrenAttendance", authenticate, getDailyChildrenWithAttendance);

attendanceRouter.get("/teacherClassrooms", authenticate, getTeacherClassrooms);

attendanceRouter.get("/director/children-attendance/daily", authenticate, getDirectorDailyChildAttendance);

//  حضور الأطفال الشهري للمديرة
attendanceRouter.get("/director/children-attendance/monthly", authenticate, getDirectorMonthlyChildAttendance);

module.exports = attendanceRouter;