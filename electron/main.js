const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;

const isDev = process.env.ELECTRON_DEV === '1';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        autoHideMenuBar: true,
        icon: isDev
            ? path.join(__dirname, '..', 'frontend', 'app', 'favicon.ico')
            : path.join(__dirname, '..', 'frontend', 'out', 'favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        console.log('Loading development URL...');
        mainWindow.loadURL('http://localhost:3000');
    } else {
        console.log('Loading production file...');
        const indexPath = path.join(__dirname, '..', 'frontend', 'out', 'index.html');

        if (!fs.existsSync(indexPath)) {
            dialog.showErrorBox('Error', `Frontend file not found at: ${indexPath}`);
            return;
        }

        mainWindow.loadFile(indexPath).catch(err => {
            dialog.showErrorBox('Error', `Failed to load frontend: ${err.message}`);
        });
    }

    // Always open DevTools for debugging
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startBackend() {
    if (isDev) {
        console.log('In Dev mode, assuming backend is started via concurrently script.');
        return;
    }

    console.log('Starting backend in production mode...');
    const backendEntry = path.join(__dirname, '..', 'backend', 'index.js');
    const backendCwd = path.join(__dirname, '..', 'backend');

    if (!fs.existsSync(backendEntry)) {
        console.error(`Backend entry not found at: ${backendEntry}`);
        return;
    }

    backendProcess = spawn('node', [backendEntry], {
        cwd: backendCwd,
        stdio: 'ignore', // Ignore stdio to prevent window creation/attachment
        windowsHide: true, // Explicitly hide the window on Windows
        env: { ...process.env, PORT: 5000 }
    });

    backendProcess.on('error', (err) => {
        console.error('Failed to start backend:', err);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    startBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (backendProcess) {
        console.log('Killing backend process...');
        backendProcess.kill();
    }
});
