/* =========================================================
   REAL AUTH HELPERS
   Replaces the old fake localStorage-only account system.
   Accounts now live in Firebase Authentication; each user's
   profile (name/phone/role) lives in Firestore at users/{uid}.

   IMPORTANT: role is ALWAYS written as "user" on signup here.
   There is no client-side way to become admin - that has to
   be set once, directly in the Firestore console, for your
   own account. See firestore.rules for why this matters.
========================================================= */

import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function registerUser({ name, email, phone, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    phone,
    role: "user", // never trust a client-supplied role
    createdAt: serverTimestamp()
  });
  return cred.user;
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

function cacheSession(user, profile) {
  try {
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.uid,
      name: profile?.name || user.displayName || '',
      email: user.email,
      role: profile?.role || 'user',
      loginTime: new Date().toISOString()
    }));
  } catch (e) { /* non-fatal, cache is only for fast UI reads */ }
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  cacheSession(cred.user, profile);
  return { user: cred.user, profile };
}

export function logoutUser() {
  localStorage.removeItem('currentUser');
  return signOut(auth);
}

/**
 * Gate a page behind real authentication.
 * Verifies against the live Firebase Auth session + the user's
 * Firestore role - NOT the locally-cached copy, which a person
 * could edit in devtools.
 */
export function requireAuth({ requireAdmin = false, onReady, onDenied } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      localStorage.removeItem('currentUser');
      if (onDenied) return onDenied('signed-out');
      window.location.href = 'Login.html';
      return;
    }

    let profile = null;
    try {
      profile = await getUserProfile(user.uid);
    } catch (err) {
      // Firestore read failed (rules not deployed yet, offline, etc).
      // Fail safe instead of leaving the page stuck/blank.
      console.error("requireAuth: could not load user profile:", err);
      if (onDenied) return onDenied('error');
      window.location.href = 'index.html';
      return;
    }

    if (requireAdmin && profile?.role !== 'admin') {
      if (onDenied) return onDenied('not-admin');
      window.location.href = 'index.html';
      return;
    }
    cacheSession(user, profile);
    if (onReady) onReady({ user, profile });
  });
}
