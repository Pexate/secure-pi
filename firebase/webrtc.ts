import {
  DocumentReference,
  CollectionReference,
  DocumentData,
  Unsubscribe,
  DocumentSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  doc,
  getDoc,
  collection,
  setDoc,
  onSnapshot,
  addDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "./firebaseconf";
import { getDeviceName } from "./firebaseMethods";

import type { DataConnection, MediaConnection, Peer } from "peerjs";
import { MutableRefObject } from "react";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const stream = async (id: string, stream: MediaStream): Promise<void> => {
  const { Peer } = await import("peerjs");
  const peer: Peer = new Peer(id + "_H");

  peer.on("call", async (call: MediaConnection) => {
    const isWhitelisted = await checkIfWhitelisted(id, call.metadata.peerId);
    if (isWhitelisted) {
      call.answer(stream);
    }
  });
};

const connect = async (
  id: string,
  userId: string,
  videoRef: MutableRefObject<null | HTMLVideoElement>
): Promise<void> => {
  const { Peer } = await import("peerjs");
  const peer: Peer = new Peer(nanoid());
  console.log(peer);
  peer.on("open", () => {
    let conn = peer.connect(id + "_H");
    console.log(conn);
    peer.on("connection", (connection) => {
      conn = connection;
    });
    const call = peer.call(id + "_H", createMediaStreamFake(), {
      metadata: { peerId: userId },
    });
    call.on("stream", async (stream) => {
      const recents = await getRecentPis(userId);
      const recentsIds: string[] = [];
      recents.forEach((recent) => {
        recentsIds.push(recent.id);
      });
      if (recentsIds.indexOf(id) === -1) {
        const name = await getDeviceName(id);
        recents.push({ name: name, id: id });
        const recentDocRef = doc(db, "recent", userId);
        const recentDoc = await getDoc(recentDocRef);
        if (recentDoc.exists()) {
          updateDoc(recentDocRef, { recent: recents });
        } else {
          setDoc(recentDocRef, { recent: recents });
        }
      }

      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  });
};

const createMediaStreamFake = () => {
  return new MediaStream([
    createEmptyAudioTrack(),
    createEmptyVideoTrack({ width: 640, height: 480 }),
  ]);
};

const createEmptyAudioTrack = () => {
  const ctx: AudioContext = new AudioContext();
  const oscillator: OscillatorNode = ctx.createOscillator();
  const dst: AudioNode = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

const createEmptyVideoTrack = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const stream: MediaStream = canvas.captureStream();
  const track: MediaStreamTrack = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

const getRecentPis = async (id: string): Promise<any[]> => {
  const idDocRef: DocumentReference<DocumentData> = doc(db, "recent", id);
  const idDoc: DocumentSnapshot<DocumentData> = await getDoc(idDocRef);
  const pis: any[] = [];

  console.log(idDoc.exists());

  if (idDoc.exists()) {
    let recent = idDoc.data().recent;
    for (let i = 0; i < recent.length; i++) {
      const name = await getDeviceName(recent[i].id);
      pis.push({ name: name, id: id });
    }
    return pis;
  }
  return [];
};

const checkIfWhitelisted = async (
  uid: string,
  ip: string
): Promise<boolean> => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data().whitelist.indexOf(ip) > -1;
  }

  return false;
};

const addToWhitelist = async (uid: string, ip: string): Promise<void> => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  const isWhitelisted = await checkIfWhitelisted(uid, ip);
  console.log("test", userDoc.exists(), !isWhitelisted);

  if (userDoc.exists() && !isWhitelisted) {
    const whitelist = userDoc.data().whitelist;
    whitelist.push(ip);
    updateDoc(userDocRef, { whitelist: whitelist });
  }

  if (!userDoc.exists()) {
    setDoc(userDocRef, { whitelist: [ip], name: "" });
  }
};

const removeFromWhitelist = async (uid: string, ip: string): Promise<void> => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  const isWhitelisted = await checkIfWhitelisted(uid, ip);
  console.log(userDoc.exists(), isWhitelisted);

  if (userDoc.exists() && isWhitelisted) {
    const whitelist = userDoc.data().whitelist;
    whitelist.splice(userDoc.data().whitelist.indexOf(ip), 1);
    updateDoc(userDocRef, { whitelist: whitelist });
  }
};

const checkNotificationStatus = async (uid: string): Promise<boolean> => {
  const notificationDocRef = doc(db, "notifications", uid);
  const notificationDoc = await getDoc(notificationDocRef);

  if (!notificationDoc.exists()) {
    await updateDoc(notificationDocRef, { status: true });
    return true;
  }

  return notificationDoc.data().status;
};

const changeNotificationStatus = async (
  uid: string,
  status: boolean
): Promise<void> => {
  const notificationDocRef = doc(db, "notifications", uid);

  await updateDoc(notificationDocRef, { status: status });
};

export {
  stream,
  connect,
  getRecentPis,
  checkIfWhitelisted,
  addToWhitelist,
  removeFromWhitelist,
  checkNotificationStatus,
  changeNotificationStatus,
};
