import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import Store from 'electron-store'

const store = new Store()

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Abrir documento...',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu:open-file')
        },
        { label: 'Fechar', role: 'quit' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { label: 'Tela Cheia', accelerator: 'F11', role: 'togglefullscreen' },
        {
          label: 'Zoom +',
          accelerator: 'CmdOrCtrl+=',
          click: () => win.webContents.send('menu:zoom-in')
        },
        {
          label: 'Zoom -',
          accelerator: 'CmdOrCtrl+-',
          click: () => win.webContents.send('menu:zoom-out')
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('dialog:open-file', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showOpenDialog(win ?? undefined, {
    filters: [{ name: 'Documentos', extensions: ['pdf', 'docx'] }],
    properties: ['openFile']
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('file:read', async (_event, filePath: string) => {
  const fs = await import('fs/promises')
  const buffer = await fs.readFile(filePath)
  return buffer
})

ipcMain.handle('annotations:save', (_event, fileKey: string, data: unknown) => {
  store.set(`annotations.${fileKey}`, data)
})

ipcMain.handle('annotations:load', (_event, fileKey: string) => {
  return store.get(`annotations.${fileKey}`, [])
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
