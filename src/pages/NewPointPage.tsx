import { useState, useEffect, useRef } from 'react'
import { db } from '../services/firebase'
import { addDoc, collection } from 'firebase/firestore'
import { Coordinates } from '../types'

export default function NewPointPage() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Ponto de Emergência')
  const [nomeLocal, setNomeLocal] = useState('')
  const [donoPosto, setDonoPosto] = useState('')
  const [pontoReferencia, setPontoReferencia] = useState('')
  const [pontoEmergencia, setPontoEmergencia] = useState('')
  const [minaLoc, setMinaLoc] = useState('Fora da Mina') // Novo Campo
  const [desc, setDesc] = useState('')
  const [coords, setCoords] = useState<Coordinates | null>(null)

  // Imagens convertidas em Base64
  const [photos, setPhotos] = useState<string[]>([])

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracyM: pos.coords.accuracy }),
        (err) => console.error("Erro ao obter localização", err),
        { enableHighAccuracy: true }
      )
    }
  }, [])

  // Função salvadora de memória RAM para Android
  // Encolhe a foto antes de jogar na página
  function resizeAndCompressImage(file: File, maxWidth = 800): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Mantém proporção
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Exporta JPEG cortando até 60% da qualidade invisível a olho nu
          resolve(canvas.toDataURL('image/jpeg', 0.6))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const compressedBase64 = await resizeAndCompressImage(file)
        setPhotos(prev => [...prev, compressedBase64])
      } catch (err) {
        console.error("Erro ao processar imagem", err)
      }
    }

    // Reseta o input para permitir selecionar a mesma foto de novo se quiser
    e.target.value = ''
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function save() {
    if (!coords) {
      alert("Aguardando captura da localização (GPS)... Por favor, permita o acesso ou aguarde.")
      return
    }

    const docToSave = {
      title,
      type,
      nomeLocal,
      donoPosto,
      pontoEmergencia,
      minaLoc,          // <- Incluído o campo ao salvar
      pontoReferencia,
      description: desc,
      coordinates: coords,
      photos: photos,
      createdAt: Date.now()
    }

    // Salvar no Firebase
    try {
      await addDoc(collection(db, 'emergencyPoints'), docToSave)
    } catch (err) {
      console.error("Erro Firebase:", err)
    }

    // Salvar no LocalStorage para exportação em PDF e Consulta Local
    try {
      const existingRecordsStr = localStorage.getItem('my_emergency_records')
      const existingRecords = existingRecordsStr ? JSON.parse(existingRecordsStr) : []
      existingRecords.unshift({ ...docToSave, id: Date.now().toString() })
      localStorage.setItem('my_emergency_records', JSON.stringify(existingRecords))
    } catch (e) {
      console.error("Erro ao salvar localmente", e)
      alert("Erro ao salvar dados localmente. Tente reiniciar o app ou apagar a Rota anterior.")
    }

    alert('Criado!')

    // Zerando tudo após sucesso corretamente
    setTitle('')
    setNomeLocal('')
    setDonoPosto('')
    setPontoReferencia('')
    setPontoEmergencia('')
    setDesc('')
    setPhotos([])
    setType('Ponto de Emergência')
    setMinaLoc('Fora da Mina')
  }

  return (
    <div className="page" style={{ overflowY: 'auto', paddingBottom: '40px' }}>
      <h2>Novo Ponto</h2>
      <div className="form">
        <label className="label">Tipo</label>
        <select value={type} onChange={e => { setType(e.target.value); setDesc(''); }}>
          <option>Nova Torre</option>
          <option>Nova COW</option>
          <option>Novo Poste</option>
          <option>Nova Repetidora</option>
          <option>Outros</option>
        </select>

        <label className="label">Título</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Torre Principal, COW Norte" />

        <label className="label">Nome do Local</label>
        <input className="input" value={nomeLocal} onChange={e => setNomeLocal(e.target.value)} placeholder="Ex.: Torre de Telecom" />

        <label className="label">Dono do Posto</label>
        <input className="input" value={donoPosto} onChange={e => setDonoPosto(e.target.value)} placeholder="Nome do proprietário ou responsável" />

        <label className="label">Ponto de Emergência (Detalhes)</label>
        <input className="input" value={pontoEmergencia} onChange={e => setPontoEmergencia(e.target.value)} placeholder="Ex.: M111, 99" />

        {/* Novo Dropdown solicitado: Dentro ou fora da Mina */}
        <label className="label">Localização da Mina</label>
        <select className="input" value={minaLoc} onChange={e => setMinaLoc(e.target.value)}>
          <option>Fora da Mina</option>
          <option>Dentro da Mina</option>
        </select>

        <label className="label">Ponto de Referência</label>
        <input className="input" value={pontoReferencia} onChange={e => setPontoReferencia(e.target.value)} placeholder="Próximo à rodovia X, Km Y" />

        {type === 'Outros' && (
          <>
            <label className="label">Descreva o Local (Outros)</label>
            <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detalhes específicos sobre este tipo de local" />
          </>
        )}

        <label className="label" style={{ marginTop: '10px' }}>Fotos do Local</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Botão de Câmera */}
          <button className="secondary" onClick={() => cameraInputRef.current?.click()}>
            📸 Câmera
          </button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Botão de Galeria */}
          <button className="secondary" onClick={() => galleryInputRef.current?.click()}>
            🖼️ Galeria
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={galleryInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Galeria Horizontal de Fotos */}
        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative', minWidth: '80px', height: '80px' }}>
                <img src={p} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <button
                  onClick={() => removePhoto(i)}
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '24px', height: '24px', border: 'none', fontSize: '10px', cursor: 'pointer' }}>
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ color: coords ? 'green' : 'orange', fontSize: '14px', margin: '12px 0 8px 0' }}>
          {coords ? `📍 GPS Capturado: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Buscando GPS local...'}
        </div>

        <button className="primary" onClick={save} disabled={!coords} style={{ fontSize: '18px', padding: '16px' }}>Salvar Cadastro</button>
      </div>
    </div>
  )
}
