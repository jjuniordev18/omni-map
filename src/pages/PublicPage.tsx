
import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../services/firebase'

export default function PublicPage() {
  const [points, setPoints] = useState<any[]>([])
  const [term, setTerm] = useState('')
  useEffect(() => { const qy = query(collection(db, 'emergencyPoints')); const unsub = onSnapshot(qy, s=> setPoints(s.docs.map(d=> ({ id:d.id, ...d.data() })))) ; return ()=> unsub() }, [])
  const rows = useMemo(()=> points.filter(p => !term || (p.title||'').toLowerCase().includes(term.toLowerCase())), [points, term])
  return (
    <div className="page">
      <h2>Consulta Pública</h2>
      <input className="input" placeholder="Buscar por título" value={term} onChange={e=> setTerm(e.target.value)} />
      <table className="table" style={{marginTop:12}}>
        <thead><tr><th>Título</th><th>Tipo</th><th>Descrição</th></tr></thead>
        <tbody>
          {rows.map(p=> (<tr key={p.id}><td>{p.title||'—'}</td><td>{p.type||'—'}</td><td>{p.description||'—'}</td></tr>))}
        </tbody>
      </table>
    </div>
  )
}
