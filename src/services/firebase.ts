
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Chaves integradas (fornecidas)
const firebaseConfig = {
  apiKey: 'AIzaSyDEsjS1SVCNrQqHeWwtcIoPcI8CJRCtDVU',
  authDomain: 'emergency-mapper-starter.firebaseapp.com',
  projectId: 'emergency-mapper-starter',
  // Correção do bucket: use o domínio appspot.com
  storageBucket: 'emergency-mapper-starter.appspot.com',
  messagingSenderId: '756381885332',
  appId: '1:756381885332:web:f72f6a8353d45ab39f2581',
  measurementId: 'G-G5GX6SL095'
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics (apenas se suportado e em origem segura)
try { isSupported().then((ok) => { if (ok) getAnalytics(app) }) } catch {}

onAuthStateChanged(auth, (user) => { if (!user) signInAnonymously(auth) })
