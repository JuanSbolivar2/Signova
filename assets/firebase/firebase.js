import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

// Funciones de autenticación reexportadas para usarlas en toda la app
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
};

// Funciones de Firestore reexportadas (usadas por cloud-sync.js)
export { doc, getDoc, setDoc };

console.log("✅ Firebase conectado correctamente");
