import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig: object = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MEASUREMENTID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);
//const analytics: Analytics = getAnalytics(app);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { app, db, auth /*analytics*/ };

//signInWithPopup,
//signInWithEmailAndPassword,
//createUserWithEmailAndPassword,
//sendPasswordResetEmail,
//signOut,
//sendSignInLinkToEmail,
