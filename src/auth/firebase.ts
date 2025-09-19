// Minimal Firebase bootstrapping
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onIdTokenChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Keep token fresh in memory
let currentToken: string | null = null;
onIdTokenChanged(auth, async (user: User | null) => {
  currentToken = user ? await user.getIdToken() : null;
});

export const getIdToken = async () =>
  currentToken ?? (auth.currentUser ? auth.currentUser.getIdToken() : null);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

export const logOut = () => signOut(auth);
