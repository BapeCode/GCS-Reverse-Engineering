let Users = [];
const addUserButton = document.getElementById("add_user");
const loginButton = document.getElementById("login-user");
const logoutButton = document.getElementById("logout-user");
const avatarButton = document.getElementById("avatar-user");
const searchInput = document.getElementById("search");
const userList = document.getElementById("userList");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalHeader = document.getElementById("modal-header");

const GetUsers = async () => {
  const response = await fetch("http://localhost:3000/api/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status} : ${errorText}`);
  }

  const result = await response.json();
  console.log("✅ Utilisateur chargé :", result);
  Users = result;
  RendersUsers(Users);
};

const HandleFormSubmit = async () => {
  const form = document.getElementById("add_user_form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const data = { username, password, role };

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erreur ${response.status} : ${errText}`);
      }

      const resp = await response.json();
      console.log("✅ Utilisateur ajouté :", resp);
      modal.style.display = "none";
      form.reset();
      return GetUsers();
    } catch (err) {
      console.error("❌ Erreur lors du submit :", err);
    }
  });
};

const HandleFormUpdateUser = async () => {
  const form = document.getElementById("update-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const id = e.target.dataset.id;
    const data = { id, username, password, role };

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 200) {
        modalBody.innerHTML = "";
        modalHeader.innerHTML = "";
        modal.style.display = "none";
        GetUsers();
        return console.log("✅ User updated");
      }
    } catch (err) {
      return console.error("❌ Erreur lors du submit :", err);
    }
  });
};

const HandleDeleteUser = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: userId }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur ${response.status} : ${errText}`);
  }

  const resp = await response.json();
  console.log("✅ Utilisateur supprimé :", resp);
  GetUsers();
};

const HandleLoginUser = async () => {
  const formLogin = document.getElementById("login-form");
  const viewPassword = document.getElementById("view-password");

  viewPassword.addEventListener("change", (e) => {
    const password = document.getElementById("password");
    if (e.target.checked) {
      password.type = "text";
    } else {
      password.type = "password";
    }
  });

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const data = { username, password };

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST", // ✅
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      isLoggedIn();
      modalHeader.innerHTML = "";
      modalBody.innerHTML = "";
      modal.style.display = "none";
      return console.log("✅ Utilisateur connecté :", result);
    } catch (err) {
      return console.error("❌ Erreur lors du submit :", err.message);
    }
  });
};

const getAllRoles = async () => {
  const response = await fetch("http://localhost:3000/api/users/roles", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status} : ${errorText}`);
  }
  const result = await response.json();
  console.log("✅ Rôles chargés :", result);
  return result || [];
};

async function RendersUsers(users) {
  const roles = await getAllRoles();
  userList.innerHTML = users
    .map((user) => {
      const role = roles.find((role) => role.role_name === user.role);
      return `
    
      <div class="user-card" data-id="${user.id}">
        <div class="user-card-left">
            <span>${user.username}</span>
            <span>${role.role_label}</span>
        </div>
    
        <div class="user-card-right">
          <button id="link-badge" data-id="${user.id}">
              <i data-id="${user.id}" class="fa-solid fa-link"></i>
          </button>

          <button id="update-user" data-id="${user.id}">
            <i data-id="${user.id}" class="fa-solid fa-pen"></i>
          </button>

          <button id="history-user" data-id="${user.id}">
            <i data-id="${user.id}" class="fa-solid fa-history"></i>
          </button>

          <button id="delete-user" data-id="${user.id}">
            <i data-id="${user.id}" class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    })
    .join("");
  ManageUsers();
}

async function OpenModal(type, user = null) {
  if (type === "add_user") {
    const roles = await getAllRoles();
    modalHeader.innerHTML = `
      <h2>Ajouter un utilisateur</h2>
      <div id="closeModal">
        <i class="fa-solid fa-xmark"></i>
      </div>
    `;

    modalBody.innerHTML = `
      <form id="add_user_form">
        <label for="username">Nom d'utilisateur</label>
        <input
          id="username"
          required="true"
          autocomplete="off"
          type="text"
          placeholder="Nom d'utilisateur"
        />
        <label for="password">Mot de passe</label>
        <input
          id="password"
          required="true"
          autocomplete="off"
          type="password"
          placeholder="Mot de passe"
        />

        <label for="username">Rôles</label>
        <select id="role" required="true">
          <option disabled selected>Choisir un rôle</option>
          ${roles.map((role) => {
            return `<option value="${role.role_name}">${role.role_label}</option>`;
          })}

        </select>

        <div class="modal-submit">
          <button id="button_add_user_cancel" type="reset">Annuler</button>
          <button id="button_add_user_submit" type="submit">Ajouter</button>
        </div>
      </form>
    `;

    modal.style.display = "flex";

    HandleFormSubmit();
  } else if (type === "update_user") {
    const roles = await getAllRoles();

    modalHeader.innerHTML = `
      <h2>Modifier la fiche de '${user.username}'</h2>
      <div id="closeModal">
        <i class="fa-solid fa-xmark"></i>
      </div>
    `;

    modalBody.innerHTML = `
      <form data-id="${user.id}" id="update-form">
        <label for="username">Nom d'utilisateur</label>
        <input
          id="username"
          required="false"
          autocomplete="off"
          type="text"
          placeholder="Nom d'utilisateur"
          value="${user.username}"
        />
        <label for="password">Mot de passe</label>
        <input
          id="password"
          required="false"
          autocomplete="off"
          type="password"
          placeholder="Mot de passe"
        />

        <label for="username">Rôles</label>
        <select id="role" required="false">
          <option disabled selected value="${user.role}">${
      roles.find((role) => role.role_name === user.role).role_label
    }</option>
          ${roles.map((role) => {
            if (role.role_name !== user.role) {
              return `<option value="${role.role_name}">${role.role_label}</option>`;
            }
          })}
        </select>

        <div class="modal-submit">
          <button id="button_update_cancel" type="reset">Annuler</button>
          <button id="button_update_submit" type="submit">Mettre à jour</button>
        </div>
      </form>
    `;

    modal.style.display = "flex";
    HandleFormUpdateUser();
  } else if (type === "login") {
    modalHeader.innerHTML = `
      <h2>Connexion à WaveGuardian</h2>
      <div id="closeModal">
        <i class="fa-solid fa-xmark"></i>
      </div>
    `;

    modalBody.innerHTML = `
        <form id="login-form">
          <label for="username">Nom d'utilisateur</label>
          <input
            id="username"
            required="true"
            autocomplete="off"
            type="text"
            placeholder="Nom d'utilisateur"
          />
          <label for="password">Mot de passe</label>
          <input
            id="password"
            required="true"
            autocomplete="off"
            type="password"
            placeholder="Mot de passe"
          />

          <div>
            <input type="checkbox" id="view-password" />
            <label for="view-password">Voir le mot de passe</label>
          </div>


          <div class="modal-submit">
            <button id="button_login_cancel" type="reset">Annuler</button>
            <button id="button_login_submit" type="submit">Connexion</button>
            </div>
        </form>
    `;

    modal.style.display = "flex";
    HandleLoginUser();
  } else if (type === "avatar-user") {
    const roles = await getAllRoles();
    const role = roles.find((role) => role.role_name === user.role);
    modalHeader.innerHTML = `
        <h2>Profil de l'utilisateur '${user.username}'</h2>
        <div id="closeModal">
          <i class="fa-solid fa-xmark"></i>
        </div>
    `;

    modalBody.innerHTML = `
        <div class="user-info">
            <p><strong>Rôle :</strong> ${role.role_label}</p>
            <p><strong>Badges :</strong> ${
              user.badge.level ? user.badge.level : "Aucun badge attribué"
            }</p>
            <p><strong>Dernières activité :</strong> ${
              user.badge.update_at ? user.badge.update_at : "Aucune activité"
            }</p>
            
            <div class="modal-submit" style="justify-content: center;">
                <button id="delete-user">
                    <i class="fa-solid fa-trash"></i> Supprimer le compte
                </button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
  }
  CloseModal();
}

function ManageUsers() {
  const linkBadge = document.querySelectorAll("#link-badge");
  const deleteUser = document.querySelectorAll("#delete-user");
  const historyUser = document.querySelectorAll("#history-user");
  const updateUser = document.querySelectorAll("#update-user");

  deleteUser.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const userId = e.target.dataset.id;
      HandleDeleteUser(userId);
    });
  });

  updateUser.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const userId = e.target.dataset.id;
      let userSelected = Users.find(
        (user) => user.id === Number(e.target.dataset.id)
      );
      OpenModal("update_user", userSelected);
    });
  });

  linkBadge.forEach((link) => {
    link.addEventListener("click", async (e) => {
      let userSelected = Users.find(
        (user) => user.id === Number(e.target.dataset.id)
      );
      // OpenModal("link_badge", userSelected);
    });
  });

  historyUser.forEach((button) => {
    button.addEventListener("click", async (e) => {
      console.log("History user", e.target.dataset.id);
    });
  });
}

function updateUIForAuth(isAuthenticated) {
  if (isAuthenticated) {
    addUserButton.style.display = "flex";
    logoutButton.style.display = "flex";
    loginButton.style.display = "none";
    avatarButton.style.display = "flex";
  } else {
    addUserButton.style.display = "none";
    logoutButton.style.display = "none";
    loginButton.style.display = "flex";
    avatarButton.style.display = "none";
  }
}

function isLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) {
    updateUIForAuth(false);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    const valid = payload.exp > now;
    updateUIForAuth(valid);
    return valid;
  } catch (err) {
    updateUIForAuth(false);
    return false;
  }
}

function CloseModal() {
  const closeModal = document.getElementById("closeModal");
  closeModal.addEventListener("click", () => {
    modalBody.innerHTML = "";
    modalHeader.innerHTML = "";
    modal.style.display = "none";
  });
}

function PendingBadge() {
  setInterval(async () => {
    const response = await fetch("http://localhost:3000/api/badges/pending", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const result = await response.json();
      const link = document.getElementById("link-badge");
      link.style.color = "green";
      console.log("✅ Badge en attente !" + result.badge);
    } else {
      console.log("❌ Aucun badge en attente !");
    }
  }, 3000);
}

function HasPermission(permission) {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user.role.toLowerCase();
}

// Evenent Listener
addUserButton.addEventListener("click", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // if (roleAuthorized[user.role.toLowerCase()]) {
  //   OpenModal("add_user");
  // }
  OpenModal("add_user");
});

loginButton.addEventListener("click", () => {
  OpenModal("login");
});

logoutButton.addEventListener("click", () => {
  console.log("✅ Logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  isLoggedIn();
});

searchInput.addEventListener("input", (e) => {
  const searchValue = e.target.value;
  const filteredUsers = Users.filter((user) =>
    user.username.toLowerCase().includes(searchValue.toLowerCase())
  );
  RendersUsers(filteredUsers);
});

avatarButton.addEventListener("click", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  OpenModal("avatar-user", user);
});

window.addEventListener("DOMContentLoaded", async () => {
  isLoggedIn();
  PendingBadge();
  await GetUsers();
});
