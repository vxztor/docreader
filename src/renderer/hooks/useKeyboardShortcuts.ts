import { useEffect } from 'react'
import { useReaderStore } from '../store/annotationStore'

export function useKeyboardShortcuts() {
  const { currentPage, pageCount, setPage, setZoom, zoom, toggleRuler } =
    useReaderStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignora quando foco está em input
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          if (currentPage < pageCount) setPage(currentPage + 1)
          break
        case 'ArrowLeft':
        case 'PageUp':
          if (currentPage > 1) setPage(currentPage - 1)
          break
        case '=':
        case '+':
          if (e.ctrlKey) { e.preventDefault(); setZoom(zoom + 0.15) }
          break
        case '-':
          if (e.ctrlKey) { e.preventDefault(); setZoom(zoom - 0.15) }
          break
        case '0':
          if (e.ctrlKey) { e.preventDefault(); setZoom(1.2) }
          break
        case 'r':
        case 'R':
          if (e.ctrlKey) { e.preventDefault(); toggleRuler() }
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentPage, pageCount, zoom])
}