const express = require("express");
const app = express();

app.use(express.json());

app.use("/", (req, resp) => {
  resp.send("Hello World");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
