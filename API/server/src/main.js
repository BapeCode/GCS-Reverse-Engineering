const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const badge = require("./routes/badge.routes");
const user = require("./routes/user.routes");

// Configuration CORS plus permissive pour le développement
app.use(
  cors({
    origin: "*",
  })
);

// Route de test
app.get("/test", (req, res) => {
  res.json({ message: "Test OK", ip: req.ip });
});

app.use((req, res, next) => {
  console.log("\n🔵 Nouvelle requête :");
  console.log(`   -📝 ${req.method} ${req.url}`);
  console.log(`   -📍 IP du client : ${req.ip}`);
  next();
});
app.use(express.json());

// Configuration des routes
app.use("/api/users", user);
app.use("/api/badges", badge);

// Configuration de la route racine
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Afficher toutes les interfaces réseau disponibles
const networkInterfaces = require("os").networkInterfaces();
console.log("\n📡 Interfaces réseau disponibles :");
Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((interface) => {
    if (interface.family === "IPv4" && !interface.internal) {
      console.log(`   ${interfaceName}: ${interface.address}`);
    }
  });
});

app.listen(PORT, HOST, () => {
  console.log(`\n✅ Server running on http://${HOST}:${PORT}`);
  console.log(`🌐 Accessible via :`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === "IPv4" && !interface.internal) {
        console.log(`   - http://${interface.address}:${PORT}`);
      }
    });
  });
});
