import { useCallback } from 'react'
import { useReaderStore } from '../../store/annotationStore'

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink'

export const COLOR_MAP: Record<HighlightColor, string> = {
  yellow: 'rgba(255, 235, 59, 0.45)',
  green:  'rgba(76, 175, 80, 0.40)',
  blue:   'rgba(33, 150, 243, 0.40)',
  pink:   'rgba(233, 30, 99, 0.40)',
}

export function useHighlighter(pageNumber: number, fileKey: string) {
  const { addHighlight } = useReaderStore()

  const captureSelection = useCallback((color: HighlightColor) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const range = selection.getRangeAt(0)
    const rects = Array.from(range.getClientRects()).map(r => ({
      x: r.x, y: r.y, width: r.width, height: r.height,
    }))

    // Salva a posição relativa ao container da página
    const container = document.getElementById(`page-${pageNumber}`)
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    const normalizedRects = rects.map(r => ({
      x: (r.x - containerRect.x) / containerRect.width,
      y: (r.y - containerRect.y) / containerRect.height,
      width: r.width / containerRect.width,
      height: r.height / containerRect.height,
    }))

    addHighlight({
      id: crypto.randomUUID(),
      fileKey,
      page: pageNumber,
      color,
      rects: normalizedRects,
      text: selection.toString(),
      createdAt: Date.now(),
    })

    selection.removeAllRanges()
  }, [pageNumber, fileKey, addHighlight])

  return { captureSelection }
}