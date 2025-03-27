let Users = [];
const addUserButton = document.getElementById("add_user");
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
    const token = GenerateToken(username, password);
    const data = { username, password, role, token };

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

function RendersUsers(users) {
  userList.innerHTML = users
    .map((user) => {
      return `
    
      <div class="user-card" data-id="${user.id}">
        <div class="user-card-left">
            <span>${user.username}</span>
            <span>${user.role}</span>
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

function OpenModal(type, user = null) {
  if (type === "add_user") {
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
          <option>Inviter</option>
          <option>Membre</option>
          <option>Administrateur</option>
          <option>Passe partout</option>
        </select>

        <div class="modal-submit">
          <button id="button_add_user_cancel" type="reset">Annuler</button>
          <button id="button_add_user_submit" type="submit">Ajouter</button>
        </div>
      </form>
    `;

    modal.style.display = "flex";

    HandleFormSubmit();
  } else if (type === "link_badge") {
    modalHeader.innerHTML = `
      <h2>Attribué un badge à '${user.username}'</h2>
      <div id="closeModal">
        <i class="fa-solid fa-xmark"></i>
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

  linkBadge.forEach((link) => {
    link.addEventListener("click", async (e) => {
      let userSelected = Users.find(
        (user) => user.id === Number(e.target.dataset.id)
      );
      OpenModal("link_badge", userSelected);
    });
  });

  historyUser.forEach((button) => {
    button.addEventListener("click", async (e) => {
      console.log("History user", e.target.dataset.id);
    });
  });
}

function GenerateToken(username, password) {
  const token = btoa(username + ":" + password);
  return token;
}

function CloseModal() {
  const closeModal = document.getElementById("closeModal");
  closeModal.addEventListener("click", () => {
    modalBody.innerHTML = "";
    modalHeader.innerHTML = "";
    modal.style.display = "none";
  });
}

// Evenent Listener
addUserButton.addEventListener("click", () => {
  OpenModal("add_user");
});

searchInput.addEventListener("input", (e) => {
  const searchValue = e.target.value;
  const filteredUsers = Users.filter((user) =>
    user.username.toLowerCase().includes(searchValue.toLowerCase())
  );
  RendersUsers(filteredUsers);
});

window.addEventListener("DOMContentLoaded", async () => {
  await GetUsers();
});
