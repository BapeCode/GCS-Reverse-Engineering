const db = require("../db/config");
const bcrypt = require("bcrypt");
require("dotenv").config();
let pendingBadge = null;

exports.pendingBadgesPost = async (request, response) => {
  const { uuid } = request.body;
  if (!uuid) return response.status(400).json({ message: "Missing UID" });

  if (pendingBadge === null) {
    pendingBadge = uuid;
    console.log("🔔 Nouveau badge à attribuer :", uuid);
    return response.status(200).json({ message: "Badges pending !" });
  }
};

exports.pendingBagesGet = async (request, response) => {
  if (pendingBadge) {
    const temp = pendingBadge;
    pendingBadge = null;
    return response.status(200).json({ badge: temp });
  }

  response.status(204).send();
};
