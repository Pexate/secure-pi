import { app, auth } from "./firebaseconf";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

const loginEmail: Function = (payload: { email: string; password: string }) => {
  signInWithEmailAndPassword(auth, payload.email, payload.password);
};

const loginGoogle: Function = () => {
  const provider: GoogleAuthProvider = new GoogleAuthProvider();
};

export const updateUserProfile: Function = async (payload: { any: any }) => {
  await updateProfile(auth.currentUser, payload);
  return auth.currentUser;
};
