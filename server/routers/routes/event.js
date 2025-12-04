const express = require("express");
const eventRouter = express.Router();
const authenticate = require("../middleware/authentication.js");
const upload = require("../../scripts/upload.js");


const { createEvent, getAllEvents, getOneEvent, getOnlyEvents, getOnlyNews, updateEvent, deleteEvent} = require("../controller/event.js");

// انشاء حدث جديد
eventRouter.post(
  "/createEvent",
  authenticate,
  (req, res, next) => upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ])(req, res, (err) => {
    // لو مافي ملفات → تجاهل الخطأ وأكملي
    if (err && err.code !== "LIMIT_UNEXPECTED_FILE") {
      console.log("Multer Error Ignored:", err);
    }
    next();
  }),
  createEvent
);
// عرض كل الاحداث والاخبار
eventRouter.get("/eventsAndNews", getAllEvents);

// عرض جميع الأحداث فقط (type = event)
eventRouter.get("/events", getOnlyEvents);

// عرض جميع الأخبار فقط (type = news)
eventRouter.get("/news", getOnlyNews);

// عرض خبر او حدث واحد
eventRouter.get("/eventsAndNews/:id", getOneEvent);

// تعديل حدث حسب الـ id
eventRouter.put(
  "/eventEdit/:id",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateEvent
);

// حذف حدث حسب الـ id
eventRouter.delete("/eventDelete/:id", deleteEvent);


module.exports = eventRouter;
