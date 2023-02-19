import { auth, storage, db } from "./firebaseconf";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
  User,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Messaging, getMessaging, getToken } from "firebase/messaging";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  StorageReference,
  deleteObject,
} from "firebase/storage";

import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

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
  const userDocRef: DocumentReference = doc(db, "users", uid);
  const userDoc: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

  if (userDoc.exists()) return;

  await setDoc(userDocRef, { name: name, whitelist: [] });
};

const requestPermission = async () => {
  console.log("Requesting permission...");
  const permission: NotificationPermission =
    await Notification.requestPermission();
  if (permission === "granted") console.log("Notification permission granted.");
  let token = await getMessagingToken();
  console.log(token);
};

const getMessagingToken = async () => {
  const messaging: Messaging = getMessaging();
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
  const userDocRef: DocumentReference = doc(db, "users", uid);
  const userDoc: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

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

const addNotificationId = async (id: string, userId: string): Promise<void> => {
  const userDocRef: DocumentReference = doc(db, "notifications", userId);
  const userDoc: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    setDoc(userDocRef, { status: true, devices: [id] });
    return;
  }

  const data = userDoc.data();
  if (data.hasOwnProperty("devices")) {
    if (data.devices.includes(id)) {
      return;
    }

    updateDoc(userDocRef, { devices: [...data.devices, id] });
    return;
  }

  updateDoc(userDocRef, { devices: [id] });
};

const getAllUserIds = async (): Promise<Array<string>> => {
  const userCollectionRef: CollectionReference<DocumentData> = collection(
    db,
    "users"
  );
  const allUsers: QuerySnapshot<DocumentData> = await getDocs(
    userCollectionRef
  );
  const ids: Array<string> = [];

  allUsers.forEach((user) => {
    ids.push(user.id);
  });

  return ids;
};

const deleteUserAndUserData = async (user: User): Promise<void> => {
  const callsDocRef: DocumentReference<DocumentData> = doc(
    db,
    "calls",
    user.uid
  );
  const notificationDocRef: DocumentReference<DocumentData> = doc(
    db,
    "notification",
    user.uid
  );
  const recentDocRef: DocumentReference<DocumentData> = doc(
    db,
    "recent",
    user.uid
  );
  const userDocRef: DocumentReference<DocumentData> = doc(
    db,
    "users",
    user.uid
  );

  await deleteDoc(callsDocRef);
  await deleteDoc(notificationDocRef);
  await deleteDoc(recentDocRef);
  await deleteDoc(userDocRef);

  const profilePictureRef: StorageReference = ref(storage, `${user.uid}.png`);
  deleteObject(profilePictureRef);

  user.delete();
};

const changePassword = async (password: string, user: User): Promise<void> => {
  updatePassword(user, password);
};

const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

const getDeviceName = async (id: string): Promise<string | null> => {
  const deviceDocRef: DocumentReference<DocumentData> = doc(db, "users", id);
  const deviceDoc: DocumentSnapshot<DocumentData> = await getDoc(deviceDocRef);

  if (!deviceDoc.exists()) {
    return null;
  }

  return deviceDoc.data().name;
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
  addNotificationId,
  getAllUserIds,
  deleteUserAndUserData,
  changePassword,
  resetPassword,
  getDeviceName,
};
