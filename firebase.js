import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDCTeY2_l3ox2mG5d9mUerrA0erQ1GHR38",
  authDomain: "collabx-c0b10.firebaseapp.com",
  projectId: "collabx-c0b10",
  storageBucket: "collabx-c0b10.firebasestorage.app",
  messagingSenderId: "502495747245",
  appId: "1:502495747245:web:3ce2fa9fee46ef4330ba24"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


export { collection, addDoc, getDocs, serverTimestamp };
