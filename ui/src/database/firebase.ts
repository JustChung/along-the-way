// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtqO5XVzz3_bxxRLXOLzdBc9ekOoZdOow",
  authDomain: "along-the-way-1c7cb.firebaseapp.com",
  projectId: "along-the-way-1c7cb",
  storageBucket: "along-the-way-1c7cb.firebasestorage.app",
  messagingSenderId: "841288230293",
  appId: "1:841288230293:web:ddbae606f93fa6ea3a029c",
  measurementId: "G-9VNBN7Q110"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
