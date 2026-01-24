import { db, collection, addDoc, getDocs, serverTimestamp } from "./firebase.js";

/* ================= EMAIL GATE (NO AUTH) ================= */

const modal = document.getElementById("authModal");
const emailInput = document.getElementById("emailInput");
const sendBtn = document.getElementById("sendOtpBtn");

const savedEmail = localStorage.getItem("userEmail");

if (!savedEmail && modal) {
  modal.style.display = "flex";
} else if (modal) {
  modal.style.display = "none";
}

if (sendBtn) {
  sendBtn.onclick = () => {
    const email = emailInput.value.trim();
    if (!email) return alert("Enter your email");
    localStorage.setItem("userEmail", email);
    modal.style.display = "none";
  };
}

/* ================= FIRESTORE ================= */

const profilesRef = collection(db, "profiles");

/* ================= ADD PROFILE ================= */

function initAdd() {
  const form = document.querySelector("#profileForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      role: document.querySelector("#role").value,
      name: document.querySelector("#name").value.trim(),
      genre: document.querySelector("#genre").value,
      country: document.querySelector("#country").value.trim(),
      link: document.querySelector("#link")?.value.trim() || "",
      createdAt: serverTimestamp(),
      email: localStorage.getItem("userEmail")
    };

    if (!data.name || !data.genre || !data.country) {
      alert("Fill all fields");
      return;
    }

    await addDoc(profilesRef, data);
    alert("Profile added 🔥");
    window.location.href = "discover.html";
  });
}

/* ================= DETAIL MODAL ================= */

const detailModal = document.getElementById("detailModal");
const detailBox = document.getElementById("detailBox");

function openDetail(p) {
  detailBox.innerHTML = `
    <h2>${p.name}</h2>
    <p style="margin:10px 0;color:#aaa">
      This artist is a <b>${p.role.toLowerCase()}</b> from <b>${p.country}</b>
      creating <b>${p.genre}</b> music and looking for collaborators.
    </p>

    <p><b>Contact:</b> ${p.email || "Not provided"}</p>

    <div style="margin-top:14px;display:flex;gap:10px">
      <a class="btn primary" href="mailto:${p.email}">Email artist</a>
      <button class="btn" id="closeDetail">Close</button>
    </div>
  `;

  detailModal.style.display = "flex";

  document.getElementById("closeDetail").onclick = () => {
    detailModal.style.display = "none";
  };
}

/* ================= DISCOVER ================= */

async function initDiscover() {
  const list = document.querySelector("#list");
  const filter = document.querySelector("#filterRole");
  if (!list) return;

  async function render() {
    list.innerHTML = "Loading...";
    const snap = await getDocs(profilesRef);
    const all = snap.docs.map(d => d.data());
    const role = filter.value;

    list.innerHTML = "";

    all
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

  filter.addEventListener("change", render);
  render();
}

/* ================= INIT ================= */

initAdd();
initDiscover();
