const Expense = require("../../DB/models/ExpenseSchema.js");
const Payment = require("../../DB/models/paymentSchema.js");


//   إحصائيات مالية عامة
const getFinanceStats = async (req, res) => {
  try {

    const totalPayments = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const payments = totalPayments[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;

    const net = payments - expenses;

    res.json({
      success: true,
      payments,
      expenses,
      net,
    });

  } catch (err) {
    res.status(500).json({
      message: "خطأ أثناء حساب الإحصائيات",
      error: err.message,
    });
  }
};


// addExpense اضافه مصروفات 
const addExpense = async (req, res) => {
  try {
    const user = req.user;
    const { amount, category, description, branch, shift, date } = req.body;

    if (!amount || !branch || !shift) {
      return res
        .status(400)
        .json({ message: "المبلغ، الفرع، الفترة مطلوبة" });
    }

    const expense = await Expense.create({
      amount,
      category: category || "أخرى",
      description,
      branch,
      shift,
      date: date ? new Date(date) : Date.now(),
      createdBy: user._id,
    });

    res.status(201).json({
      message: "✅ تم تسجيل المصروف بنجاح",
      expense,
    });
  } catch (error) {
    console.error("addExpense error:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء إضافة المصروف ❌",
      error: error.message,
    });
  }
};

module.exports = { getFinanceStats, addExpense }