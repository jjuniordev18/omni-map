
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const required = ['apiKey', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const missing = required.filter(k => !firebaseConfig[k as keyof typeof firebaseConfig])

if (missing.length > 0) {
  console.error(`Firebase config missing: ${missing.join(', ')}. Create .env file based on .env.example`)
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics (apenas se suportado e em origem segura)
try { isSupported().then((ok) => { if (ok) getAnalytics(app) }) } catch {}

onAuthStateChanged(auth, (user) => { if (!user) signInAnonymously(auth) })
