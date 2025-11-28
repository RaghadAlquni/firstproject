// subscriptionMonitor.js
const cron = require("node-cron");
const axios = require("axios");
const Children = require("../DB/models/childrenSchema");
const Subscription = require("../DB/models/subscriptionSchema");

// 🟡 بيانات API واتساب (من env)
const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_ID;

// ------------------------------------------------------------------
// 🔔 دالة إرسال واتساب — داخل نفس الملف 💛
// ------------------------------------------------------------------
async function sendWhatsAppMessage(recipient, message) {
  try {
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

    const data = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body: message }
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`📩 تم إرسال واتساب إلى: ${recipient}`);
    return response.data;

  } catch (err) {
    console.error("❌ خطأ في إرسال الواتساب:", err.response?.data || err.message);
  }
}

// ------------------------------------------------------------------
// ⏳ كرون — فحص الاشتراكات يومياً الساعة 2 صباحاً
// ------------------------------------------------------------------
cron.schedule("0 3 * * *", async () => {
  try {
    console.log("⏳ بدء فحص الاشتراكات المنتهية...");

    const today = new Date();

    const children = await Children.find({
      status: "مؤكد",
      subscriptionEnd: { $lt: today }
    }).populate("subscription");

    if (children.length === 0) {
      console.log("📭 لا يوجد اشتراكات منتهية اليوم");
      return;
    }

    for (const child of children) {
      // تغيير الحالة
      child.status = "غير مفعل";
      await child.save();

      // رسالة واتساب
      const msg = `
نود إبلاغكم بأن اشتراك طفلكم في واحة المعرفة قد انتهى اليوم.
يسعدنا استمراركم معنا، ويمكنكم تجديد الاشتراك عبر التواصل معنا أو زيارة المركز.
شاكرين لكم ثقتكم الدائمة بنا 💛✨
      `;

      // أرقام أولياء الأمور
      const phones = child.guardian.map((g) => g.phoneNumber);

      for (const phone of phones) {
        await sendWhatsAppMessage(phone, msg);
      }

      console.log(`⚠️ انتهى اشتراك الطفل: ${child.childName}`);
    }

  } catch (err) {
    console.error("❌ Cron Error:", err);
  }
});

console.log("✅ subscriptionMonitor يعمل الآن...");
