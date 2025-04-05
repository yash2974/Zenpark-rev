// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyBwBk72y3xIXUKNGqJzF_VLQADEzSNgBMQ",
  authDomain: "zenpark-28d15.firebaseapp.com",
  projectId: "zenpark-28d15",
  storageBucket: "zenpark-28d15.firebasestorage.app",
  messagingSenderId: "248113294350",
  appId: "1:248113294350:web:729e6e9aa97d0f15afe05f",
  measurementId: "G-B2B52N95QS"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { app, auth };
