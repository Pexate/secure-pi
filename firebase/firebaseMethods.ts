import { auth, storage, db } from "./firebaseconf";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
  User,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getMessaging, getToken } from "firebase/messaging";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  StorageReference,
} from "firebase/storage";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { initializeApp } from "firebase/app";

const firebaseConfig: object = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MEASUREMENTID,
};

initializeApp(firebaseConfig);

const loginEmail: Function = (payload: { email: string; password: string }) => {
  signInWithEmailAndPassword(auth, payload.email, payload.password);
};

const loginGoogle: Function = () => {
  const provider: GoogleAuthProvider = new GoogleAuthProvider();
};

const updateUserProfile: Function = async (payload: {
  displayName: string | null | undefined;
  photoURL: string | null | undefined;
}) => {
  auth.currentUser && (await updateProfile(auth.currentUser, payload));
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

  await setDoc(userDocRef, { name: name, whitelist: [] });
};

const requestPermission = async () => {
  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  if (permission === "granted") console.log("Notification permission granted.");
  let token = await getMessagingToken();
  console.log(token);
};

const getMessagingToken = async () => {
  const messaging = getMessaging();
  const token = await getToken(messaging, { vapidKey: process.env.vapidKey });
  return token;
};

const setProfilePicture = async (file: File, user: User) => {
  const pictureRef: StorageReference = ref(storage, `${user.uid}.png`);

  const snapshot = await uploadBytes(pictureRef, file);
  const photoURL = await getDownloadURL(pictureRef);

  await updateProfile(user, { photoURL });

  return photoURL;
};

const changeDeviceName = async (name: string, uid: string): Promise<void> => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    setDoc(userDocRef, { name: name, whitelist: [] });
    return;
  }

  updateDoc(userDocRef, { name: name });
  console.log(userDoc.data());
};

const changeUsername = async (name: string): Promise<void> => {
  auth.currentUser &&
    (await updateProfile(auth.currentUser, { displayName: name }));
};

export {
  requestPermission,
  logOut,
  updateUserProfile,
  loginGoogle,
  loginEmail,
  setProfilePicture,
  setRegistrationInfo,
  changeDeviceName,
  changeUsername,
};
