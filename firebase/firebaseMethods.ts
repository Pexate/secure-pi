import { auth, messaging } from "./firebaseconf";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getToken } from "firebase/messaging";

const loginEmail: Function = (payload: { email: string; password: string }) => {
  signInWithEmailAndPassword(auth, payload.email, payload.password);
};

const loginGoogle: Function = () => {
  const provider: GoogleAuthProvider = new GoogleAuthProvider();
};

const updateUserProfile: Function = async (payload: { any: any }) => {
  await updateProfile(auth.currentUser, payload);
  return auth.currentUser;
};

const logOut = async () => {
  await signOut(auth);
};

const requestPermission = async () => {
  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  if (permission === "granted") console.log("Notification permission granted.");
  let token = await getMessagingToken();
  console.log(token);
};

const getMessagingToken = async () => {
  const token = await getToken(messaging, { vapidKey: process.env.vapidKey });
  return token;
};

export {
  requestPermission,
  logOut,
  updateUserProfile,
  loginGoogle,
  loginEmail,
};
