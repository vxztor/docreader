import { contextBridge, ipcRenderer } from 'electron'

// Expõe APIs seguras para o React sem expor Node.js diretamente
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  saveAnnotations: (key: string, data: unknown) =>
    ipcRenderer.invoke('annotations:save', key, data),
  loadAnnotations: (key: string) =>
    ipcRenderer.invoke('annotations:load', key),
  onMenuAction: (callback: (action: string) => void) => {
    const actions = ['menu:open-file', 'menu:zoom-in', 'menu:zoom-out']
    actions.forEach(action =>
      ipcRenderer.on(action, () => callback(action))
    )
  },
})