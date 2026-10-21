// Chạy runAutomation() THẬT (ký tx thật bằng key đã lưu trong Config) ngoài Electron GUI —
// dùng khi MCP tool `run_automation` được gọi với confirm:true. KHÔNG override tham số nào —
// dùng đúng những gì đã lưu trong Config row (tabId truyền vào), y hệt bấm "Bắt đầu Automation"
// trong app thật. Log ghi thẳng vào cùng Config.logsJson để `get_logs` đọc được như bình thường.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import solc from 'solc'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createHonoHandler } from '@zenstackhq/server/hono'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const { PrismaClient } = await import(path.join(ROOT, 'prisma', 'client', 'index.js'))
const { runAutomation } = await import(path.join(ROOT, 'src', 'utils', 'automationService.ts'))
const { configureZenStack } = await import(path.join(ROOT, 'src', 'utils', 'zenstack-function.ts'))
const { default: DEFAULT_CONTRACT } = await import(path.join(ROOT, 'src', 'utils', 'defaultContract.ts'))
const { default: FAKE_VOLUME_CONTRACT } = await import(path.join(ROOT, 'src', 'utils', 'fakeVolumeContract.ts'))

const tabId = process.argv[2] || 'default'
const DB_PATH = path.join(ROOT, 'prisma', 'auto-deploy.sqlite')

// Giống app: dùng đúng solcVersion lưu ở _global (mặc định 0.8.27), không phải solc trong node_modules
async function loadSolc(version) {
    if (version === solc.version().split('+')[0]) return solc
    const list = await (await fetch('https://binaries.soliditylang.org/bin/list.json')).json()
    const file = list.releases[version]
    if (!file) throw new Error(`solc version không hợp lệ: ${version}`)
    const full = file.replace(/^soljson-/, '').replace(/\.js$/, '')
    return new Promise((resolve, reject) =>
        solc.loadRemoteVersion(full, (err, snapshot) => (err ? reject(err) : resolve(snapshot)))
    )
}

// FNV-1a — copy y hệt hashString trong src/pages/main.tsx, phải khớp để so fakeVolumeVersion
function hashString(s) {
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 0x01000193)
    }
    return (h >>> 0).toString(16)
}

function compile(compiler, source, fileName) {
    const input = JSON.stringify({
        language: 'Solidity',
        sources: { [fileName]: { content: source } },
        settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
    })
    const output = JSON.parse(compiler.compile(input))
    if (output.errors) {
        const errors = output.errors.filter((e) => e.severity === 'error')
        if (errors.length > 0) throw new Error(errors.map((e) => e.formattedMessage).join('\n'))
    }
    const candidates = Object.entries(output.contracts[fileName])
        .map(([name, c]) => ({ name, c }))
        .filter((x) => x.c.evm.bytecode.object.length > 0)
        .sort((a, b) => b.c.abi.length - a.c.abi.length)
    if (candidates.length === 0) throw new Error(`Không tìm thấy contract có bytecode trong ${fileName}`)
    return { abi: candidates[0].c.abi, bytecode: '0x' + candidates[0].c.evm.bytecode.object }
}

const prisma = new PrismaClient({ datasourceUrl: `file:${DB_PATH}` })
let localServer
let stopping = false

// Mọi ghi DB đi qua 1 hàng đợi — onLog/updateStatus không được await bên trong runAutomation,
// read-modify-write logsJson/tokensJson chạy chồng nhau sẽ đè mất dòng.
let dbQueue = Promise.resolve()
function enqueue(fn) {
    dbQueue = dbQueue.then(fn).catch((err) => console.error('[headless] ghi DB lỗi:', err))
    return dbQueue
}

function appendLog(text) {
    return enqueue(async () => {
        const cfg = await prisma.config.findUnique({ where: { id: tabId } })
        const logs = cfg?.logsJson ? JSON.parse(cfg.logsJson) : []
        logs.push({ id: Date.now() + Math.random(), text })
        await prisma.config.update({
            where: { id: tabId },
            data: { logsJson: JSON.stringify(logs.slice(-500)) },
        })
    })
}

// Lưu status/contractAddress vào tokensJson theo index — lần chạy MCP sau resume token lỗi
// thay vì deploy lại từ đầu (app GUI bỏ qua các field này khi load, không ảnh hưởng).
function updateTokenStatus(index, status, contractAddress, errorMsg) {
    return enqueue(async () => {
        const cfg = await prisma.config.findUnique({ where: { id: tabId } })
        const tokens = JSON.parse(cfg?.tokensJson || '[]')
        if (!tokens[index]) return
        tokens[index] = { ...tokens[index], status, contractAddress, errorMsg }
        await prisma.config.update({ where: { id: tabId }, data: { tokensJson: JSON.stringify(tokens) } })
    })
}

// stop_automation gửi SIGTERM — dừng êm qua shouldStop (rút BNB khỏi FakeVolume nếu đang dở)
process.on('SIGTERM', () => {
    if (stopping) return
    stopping = true
    appendLog('=== [headless] Nhận lệnh dừng — dừng sau bước hiện tại ===')
})

async function main() {
    const cfg = await prisma.config.findUnique({ where: { id: tabId } })
    const gCfg = await prisma.config.findUnique({ where: { id: '_global' } })
    if (!cfg) throw new Error(`Không tìm thấy Config id="${tabId}"`)
    if (!cfg.mainKey || !cfg.swapKey || !cfg.mintKey) {
        throw new Error('Thiếu private key (main/swap/mint) trong Config — chưa cấu hình đủ qua GUI')
    }

    // Local Hono + ZenStack server riêng cho lần chạy này (port ngẫu nhiên) — để
    // ScanWallet CRUD (step 5.2) hoạt động giống hệt app thật, không cần GUI đang mở.
    const app = new Hono()
    app.use('*', cors({ origin: '*' }))
    app.use('/api/model/*', createHonoHandler({ getPrisma: () => prisma }))
    const port = await new Promise((resolve) => {
        localServer = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 }, (info) => resolve(info.port))
    })
    configureZenStack(`http://127.0.0.1:${port}/api/model`, fetch)

    const normalizeKey = (k) => (k.trim().startsWith('0x') ? k.trim() : `0x${k.trim()}`)
    // Giống app: bỏ token đã success, token error còn contractAddress thì resume
    const tokens = JSON.parse(cfg.tokensJson || '[]')
        .map((t, i) => ({
            ...t,
            id: String(i),
            resumeContractAddress: t.status === 'error' && t.contractAddress ? t.contractAddress : undefined,
        }))
        .filter((t) => t.status !== 'success')
    if (tokens.length === 0) {
        await appendLog('=== [headless] Không có token nào cần chạy — tất cả đã hoàn thành ===')
        return
    }
    const swapCommands = JSON.parse(cfg.swapCommandsJson || '[]')
    const scanContracts = JSON.parse(cfg.scanContractsJson || '[]')

    // Y hệt check an toàn trong main.tsx lúc load config — code cũ lưu trong DB có thể là
    // bản KHÔNG tương thích luồng EIP-1167 clone+initialize hiện tại (thiếu initialize(),
    // dùng constructor thường) nếu chưa từng save lại qua Editor mới. Marker 'function airdrop'
    // chỉ có ở bản tương thích — fallback về DEFAULT_CONTRACT nếu thiếu.
    const contractSource =
        cfg.contractCode && cfg.contractCode.includes('function airdrop')
            ? cfg.contractCode
            : DEFAULT_CONTRACT
    const compiler = await loadSolc(gCfg?.solcVersion || '0.8.27')
    const compiled = compile(compiler, contractSource, 'token.sol')

    // Giống app: đổi code FakeVolume (hash khác fakeVolumeVersion) thì coi như chưa có contract
    const fakeVolumeCode = cfg.fakeVolumeCode || FAKE_VOLUME_CONTRACT
    const fakeVolumeCodeHash = hashString(fakeVolumeCode)
    let fakeVolumeAbi, fakeVolumeBytecode
    if (cfg.fakeVolumeEnabled === 'true') {
        const fv = compile(compiler, fakeVolumeCode, 'fakeVolume.sol')
        fakeVolumeAbi = fv.abi
        fakeVolumeBytecode = fv.bytecode
    }
    const implRef = { current: null }

    await appendLog(`\n=== [headless] Bắt đầu chạy qua MCP (tabId=${tabId}) ===`)

    try {
        await runAutomation(
            {
                rpcList: (cfg.rpc || '').split('\n').map((s) => s.trim()).filter(Boolean),
                chainId: Number(cfg.chainId) || 56,
                gasPriceGwei: Number(cfg.gasPriceGwei) || 0.05,
                mainPrivateKey: normalizeKey(cfg.mainKey),
                swapPrivateKey: normalizeKey(cfg.swapKey),
                mintPrivateKey: normalizeKey(cfg.mintKey),
                abi: compiled.abi,
                bytecode: compiled.bytecode,
                tokens,
                swapCommands,
                swapDelayMs: (Number(cfg.swapDelay) || 0) * 1000,
                swapRepeat: Number(cfg.swapRepeat) || 1,
                transferBnbToMain: cfg.transferBnbToMain || '',
                scanContracts,
                scanMode: cfg.scanMode === 'contract' ? 'contract' : 'allBlocks',
                disperseAmount: cfg.disperseAmount || '',
                disperseBatchSize: Number(cfg.disperseBatchSize) || 10000,
                scanDelaySeconds: Number(cfg.scanDelay) || 30,
                existingImplementationAddress: gCfg?.implAddress || null,
                _implRef: implRef,
                fakeVolumeEnabled: cfg.fakeVolumeEnabled === 'true',
                fakeVolumeTimes: Number(cfg.fakeVolumeTimes) || 1,
                fakeVolumeBnbAmount: cfg.fakeVolumeBnbAmount || '',
                fakeVolumeAddress:
                    cfg.fakeVolumeVersion === fakeVolumeCodeHash ? cfg.fakeVolumeAddress || null : null,
                fakeVolumeAbi,
                fakeVolumeBytecode,
                onFakeVolumeDeployed: (addr) =>
                    enqueue(() =>
                        prisma.config.update({
                            where: { id: tabId },
                            data: { fakeVolumeAddress: addr, fakeVolumeVersion: fakeVolumeCodeHash },
                        })
                    ),
                shouldStop: () => stopping,
            },
            (msg) => appendLog(msg),
            (id, status, contractAddress, errorMsg) => updateTokenStatus(Number(id), status, contractAddress, errorMsg),
            async () => {} // onStepChange — không cần stepStatesJson cho lần chạy headless
        )
    } finally {
        // Giống app: lưu impl mới deploy vào _global để lần sau (app hoặc MCP) dùng lại
        if (implRef.current) {
            await enqueue(() =>
                prisma.config.upsert({
                    where: { id: '_global' },
                    create: { id: '_global', implAddress: implRef.current },
                    update: { implAddress: implRef.current },
                })
            )
        }
    }

    await appendLog(stopping ? '=== [headless] Đã dừng ===' : '=== [headless] Hoàn thành ===')
}

main()
    .catch(async (err) => {
        await appendLog(`=== [headless] LỖI: ${err.message || err} ===`)
        process.exitCode = 1
    })
    .finally(async () => {
        await dbQueue
        await prisma.$disconnect()
        // serve() giữ event loop sống vô thời hạn nếu không đóng — process không tự thoát
        // dù automation đã xong, phải tự close() rồi exit() để chắc chắn kết thúc.
        localServer?.close()
        process.exit(process.exitCode || 0)
    })
