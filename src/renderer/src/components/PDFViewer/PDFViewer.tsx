import React, { useEffect, useRef, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Worker do PDF.js (necessário para performance)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

interface Props {
  fileBuffer: ArrayBuffer
  zoom: number
  currentPage: number
  onPageCount: (count: number) => void
}

export const PDFViewer: React.FC<Props> = ({
  fileBuffer, zoom, currentPage, onPageCount
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null)

  // Carrega o PDF uma vez
  useEffect(() => {
    const loadPDF = async () => {
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise
      pdfRef.current = pdf
      onPageCount(pdf.numPages)
    }
    loadPDF()
  }, [fileBuffer])

  // Renderiza a página atual quando página ou zoom mudam
  const renderPage = useCallback(async () => {
    if (!pdfRef.current || !canvasRef.current) return

    // Cancela renderização anterior para evitar flickering
    renderTaskRef.current?.cancel()

    const page = await pdfRef.current.getPage(currentPage)
    const viewport = page.getViewport({ scale: zoom })

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderTask = page.render({ canvasContext: ctx, viewport, canvas })
    renderTaskRef.current = renderTask

    try {
      await renderTask.promise
    } catch (e) {
      // RenderingCancelledException é esperado — ignorar
    }
  }, [currentPage, zoom])

  useEffect(() => { renderPage() }, [renderPage])

  return (
    <div className="pdf-page-container">
      <canvas ref={canvasRef} className="pdf-canvas" />
    </div>
  )
}