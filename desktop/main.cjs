const { app, BrowserWindow, dialog, ipcMain, Menu, net, protocol, session, shell } = require('electron');
const path = require('node:path');
const { writeFile } = require('node:fs/promises');
const { pathToFileURL } = require('node:url');

const origin = 'cyberstudios://palettepilot';
const home = origin + '/';
const webRoot = path.join(__dirname, '..', 'dist');
const contentPolicy = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";

protocol.registerSchemesAsPrivileged([
  { scheme: 'cyberstudios', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

async function loadAsset(request) {
  const url = new URL(request.url);
  if (url.host !== 'palettepilot' || request.method !== 'GET') return new Response(null, { status: 404 });
  const asset = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (!/^(index\.html|assets\/[\w.-]+\.(js|css))$/.test(asset)) return new Response(null, { status: 404 });
  const response = await net.fetch(pathToFileURL(path.join(webRoot, asset)).href);
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', contentPolicy);
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(response.body, { status: response.status, headers });
}

function openProject(url) {
  const link = new URL(url);
  if (link.origin === 'https://github.com' && /^\/CyberStudiosTM(?:\/[\w.-]+)?\/?$/i.test(link.pathname)) {
    void shell.openExternal(link.href).catch(error => console.error(error.message));
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1220,
    height: 880,
    minWidth: 340,
    minHeight: 520,
    backgroundColor: '#e9e1f6',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webviewTag: false, preload: path.join(__dirname, 'preload.cjs') },
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (url === home) return;
    event.preventDefault();
    openProject(url);
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  return window.loadURL(home);
}


ipcMain.handle('palette:save', async (event, name, text) => {
  if (event.senderFrame?.url !== home || typeof name !== 'string' || typeof text !== 'string' ||
      !/^[a-z0-9-]{1,83}\.(json|css|gpl)$/.test(name) || Buffer.byteLength(text, 'utf8') > 1024 * 1024) {
    throw new Error('Invalid palette export.');
  }
  const extension = path.extname(name).slice(1);
  const result = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), {
    title: 'Save palette',
    defaultPath: name,
    filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
  });
  if (result.canceled || !result.filePath) return false;
  await writeFile(result.filePath, text, 'utf8');
  return true;
});
app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  protocol.handle('cyberstudios', loadAsset);
  await createWindow();
}).catch(error => {
  console.error(error.message);
  app.exit(1);
});

app.on('window-all-closed', () => app.quit());
