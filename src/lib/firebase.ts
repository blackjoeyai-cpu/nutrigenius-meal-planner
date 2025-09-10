
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-9723804123-a510a",
  appId: "1:485098853651:web:b352c82756487ab11ff6e6",
  storageBucket: "studio-9723804123-a510a.firebasestorage.app",
  apiKey: "AIzaSyCtyC2101Up9LlGqUMd3rV8Z9Y8erl2KdQ",
  authDomain: "studio-9723804123-a510a.firebaseapp.com",
  messagingSenderId: "485098853651",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
