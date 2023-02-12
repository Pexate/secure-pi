import {
  useAuthState,
  useSignInWithEmailAndPassword,
  useCreateUserWithEmailAndPassword,
  AuthStateHook,
} from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseconf";
import type { AuthError, User, UserCredential } from "firebase/auth";
import { getApps } from "firebase/app";

const useFirebaseState: () => (
  | boolean
  | User
  | Error
  | null
  | undefined
)[] = () => {
  const firebaseIsRunning = !!getApps().length;
  if (!firebaseIsRunning) return [null, false, undefined];
  const [user, loading, error]: AuthStateHook = useAuthState(auth);
  return [user, loading, error];
};

const useRegistrationFirebaseState: () =>
  | (
      | boolean
      | UserCredential
      | ((email: string, password: string) => Promise<void>)
      | AuthError
      | undefined
    )[]
  | (
      | boolean
      | ((email: string, password: string) => null)
      | null
      | undefined
    )[] = () => {
  const firebaseIsRunning = !!getApps().length;
  if (!firebaseIsRunning)
    return [
      (email: string, password: string) => {
        return null;
      },
      null,
      false,
      undefined,
    ];
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  return [createUserWithEmailAndPassword, user, loading, error];
};

const useLoginFirebaseState: () =>
  | (
      | boolean
      | UserCredential
      | ((email: string, password: string) => Promise<void>)
      | AuthError
      | undefined
    )[]
  | (
      | boolean
      | ((email: string, password: string) => null)
      | null
      | undefined
    )[] = () => {
  const firebaseIsRunning = !!getApps().length;
  if (!firebaseIsRunning)
    return [
      (email: string, password: string) => {
        return null;
      },
      null,
      false,
      undefined,
    ];

  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  return [signInWithEmailAndPassword, user, loading, error];
};

export {
  useFirebaseState,
  useLoginFirebaseState,
  useRegistrationFirebaseState,
};
