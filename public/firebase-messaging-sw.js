// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  projectId: "sccure-pi",
  messagingSenderId: "167692408211",
  apiKey: "AIzaSyDIXAQ1ih4xA9rjw2oo2YQxqNRxK5U0WFo",
  authDomain: "sccure-pi.firebaseapp.com",
  storageBucket: "sccure-pi.appspot.com",
  appId: "1:167692408211:web:98b3b9405ae74e31318466",
  measurementId: "G-ZR2S28KX6P",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
/*
messaging.setBackgroundMessageHandler(function (payload) {
  console.log("Handling background message ", payload);

  return self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data));
});
*/

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = "Pokret detektiran!";

  self.registration.showNotification(notificationTitle);
});
