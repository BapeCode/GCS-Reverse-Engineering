const db = require("../db/config");
const bcrypt = require("bcrypt");

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
