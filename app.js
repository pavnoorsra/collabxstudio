import { db, collection, addDoc, getDocs, serverTimestamp } from "./firebase.js";

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
      contactPlatform: document.querySelector("#contactPlatform").value,
      contactId: document.querySelector("#contactId").value.trim(),
      createdAt: serverTimestamp()
    };

    if (!data.name || !data.genre || !data.country || !data.contactPlatform || !data.contactId) {
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

    <div id="contactArea" style="display:none;margin-top:12px">
      This artist's <b>${p.contactPlatform}</b> is 
      <span style="color:#7c5cff">@${p.contactId}</span>
    </div>

    <div style="margin-top:14px;display:flex;gap:10px">
      <button class="btn primary" id="showContactBtn">View contact info</button>
      <button class="btn" id="closeDetail">Close</button>
    </div>
  `;

  document.getElementById("showContactBtn").onclick = () => {
    document.getElementById("contactArea").style.display = "block";
  };

  document.getElementById("closeDetail").onclick = () => {
    detailModal.style.display = "none";
  };

  detailModal.style.display = "flex";
}

detailModal?.addEventListener("click", (e) => {
  if (e.target === detailModal) detailModal.style.display = "none";
});

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
