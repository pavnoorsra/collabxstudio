import { supabase } from "./supabase.js";

/* ================= AUTH UI ================= */
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeUser = document.getElementById("welcomeUser");

const loginModal = document.getElementById("loginModal");
const loginEmail = document.getElementById("loginEmail");
const sendLoginLink = document.getElementById("sendLoginLink");
const closeLogin = document.getElementById("closeLogin");

const loginFormView = document.getElementById("loginFormView");
const loginSuccessView = document.getElementById("loginSuccessView");
const closeSuccess = document.getElementById("closeSuccess");
const loginError = document.getElementById("loginError");

async function initAuthUI() {
  const { data: sessionData } = await supabase.auth.getSession();

  if (sessionData.session) {
    const user = sessionData.session.user;
    const name = user.email.split("@")[0];

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-flex";

    if (welcomeUser) {
      welcomeUser.textContent = `Hi, ${name}`;
      welcomeUser.setAttribute("data-letter", name[0].toUpperCase());
    }
  } else {
    loginBtn.style.display = "inline-flex";
    logoutBtn.style.display = "none";
    if (welcomeUser) welcomeUser.textContent = "";
  }

  loginBtn.onclick = () => {
    loginModal.style.display = "flex";
    loginFormView.style.display = "block";
    loginSuccessView.style.display = "none";
    loginError.textContent = "";
    loginEmail.value = "";
    loginEmail.focus();
  };

  closeLogin.onclick = () => {
    loginModal.style.display = "none";
  };

  closeSuccess.onclick = () => {
    loginModal.style.display = "none";
  };

  sendLoginLink.onclick = async () => {
    const email = loginEmail.value.trim();
    if (!email) {
      loginError.textContent = "Please enter your email.";
      return;
    }

    sendLoginLink.disabled = true;
    sendLoginLink.textContent = "Sending...";

    const { error } = await supabase.auth.signInWithOtp({ email });

    sendLoginLink.disabled = false;
    sendLoginLink.textContent = "Send link";

    if (error) {
      loginError.textContent = error.message;
      return;
    }

    loginFormView.style.display = "none";
    loginSuccessView.style.display = "block";
  };

  logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    location.reload();
  };
}

/* ================= ADD PROFILE ================= */
async function initAdd() {
  const form = document.querySelector("#profileForm");
  if (!form) return;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    window.location.href = "index.html";
    return;
  }

  const user = userData.user;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = document.querySelector("#role").value;
    const name = document.querySelector("#name").value.trim();
    const genre = document.querySelector("#genre").value;
    const country = document.querySelector("#country").value.trim();
    const platform = document.querySelector("#contactPlatform").value;
    const username = document.querySelector("#contactId").value.trim();
    const files = document.querySelector("#songs").files;

    if (!name || !genre || !country || !platform || !username) {
      alert("Fill all fields");
      return;
    }

    if (files.length > 2) {
      alert("Max 2 MP3 files allowed");
      return;
    }

    let audioUrls = [];

    for (let file of files) {
      if (!file.type.includes("audio")) {
        alert("Only MP3 files allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Max 5MB per file");
        return;
      }

      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("tracks")
        .upload(filePath, file);

      if (uploadError) {
        alert("Upload failed");
        return;
      }

      const { data } = supabase.storage
        .from("tracks")
        .getPublicUrl(filePath);

      audioUrls.push(data.publicUrl);
    }

    const { error } = await supabase.from("profiles").insert([
      {
        user_id: user.id,
        role,
        name,
        genre,
        country,
        platform,
        username,
        audio_urls: audioUrls
      }
    ]);

    if (error) {
      alert("DB error");
      return;
    }

    window.location.href = "discover.html";
  });
}

/* ================= DISCOVER ================= */
async function initDiscover() {
  const list = document.querySelector("#list");
  const filter = document.querySelector("#filterRole");
  const detailModal = document.getElementById("detailModal");
  const detailBox = document.getElementById("detailBox");

  if (!list) return;

  async function render() {
    list.innerHTML = "Loading...";

    const { data, error } = await supabase
      .from("profiles")
      .select("name, role, genre, country, platform, username, audio_urls");

    if (error) {
      list.innerHTML = "Error loading data";
      return;
    }

    const role = filter.value;
    list.innerHTML = "";

    data
      .filter(p => role === "all" || p.role === role)
      .forEach(p => {
        const div = document.createElement("div");
        div.className = "profile";
        div.innerHTML = `
          <h3>${p.name} <span class="badge">${p.role}</span></h3>
          <div class="meta">${p.genre} • ${p.country}</div>
        `;
        div.onclick = () => openDetail(p);
        list.appendChild(div);
      });
  }

  function openDetail(p) {
    detailBox.innerHTML = `
      <h2>${p.name}</h2>
      <p class="notice">
        This artist is a ${p.role.toLowerCase()} from ${p.country}
        creating ${p.genre} music and looking for collaborators.
      </p>

      <p><b>Contact:</b> ${p.platform} → ${p.username}</p>

      ${p.audio_urls?.length ? `
        <h4>Artist work</h4>
        ${p.audio_urls.map(url => `
          <audio controls style="width:100%;margin-top:6px">
            <source src="${url}" type="audio/mpeg">
          </audio>
        `).join("")}
      ` : ""}

      <div class="row" style="margin-top:14px">
        <button class="btn" id="closeDetail">Close</button>
      </div>
    `;

    detailModal.style.display = "flex";
    document.getElementById("closeDetail").onclick = () => {
      detailModal.style.display = "none";
    };
  }

  filter?.addEventListener("change", render);
  render();
}

/* ================= INIT ================= */
initAuthUI();
initAdd();
initDiscover();
