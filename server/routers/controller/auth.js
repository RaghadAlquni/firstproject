const User = require("../../DB/models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Login with Email + Password
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // تحقق من وجود البيانات
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // البحث عن المستخدم حسب البريد الإلكتروني
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // مقارنة كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // إنشاء التوكن
    const token = jwt.sign(
      {
        _id: user._id,
        fullName: user.fullName,
        role: user.role,
        shift: user.shift,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

module.exports = { loginUser };