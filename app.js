import { db, collection, addDoc, getDocs, serverTimestamp, auth } from "./firebase.js";
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const profilesRef = collection(db, "profiles");

// ================= AUTH POPUP =================
const modal = document.getElementById("authModal");
const emailInput = document.getElementById("emailInput");
const sendBtn = document.getElementById("sendOtpBtn");

const actionCodeSettings = {
  url: window.location.origin + window.location.pathname,
  handleCodeInApp: true,
};

onAuthStateChanged(auth, user => {
  if (user) {
    if (modal) modal.style.display = "none";
  } else {
    if (modal) modal.style.display = "flex";
  }
});

if (sendBtn) {
  sendBtn.onclick = async () => {
    const email = emailInput.value;
    if (!email) return alert("Enter email");

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("emailForSignIn", email);
    alert("OTP link sent to your email");
  };
}

if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = localStorage.getItem("emailForSignIn");
  if (!email) email = prompt("Enter your email to confirm");

  await signInWithEmailLink(auth, email, window.location.href);
  localStorage.removeItem("emailForSignIn");
  window.location.href = window.location.pathname;
}

// ================= ADD PROFILE =================
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
      createdAt: serverTimestamp(),
      user: auth.currentUser.email
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

// ================= DISCOVER =================
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
          <a class="btn" href="${p.link}" target="_blank">Contact artist</a>
        `;
        list.appendChild(div);
      });
  }

  filter.addEventListener("change", render);
  render();
}

initAdd();
initDiscover();
