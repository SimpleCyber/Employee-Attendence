import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAvVcmuus3HYXXJ82knhIQlrYoSFA_yhi0",
  authDomain: "emloyee-attendence-app.firebaseapp.com",
  projectId: "emloyee-attendence-app",
  storageBucket: "emloyee-attendence-app.firebasestorage.app",
  messagingSenderId: "861954105616",
  appId: "1:861954105616:web:0f2cacaab6f165a3d98595",
  measurementId: "G-Y71CQ0C4WC"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
