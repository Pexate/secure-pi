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

import type { DataConnection, Peer } from "peerjs";

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

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const connect = async (
  id: string,
  document: Document,
  setInfo: Function,
  userId: string
) => {
  const { Peer } = await import("peerjs");
  const pc: RTCPeerConnection = new RTCPeerConnection(servers);
  const streamVideo: HTMLElement | null =
    document.getElementById("streamVideo");
  let remoteStream: MediaStream = new MediaStream();

  const peer: Peer = new Peer(userId);
  console.log(peer);

  peer.on("open", () => {
    const conn: DataConnection = peer.connect(id + "_H");
    console.log(conn);

    conn.on("open", () => {
      console.log("open");
      conn.on("data", async (data: any) => {
        console.log(data);
        const dataDocRef = doc(db, "users", data.id);
        const dataDoc = await getDoc(dataDocRef);

        if (dataDoc.exists()) {
          console.log(dataDoc.data());
          setInfo(dataDoc.data());
        }
        if (streamVideo) {
          streamVideo.style.width = `${data.width}px`;
          streamVideo.style.height = `${data.height}px`;
        }
      });

      conn.send(userId);
    });
  });

  pc.ontrack = (event): void => {
    event.streams[0].getTracks().forEach((track): void => {
      remoteStream.addTrack(track);
    });
  };

  //@ts-ignore
  if (streamVideo) streamVideo.srcObject = remoteStream;

  const callDoc: DocumentReference = doc(db, "calls", id);
  const offerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "offerCandidates"
  );
  const answerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "answerCandidates"
  );

  pc.onicecandidate = async (event): Promise<void> => {
    event.candidate &&
      (await addDoc(answerCandidates, event.candidate.toJSON()));
  };

  const callData: DocumentData | undefined = (await getDoc(callDoc)).data();
  if (!callData) return;

  const offerDescription: RTCSessionDescriptionInit = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer: { type: string; sdp: string | undefined } = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDoc, { answer });

  const addIceCandidate: Unsubscribe = onSnapshot(
    offerCandidates,
    (snapshot) => {
      snapshot.docChanges().forEach((change): void => {
        if (change.type == "added") {
          const data: DocumentData = change.doc.data();
          const candidate: RTCIceCandidate = new RTCIceCandidate(data);
          candidate && pc.addIceCandidate(candidate);
        }
      });
    }
  );

  const recentDoc = doc(db, "recent", userId);
  const recentDocSnapshot = await getDoc(recentDoc);

  if (!recentDocSnapshot.exists())
    await setDoc(recentDoc, { recent: [id], name: "" });
  else {
    const recentConnections: Array<string> = recentDocSnapshot.data().recent;

    if (!recentConnections.includes(id)) {
      recentConnections.push(id);

      updateDoc(recentDoc, { recent: recentConnections });
    }
  }

  try {
  } catch (e) {
    console.log("failed");
  }
};

const stream = async (
  document: Document,
  videoStream: MediaStream,
  id: string
) => {
  const { Peer } = await import("peerjs");
  let pc: RTCPeerConnection = new RTCPeerConnection(servers);
  const peer: Peer = new Peer(id + "_H");
  const { width, height } = videoStream.getVideoTracks()[0].getSettings();

  const webcamVideo: HTMLElement | null = document.getElementById("watchVideo");
  const videoId: HTMLElement | null = document.getElementById("watch_video_id");

  videoStream.getTracks().forEach((track: MediaStreamTrack): void => {
    pc.addTrack(track, videoStream);
  });

  //pc.onsignalingstatechange = (event) => {
  //  console.log(pc.signalingState, event);
  //};

  const copy_button = document.getElementById("copy_button");
  if (videoId && copy_button && webcamVideo) {
    videoId.innerHTML = `Pi kod: <b>${id}<b>`;
    copy_button.onclick = (): void => {
      navigator.clipboard.writeText(id);
    };
    //@ts-ignore
    webcamVideo.srcObject = videoStream;
  }

  const callDoc = doc(db, "calls", id);
  const offerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "offerCandidates"
  );
  const answerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "answerCandidates"
  );

  pc.oniceconnectionstatechange = async (event: Event): Promise<void> => {
    console.log(event, pc.iceConnectionState);
    if (pc.iceConnectionState === "disconnected") {
      console.log("DISCONNECTED");
      //
      pc.restartIce();
      //pc.close();

      pc = new RTCPeerConnection(servers);

      await updateDoc(callDoc, {
        answer: deleteField(),
        offer: deleteField(),
      });
      await deleteDoc(callDoc);
      await stream(document, videoStream, id);
    }
  };

  const listenForAnswer: Unsubscribe = onSnapshot(
    callDoc,
    (snapshot: DocumentSnapshot<DocumentData>) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    }
  );

  const offerDescription: RTCSessionDescriptionInit = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer: {
    sdp: string | undefined;
    type: string;
  } = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };
  await setDoc(callDoc, { offer });

  peer.on("connection", (conn: DataConnection): void => {
    conn.on("data", async (data: any): Promise<void> => {
      const isWhitelisted: boolean = await checkIfWhitelisted(id, data);
      console.log(isWhitelisted);

      if (!isWhitelisted) {
        return;
      }

      pc.onicecandidate = async (
        event: RTCPeerConnectionIceEvent
      ): Promise<void> => {
        event.candidate &&
          (await addDoc(offerCandidates, event.candidate.toJSON()));
      };

      const addCandidateOnAnswer: Unsubscribe = onSnapshot(
        answerCandidates,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const candidate = new RTCIceCandidate(change.doc.data());
              if (candidate && pc.remoteDescription && pc)
                pc.addIceCandidate(candidate);
            }
          });
        }
      );

      //listenForAnswer();
      //addCandidateOnAnswer();

      conn.send({ id: id, width: width, height: height });
    });
  });

  /*
  const webcamVideo: HTMLElement | null = document.getElementById("watchVideo");
  const videoId: HTMLElement | null = document.getElementById("watch_video_id");

  videoStream.getTracks().forEach((track: MediaStreamTrack): void => {
    pc.addTrack(track, videoStream);
  });

  const callDoc = doc(db, "calls", id);
  const offerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "offerCandidates"
  );
  const answerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "answerCandidates"
  );


  const offerDescription: RTCSessionDescriptionInit = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer: {
    sdp: string | undefined;
    type: string;
  } = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };
  await setDoc(callDoc, { offer });

  const listenForAnswer: Unsubscribe = onSnapshot(
    callDoc,
    (snapshot: DocumentSnapshot<DocumentData>) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    }
  );

  const addCandidateOnAnswer: Unsubscribe = onSnapshot(
    answerCandidates,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          if (candidate && pc.remoteDescription && pc)
            pc.addIceCandidate(candidate);
        }
      });
    }
  );
  const copy_button = document.getElementById("copy_button");
  if (videoId && copy_button && webcamVideo) {
    videoId.innerHTML = `Pi kod: <b>${id}<b>`;
    copy_button.onclick = (): void => {
      navigator.clipboard.writeText(id);
    };
    //@ts-ignore
    webcamVideo.srcObject = videoStream;
  }
  //listenForAnswer();
  //addCandidateOnAnswer();

  pc.oniceconnectionstatechange = async (event: Event): Promise<void> => {
    if (pc.iceConnectionState === "disconnected") {
      await deleteDoc(callDoc);
      await stream(document, videoStream, id);
    }
  };
  */
};

const getRecentPis = async (id: string, setPis: Function): Promise<void> => {
  const idDocRef = doc(db, "recent", id);
  const idDoc = await getDoc(idDocRef);

  if (idDoc.exists()) {
    setPis(idDoc.data());
  }
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
    await setDoc(notificationDocRef, { status: true });
    return true;
  }

  return notificationDoc.data().status;
};

const changeNotificationStatus = async (
  uid: string,
  status: boolean
): Promise<void> => {
  const notificationDocRef = doc(db, "notifications", uid);

  await setDoc(notificationDocRef, { status: status });
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
