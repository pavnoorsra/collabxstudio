import { db, collection, addDoc, getDocs, serverTimestamp } from "./firebase.js";

const profilesRef = collection(db, "profiles");

// ================= EMAIL POPUP =================
const modal = document.getElementById("authModal");
const emailInput = document.getElementById("emailInput");
const sendBtn = document.getElementById("sendOtpBtn");

let userEmail = localStorage.getItem("userEmail");

if (!userEmail && modal) {
  modal.style.display = "flex";
}

if (sendBtn) {
  sendBtn.onclick = () => {
    const email = emailInput.value.trim();
    if (!email) return alert("Enter your email");

    localStorage.setItem("userEmail", email);
    modal.style.display = "none";
  };
}

// ================= ADD PROFILE =================
function initAdd() {
  const form = document.querySelector("#profileForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("userEmail");
    if (!email) {
      alert("Please enter email first");
      return;
    }

    const data = {
      role: document.querySelector("#role").value,
      name: document.querySelector("#name").value.trim(),
      genre: document.querySelector("#genre").value,
      country: document.querySelector("#country").value.trim(),
      email: email,
      createdAt: serverTimestamp()
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

// ================= DISCOVER =================
async function initDiscover() {
  const list = document.querySelector("#list");
  const filter = document.querySelector("#filterRole");
  const detailModal = document.getElementById("detailModal");
  const detailBox = document.getElementById("detailBox");
  if (!list) return;

  function makeSentence(p) {
    return `This artist is a ${p.role.toLowerCase()} from ${p.country} creating ${p.genre} music and looking for collaborators.`;
  }

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

        div.onclick = () => {
          detailBox.innerHTML = `
            <h2>${p.name}</h2>
            <p style="color:#aaa;margin-top:6px">${makeSentence(p)}</p>
            <p style="margin-top:10px"><b>Contact:</b> ${p.email}</p>
            <div class="row" style="margin-top:14px">
              <a class="btn primary" href="mailto:${p.email}">Email artist</a>
              <button class="btn" onclick="closeDetail()">Close</button>
            </div>
          `;
          detailModal.style.display = "flex";
        };

        list.appendChild(div);
      });
  }

  filter.addEventListener("change", render);
  render();

  window.closeDetail = () => {
    detailModal.style.display = "none";
  };
}

initAdd();
initDiscover();
