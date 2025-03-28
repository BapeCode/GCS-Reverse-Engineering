const db = require("../db/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_KEY_SECRET;

exports.addUser = async (request, response) => {
  const { username, password, role, token } = request.body;
  console.log(username, password, role, token);
  let password_hashed;
  if (password) {
    password_hashed = await bcrypt.hash(password, 10);
  } else {
    return response.status(400).json({ message: "Password is required !" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO `users` (username, password, role, token) VALUES (?, ?, ?, ?)",
      [username, password_hashed, role, token]
    );

    return response
      .status(201)
      .json({ message: "User added !", id: result.insertId });
  } catch (err) {
    console.error("❌ Erreur SQL :", err); // Ajout pour debug
    if (err.code === "ER_DUP_ENTRY") {
      return response.status(400).json({ message: "User already exists !" });
    } else {
      return response.status(500).json({ message: "Erreur interne !" });
    }
  }
};

exports.getUsers = async (request, response) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    return response.status(200).json(rows);
  } catch (err) {
    response.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteUser = async (request, response) => {
  const { id } = request.body;

  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return response.status(200).json({ message: "User deleted !", id });
  } catch (err) {
    console.error("❌ Erreur SQL :", err); // Ajout pour debug
    if (err.code === "ER_NO_SUCH_TABLE") {
      return response.status(404).json({ message: "User not found !" });
    } else {
      return response.status(500).json({ message: "Erreur interne !" });
    }
  }
};

exports.loginUser = async (request, response) => {
  const { username, password } = request.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!user || !isMatch) {
      return response.status(404).json({ message: "User not found !" });
    }

    const [badge] = await db.query("SELECT * FROM badges WHERE user_id = ?", [
      user.id,
    ]);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        badge: badge,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return response.status(200).json({
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        badge: badge,
      },
    });
  } catch (err) {
    console.error("❌ Erreur SQL :", err); // Ajout pour debug
    if (err.code === "ER_NO_SUCH_TABLE") {
      return response.status(404).json({ message: "User not found !" });
    }
  }
};
