const express = require("express");
const router = express.Router();
const badgeController = require("../controllers/badges.controller");

router.post("/pending", badgeController.pendingBadgesPost);
router.get("/pending", badgeController.pendingBagesGet);

module.exports = router;
