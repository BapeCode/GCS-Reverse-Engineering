const db = require("../db/config");

exports.checkBadge = async (req, res) => {
  const badgeId = req.params.badge_id;

  if (!badgeId)
    return res.status(400).json({ message: "Badge ID is required" });

  try {
    const [rows] = await db.query("SELECT * FROM badges WHERE badge_id = ?", [
      badgeId,
    ]);
    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      // Ajoutez cette condition
      res.status(404).json({ message: "Badge not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
