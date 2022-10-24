import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import type { Auth } from "firebase/auth";
import {
  Firestore,
  DocumentReference,
  CollectionReference,
  DocumentData,
  Unsubscribe,
  getDocs,
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
} from "firebase/firestore";
import { db } from "./firebaseconf";

import { nanoid } from "nanoid";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const connect = async (id: string, document) => {
  const pc: RTCPeerConnection = new RTCPeerConnection(servers);
  const streamVideo = document.getElementById("streamVideo");
  const webcamVideo = document.getElementById("watchVideo");
  let remoteStream = new MediaStream();

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  streamVideo.srcObject = remoteStream;

  const callDoc = doc(db, "calls", id);
  const offerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "offerCandidates"
  );
  const answerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "answerCandidates"
  );

  pc.onicecandidate = async (event) => {
    event.candidate &&
      (await addDoc(answerCandidates, event.candidate.toJSON()));
  };

  const callData = (await getDoc(callDoc)).data();

  const offerDescription = callData.offer;
  console.log("offer description:", offerDescription);
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  console.log(answerDescription);
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  console.log(answer);

  await updateDoc(callDoc, { answer });

  const addIceCandidate = onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change);
      if (change.type == "added") {
        const data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};

const stream = async (document, videoStream) => {
  const pc: RTCPeerConnection = new RTCPeerConnection(servers);
  const streamVideo = document.getElementById("streamVideo");
  const webcamVideo = document.getElementById("watchVideo");
  // Phase 1: Initiate camera feed
  console.log(videoStream);
  videoStream.getTracks().forEach((track: MediaStreamTrack) => {
    pc.addTrack(track, videoStream);
  });

  /*
  pc.ontrack = (event: RTCTrackEvent) => {
    event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {});
  };
  */
  // Phase 2: Create the peer connection offer
  const id = nanoid();

  const callDoc = doc(db, "calls", id);
  const offerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "offerCandidates"
  );
  const answerCandidates: CollectionReference<DocumentData> = collection(
    callDoc,
    "answerCandidates"
  );

  pc.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
    event.candidate &&
      (await addDoc(offerCandidates, event.candidate.toJSON()));
  };

  const offerDescription: RTCSessionDescriptionInit = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };
  console.log(offer);
  await setDoc(callDoc, { offer });

  const listenForAnswer = onSnapshot(
    callDoc,
    (snapshot: DocumentSnapshot<DocumentData>) => {
      // <-------------------------------------------
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    }
  );

  const addCandidateOnAnswer = onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  webcamVideo.srcObject = videoStream;
  console.log(id);
};

export { stream, connect };
