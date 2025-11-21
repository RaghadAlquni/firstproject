const Event = require("../../DB/models/EventSchema.js");

// إنشاء حدث جديد
// إنشاء حدث جديد
const createEvent = async (req, res) => {
  try {
    const { title, coverImage, date, description, gallery, type } = req.body;

    // التحقق من الحقول الأساسية
    if (!title || !coverImage || !description || !type) {
      return res
        .status(400)
        .json({ message: "الرجاء تعبئة جميع الحقول المطلوبة" });
    }

    // إنشاء الحدث
    const newEvent = new Event({
      title,
      coverImage,
      description,
      type,
      gallery: gallery || [],
      date: date ? new Date(date) : Date.now(),
    });

    await newEvent.save();

    res.status(201).json({
      message: "تم إضافة الحدث بنجاح 🎉",
      event: newEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة الحدث" });
  }
};


// عرض جميع الأحداث
const getAllEvents = async (req, res) => {
  try {
    // نجيب كل الأحداث مرتبة حسب الأحدث أولًا
    const events = await Event.find().sort({ date: -1 });

    res.status(200).json({
      message: "تم جلب جميع الأحداث بنجاح ✅",
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الأحداث" });
  }
};


// عرض حدث واحد حسب الـ id
const getOneEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "الحدث غير موجود ❌" });
    }

    res.status(200).json({
      message: "تم جلب تفاصيل الحدث بنجاح ✅",
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب تفاصيل الحدث" });
  }
};

// عرض جميع الأحداث فقط (type = event)
const getOnlyEvents = async (req, res) => {
  try {
    const events = await Event.find({ type: "event" }).sort({ date: -1 });

    res.status(200).json({
      message: "تم جلب جميع الفعاليات بنجاح ✅",
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الفعاليات" });
  }
};

// عرض جميع الأخبار فقط (type = news)
const getOnlyNews = async (req, res) => {
  try {
    const news = await Event.find({ type: "news" }).sort({ date: -1 });

    res.status(200).json({
      message: "تم جلب جميع الأخبار بنجاح ✅",
      count: news.length,
      news,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الأخبار" });
  }
};

// تعديل حدث حسب الـ id
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // نأخذ فقط القيم اللي جات من المستخدم

    const updatedEvent = await Event.findByIdAndUpdate(id, updates, {
      new: true, // يرجّع الحدث بعد التعديل
      runValidators: true, // يتأكد من القيم حسب السكيما
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "الحدث غير موجود ❌" });
    }

    res.status(200).json({
      message: "تم تعديل الحدث بنجاح ✏️",
      updatedEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل الحدث" });
  }
};


// حذف حدث حسب الـ id
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "الحدث غير موجود ❌" });
    }

    res.status(200).json({
      message: "تم حذف الحدث بنجاح 🗑️",
      deletedEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء حذف الحدث" });
  }
};

module.exports = { createEvent, getAllEvents, getOneEvent, getOnlyEvents, getOnlyNews, updateEvent, deleteEvent };