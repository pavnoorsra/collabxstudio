import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJuEbYm7CF-iHelcv4b4ZgeayBOISKs2A",
  authDomain: "collabx-us.firebaseapp.com",
  projectId: "collabx-us",
  storageBucket: "collabx-us.firebasestorage.app",
  messagingSenderId: "161792029565",
  appId: "1:161792029565:web:c202adcd57cb74bc6c1214"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export { collection, addDoc, getDocs, serverTimestamp, ref, uploadBytes, getDownloadURL };
