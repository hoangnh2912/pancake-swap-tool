import { BrowserWindow, app, ipcMain } from 'electron'
import path from 'node:path'
import { PrismaClient } from '../prisma/client'
import './server'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const __non_webpack_require__: NodeRequire

// eslint-disable-next-line @typescript-eslint/no-var-requires
const solc = __non_webpack_require__('solc')

// ── Solc version management ───────────────────────────────────────────────────

const BUILTIN_VERSION = '0.8.35'

const SOLC_VERSION_MAP: Record<string, string> = {
    '0.8.35': 'v0.8.35+commit.47b9dedd',
    '0.8.34': 'v0.8.34+commit.80d5c536',
    '0.8.33': 'v0.8.33+commit.64118f21',
    '0.8.32': 'v0.8.32+commit.ebbd65e5',
    '0.8.31': 'v0.8.31+commit.fd3a2265',
    '0.8.30': 'v0.8.30+commit.73712a01',
    '0.8.29': 'v0.8.29+commit.ab55807c',
    '0.8.28': 'v0.8.28+commit.7893614a',
    '0.8.27': 'v0.8.27+commit.40a35a09',
    '0.8.26': 'v0.8.26+commit.8a97fa7a',
    '0.8.25': 'v0.8.25+commit.b61c2a91',
    '0.8.24': 'v0.8.24+commit.e11b9ed9',
    '0.8.23': 'v0.8.23+commit.f704f362',
    '0.8.22': 'v0.8.22+commit.4fc1097e',
    '0.8.21': 'v0.8.21+commit.d9974bed',
    '0.8.20': 'v0.8.20+commit.a1b79de6',
    '0.8.19': 'v0.8.19+commit.7dd6d404',
    '0.8.17': 'v0.8.17+commit.8df45f5f',
}

const solcCache = new Map<string, any>()

function getSolcForVersion(version: string): Promise<any> {
    if (version === BUILTIN_VERSION) return Promise.resolve(solc)
    if (solcCache.has(version)) return Promise.resolve(solcCache.get(version))

    const fullVersion = SOLC_VERSION_MAP[version]
    if (!fullVersion) return Promise.reject(new Error(`Version không hợp lệ: ${version}`))

    return new Promise((resolve, reject) => {
        solc.loadRemoteVersion(fullVersion, (err: any, snapshot: any) => {
            if (err) reject(new Error(`Tải solc ${version} thất bại: ${err.message}`))
            else {
                solcCache.set(version, snapshot)
                resolve(snapshot)
            }
        })
    })
}

// ── Compile IPC ───────────────────────────────────────────────────────────────
ipcMain.handle('compile-contract', async (_event, sourceCode: string, solcVersion: string) => {
    const version = solcVersion || '0.8.27'
    const compiler = await getSolcForVersion(version)

    const input = JSON.stringify({
        language: 'Solidity',
        sources: { 'token.sol': { content: sourceCode } },
        settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
    })

    const output = JSON.parse(compiler.compile(input))

    if (output.errors) {
        const errors = (output.errors as any[]).filter((e) => e.severity === 'error')
        if (errors.length > 0) {
            throw new Error(errors.map((e: any) => e.formattedMessage).join('\n'))
        }
    }

    const candidates: { contractName: string; abi: any[]; bytecode: string }[] = []
    for (const fileName in output.contracts) {
        for (const contractName in output.contracts[fileName]) {
            const contract = output.contracts[fileName][contractName]
            const bytecode = contract.evm?.bytecode?.object
            if (bytecode && bytecode.length > 0) {
                candidates.push({ contractName, abi: contract.abi, bytecode })
            }
        }
    }

    if (candidates.length === 0) throw new Error('Không tìm thấy contract hợp lệ')
    candidates.sort((a, b) => b.abi.length - a.abi.length)
    return candidates[0]
})

// ── Config IPC ────────────────────────────────────────────────────────────────
const prisma = new PrismaClient({
    datasourceUrl: app.isPackaged
        ? `file:${path.join(app.getAppPath(), '..', 'prisma', 'auto-deploy.sqlite')}`
        : `file:${path.join(app.getAppPath(), 'prisma', 'auto-deploy.sqlite')}`,
})

app.on('before-quit', async () => {
    await prisma.$disconnect()
})

ipcMain.handle('load-config', async () => {
    return await prisma.config.findUnique({ where: { id: 'default' } })
})

ipcMain.handle('save-config', async (_event, data: Record<string, string>) => {
    await prisma.config.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...data },
        update: data,
    })
})

// Return available solc versions for the settings UI
ipcMain.handle('get-solc-versions', () => {
    return Object.keys(SOLC_VERSION_MAP).map((v) => ({
        value: v,
        label: v === BUILTIN_VERSION ? `${v} (built-in)` : v === '0.8.27' ? `${v} (default)` : v,
    }))
})

// ── Window ────────────────────────────────────────────────────────────────────
if (require('electron-squirrel-startup')) {
    app.quit()
}

let mainWindow: BrowserWindow

const createWindow = (): void => {
    mainWindow = new BrowserWindow({
        center: true,
        webPreferences: {
            contextIsolation: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        width: 1400,
        height: 900,
        icon: './src/favicon.ico',
    })
    mainWindow.setMenuBarVisibility(false)
    mainWindow.maximize()
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
