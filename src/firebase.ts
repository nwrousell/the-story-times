// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVIi61lPlUhB8an06zzHmc_yDo9gTnMCI",
  authDomain: "newspaper-aa1c3.firebaseapp.com",
  projectId: "newspaper-aa1c3",
  storageBucket: "newspaper-aa1c3.appspot.com",
  messagingSenderId: "890622593971",
  appId: "1:890622593971:web:d26d499a8c546b16eb19c6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore()