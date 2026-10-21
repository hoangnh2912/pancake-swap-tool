#!/usr/bin/env node
// MCP server nội bộ cho pancake-swap-tool. Phần lớn tool chỉ ĐỌC (log/config/ScanWallet từ
// SQLite, không lộ private key). Riêng `run_automation` KÝ TX THẬT bằng key đã lưu trong
// Config — chỉ chạy khi gọi với confirm:true, không có tool nào khác động tới ví/on-chain.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'prisma', 'auto-deploy.sqlite')

// Field KHÔNG BAO GIỜ trả ra ngoài (private key) — chặn cứng dù tool nào gọi.
const SENSITIVE_FIELDS = new Set(['mainKey', 'swapKey', 'mintKey'])

function queryJson(sql) {
    const out = execFileSync('sqlite3', ['-json', DB_PATH, sql], { encoding: 'utf8' })
    const trimmed = out.trim()
    return trimmed ? JSON.parse(trimmed) : []
}

function redact(row) {
    if (!row || typeof row !== 'object') return row
    const copy = { ...row }
    for (const f of SENSITIVE_FIELDS) {
        if (f in copy) copy[f] = copy[f] ? '[redacted]' : copy[f]
    }
    return copy
}

function textResult(value) {
    return { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] }
}

const server = new McpServer({ name: 'pancake-swap-tool-local', version: '1.0.0' })

server.registerTool(
    'list_tabs',
    {
        title: 'List tabs',
        description: 'Liệt kê các tabId đang có trong Config (mỗi tab app = 1 row, kèm _global).',
    },
    async () => {
        const rows = queryJson('SELECT id FROM Config ORDER BY id;')
        return textResult(rows.map((r) => r.id))
    }
)

server.registerTool(
    'get_logs',
    {
        title: 'Get automation logs',
        description:
            'Đọc logsJson của 1 tab (mặc định tab "default") — log realtime của automation (deploy, swap, fake volume, lỗi...). Trả về N dòng cuối.',
        inputSchema: {
            tabId: z.string().optional().describe('Tab id, mặc định "default"'),
            lastN: z.number().int().positive().max(2000).optional().describe('Số dòng log cuối cùng, mặc định 80'),
        },
    },
    async ({ tabId, lastN }) => {
        const id = (tabId || 'default').replace(/'/g, "''")
        const rows = queryJson(`SELECT logsJson FROM Config WHERE id='${id}';`)
        if (rows.length === 0) return textResult(`Không có tab "${tabId || 'default'}"`)
        let logs
        try {
            logs = JSON.parse(rows[0].logsJson || '[]')
        } catch {
            return textResult('logsJson không parse được')
        }
        const n = lastN || 80
        const slice = logs.slice(-n)
        const texts = slice.map((x) => (typeof x === 'object' ? x.text : x))
        return textResult(texts.join('\n'))
    }
)

server.registerTool(
    'get_config',
    {
        title: 'Get config (redacted)',
        description:
            'Đọc toàn bộ Config row của 1 tab (mặc định "default") — chainId, tokensJson, swapCommandsJson, fakeVolume*, disperseAmount, scanMode... Private key (mainKey/swapKey/mintKey) LUÔN bị redact, không bao giờ trả ra.',
        inputSchema: {
            tabId: z.string().optional().describe('Tab id, mặc định "default"'),
        },
    },
    async ({ tabId }) => {
        const id = (tabId || 'default').replace(/'/g, "''")
        const rows = queryJson(`SELECT * FROM Config WHERE id='${id}';`)
        if (rows.length === 0) return textResult(`Không có tab "${tabId || 'default'}"`)
        return textResult(redact(rows[0]))
    }
)

server.registerTool(
    'get_step_states',
    {
        title: 'Get step states',
        description: 'Đọc stepStatesJson của 1 tab — trạng thái từng bước (wait/process/finish/error) của từng token.',
        inputSchema: {
            tabId: z.string().optional().describe('Tab id, mặc định "default"'),
        },
    },
    async ({ tabId }) => {
        const id = (tabId || 'default').replace(/'/g, "''")
        const rows = queryJson(`SELECT stepStatesJson FROM Config WHERE id='${id}';`)
        if (rows.length === 0) return textResult(`Không có tab "${tabId || 'default'}"`)
        try {
            return textResult(JSON.parse(rows[0].stepStatesJson || '{}'))
        } catch {
            return textResult('stepStatesJson không parse được')
        }
    }
)

server.registerTool(
    'get_scan_wallets',
    {
        title: 'Query ScanWallet table',
        description:
            'Query bảng ScanWallet (ví quét được + trạng thái airdrop) — lọc theo wallet (contract quét) và/hoặc token (địa chỉ token đã airdrop), giới hạn số dòng trả về.',
        inputSchema: {
            wallet: z.string().optional().describe('Lọc theo cột wallet (contract/router đã quét)'),
            token: z.string().optional().describe('Lọc theo cột token (địa chỉ ERC20 đã airdrop)'),
            limit: z.number().int().positive().max(1000).optional().describe('Giới hạn số dòng, mặc định 50'),
        },
    },
    async ({ wallet, token, limit }) => {
        const clauses = []
        if (wallet) clauses.push(`wallet='${wallet.replace(/'/g, "''")}'`)
        if (token) clauses.push(`token='${token.replace(/'/g, "''")}'`)
        const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
        const rows = queryJson(
            `SELECT * FROM ScanWallet ${where} ORDER BY createdAt DESC LIMIT ${limit || 50};`
        )
        return textResult(rows)
    }
)

const RUN_STATE_FILE = path.join(__dirname, '.run-state.json')

server.registerTool(
    'run_automation',
    {
        title: 'Run automation (REAL, ký tx thật)',
        description:
            'Chạy runAutomation() THẬT ngoài Electron GUI, dùng ĐÚNG config/private key đã lưu ' +
            'trong Config (tabId) — y hệt bấm "Bắt đầu Automation" trong app. KÝ GIAO DỊCH THẬT, ' +
            'TỐN BNB THẬT. Bắt buộc confirm:true mới chạy. Chạy nền (không block) — dùng get_logs ' +
            'để theo dõi tiến trình, run_automation_status để biết tiến trình đang chạy hay đã xong.',
        inputSchema: {
            tabId: z.string().optional().describe('Tab id, mặc định "default"'),
            confirm: z
                .literal(true)
                .describe('Phải truyền đúng true — xác nhận đã hiểu đây là chạy thật, ký tx thật'),
        },
    },
    async ({ tabId, confirm }) => {
        if (confirm !== true) {
            return textResult('Từ chối — thiếu confirm:true. Đây là hành động ký tx thật, tốn BNB thật.')
        }
        if (fs.existsSync(RUN_STATE_FILE)) {
            const state = JSON.parse(fs.readFileSync(RUN_STATE_FILE, 'utf8'))
            try {
                process.kill(state.pid, 0) // không gửi tín hiệu, chỉ kiểm tra process còn sống
                return textResult(`Đã có 1 lần chạy khác đang chạy (pid ${state.pid}, tabId ${state.tabId}) — đợi xong hoặc kiểm tra get_logs trước.`)
            } catch {
                // process không còn sống — cho chạy tiếp, dọn file cũ
            }
        }
        const id = tabId || 'default'
        // Gọi thẳng binary tsx cục bộ (không qua npx) — npx tạo thêm 1-2 tầng process con,
        // detached+unref không kill hết được cả cây, để lại process mồ côi khi cần dừng khẩn.
        const tsxBin = path.join(__dirname, 'node_modules', '.bin', 'tsx')
        const logFd = fs.openSync(path.join(__dirname, 'run.log'), 'a')
        const child = spawn(tsxBin, [path.join(__dirname, 'headless-run.ts'), id], {
            cwd: __dirname,
            detached: true,
            stdio: ['ignore', logFd, logFd],
        })
        fs.closeSync(logFd) // child đã giữ fd riêng
        child.unref()
        fs.writeFileSync(RUN_STATE_FILE, JSON.stringify({ pid: child.pid, tabId: id, startedAt: Date.now() }))
        return textResult(
            `Đã bắt đầu chạy automation THẬT cho tabId="${id}" (pid ${child.pid}). ` +
            `Dùng get_logs({tabId:"${id}"}) để theo dõi, run_automation_status để biết còn chạy không.`
        )
    }
)

server.registerTool(
    'run_automation_status',
    {
        title: 'Check run_automation status',
        description: 'Kiểm tra lần chạy run_automation gần nhất còn đang chạy hay đã kết thúc.',
    },
    async () => {
        if (!fs.existsSync(RUN_STATE_FILE)) return textResult('Chưa có lần chạy nào qua MCP.')
        const state = JSON.parse(fs.readFileSync(RUN_STATE_FILE, 'utf8'))
        try {
            process.kill(state.pid, 0)
            return textResult({ ...state, status: 'running' })
        } catch {
            return textResult({ ...state, status: 'finished (hoặc đã bị kill) — xem get_logs để biết kết quả' })
        }
    }
)

server.registerTool(
    'stop_automation',
    {
        title: 'Stop run_automation',
        description:
            'Dừng lần chạy run_automation đang chạy: gửi SIGTERM để dừng êm sau bước hiện tại ' +
            '(tự rút BNB khỏi FakeVolume nếu đang dở), quá 60s chưa thoát thì SIGKILL cả process ' +
            'group. KHÔNG hoàn tác được tx đã gửi trước đó — chỉ dừng các bước CHƯA chạy.',
    },
    async () => {
        if (!fs.existsSync(RUN_STATE_FILE)) return textResult('Không có lần chạy nào để dừng.')
        const state = JSON.parse(fs.readFileSync(RUN_STATE_FILE, 'utf8'))
        const alive = () => {
            try {
                process.kill(state.pid, 0)
                return true
            } catch {
                return false
            }
        }
        let forced = false
        try {
            process.kill(-state.pid, 'SIGTERM') // số âm = cả process group (detached tạo group riêng)
            for (let i = 0; i < 60 && alive(); i++) await new Promise((r) => setTimeout(r, 1000))
            if (alive()) {
                forced = true
                process.kill(-state.pid, 'SIGKILL')
            }
        } catch (err) {
            // process group có thể đã chết hoặc không tồn tại — vẫn dọn state file
        }
        fs.unlinkSync(RUN_STATE_FILE)
        return textResult(
            forced
                ? `Quá 60s chưa dừng êm — đã SIGKILL (pid group ${state.pid}). Kiểm tra get_logs xem BNB có kẹt trong FakeVolume không.`
                : `Đã dừng (pid group ${state.pid}, tabId ${state.tabId}).`
        )
    }
)

const transport = new StdioServerTransport()
await server.connect(transport)
