const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const checkBadge = require("./routes/check_badge.routes");
const createBadge = require("./routes/create_badge.routes");
const user = require("./routes/user.routes");

app.use(cors({ origin: "http://localhost:5500" }));
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use("/api/check_badge", checkBadge);
app.use("/api/create_badge", createBadge);

app.use("/api/users", user);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
