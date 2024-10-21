// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKISeYeeSCe4vWzjxb9guIJaO4DFhB2-s",
  authDomain: "dashboard-vendas-44df4.firebaseapp.com",
  projectId: "dashboard-vendas-44df4",
  storageBucket: "dashboard-vendas-44df4.appspot.com",
  messagingSenderId: "244116719488",
  appId: "1:244116719488:web:ba5f4236fa32b2d0452365"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };