import {
  db, storage,
  collection, addDoc, getDocs, serverTimestamp,
  ref, uploadBytes, getDownloadURL
} from "./firebase.js";

const profilesRef = collection(db, "profiles");

/* ================= ADD PROFILE ================= */
const form = document.querySelector("#profileForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = roleEl.value;
    const name = nameEl.value.trim();
    const genre = genreEl.value.trim();
    const country = countryEl.value.trim();
    const platform = contactPlatform.value;
    const contactId = contactIdEl.value.trim();
    const files = tracks.files;

    if (files.length > 2) {
      alert("Max 2 MP3 files allowed");
      return;
    }

    let trackUrls = [];

    for (let file of files) {
      const fileRef = ref(storage, `tracks/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      trackUrls.push(url);
    }

    await addDoc(profilesRef, {
      role,
      name,
      genre,
      country,
      contactPlatform: platform,
      contactId,
      tracks: trackUrls,
      createdAt: serverTimestamp()
    });

    alert("Profile added 🔥");
    window.location.href = "discover.html";
  });
}

/* ================= DISCOVER ================= */
const list = document.querySelector("#list");
const detailModal = document.getElementById("detailModal");
const detailBox = document.getElementById("detailBox");

async function loadProfiles() {
  if (!list) return;

  list.innerHTML = "";
  const snap = await getDocs(profilesRef);

  snap.forEach(doc => {
    const p = doc.data();

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

function showDetails(p) {
  detailModal.style.display = "flex";

  let tracksHTML = "";
  if (p.tracks?.length) {
    tracksHTML = p.tracks.map(url =>
      `<audio controls src="${url}" style="width:100%;margin-top:8px"></audio>`
    ).join("");
  }

  detailBox.innerHTML = `
    <h2>${p.name}</h2>
    <p>This artist is a ${p.role.toLowerCase()} from ${p.country} creating ${p.genre} music and looking for collaborators.</p>

    <div class="hr"></div>

    <p><strong>Contact:</strong> ${p.contactPlatform} — ${p.contactId}</p>

    <div class="hr"></div>

    <h4>Artist's work</h4>
    ${tracksHTML}

    <div class="row" style="margin-top:12px">
      <button class="btn" onclick="document.getElementById('detailModal').style.display='none'">Close</button>
    </div>
  `;
}

loadProfiles();
