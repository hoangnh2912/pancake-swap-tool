#!/usr/bin/env node
// MCP server nội bộ cho pancake-swap-tool — chỉ ĐỌC (không write, không ký tx, không lộ
// private key) để đọc log/config/trạng thái automation trực tiếp từ SQLite, thay vì chạy
// tay sqlite3 + python mỗi lần debug.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.resolve(__dirname, '..', 'prisma', 'auto-deploy.sqlite')

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

const transport = new StdioServerTransport()
await server.connect(transport)
