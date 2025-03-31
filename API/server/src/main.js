const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const badge = require("./routes/badge.routes");
const user = require("./routes/user.routes");

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://172.20.10.2",
    ],
  })
);
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});
app.use(express.json());

app.use("/api/users", user);
app.use("/api/badges", badge);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
