import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXkMc8NO3q6I-I6WifuYUPBxlzOVkuH7U",
  authDomain: "youthforenvironment.firebaseapp.com",
  projectId: "youthforenvironment",
  storageBucket: "youthforenvironment.firebasestorage.app",
  messagingSenderId: "674998656661",
  appId: "1:674998656661:web:1deda9abd50a79009fc59c",
  measurementId: "G-7VWQB7M0P3"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
