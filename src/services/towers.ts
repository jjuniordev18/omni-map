
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from './firebase'

export async function loadTowers() {
  const qy = query(collection(db, 'towers'))
  const snap = await getDocs(qy)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
}
