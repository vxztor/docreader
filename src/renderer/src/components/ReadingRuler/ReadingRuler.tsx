import React, { useEffect, useState } from 'react'
import './ReadingRuler.css'

interface Props {
  isActive: boolean
  windowHeight: number      // altura da faixa iluminada em pixels
  opacity: number           // 0-1, escuridão das faixas
  containerRef: React.RefObject<HTMLElement>
}

export const ReadingRuler: React.FC<Props> = ({
  isActive, windowHeight, opacity, containerRef
}) => {
  const [mouseY, setMouseY] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      setMouseY(e.clientY - rect.top + container.scrollTop)
    }

    const container = containerRef.current
    container?.addEventListener('mousemove', handleMouseMove)
    return () => container?.removeEventListener('mousemove', handleMouseMove)
  }, [isActive, containerRef])

  if (!isActive) return null

  const halfWindow = windowHeight / 2
  const topHeight = Math.max(0, mouseY - halfWindow)
  const bottomTop = mouseY + halfWindow

  return (
    <div className="reading-ruler" aria-hidden="true">
      {/* Faixa de cima */}
      <div
        className="ruler-overlay ruler-top"
        style={{
          height: `${topHeight}px`,
          opacity,
        }}
      />
      {/* Faixa de baixo — vai até o infinito */}
      <div
        className="ruler-overlay ruler-bottom"
        style={{
          top: `${bottomTop}px`,
          opacity,
        }}
      />
      {/* Linha de guia visual no centro da janela */}
      <div
        className="ruler-guide"
        style={{ top: `${mouseY}px` }}
      />
    </div>
  )
}