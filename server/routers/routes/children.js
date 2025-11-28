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
  getConfirmedChildren,
  markAllInactive,
  getOneChild, renewSubscription, getWaitingChildren, confirmManyChildren, deleteManyChildren} = require("../controller/children.js")

  
// ✅ إضافة طفل جديد
// parent = add pending
// admin/director/assistant = add confirmed
childRouter.post("/children/add", authenticate, authorize(["parent", "admin", "director", "assistant_director"]), addChild)
// تجديد الاشتراك 
childRouter.post("/renewSubscription", authenticate, renewSubscription)

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
// ✅ جلب جميع الأطفال المؤكدين
childRouter.get("/confirmedChildren", authenticate ,  authorize(["admin", "director", "assistant_director", "teacher", "assistant_teacher"]), getConfirmedChildren);
// ✅ جلب جميع الأطفال المضافين
childRouter.get("/waitingChildren", authenticate ,  authorize(["admin", "director", "assistant_director", "teacher", "assistant_teacher"]), getWaitingChildren);

// ✅ حذف اكثر من طفل بعد إضافته (من الإدارة فقط)
childRouter.delete("/children/delete/:id", authenticate, authorize(["admin", "director", "assistant_director"]), deleteChild);

// ✅ تأكيد اكثر من طفل بعد إضافته (من الإدارة فقط)
childRouter.put("/confirmMany", authenticate, confirmManyChildren);

// ✅ حذف طفل (من الإدارة فقط)
childRouter.delete("/deleteMany", authenticate, authorize(["admin", "director", "assistant_director"]), deleteManyChildren);


module.exports = childRouter;