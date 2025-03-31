const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/", userController.addUser);
router.get("/", userController.getUsers);
router.delete("/:id", userController.deleteUser);
router.post("/login", userController.loginUser);
router.get("/roles", userController.getAllRoles);
router.put("/", userController.updateUser);

module.exports = router;
