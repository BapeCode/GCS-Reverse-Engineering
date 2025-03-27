const express = require("express");
const router = express.Router();
const badgeController = require("../controllers/create_badge.controller");

router.post("/", badgeController.createBadge);

module.exports = router;
