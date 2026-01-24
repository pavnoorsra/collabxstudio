import { supabase } from "./supabase.js";

/* ================= ADD PROFILE ================= */
function initAdd() {
  const form = document.querySelector("#profileForm");
  if (!form) return;

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

    let audioUrls = [];

    if (files.length > 2) {
      alert("Max 2 MP3 files allowed");
      return;
    }

    for (let file of files) {
      const filePath = `tracks/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("tracks")
        .upload(filePath, file);

      if (uploadError) {
        alert("Upload failed");
        return;
      }

      const { data } = supabase.storage.from("tracks").getPublicUrl(filePath);
      audioUrls.push(data.publicUrl);
    }

    const { error } = await supabase.from("profiles").insert([
      {
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
      console.error(error);
      return;
    }

    alert("Profile added 🔥");
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

    const { data, error } = await supabase.from("profiles").select("*");

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
        <h4 style="margin-top:12px">Artist work</h4>
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

  filter.addEventListener("change", render);
  render();
}

initAdd();
initDiscover();
