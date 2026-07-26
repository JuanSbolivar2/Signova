import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBki5ziLxT4HjggWizmvpbCYwQRSi60OME",
  authDomain: "signova-2a450.firebaseapp.com",
  projectId: "signova-2a450",
  storageBucket: "signova-2a450.firebasestorage.app",
  messagingSenderId: "208358580964",
  appId: "1:208358580964:web:86ea2ffece55f0b69842f1",
  measurementId: "G-SN3HZW9YLF"
};

const app = initializeApp(firebaseConfig);

// Servicios que usaremos
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("✅ Firebase conectado correctamente");
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut
};
