import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Highlight {
  id: string
  fileKey: string
  page: number
  color: string
  rects: Array<{ x: number; y: number; width: number; height: number }>
  text: string
  createdAt: number
}

interface ReaderState {
  // Documento atual
  currentFile: string | null
  pageCount: number
  currentPage: number
  zoom: number

  // UI
  isDarkMode: boolean
  isFullscreen: boolean
  isRulerActive: boolean
  rulerHeight: number
  rulerOpacity: number
  activeHighlightColor: string

  // Anotações
  highlights: Highlight[]

  // Actions
  setFile: (path: string) => void
  setPage: (page: number) => void
  setZoom: (zoom: number) => void
  toggleDarkMode: () => void
  toggleRuler: () => void
  setRulerHeight: (h: number) => void
  addHighlight: (h: Highlight) => void
  removeHighlight: (id: string) => void
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      currentFile: null,
      pageCount: 0,
      currentPage: 1,
      zoom: 1.2,
      isDarkMode: true,
      isFullscreen: false,
      isRulerActive: false,
      rulerHeight: 80,
      rulerOpacity: 0.75,
      activeHighlightColor: 'yellow',
      highlights: [],

      setFile: (path) => set({ currentFile: path, currentPage: 1 }),
      setPage: (page) => set({ currentPage: page }),
      setZoom: (zoom) => set({ zoom: Math.min(3, Math.max(0.5, zoom)) }),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      toggleRuler: () => set((s) => ({ isRulerActive: !s.isRulerActive })),
      setRulerHeight: (rulerHeight) => set({ rulerHeight }),
      addHighlight: (h) => set((s) => ({ highlights: [...s.highlights, h] })),
      removeHighlight: (id) => set((s) => ({
        highlights: s.highlights.filter(h => h.id !== id),
      })),
    }),
    {
      name: 'reader-storage',
      // Persiste apenas preferências, não o arquivo aberto
      partialize: (s) => ({
        isDarkMode: s.isDarkMode,
        zoom: s.zoom,
        rulerHeight: s.rulerHeight,
        rulerOpacity: s.rulerOpacity,
        highlights: s.highlights,
      }),
    }
  )
)