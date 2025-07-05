import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBrFpknzO0LwmCKzRbIznQE3erVY0teo80",
  authDomain: "my-react-firebase-app-69fcd.firebaseapp.com",
  projectId: "my-react-firebase-app-69fcd",
  storageBucket: "my-react-firebase-app-69fcd.firebasestorage.app",
  messagingSenderId: "333629247601",
  appId: "1:333629247601:web:c7d83b6270eb66083f8bd0",
  measurementId: "G-DYEQEH86X7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;