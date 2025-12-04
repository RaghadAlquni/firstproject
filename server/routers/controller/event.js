const Event = require("../../DB/models/EventSchema.js");

// إنشاء حدث جديد
const createEvent = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    const { title, type, visibility, description, date, coverImage, images } = req.body;

    if (!title || !type || !description || !date) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    let finalCoverImage = null;

    if (req.files?.coverImage?.[0]) {
      finalCoverImage = "/uploads/events/" + req.files.coverImage[0].filename;
    } else if (coverImage) {
      finalCoverImage = coverImage;
    }

    let finalImages = [];

    if (req.files?.images) {
      finalImages = req.files.images.map((i) => "/uploads/events/" + i.filename);
    } else if (images) {
      finalImages = Array.isArray(images) ? images : [images];
    }

    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);

    const newEvent = new Event({
      title,
      type,
      visibility,
      description,
      date,
      createdBy: user._id,
      coverImage: finalCoverImage,
      images: finalImages,
    });

    await newEvent.save();

    res.status(201).json({
      message: "تم إضافة الحدث بنجاح",
      event: newEvent,
    });

  } catch (error) {
    console.error("Add Event Error:", error);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};



// عرض جميع الأحداث
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: "createdBy",
        select: "fullName role"
      })
      .sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في السيرفر" });
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

    // البيانات من الـ body
    const { title, type, visibility, description, date, coverImage, images } =
      req.body;

    // جلب الحدث القديم أولاً
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: "الحدث غير موجود ❌" });
    }

    // =============== معالجة الكوفر ====================
    let finalCoverImage = existingEvent.coverImage; // الافتراضي: الصورة القديمة

    // إذا المستخدم رفع صورة جديدة عبر Multer
    if (req.files?.coverImage?.[0]) {
      finalCoverImage = "/uploads/events/" + req.files.coverImage[0].filename;
    }
    // لو أرسل رابط للصورة
    else if (coverImage) {
      finalCoverImage = coverImage;
    }

    // =============== معالجة الصور الإضافية ==================
    let finalImages = existingEvent.images; // الافتراضي: الصور القديمة

    // إذا رفع صور جديدة
    if (req.files?.images) {
      finalImages = req.files.images.map(
        (i) => "/uploads/events/" + i.filename
      );
    }
    // لو أرسل روابط جديدة من JSON
    else if (images) {
      finalImages = Array.isArray(images) ? images : [images];
    }

    // =============== تنفيذ التحديث ==================
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title: title ?? existingEvent.title,
        type: type ?? existingEvent.type,
        visibility: visibility ?? existingEvent.visibility,
        description: description ?? existingEvent.description,
        date: date ?? existingEvent.date,
        coverImage: finalCoverImage,
        images: finalImages,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "تم تعديل الحدث بنجاح ✏️",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل الحدث ⚠️" });
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