// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeMk-LR6nAUHZxgY6XXt3KHLhb3FyWJac",
  authDomain: "todo-app-backend-6e53e.firebaseapp.com",
  projectId: "todo-app-backend-6e53e",
  storageBucket: "todo-app-backend-6e53e.firebasestorage.app",
  messagingSenderId: "973003645663",
  appId: "1:973003645663:web:95809da3fd2141ea443f6a",
  measurementId: "G-FHQLY8KD43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);