import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import Store from 'electron-store'

const store = new Store()

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'hiddenInset', // título integrado, visual moderno
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Menu nativo com atalhos
  const menu = Menu.buildFromTemplate([
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Abrir documento...',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu:open-file'),
        },
        { label: 'Fechar', role: 'quit' },
      ],
    },
    {
      label: 'Visualizar',
      submenu: [
        { label: 'Tela Cheia', accelerator: 'F11', role: 'togglefullscreen' },
        { label: 'Zoom +', accelerator: 'CmdOrCtrl+=', click: () => win.webContents.send('menu:zoom-in') },
        { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', click: () => win.webContents.send('menu:zoom-out') },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

// IPC: abrir arquivo via diálogo nativo
ipcMain.handle('dialog:open-file', async () => {
  const result = await dialog.showOpenDialog({
    filters: [
      { name: 'Documentos', extensions: ['pdf', 'docx'] },
    ],
    properties: ['openFile'],
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

// IPC: ler arquivo como buffer (para PDF.js)
ipcMain.handle('file:read', async (_event, filePath: string) => {
  const fs = await import('fs/promises')
  const buffer = await fs.readFile(filePath)
  return buffer
})

// IPC: persistência de anotações
ipcMain.handle('annotations:save', (_event, fileKey: string, data: unknown) => {
  store.set(`annotations.${fileKey}`, data)
})
ipcMain.handle('annotations:load', (_event, fileKey: string) => {
  return store.get(`annotations.${fileKey}`, [])
})

app.whenReady().then(createWindow)