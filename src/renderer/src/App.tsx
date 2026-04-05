import { useState } from 'react'
import { useReaderStore } from './store/annotationStore'

function App(): React.JSX.Element {
  const { currentFile, setFile } = useReaderStore()
  const [isDark, setIsDark] = useState(true)
  const [openError, setOpenError] = useState<string | null>(null)

  const handleOpenFile = async (): Promise<void> => {
    try {
      const filePath = await window.electronAPI.openFile()
      if (filePath) {
        setFile(filePath)
        setOpenError(null)
      }
    } catch {
      setOpenError('Não foi possível abrir o seletor de arquivos.')
    }
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: isDark ? '#1a1a2e' : '#f5f5f5',
        color: isDark ? '#e0e0e0' : '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, sans-serif'
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 20px',
          background: isDark ? '#16213e' : '#ffffff',
          borderBottom: `1px solid ${isDark ? '#0f3460' : '#ddd'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <button onClick={handleOpenFile} style={btnStyle}>
          📂 Abrir Documento
        </button>
        <button onClick={() => setIsDark(!isDark)} style={btnStyle}>
          {isDark ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
        {currentFile && (
          <span style={{ fontSize: '13px', opacity: 0.6 }}>{currentFile.split('\\').pop()}</span>
        )}
        {openError && <span style={{ fontSize: '13px', color: '#ff8a80' }}>{openError}</span>}
      </div>

      {/* Área principal */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {!currentFile ? (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <div style={{ fontSize: '64px' }}>📄</div>
            <p style={{ marginTop: '16px' }}>Clique em &quot;Abrir Documento&quot; para começar</p>
            <p style={{ fontSize: '13px' }}>Suporta PDF e DOCX</p>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <p>Arquivo aberto: {currentFile}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#0f3460',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px'
}

export default App
