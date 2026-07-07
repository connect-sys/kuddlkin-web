import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Public web config (safe to ship) — same Firebase project as kuddl-customer-web.
const firebaseConfig = {
  apiKey: "AIzaSyBgafMLFNIWEOjagVDqiEHckRpKz-KbOVE",
  authDomain: "kuddl-web-module.firebaseapp.com",
  projectId: "kuddl-web-module",
  storageBucket: "kuddl-web-module.firebasestorage.app",
  messagingSenderId: "571837960706",
  appId: "1:571837960706:web:376739cec2347614b6cd1b",
  measurementId: "G-2BRMB662BD",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
