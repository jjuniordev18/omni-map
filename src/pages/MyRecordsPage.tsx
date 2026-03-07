import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import { db } from '../services/firebase'
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'

const ADMIN_PASSWORD = 'admin@1230'

export default function MyRecordsPage() {
    const [records, setRecords] = useState<any[]>([])

    useEffect(() => {
        loadRecords()
    }, [])

    function loadRecords() {
        const data = localStorage.getItem('my_emergency_records')
        if (data) {
            try {
                setRecords(JSON.parse(data))
            } catch (e) {
                console.error("Erro ao ler registros locais", e)
                setRecords([])
            }
        } else {
            setRecords([])
        }
    }

    async function clearRecords() {
        const pass = prompt('Digite a senha de administrador para apagar TODOS os registros locais:')
        if (pass === ADMIN_PASSWORD) {
            if (confirm('ATENÇÃO: Isso apagará apenas os registros deste aparelho. Deseja continuar?')) {
                localStorage.removeItem('my_emergency_records')
                loadRecords()
            }
        } else if (pass !== null) {
            alert('Senha incorreta!')
        }
    }

    async function deleteSingleRecord(record: any) {
        const pass = prompt('Digite a senha de administrador para excluir este registro:')
        if (pass === ADMIN_PASSWORD) {
            if (confirm('Deseja realmente excluir este registro?')) {
                // 1. Remover do LocalStorage
                const updated = records.filter(r => r.id !== record.id)
                localStorage.setItem('my_emergency_records', JSON.stringify(updated))
                setRecords(updated)

                // 2. Tentar remover do Firebase se tivermos o ID ou dados correspondentes
                try {
                    // Como o ID local pode ser diferente do ID do Firestore, buscamos pelo timestamp e título
                    const q = query(
                        collection(db, 'emergencyPoints'),
                        where('createdAt', '==', record.createdAt),
                        where('title', '==', record.title)
                    )
                    const querySnapshot = await getDocs(q)
                    querySnapshot.forEach(async (snapshot) => {
                        await deleteDoc(doc(db, 'emergencyPoints', snapshot.id))
                    })
                } catch (err) {
                    console.error("Erro ao deletar no Firebase:", err)
                }
                alert('Registro excluído com sucesso!')
            }
        } else if (pass !== null) {
            alert('Senha incorreta!')
        }
    }

    function openRoute(lat: number, lng: number) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
    }

    function exportPDF() {
        const docPDF = new jsPDF()

        docPDF.setFontSize(18)
        docPDF.text('Meus Registros - OmniMap', 14, 22)

        docPDF.setFontSize(12)
        let y = 35

        if (records.length === 0) {
            docPDF.text('Nenhum registro encontrado.', 14, y)
        } else {
            records.forEach((record, index) => {
                const dateStr = new Date(record.createdAt).toLocaleString('pt-BR')

                if (y > 250) {
                    docPDF.addPage()
                    y = 20
                }

                docPDF.setFont('helvetica', 'bold')
                docPDF.text(`${index + 1}. ${record.title || record.type || 'Sem título'}`, 14, y)
                y += 7

                docPDF.setFont('helvetica', 'normal')
                docPDF.text(`Criado em: ${dateStr}`, 14, y)
                y += 7

                if (record.minaLoc) {
                    docPDF.text(`Localização: ${record.minaLoc}`, 14, y)
                    y += 7
                }

                if (record.coordinates) {
                    docPDF.text(`GPS: ${record.coordinates.lat.toFixed(6)}, ${record.coordinates.lng.toFixed(6)}`, 14, y)
                    y += 7
                }

                if (record.description) {
                    const splitDesc = docPDF.splitTextToSize(`Descrição: ${record.description}`, 180)
                    docPDF.text(splitDesc, 14, y)
                    y += (splitDesc.length * 7)
                }

                if (record.photos && record.photos.length > 0) {
                    docPDF.text(`Há ${record.photos.length} foto(s) registrada(s).`, 14, y)
                    try {
                        y += 5
                        let imgX = 14
                        const limit = Math.min(record.photos.length, 3)
                        for (let i = 0; i < limit; i++) {
                            docPDF.addImage(record.photos[i], 'JPEG', imgX, y, 50, 50)
                            imgX += 55
                        }

                        y += 55
                    } catch (e) {
                        console.log("Erro ao embutir img PDF", e)
                    }
                }

                y += 10
            })
        }

        docPDF.save('meus-registros.pdf')
    }

    return (
        <div className="page" style={{ overflowY: 'auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Meus Registros</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="primary" onClick={exportPDF}>Baixar PDF</button>
                    <button className="secondary" onClick={clearRecords} style={{ background: '#f44336', color: 'white' }}>Limpar Dados</button>
                </div>
            </div>

            <p style={{ color: 'var(--text-color)', opacity: 0.8, marginBottom: '1.5rem', fontSize: '14px' }}>
                Estes dados estão apenas no seu aparelho no momento. Eles permitem gerar PDF das suas medições ou encontrar a rota até eles.
            </p>

            {records.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '8px' }}>
                    <p style={{ margin: 0 }}>Você ainda não tem registros locais.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {records.map((r, i) => (
                        <div key={r.id || i} style={{ border: '1px solid var(--input-border)', padding: '1rem', borderRadius: '8px', background: 'var(--card-bg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>{r.title || r.type || 'Sem Título'}</h3>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {r.coordinates && (
                                        <button
                                            onClick={() => openRoute(r.coordinates.lat, r.coordinates.lng)}
                                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                            📍 Gerar Rota
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteSingleRecord(r)}
                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </div>

                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px' }}><strong>Data:</strong> {new Date(r.createdAt).toLocaleString('pt-BR')}</p>
                            {r.minaLoc && <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px' }}><strong>Localização:</strong> {r.minaLoc}</p>}
                            {r.coordinates && <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px' }}><strong>GPS:</strong> {r.coordinates.lat.toFixed(5)}, {r.coordinates.lng.toFixed(5)}</p>}

                            {r.photos && r.photos.length > 0 && (
                                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginTop: '10px' }}>
                                    {r.photos.map((photo: string, idx: number) => (
                                        <img key={idx} src={photo} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
