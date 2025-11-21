const express = require("express")
const childRouter = express.Router()

const authenticate = require("../middleware/authentication.js");
const authorize = require("../middleware/authorization.js");


const {
  addChild,
  addChildParent,
  confirmChild,
  updateChild,
  deleteChild,
  expireSubscriptions,
  getChildren,
  markAllInactive,
  getOneChild} = require("../controller/children.js")

  
// ✅ إضافة طفل جديد
// parent = add pending
// admin/director/assistant = add confirmed
childRouter.post("/children/add", authenticate, authorize(["parent", "admin", "director", "assistant_director"]), addChild)

// ✅ إضافة طفل جديد
// parent = add pending
childRouter.post("/children/publicAdd" , addChildParent)

// ✅ تأكيد طفل بعد إضافته (من الإدارة فقط)
childRouter.put( "/children/confirm/:id", authenticate, authorize(["admin", "director", "assistant_director"]), confirmChild);

// ✅ جلب طفل واحد فقط
childRouter.get("/children/:id", authenticate, authorize(["admin", "director", "assistant_director"]), getOneChild);

// ✅ تحديث بيانات طفل
childRouter.put("/children/update/:id", authenticate, authorize(["admin", "director", "assistant_director"]), updateChild);

// ✅ تعطيل الأطفال بانتهاء الاشتراك (من الإدارة)
childRouter.put("/children/expire", authenticate,authorize(["admin", "director", "assistant_director"]),expireSubscriptions);
// ✅ جعل كل الأطفال غير مفعلين (أدمن فقط)
childRouter.put("/children/inactive/all", authenticate,authorize(["admin"]),markAllInactive);

// ✅ جلب جميع الأطفال
childRouter.get("/children", authenticate ,authorize(["admin", "director", "assistant_director"]),getChildren);

// ✅ حذف طفل (من الإدارة فقط)
childRouter.delete("/children/delete/:id", authenticate, authorize(["admin", "director", "assistant_director"]), deleteChild);



module.exports = childRouter;