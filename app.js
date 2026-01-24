import { db, collection, addDoc, getDocs, serverTimestamp } from "./firebase.js";

const profilesRef = collection(db, "profiles");

/* ================= EMAIL POPUP ================= */

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
      email: localStorage.getItem("userEmail"),
      createdAt: serverTimestamp()
    };

    if (!data.name || !data.genre || !data.country || !data.email) {
      alert("Fill all fields and enter email");
      return;
    }

    await addDoc(profilesRef, data);
    alert("Profile added 🔥");
    window.location.href = "discover.html";
  });
}

/* ================= DETAIL MODAL ================= */

let detailModal;
let detailBox;

function createDetailModal() {
  detailModal = document.createElement("div");
  detailModal.id = "detailModal";
  detailModal.innerHTML = `
    <div id="detailBox"></div>
  `;
  document.body.appendChild(detailModal);

  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.style.display = "none";
  });
}

function showDetails(p) {
  const text = `This artist is a ${p.role.toLowerCase()} from ${p.country} creating ${p.genre} music and looking for collaborators.`;

  detailBox.innerHTML = `
    <h2>${p.name}</h2>
    <p style="color:#bbb;margin-top:6px">${text}</p>
    <p style="margin-top:10px"><b>Contact:</b> ${p.email}</p>

    <div style="margin-top:14px;display:flex;gap:10px">
      <a class="btn primary" href="mailto:${p.email}">Email artist</a>
      <button class="btn" id="closeDetail">Close</button>
    </div>
  `;

  document.getElementById("closeDetail").onclick = () => {
    detailModal.style.display = "none";
  };

  detailModal.style.display = "flex";
}

/* ================= DISCOVER ================= */

async function initDiscover() {
  const list = document.querySelector("#list");
  const filter = document.querySelector("#filterRole");
  if (!list) return;

  createDetailModal();

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

        div.onclick = () => showDetails(p);
        list.appendChild(div);
      });
  }

  filter.addEventListener("change", render);
  render();
}

/* ================= INIT ================= */

initAdd();
initDiscover();
