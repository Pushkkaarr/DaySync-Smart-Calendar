const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

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
        mainWindow.loadURL('http://localhost:3000');
    } else {
        const indexPath = path.join(__dirname, '..', 'frontend', 'out', 'index.html');

        if (!fs.existsSync(indexPath)) {
            dialog.showErrorBox('Error', `Frontend file not found at: ${indexPath}`);
            return;
        }

        mainWindow.loadFile(indexPath).catch(err => {
            dialog.showErrorBox('Error', `Failed to load frontend: ${err.message}`);
        });
    }

    // Open DevTools only in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
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
    // Cleanup if needed
});
