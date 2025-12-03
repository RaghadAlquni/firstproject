const express = require("express");
const classroomRouter = express.Router();

const authenticate = require("../middleware/authentication.js");
const authorize = require("../middleware/authorization.js");

const { addClassroomByTeacher, addChildToClassroom, addAssistantToClassroom, moveChildToAnotherClassroom } = require("../controller/classroom.js");

// 🏫 المعلم ينشئ فصل جديد
classroomRouter.post("/addClassroom", authenticate, authorize(["teacher"]), addClassroomByTeacher);
classroomRouter.post("/addChildCalssroom", authenticate, authorize(["teacher"]), addChildToClassroom);
classroomRouter.post("/assistantClassroom", authenticate, authorize(["teacher", ""]), addAssistantToClassroom);

classroomRouter.put("/classroom/moveChild", authenticate, authorize(["director", "assistant_director", "teacher"]), moveChildToAnotherClassroom);

module.exports = classroomRouter;
