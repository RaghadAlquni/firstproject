const express = require("express");
const classroomRouter = express.Router();

const authenticate = require("../middleware/authentication.js");
const authorize = require("../middleware/authorization.js");

const { addClassroomByTeacher, addChildToClassroom, addAssistantToClassroom } = require("../controller/classroom.js");

// 🏫 المعلم ينشئ فصل جديد
classroomRouter.post("/addClassroom", authenticate, authorize(["teacher"]), addClassroomByTeacher);
classroomRouter.post("/addChildCalssroom", authenticate, authorize(["teacher"]), addChildToClassroom);
classroomRouter.post("/assistantClassroom", authenticate, authorize(["teacher", ""]), addAssistantToClassroom);

module.exports = classroomRouter;
