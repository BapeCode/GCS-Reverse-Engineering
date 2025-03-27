// Generate Token Functions
function GenerateToken(username, password) {
  const token = btoa(username + ":" + password);
  return token;
}

// Get User
const getUser = async () => {
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
  document.getElementById("user").innerHTML = result
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
                <i class="fa-solid fa-pen"></i>
                <i class="fa-solid fa-trash"></i>
                </div>
            </div>`;
    })
    .join("");

  document.querySelectorAll("#link-badge").forEach((link) => {
    link.addEventListener("click", async (e) => {
      const modal = document.getElementById("modal-link-badge");
      const userId = e.target.dataset.id;
      const user = result.map((users) => {
        console.log(users.id, userId);
        if (users.id === userId) {
          return users;
        }
      });

      console.log(user);
      document.getElementById("modal-link-header").innerText = `
        <span>${"test"}</span>
      `;

      modal.style.display = "flex";
    });
  });
};

// Add button Header
const buttonAddUser = document.getElementById("add_user");

buttonAddUser.addEventListener("click", () => {
  const modal = document.getElementById("modal-add-user");
  const buttonCancel = document.getElementById("button_add_user_cancel");

  buttonCancel.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.style.display = "flex";
});

// Add button Modal

const formAddUser = document.getElementById("add_user_form");

formAddUser.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const token = GenerateToken(username, password);
  const data = { username, password, role, token };
  console.log("Formulaire soumis : ", data);

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
    document.getElementById("modal-add-user").style.display = "none";
    formAddUser.reset();
    return getUser();
  } catch (err) {
    console.error("❌ Erreur lors du submit :", err);
  }
});

// Close Button Modal
const buttonCloseModal = document.getElementById("close_modal");

buttonCloseModal.addEventListener("click", () => {
  const modal = document.getElementById("modal-add-user");
  modal.style.display = "none";
});

// Loading User
window.addEventListener("load", async () => {
  getUser();
});
