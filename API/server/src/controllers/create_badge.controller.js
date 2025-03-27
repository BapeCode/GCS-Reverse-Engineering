const db = require("../db/config");

exports.createBadge = async (req, res) => {
  const { userId, badgeId, level } = req.query;

  console.log(userId, badgeId, level);

  if (
    !userId ||
    !badgeId ||
    !level ||
    isNaN(userId) ||
    isNaN(badgeId) ||
    isNaN(level)
  )
    return res.status(400).json({
      message:
        "UsersId,badgeId and level are required and must be right numbers",
    });

  try {
    const [result] = await db.query(
      "INSERT INTO badges (user_id, badge_id, level) VALUES (?, ?, ?)",
      [userId, badgeId, level]
    );
    res.status(201).json({ message: "Badge created", id: result.insertId });
  } catch (err) {
    console.error("Erreur SQL:", err);
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res
        .status(400)
        .json({ error: "L'utilisateur spécifié n'existe pas" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};
