const db = require("../db/config");
const router = require("express").Router();
const badgeController = require("../controllers/check_badge.controller");

router.get("/:badge_id", badgeController.checkBadge);

module.exports = router;
