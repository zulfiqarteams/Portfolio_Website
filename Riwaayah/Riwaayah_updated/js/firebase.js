// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration
// NOTE: These credentials are safe to expose in Firebase projects
// Firebase Security Rules protect your data - not the credentials
// For production, consider using Firebase App Check
const firebaseConfig = {
  apiKey: "AIzaSyBz-UoBmjgxehkt52qy6mptup3NEsSm1Fs",
  authDomain: "riwayat-6b724.firebaseapp.com",
  projectId: "riwayat-6b724",
  storageBucket: "riwayat-6b724.firebasestorage.app",
  messagingSenderId: "180914467568",
  appId: "1:180914467568:web:ad70f1ff83d4f2faddc835",
  measurementId: "G-T0GQL1D13M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);