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
  runTransaction,
} from "firebase/firestore";
import {
  doc,
  getDoc,
  collection,
  setDoc,
  onSnapshot,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseconf";

import { nanoid } from "nanoid";
import { start } from "repl";

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
  const pc: RTCPeerConnection = new RTCPeerConnection(servers);
  const streamVideo = document.getElementById("streamVideo");
  let remoteStream = new MediaStream();
  /*
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
*/
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track); //, event.streams[0]
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
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDoc, { answer });

  const addIceCandidate = onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type == "added") {
        const data = change.doc.data();
        const candidate = new RTCIceCandidate(data);
        console.log("DESC:", pc.remoteDescription);
        if (candidate) pc.addIceCandidate(candidate);
      }
    });
  });

  const recentDoc = doc(db, "recent", userId);
  const recentDocSnapshot = await getDoc(recentDoc);

  /*
  pc.addEventListener("datachannel", (event) => {
    dataChannel = event.channel;
    dataChannel.onmessage = (e) => {
      console.log("onmessage");

      message = JSON.parse(e.data);
      console.log("message", message);
      setInfo(message);
      if (recentDocSnapshot.exists()) {
        updateDoc(recentDoc, { name: message.name });
      } else {
        setDoc(recentDoc, { recent: [id], name: message.name });
      }
    };
  });
  */
  /*
  let sendChannel = null;
  pc.ondatachannel = (e) => {
    console.log("hello data channelgge");
    sendChannel = e.channel;
    sendChannel.onmessage = handleRecieveMessage;
  };

  const handleRecieveMessage = (e) => {
    console.log(e.data);
  };

  pc.ondatachannel = function (event) {
    let receiveChannel = event.channel;
    receiveChannel.onmessage = function (event) {
      alert(event.data);
    };
  };
  */
  const dataChannel = pc.createDataChannel("sendChannel");

  // Add an event listener for the message event
  dataChannel.addEventListener("message", (event) => {
    console.log(`Received message: ${event.data}`);
  });

  if (recentDocSnapshot.exists()) {
    const recentConnections = recentDocSnapshot.data().recent;
    if (id in recentConnections) {
      for (let i = 0; i < recentConnections.length; i++) {
        if (recentConnections[i] == id) {
          recentConnections.splice(i, 1);
        }
      }
    }

    recentConnections.push(id);

    updateDoc(recentDoc, { recent: recentConnections });
  } else {
    await setDoc(recentDoc, { recent: [id], name: "" });
  }

  try {
  } catch (e) {
    console.log("failed");
  }
  /*
  await runTransaction(db, async (transaction) => {
      const recent = await transaction.get(recentDoc);
      if (!recent.exists()) {
        await setDoc(recentDoc, { recent: [id] });
        return;
      }

      const recentConnections = recent.data().recent;
      recentConnections.push(id);

      transaction.update(recentDoc, { recent: recentConnections })
    */
};

const stream = async (
  document: Document,
  videoStream: MediaStream,
  id = nanoid()
) => {
  const pc: RTCPeerConnection = new RTCPeerConnection(servers);

  const webcamVideo = document.getElementById("watchVideo");
  const videoId = document.getElementById("watch_video_id");
  // Phase 1: Initiate camera feed
  videoStream.getTracks().forEach((track: MediaStreamTrack) => {
    pc.addTrack(track, videoStream);
  });

  /*
  pc.ontrack = (event: RTCTrackEvent) => {
    event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {});
  };
  */
  // Phase 2: Create the peer connection offer

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
      (async () => {
        await addDoc(offerCandidates, event.candidate.toJSON());
      })();
  };

  const offerDescription: RTCSessionDescriptionInit = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };
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
        console.log("DESC:", pc.remoteDescription);
        if (candidate && pc.remoteDescription && pc)
          pc.addIceCandidate(candidate);
      }
    });
  });

  videoId.innerHTML = `Pi kod: <b>${id}<b>`;
  document.getElementById("copy_button").onclick = () => {
    navigator.clipboard.writeText(id);
  };
  webcamVideo.srcObject = videoStream;
  //listenForAnswer();
  //addCandidateOnAnswer();

  const channel = pc.createDataChannel("sendChannel", {
    ordered: true,
  });

  setTimeout(() => {
    console.log(channel.readyState);
    channel.send("hello world!");
  }, 12000);
  /*
  channel.binaryType = "arraybuffer";
  channel.addEventListener("open", () => {
    console.log("local channel open");
  });

  pc.ondatachannel = (e) => {
    console.log(e);
  };

  channel.onopen = function (event) {
    var readyState = channel.readyState;
    if (readyState == "open") {
      channel.send("Hello");
    }
  };
  */

  /*
  const handleMessage = (e) => {
    console.log(e.data);
  };

  channel.onmessage = handleMessage;

  channel.onopen = () => {
    console.log("sda");
    channel.send("hello");
  };

  pc.ondatachannel = () => {
    console.log("sda");
    channel.send("hello");
  };
  */

  pc.oniceconnectionstatechange = async (event: Event) => {
    if (pc.iceConnectionState === "disconnected") {
      await deleteDoc(callDoc);
      await stream(document, videoStream, id);
    }
  };

  var interval = setInterval(function () {
    console.log(channel.readyState);
    if (channel.readyState === "open") {
      //sendServerInfo(pc, localChannel);
      clearInterval(interval);
      //sendServerInfo(pc, localChannel);
      //const data = {
      //  name: "Tonči's pi",
      //  id: "dsiauhdsaoidewiuu43298u4329ndfcs",
      //;

      channel.send("hello");
    }
  }, 1000);
};

const getRecentPis = async (id: string, setPis: Function) => {
  const idDocRef = doc(db, "recent", id);
  const idDoc = await getDoc(idDocRef);

  if (idDoc.exists()) {
    setPis(idDoc.data());
  }
};

const checkIfBlacklisted = async (uid: string, ip: string) => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data().blacklist.indexOf(ip) > -1;
  }

  return false;
};

const addToBlacklist = async (uid: string, ip: string) => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists() && userDoc.data().blacklist.indexOf(ip) === -1) {
    const blacklist = userDoc.data().blacklist;
    blacklist.push(ip);
    updateDoc(userDocRef, { blacklist: blacklist });
  }
};

const removeFromBlacklist = async (uid: string, ip: string) => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists() && userDoc.data().blacklist.indexOf(ip) > -1) {
    const blacklist = userDoc.data().blacklist;
    blacklist.splice(userDoc.data().blacklist.indexOf(ip), 1);
    updateDoc(userDocRef, { blacklist: blacklist });
  }
};

export {
  stream,
  connect,
  getRecentPis,
  checkIfBlacklisted,
  addToBlacklist,
  removeFromBlacklist,
};
