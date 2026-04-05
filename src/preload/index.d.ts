import { ElectronAPI } from '@electron-toolkit/preload'

interface ReaderElectronAPI {
  openFile: () => Promise<string | null>
  readFile: (path: string) => Promise<Uint8Array>
  saveAnnotations: (key: string, data: unknown) => Promise<void>
  loadAnnotations: (key: string) => Promise<unknown>
  onMenuAction: (callback: (action: string) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: ReaderElectronAPI
  }
}
