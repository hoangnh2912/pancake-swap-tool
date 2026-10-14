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

function compile(source, fileName) {
    const input = JSON.stringify({
        language: 'Solidity',
        sources: { [fileName]: { content: source } },
        settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
    })
    const output = JSON.parse(solc.compile(input))
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

async function appendLog(text) {
    const cfg = await prisma.config.findUnique({ where: { id: tabId } })
    const logs = cfg?.logsJson ? JSON.parse(cfg.logsJson) : []
    logs.push({ id: Date.now() + Math.random(), text })
    await prisma.config.update({
        where: { id: tabId },
        data: { logsJson: JSON.stringify(logs.slice(-500)) },
    })
}

async function main() {
    const cfg = await prisma.config.findUnique({ where: { id: tabId } })
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
        serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 }, (info) => resolve(info.port))
    })
    configureZenStack(`http://127.0.0.1:${port}/api/model`, fetch)

    const normalizeKey = (k) => (k.trim().startsWith('0x') ? k.trim() : `0x${k.trim()}`)
    const tokens = JSON.parse(cfg.tokensJson || '[]')
    const swapCommands = JSON.parse(cfg.swapCommandsJson || '[]')
    const scanContracts = JSON.parse(cfg.scanContractsJson || '[]')

    const compiled = compile(cfg.contractCode || DEFAULT_CONTRACT, 'token.sol')

    let fakeVolumeAbi, fakeVolumeBytecode
    if (cfg.fakeVolumeEnabled === 'true') {
        const fv = compile(cfg.fakeVolumeCode || FAKE_VOLUME_CONTRACT, 'fakeVolume.sol')
        fakeVolumeAbi = fv.abi
        fakeVolumeBytecode = fv.bytecode
    }

    await appendLog(`\n=== [headless] Bắt đầu chạy qua MCP (tabId=${tabId}) ===`)

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
            existingImplementationAddress: cfg.implAddress || null,
            fakeVolumeEnabled: cfg.fakeVolumeEnabled === 'true',
            fakeVolumeTimes: Number(cfg.fakeVolumeTimes) || 1,
            fakeVolumeBnbAmount: cfg.fakeVolumeBnbAmount || '',
            fakeVolumeAddress: cfg.fakeVolumeAddress || null,
            fakeVolumeAbi,
            fakeVolumeBytecode,
            onFakeVolumeDeployed: async (addr) => {
                await prisma.config.update({ where: { id: tabId }, data: { fakeVolumeAddress: addr } })
            },
            shouldStop: () => false,
        },
        (msg) => appendLog(msg),
        async (id, status, contractAddress, errorMsg) => {
            const updated = JSON.parse((await prisma.config.findUnique({ where: { id: tabId } }))?.tokensJson || '[]')
            // tokensJson không lưu status/contractAddress theo thiết kế hiện tại — bỏ qua update
            // ở đây, log text đã đủ để biết kết quả qua get_logs.
            void updated
        },
        async () => {} // onStepChange — không cần stepStatesJson cho lần chạy headless
    )

    await appendLog('=== [headless] Hoàn thành ===')
}

main()
    .catch(async (err) => {
        await appendLog(`=== [headless] LỖI: ${err.message || err} ===`)
        process.exitCode = 1
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
