// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAjj8PZj77e2hYRxx2eiZbnUrqJNK9aKsw",
  authDomain: "zenpark-feabf.firebaseapp.com",
  projectId: "zenpark-feabf",
  storageBucket: "zenpark-feabf.appspot.com",
  messagingSenderId: "664418493611",
  appId: "1:664418493611:web:a3cb973f4235c2131343ee",
  measurementId: "G-KSHQWX5NS2"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
