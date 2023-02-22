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

/*
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
};
*/
/*
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
      listenForAnswer();
      await deleteDoc(callDoc);
      await stream(document, videoStream, id);
    }
  };

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
};
  */

const stream = async (id: string, stream: MediaStream): Promise<void> => {
  const { Peer } = await import("peerjs");
  const peer: Peer = new Peer(id + "_H", { debug: 3 });
  /*
  console.log(peer);
  const { width, height } = stream.getVideoTracks()[0].getSettings();

  peer.on("connection", (conn: DataConnection) => {
    console.log(conn, { id: id, width: width, height: height });
    conn.on("open", (data) => {
      console.log(data);
      conn.on("data", async (data2: any): Promise<void> => {
        console.log(data2);
        conn.send({ id: id, width: width, height: height });
      });
    });
  });
  */

  peer.on("call", (call: MediaConnection) => {
    console.log("call", call);
    console.log(stream);
    call.answer(stream);
  });
};

const connect = async (
  id: string,
  userId: string,
  videoRef: MutableRefObject<null | HTMLVideoElement>
): Promise<void> => {
  const { Peer } = await import("peerjs");
  const peer: Peer = new Peer(nanoid(), { debug: 3 });
  console.log(peer);
  peer.on("open", () => {
    let conn = peer.connect(id + "_H");
    console.log(conn);
    peer.on("connection", (connection) => {
      conn = connection;
    });
    console.log("open");
    const call = peer.call(id + "_H", createMediaStreamFake());
    console.log(call);
    call.on("stream", (stream) => {
      console.log(stream);
      videoRef.current.srcObject = stream;
    });
  });

  /*
  peer.on("open", () => {
    const conn: DataConnection = peer.connect(id + "_H");

    const call: MediaConnection = peer.call(id + "_H", local);
    console.log(call);

    call.on("stream", (stream: MediaStream) => {
      console.log("stream", stream);
      videoRef.current.srcObject = stream;
    });

    console.log(conn);

    conn.on("open", () => {
      console.log("open");
      conn.on("data", async (data: any) => {
        console.log(data);
        /*
        const dataDocRef = doc(db, "users", data.id);
        const dataDoc = await getDoc(dataDocRef);

        if (dataDoc.exists()) {
          console.log(dataDoc.data());
          setInfo(dataDoc.data());
        }
        
      });

      conn.send(userId);
    });
  });
  */
};

const createMediaStreamFake = () => {
  return new MediaStream([
    createEmptyAudioTrack(),
    createEmptyVideoTrack({ width: 640, height: 480 }),
  ]);
};

const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

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
      const name = await getDeviceName(recent[i]);
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
