const express = require("express");
require('dotenv').config();
const cors = require("cors");
const morgan = require('morgan') 
require("./DB/db.js");
const axios = require("axios");


const app = express();
// احنا نحتاج نسوي ميدل وير يحول لنا الجيسون الى كائن جافاسكربت
app.use(express.json())

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
// Morgan: middleware for logging HTTP requests (method, URL, status, response time)
app.use(morgan('dev'))
app.use(cors());

app.post("/send-whatsapp", async (req, res) => {
  try {
    const { recipient, message } = req.body;

    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
    const data = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body: message },
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// route for morgan test
app.get('/', (req, res) => {
  res.send('Hello Morgan!');
})


const childRoutes = require("./routers/routes/children.js");
app.use(childRoutes);

const authRoutes = require("./routers/routes/auth.js")
app.use(authRoutes)

const userRouter = require("./routers/routes/user.js")
app.use(userRouter)

const branchRouter = require("./routers/routes/branch.js")
app.use(branchRouter)


const eventRouter = require("./routers/routes/event.js")
app.use(eventRouter)

const dashboardStateRouter = require("./routers/routes/dashboardState.js")
app.use(dashboardStateRouter)

const PORT = process.env.PORT || 5000 ;
app.listen(PORT, () => {
  console.log(`server run on ${PORT}`);
});