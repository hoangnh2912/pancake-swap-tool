import './setup'

import { BrowserWindow, Menu, app, autoUpdater, dialog, ipcMain } from 'electron'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { Prisma, PrismaClient } from '../prisma/client'
import { startServer } from './server'
import { PROJECT_EXT, decodeProject, encodeProject } from './utils/projectFile'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
// __non_webpack_require__ bypasses webpack bundling and uses Node.js native require
declare const __non_webpack_require__: NodeRequire

// eslint-disable-next-line @typescript-eslint/no-var-requires
const solc = require('solc')

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

// Download soljson.js content with redirect following
function fetchSoljson(url: string, redirects = 5): Promise<string> {
    return new Promise((resolve, reject) => {
        if (redirects < 0) { reject(new Error('Too many redirects')); return }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const https = require('node:https')
        https.get(url, (res: any) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume()
                fetchSoljson(res.headers.location, redirects - 1).then(resolve).catch(reject)
                return
            }
            if (res.statusCode !== 200) { res.resume(); reject(new Error(`HTTP ${res.statusCode}`)); return }
            const chunks: Buffer[] = []
            res.on('data', (c: Buffer) => chunks.push(c))
            res.on('end', () => resolve(Buffer.concat(chunks).toString()))
            res.on('error', reject)
        }).on('error', reject)
    })
}

function getSolcForVersion(version: string): Promise<any> {
    if (version === BUILTIN_VERSION) return Promise.resolve(solc)
    if (solcCache.has(version)) return Promise.resolve(solcCache.get(version))

    const fullVersion = SOLC_VERSION_MAP[version]
    if (!fullVersion) return Promise.reject(new Error(`Version không hợp lệ: ${version}`))

    const url = `https://binaries.soliditylang.org/bin/soljson-${fullVersion}.js`
    return fetchSoljson(url).then(code => {
        // solc's loadRemoteVersion uses `module.constructor` (Node.js Module class) to
        // evaluate soljson via _compile(). In webpack, module.constructor is webpack's
        // class — not Node.js's. Use __non_webpack_require__('module') to get the real one.
        const NodeModule = __non_webpack_require__('module')
        const soljsonMod = new NodeModule()
        soljsonMod._compile(code, `soljson-${fullVersion}.js`)
        const snapshot = solc.setupMethods(soljsonMod.exports)
        solcCache.set(version, snapshot)
        return snapshot
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
const DB_PATH = app.isPackaged
    ? path.join(app.getAppPath(), '..', 'prisma', 'auto-deploy.sqlite')
    : path.join(app.getAppPath(), 'prisma', 'auto-deploy.sqlite')
const prisma = new PrismaClient({ datasourceUrl: `file:${DB_PATH}` })

// Ghi nốt thay đổi vào file .adp trước khi thoát
let quitting = false
app.on('before-quit', (event) => {
    if (quitting) return
    event.preventDefault()
    quitting = true
    flushProject().finally(async () => {
        await prisma.$disconnect()
        app.quit()
    })
})

ipcMain.handle('load-config', async (_event, tabId?: string) => {
    const id = tabId || 'default'
    // Retry vài lần nếu SQLite đang bị lock (ví dụ 2 instance app khởi động cùng lúc) —
    // nếu không, renderer nhận promise reject, form hiển thị trống (giống mất dữ liệu)
    // trong khi dữ liệu vẫn còn nguyên trong DB.
    for (let attempt = 0; ; attempt++) {
        try {
            return await prisma.config.findUnique({ where: { id } })
        } catch (err) {
            if (attempt >= 3) throw err
            await new Promise((r) => setTimeout(r, 300))
        }
    }
})

ipcMain.handle('save-config', async (_event, data: Record<string, string>, tabId?: string) => {
    const id = tabId || 'default'
    await prisma.config.upsert({
        where: { id },
        create: { id, ...data } as any,
        update: data as any,
    })
})

// ── File dự án .adp — NGUỒN DỮ LIỆU GỐC ─────────────────────────────────────
// SQLite chỉ là cache làm việc. Mọi thay đổi DB (IPC save-config, Hono/ZenStack ScanWallet,
// MCP headless ghi thẳng file DB) được phát hiện qua mtime file DB → tự ghi lại vào file .adp
// đang mở. Mật khẩu chỉ giữ trong RAM. Không có file đang mở thì renderer chặn UI ở màn hình
// chọn/tạo file.
let currentProject: { path: string; password: string } | null = null
let pendingOpenPath: string | null = null // file mở từ Finder/Explorer trước khi renderer sẵn sàng
let lastFlushedMtime = 0

// Cache meta (máy local): cache DB hiện thuộc file nào, đã flush tới mtime nào — để biết cache
// có thay đổi chưa ghi vào file (vd MCP chạy lúc app tắt) khi mở lại đúng file đó.
const cacheMetaPath = () => path.join(app.getPath('userData'), 'project-cache.json')
const readCacheMeta = (): { path: string | null; flushedMtime: number; db?: string; version?: string } | null => {
    try {
        return JSON.parse(fs.readFileSync(cacheMetaPath(), 'utf8'))
    } catch {
        return null
    }
}
const dbMtime = () => fs.statSync(DB_PATH).mtimeMs

// File mở gần đây (tối đa 10, bỏ file đã bị xoá/di chuyển). Chưa có danh sách → lấy file trong cache meta.
const recentPath = () => path.join(app.getPath('userData'), 'recent-projects.json')
const readRecent = (): string[] => {
    let list: unknown
    try {
        list = JSON.parse(fs.readFileSync(recentPath(), 'utf8'))
    } catch {
        list = [readCacheMeta()?.path]
    }
    return Array.isArray(list) ? list.filter((p): p is string => typeof p === 'string' && fs.existsSync(p)) : []
}
const writeRecent = (list: string[]) => {
    fs.writeFileSync(recentPath(), JSON.stringify(list.slice(0, 10)))
    buildMenu()
}
const addRecent = (filePath: string) => {
    writeRecent([filePath, ...readRecent().filter((p) => p !== filePath)])
    app.addRecentDocument(filePath)
}

// Chỉ giữ field có trong schema hiện tại — file từ bản cũ/mới hơn không làm Prisma lỗi
const pickFields = (rows: any[], fields: Record<string, string>) =>
    rows.map((r) => Object.fromEntries(Object.keys(fields).filter((k) => k in r).map((k) => [k, r[k]])))

const updateTitle = () =>
    mainWindow?.setTitle(currentProject ? `${path.basename(currentProject.path)} — auto-deploy` : 'auto-deploy')

async function writeProjectFile() {
    if (!currentProject) return
    const mtime = dbMtime()
    const file = encodeProject(
        { config: await prisma.config.findMany(), scanWallet: await prisma.scanWallet.findMany() },
        currentProject.password
    )
    // Ghi file tạm rồi rename — lỗi giữa chừng không làm hỏng file .adp cũ
    fs.writeFileSync(`${currentProject.path}.tmp`, file)
    fs.renameSync(`${currentProject.path}.tmp`, currentProject.path)
    lastFlushedMtime = mtime
    fs.writeFileSync(cacheMetaPath(), JSON.stringify({ path: currentProject.path, flushedMtime: mtime, db: DB_PATH, version: app.getVersion() }))
}

// Mọi lần ghi file chạy tuần tự. force=false: chỉ ghi khi DB đổi kể từ lần ghi trước.
let flushChain: Promise<void> = Promise.resolve()
function flushProject(force = false): Promise<void> {
    flushChain = flushChain
        .then(() => (currentProject && (force || dbMtime() > lastFlushedMtime) ? writeProjectFile() : undefined))
        .catch((err) => {
            mainWindow?.webContents.send('project-save-error', String(err?.message || err))
        })
    return flushChain
}

let flushTimer: NodeJS.Timeout | null = null
fs.watchFile(DB_PATH, { interval: 1000 }, (curr) => {
    if (!currentProject || curr.mtimeMs <= lastFlushedMtime) return
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = setTimeout(() => flushProject(), 1500)
})

const readTabs = async () => {
    const g = await prisma.config.findUnique({ where: { id: '_global' } })
    try {
        const tabs = JSON.parse(g?.tabsJson || 'null')
        return Array.isArray(tabs) && tabs.length > 0 ? tabs : null
    } catch {
        return null
    }
}

const requestOpen = (filePath: string) => {
    if (mainWindow && !mainWindow.webContents.isLoading()) {
        mainWindow.webContents.send('project-open-request', filePath)
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    } else {
        pendingOpenPath = filePath
    }
}

ipcMain.handle('project-info', async () => ({
    path: currentProject?.path ?? null,
    recent: readRecent(),
    tabs: currentProject ? await readTabs() : null,
}))

ipcMain.handle('project-take-pending', () => {
    const p = pendingOpenPath
    pendingOpenPath = null
    return p
})

ipcMain.handle('project-pick-open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Auto Deploy Project', extensions: [PROJECT_EXT] }],
    })
    return canceled ? null : filePaths[0] ?? null
})

ipcMain.handle('project-open', async (_event, filePath: string, password: string) => {
    const payload = decodeProject(fs.readFileSync(filePath), password) // sai mật khẩu → throw ở đây
    await flushProject() // ghi nốt thay đổi của file đang mở trước khi thay cache
    const meta = readCacheMeta()
    // OTA (Squirrel) cài bản mới vào app-x.y.z\ khác → DB rỗng mới, không phải cache của file này.
    // Thiếu check db/version thì DB rỗng bị coi là "mới hơn" và ghi đè mất dữ liệu file .adp.
    const cacheNewer =
        meta?.path === filePath &&
        meta.db === DB_PATH &&
        meta.version === app.getVersion() &&
        dbMtime() > meta.flushedMtime
    if (!cacheNewer) {
        const config = pickFields(payload.config, Prisma.ConfigScalarFieldEnum)
        // File .adp bản đầu lưu tabs ngoài config — chuyển vào row _global
        if (Array.isArray(payload.tabs)) {
            const g = config.find((c) => c.id === '_global')
            if (!g) config.push({ id: '_global', tabsJson: JSON.stringify(payload.tabs) })
            else if (!g.tabsJson) g.tabsJson = JSON.stringify(payload.tabs)
        }
        await prisma.$transaction([
            prisma.scanWallet.deleteMany(),
            prisma.config.deleteMany(),
            prisma.config.createMany({ data: config as any }),
            prisma.scanWallet.createMany({ data: pickFields(payload.scanWallet, Prisma.ScanWalletScalarFieldEnum) as any }),
        ])
    }
    currentProject = { path: filePath, password }
    if (cacheNewer) {
        await flushProject(true) // cache có thay đổi chưa ghi (vd MCP chạy khi app tắt) → ghi vào file
    } else {
        lastFlushedMtime = dbMtime()
        fs.writeFileSync(cacheMetaPath(), JSON.stringify({ path: filePath, flushedMtime: lastFlushedMtime, db: DB_PATH, version: app.getVersion() }))
    }
    updateTitle()
    addRecent(filePath)
    return { tabs: await readTabs() }
})

// Tạo file mới / Lưu thành: ghi dữ liệu hiện có ra file mới, từ đó làm việc trên file mới
ipcMain.handle('project-save-as', async (_event, password: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: currentProject?.path ?? `du-an-${new Date().toISOString().slice(0, 10)}.${PROJECT_EXT}`,
        filters: [{ name: 'Auto Deploy Project', extensions: [PROJECT_EXT] }],
    })
    if (canceled || !filePath) return null
    await flushProject() // file cũ nhận nốt thay đổi trước khi chuyển sang file mới
    currentProject = { path: filePath, password }
    await flushProject(true)
    updateTitle()
    addRecent(filePath)
    return filePath
})

// Đóng file: ghi nốt vào .adp rồi xoá cache — không để private key dạng rõ trên máy khi không mở file
ipcMain.handle('project-close', async () => {
    if (!currentProject) return
    const write = flushChain.then(() => writeProjectFile())
    flushChain = write.catch(() => {})
    await write // ghi lỗi → throw, KHÔNG xoá cache (tránh mất dữ liệu chưa ghi)
    currentProject = null
    await prisma.$transaction([prisma.scanWallet.deleteMany(), prisma.config.deleteMany()])
    fs.writeFileSync(
        cacheMetaPath(),
        JSON.stringify({ path: null, flushedMtime: dbMtime(), db: DB_PATH, version: app.getVersion() })
    )
    updateTitle()
})

ipcMain.handle('project-clear-recent', () => writeRecent([]))

ipcMain.handle('project-save', async () => {
    if (!currentProject) throw new Error('Chưa có file đang mở')
    await flushProject(true)
    return currentProject.path
})

ipcMain.handle('project-set-tabs', async (_event, tabs: unknown) => {
    await prisma.config.upsert({
        where: { id: '_global' },
        create: { id: '_global', tabsJson: JSON.stringify(tabs) },
        update: { tabsJson: JSON.stringify(tabs) },
    })
})

const findProjectArg = (argv: string[]) => argv.find((a) => a.toLowerCase().endsWith(`.${PROJECT_EXT}`)) ?? null

// macOS: Finder double-click (kể cả khi app chưa chạy) — phải đăng ký trước 'ready'
app.on('open-file', (event, filePath) => {
    event.preventDefault()
    requestOpen(filePath)
})

// Windows: double-click mở instance mới với đường dẫn file trong argv
pendingOpenPath = findProjectArg(process.argv)

// Windows: đăng ký đuôi .adp vào HKCU (không cần quyền admin). Installer (Squirrel) gọi lúc cài/update,
// bản ZIP gọi mỗi lần mở app.
const ADP_PROG_ID = 'AutoDeploy.Project'
// Squirrel: app nằm ở app-x.y.z\ (đổi mỗi lần update), Update.exe + stub <tên>.exe ở thư mục cha
const squirrelRoot = path.resolve(path.dirname(process.execPath), '..')
const isSquirrelInstall = process.platform === 'win32' && fs.existsSync(path.join(squirrelRoot, 'Update.exe'))
const regCmd = (args: string[]) => {
    try {
        execFileSync('reg', args, { stdio: 'ignore', windowsHide: true })
    } catch (err) {
        console.error('[reg]', args.join(' '), err)
    }
}

function registerWindowsFileAssociation() {
    if (process.platform !== 'win32' || !app.isPackaged) return
    const progId = ADP_PROG_ID
    // Trỏ vào stub ở thư mục cha → luôn chạy bản mới nhất sau mỗi lần update
    const exe = isSquirrelInstall ? path.join(squirrelRoot, path.basename(process.execPath)) : process.execPath
    const reg = (key: string, value: string) =>
        regCmd(['add', `HKCU\\Software\\Classes\\${key}`, '/ve', '/d', value, '/f'])
    reg(`.${PROJECT_EXT}`, progId)
    reg(progId, 'Auto Deploy Project')
    reg(`${progId}\\DefaultIcon`, `"${exe}",0`)
    reg(`${progId}\\shell\\open\\command`, `"${exe}" "%1"`)
}

// ── OTA update (Windows/Squirrel) ────────────────────────────────────────────
// update.electronjs.org đọc GitHub Releases (public) của repo: cần RELEASES + .nupkg do CI upload.
// shortcut: chỉ Windows — macOS cần code signing mới auto-update được, làm khi có Apple Developer ID.
type UpdateStatus = 'unsupported' | 'idle' | 'checking' | 'downloading' | 'latest' | 'downloaded' | 'error'
let updateState: { status: UpdateStatus; message?: string } = {
    status: process.platform === 'win32' && app.isPackaged ? 'idle' : 'unsupported',
}
let downloadedRelease = ''
const setUpdateState = (status: UpdateStatus, message?: string) => {
    updateState = { status, message }
    mainWindow?.webContents.send('update-status', updateState)
}

async function promptInstallUpdate() {
    const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Khởi động lại & cập nhật', 'Để sau'],
        defaultId: 0,
        cancelId: 1,
        message: `Đã tải xong bản cập nhật ${downloadedRelease}`.trim(),
        detail:
            'Dữ liệu được ghi vào file .adp trước khi khởi động lại. ' +
            'Không khởi động lại khi đang chạy automation — chọn "Để sau", bản mới sẽ được cài ở lần mở app tới.',
    })
    if (response !== 0) return
    await flushProject()
    autoUpdater.quitAndInstall()
}

function setupAutoUpdate() {
    if (updateState.status === 'unsupported') return
    autoUpdater.setFeedURL({
        url: `https://update.electronjs.org/hoangnh2912/pancake-swap-tool/${process.platform}-${process.arch}/${app.getVersion()}`,
    })
    autoUpdater.on('checking-for-update', () => setUpdateState('checking'))
    autoUpdater.on('update-available', () => setUpdateState('downloading'))
    autoUpdater.on('update-not-available', () => setUpdateState('latest'))
    autoUpdater.on('error', (err) => {
        console.error('[update]', err.message)
        setUpdateState('error', err.message)
    })
    autoUpdater.on('update-downloaded', (_event, _notes, releaseName) => {
        downloadedRelease = releaseName || ''
        setUpdateState('downloaded', downloadedRelease)
        promptInstallUpdate()
    })
    // Kiểm tra ngay khi mở app; lần chạy đầu sau khi cài Squirrel còn giữ lock file → đợi 30s
    setTimeout(() => autoUpdater.checkForUpdates(), process.argv.includes('--squirrel-firstrun') ? 30_000 : 0)
    setInterval(() => autoUpdater.checkForUpdates(), 60 * 60 * 1000)
}

ipcMain.handle('update-state', () => updateState)
ipcMain.handle('update-check', () => {
    if (updateState.status === 'downloaded') promptInstallUpdate()
    else if (updateState.status !== 'unsupported' && updateState.status !== 'checking' && updateState.status !== 'downloading')
        autoUpdater.checkForUpdates()
    return updateState
})

// Menu File (Cmd/Ctrl+O/S/Shift+S) — renderer xử lý vì cần hỏi mật khẩu
function buildMenu() {
    const send = (action: string) => () => mainWindow?.webContents.send('project-menu', action)
    const template: Electron.MenuItemConstructorOptions[] = [
        ...(process.platform === 'darwin' ? [{ role: 'appMenu' as const }] : []),
        {
            label: 'File',
            submenu: [
                { label: 'Mở…', accelerator: 'CmdOrCtrl+O', click: send('open') },
                {
                    label: 'Mở gần đây',
                    submenu: [
                        ...readRecent().map((p) => ({ label: p, click: () => requestOpen(p) })),
                        { type: 'separator' as const },
                        { label: 'Xoá danh sách', click: () => writeRecent([]) },
                    ],
                },
                { label: 'Lưu', accelerator: 'CmdOrCtrl+S', click: send('save') },
                { label: 'Lưu thành…', accelerator: 'CmdOrCtrl+Shift+S', click: send('saveAs') },
                { type: 'separator' },
                { label: 'Đóng file', accelerator: 'CmdOrCtrl+Shift+W', click: send('close') },
            ],
        },
        { role: 'editMenu' },
        { role: 'viewMenu' },
        { role: 'windowMenu' },
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// Return available solc versions for the settings UI
ipcMain.handle('get-solc-versions', () => {
    return Object.keys(SOLC_VERSION_MAP).map((v) => ({
        value: v,
        label: v === BUILTIN_VERSION ? `${v} (built-in)` : v === '0.8.27' ? `${v} (default)` : v,
    }))
})

// ── Window ────────────────────────────────────────────────────────────────────
// Squirrel chạy app với --squirrel-install/updated/uninstall/obsolete rồi đợi app thoát:
// tạo/xoá shortcut + đăng ký/gỡ đuôi .adp ngay lúc cài, không đợi lần mở app đầu tiên.
function handleSquirrelEvent(): boolean {
    const cmd = process.platform === 'win32' ? process.argv[1] : undefined
    if (!cmd || !['--squirrel-install', '--squirrel-updated', '--squirrel-uninstall', '--squirrel-obsolete'].includes(cmd))
        return false
    const exeName = path.basename(process.execPath)
    const update = (arg: string) => {
        try {
            execFileSync(path.join(squirrelRoot, 'Update.exe'), [arg], { stdio: 'ignore', windowsHide: true })
        } catch (err) {
            console.error('[squirrel]', arg, err)
        }
    }
    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
        update(`--createShortcut=${exeName}`)
        registerWindowsFileAssociation()
    } else if (cmd === '--squirrel-uninstall') {
        update(`--removeShortcut=${exeName}`)
        regCmd(['delete', `HKCU\\Software\\Classes\\.${PROJECT_EXT}`, '/f'])
        regCmd(['delete', `HKCU\\Software\\Classes\\${ADP_PROG_ID}`, '/f'])
    }
    app.quit()
    return true
}
const squirrelEvent = handleSquirrelEvent()

let mainWindow: BrowserWindow

const createWindow = (serverPort: number): void => {
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
    mainWindow.setMenuBarVisibility(false) // Windows: ẩn thanh menu, phím tắt Ctrl+O/S vẫn chạy
    mainWindow.on('page-title-updated', (e) => e.preventDefault()) // giữ tiêu đề tên file
    mainWindow.webContents.on('did-finish-load', updateTitle)
    mainWindow.maximize()
    const separator = MAIN_WINDOW_WEBPACK_ENTRY.includes('?') ? '&' : '?'
    mainWindow.loadURL(`${MAIN_WINDOW_WEBPACK_ENTRY}${separator}serverPort=${serverPort}`)
}

let resolvedServerPort: number

app.on('ready', async () => {
    if (squirrelEvent) return
    resolvedServerPort = await startServer()
    buildMenu()
    if (!isSquirrelInstall) registerWindowsFileAssociation() // installer đã đăng ký lúc cài
    createWindow(resolvedServerPort)
    setupAutoUpdate()
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(resolvedServerPort)
})
