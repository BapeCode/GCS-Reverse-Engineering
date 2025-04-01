const db = require("../db/config");
const bcrypt = require("bcrypt");
require("dotenv").config();
let pendingBadge = null;

const isWorkingHours = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 8 && hour < 17;
};

exports.pendingBadgesPost = async (request, response) => {
  const { uuid } = request.body;
  if (!uuid) return response.status(400).json({ message: "Missing UID" });

  const [rows] = await db.query("SELECT * FROM badges WHERE badge_id = ?", [
    uuid,
  ]);

  if (rows.length > 0) {
    const [badge] = await db.query("SELECT * FROM users WHERE id = ?", [
      rows[0].user_id,
    ]);

    console.log(
      "Nouvelle connection du badge utilisateur : ",
      badge[0].username
    );

    const [history] = await db.query(
      "INSERT INTO history (user_id) VALUES (?)",
      [badge[0].id]
    );

    if (!isWorkingHours() && badge[0].role !== "admin") {
      return response.status(403).json({
        message: "Les badges ne peuvent être attribués qu'entre 8h et 18h",
      });
    }

    return response.status(201).json({ message: "Connection entrée !" });
  }

  if (pendingBadge === null) {
    pendingBadge = uuid;
    console.log("🔔 Nouveau badge détecté :", uuid);
    return response.status(200).json({ message: "Badges pending !" });
  }
};

exports.pendingBadgeGet = async (request, response) => {
  if (pendingBadge) {
    const temp = pendingBadge;
    pendingBadge = null;
    return response.status(200).json({ badge: temp });
  }

  response.status(204).send();
};

getLevel = async (role) => {
  if (role === "admin") {
    return 0;
  } else {
    return 1;
  }
};

exports.addBadges = async (request, response) => {
  const { badge_id, user_id } = request.body;
  const [user] = await db.query("SELECT * FROM users WHERE id = ?", [user_id]);
  const [checkBadge] = await db.query(
    "SELECT * FROM badges WHERE user_id = ?",
    [user_id]
  );

  if (checkBadge.length <= 0) {
    const level = await getLevel(user.role);
    const [insert] = await db.query(
      "INSERT INTO badges (badge_id, user_id, level) VALUES (?, ?, ?)",
      [badge_id, user_id, level]
    );

    if (insert) {
      return response.status(200).json({ message: "done" });
    } else {
      return response.status(400).json({ message: "error" });
    }
  } else {
    return response.status(400).json({ message: "User already has a badge" });
  }
};
