const db = require("../db/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_KEY_SECRET;

exports.addUser = async (request, response) => {
  const { username, password, role } = request.body;
  const token = bcrypt.hashSync(username + password, 10);

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
    const [rows] = await db.query(
      "SELECT users.id, users.username, users.role, badges.badge_id, badges.level, badges.created_at FROM users LEFT JOIN badges ON users.id = badges.user_id"
    );
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

    console.log(rows);

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
        badge: {
          badge_id: badge[0] ? badge[0].badge_id : null,
          level: badge[0] ? badge[0].level : null,
        },
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
        badge: {
          badge_id: badge[0] ? badge[0].badge_id : null,
          level: badge[0] ? badge[0].level : null,
        },
      },
    });
  } catch (err) {
    console.error("❌ Erreur SQL :", err); // Ajout pour debug
    if (err.code === "ER_NO_SUCH_TABLE") {
      return response.status(404).json({ message: "User not found !" });
    }
  }
};

exports.getAllRoles = async (request, response) => {
  try {
    const [rows] = await db.query("SELECT *FROM roles");
    const [permissions] = await db.query("SELECT * FROM permissions");
    const data = rows.map((role) => {
      return {
        role_name: role.role_name,
        role_label: role.role_label,
        permissions: permissions
          .filter((permission) => permission.role === role.role_name)
          .map((permission) => permission.permission),
      };
    });

    if (rows.length > 0) {
      return response.status(200).json(data);
    }
  } catch (err) {
    console.error("❌ Erreur SQL :", err); // Ajout pour debug
    if (err.code === "ER_NO_SUCH_TABLE") {
      return response.status(404).json({ message: "User not found !" });
    }
  }
};

exports.updateUser = async (request, response) => {
  const { id, username, password, role } = request.body;
  const password_hashed = await bcrypt.hash(password, 10);
  const token = bcrypt.hashSync(username + password, 10);

  try {
    const [rows] = await db.query(
      "UPDATE users SET username = ?, password = ?, role = ?, token = ? WHERE id = ?",
      [username, password_hashed, role, token, id]
    );

    if (rows.affectedRows === 0) {
      return response.status(404).json({ message: "User not found !" });
    }
    return response.status(200).json({ message: "User updated !", id });
  } catch (err) {
    console.error("❌ Erreur SQL :", err); // Ajout pour debug
    if (err.code === "ER_NO_SUCH_TABLE") {
      return response.status(404).json({ message: "User not found !" });
    }
  }
};

exports.getHistory = async (request, response) => {
  const { id } = request.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM history WHERE user_id = ? ORDER BY date DESC",
      [id]
    );

    console.log(rows);
    return response.status(200).json(rows);
  } catch (err) {
    console.error("❌ Erreur SQL :", err); // Ajout pour debug
    if (err.code === "ER_NO_SUCH_TABLE") {
      return response.status(404).json({ message: "User not found !" });
    }
  }
};
