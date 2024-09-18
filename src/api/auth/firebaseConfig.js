// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1FZ2xYsE4TfxmWI3aScCuM3FtXZ8EzJI",
  authDomain: "vendas-nuvem.firebaseapp.com",
  projectId: "vendas-nuvem",
  storageBucket: "vendas-nuvem.appspot.com",
  messagingSenderId: "1091908647792",
  appId: "1:1091908647792:web:e1f418330f4717bbfe2db5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };