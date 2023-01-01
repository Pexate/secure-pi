import { auth, messaging, storage, db } from "./firebaseconf";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getToken } from "firebase/messaging";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  StorageReference,
} from "firebase/storage";

import { doc, getDoc, setDoc } from "firebase/firestore";

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

const setRegistrationInfo = async (name: string, uid: string) => {
  console.log(name, uid);
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) return;

  await setDoc(userDocRef, { name: name, blacklist: [] });
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

const setProfilePicture = async (file, user) => {
  const pictureRef: StorageReference = ref(storage, `${user.uid}.png`);

  const snapshot = await uploadBytes(pictureRef, file);
  const photoURL = await getDownloadURL(pictureRef);

  await updateProfile(user, { photoURL });

  return photoURL;
};

export {
  requestPermission,
  logOut,
  updateUserProfile,
  loginGoogle,
  loginEmail,
  setProfilePicture,
  setRegistrationInfo,
};
