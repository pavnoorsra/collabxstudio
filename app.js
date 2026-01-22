import { db, collection, addDoc, getDocs, serverTimestamp } from "./firebase.js";

const profilesRef = collection(db, "profiles");

// ADD PROFILE
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
      link: document.querySelector("#link").value.trim(),
      createdAt: serverTimestamp()
    };

    if (!data.name || !data.genre || !data.country || !data.link) {
      alert("Fill all fields");
      return;
    }

    await addDoc(profilesRef, data);
    alert("Profile added 🔥");
    window.location.href = "discover.html";
  });
}

// DISCOVER
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
          <a class="btn" href="${p.link}" target="_blank">About artist</a>
        `;
        list.appendChild(div);
      });
  }

  filter.addEventListener("change", render);
  render();
}

initAdd();
initDiscover();
