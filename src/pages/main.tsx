import { DeleteOutlined, DownloadOutlined, PlayCircleOutlined, PlusOutlined, SettingOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons'
import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import { Button, Input, InputNumber, Modal, Select, Steps, Table, Tag, Tooltip, Typography, message } from 'antd'
import { ethers } from 'ethers'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { AutomationToken, StepStatus, SwapCommand } from '../utils/automationService'
import { runAutomation } from '../utils/automationService'
import DEFAULT_CONTRACT from '../utils/defaultContract'
import * as XLSX from 'xlsx'

const { Title, Text: AntText, Link } = Typography


type RowStatus = 'idle' | 'running' | 'success' | 'error'

interface TokenRow {
    id: string
    name: string
    decimal: number
    mintAmount: string
    liquidityToken: string
    liquidityBNB: string
    status: RowStatus
    contractAddress?: string
    errorMsg?: string
}

let _rowId = 1
const newRow = (): TokenRow => ({
    id: String(_rowId++),
    name: '',
    decimal: 18,
    mintAmount: '',
    liquidityToken: '',
    liquidityBNB: '',
    status: 'idle',
})

const deriveAddress = (pk: string): string => {
    try {
        const key = pk.trim().startsWith('0x') ? pk.trim() : `0x${pk.trim()}`
        return new ethers.Wallet(key).address
    } catch {
        return ''
    }
}

const statusColor: Record<RowStatus, string> = {
    idle: 'default',
    running: 'processing',
    success: 'success',
    error: 'error',
}
const statusLabel: Record<RowStatus, string> = {
    idle: 'Chờ',
    running: 'Đang chạy',
    success: 'Thành công',
    error: 'Lỗi',
}

const LABEL_W = '130px'

const electron = (window as any).electron

const Main = () => {
    const [rpc, setRpc] = useState('https://bsc.drpc.org')
    const [chainId, setChainId] = useState('56')
    const [mainKey, setMainKey] = useState('')
    const [swapKey, setSwapKey] = useState('')
    const [mintKey, setMintKey] = useState('')
    const [contractCode, setContractCode] = useState(DEFAULT_CONTRACT)
    const [tokens, setTokens] = useState<TokenRow[]>([newRow()])
    const [running, setRunning] = useState(false)
    const [logs, setLogs] = useState<{ id: number; text: string }[]>([])
    const [solcVersion, setSolcVersion] = useState('0.8.27')
    const [solcVersionOptions, setSolcVersionOptions] = useState<{ value: string; label: string }[]>([])
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [stepStates, setStepStates] = useState<Record<string, { tokenName: string; statuses: StepStatus[] }>>({})
    const [swapCommands, setSwapCommands] = useState<SwapCommand[]>([])
    const [swapDelay, setSwapDelay] = useState<number>(0)
    const logEndRef = useRef<HTMLDivElement>(null)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const stopRef = useRef(false)

    const mainAddr = deriveAddress(mainKey)
    const swapAddr = deriveAddress(swapKey)
    const mintAddr = deriveAddress(mintKey)

    const [mainBal, setMainBal] = useState('')
    const [swapBal, setSwapBal] = useState('')
    const [mintBal, setMintBal] = useState('')

    useEffect(() => {
        if (!rpc) return
        const provider = new ethers.providers.JsonRpcProvider(rpc)
        const fetchBal = (addr: string, set: (v: string) => void) => {
            if (!addr) { set(''); return }
            provider.getBalance(addr)
                .then((b) => set(`${Number.parseFloat(ethers.utils.formatEther(b)).toFixed(4)} BNB`))
                .catch(() => set(''))
        }
        const poll = () => {
            fetchBal(mainAddr, setMainBal)
            fetchBal(swapAddr, setSwapBal)
            fetchBal(mintAddr, setMintBal)
        }
        poll()
        const id = setInterval(poll, 5000)
        return () => clearInterval(id)
    }, [mainAddr, swapAddr, mintAddr, rpc])

    // Load config + version list on mount
    useEffect(() => {
        electron.getSolcVersions().then((opts: { value: string; label: string }[]) => {
            setSolcVersionOptions(opts)
        })
        electron.loadConfig().then((cfg: any) => {
            if (!cfg) return
            if (cfg.rpc) setRpc(cfg.rpc)
            if (cfg.chainId) setChainId(cfg.chainId)
            if (cfg.mainKey) setMainKey(cfg.mainKey)
            if (cfg.swapKey) setSwapKey(cfg.swapKey)
            if (cfg.mintKey) setMintKey(cfg.mintKey)
            if (cfg.contractCode) setContractCode(cfg.contractCode)
            if (cfg.solcVersion) setSolcVersion(cfg.solcVersion)
            if (cfg.tokensJson) {
                try {
                    const saved = JSON.parse(cfg.tokensJson) as Omit<TokenRow, 'status' | 'contractAddress' | 'errorMsg'>[]
                    if (Array.isArray(saved) && saved.length > 0) {
                        setTokens(saved.map((t) => ({ ...t, id: String(_rowId++), status: 'idle' })))
                    }
                } catch { /* ignore */ }
            }
            if (cfg.swapCommandsJson) {
                try {
                    const saved = JSON.parse(cfg.swapCommandsJson) as SwapCommand[]
                    if (Array.isArray(saved)) setSwapCommands(saved.map((c) => ({ ...c, id: String(swapIdRef.current++) })))
                } catch { /* ignore */ }
            }
            if (cfg.swapDelay) setSwapDelay(Number(cfg.swapDelay) || 0)
        })
    }, [])

    const scheduleSave = useCallback((patch: Record<string, string>) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
            electron.saveConfig(patch)
        }, 800)
    }, [])

    const logIdRef = useRef(0)
    const swapIdRef = useRef(1)
    const addLog = useCallback((msg: string) => {
        const time = new Date().toLocaleTimeString('vi-VN')
        setLogs((prev) => [...prev, { id: logIdRef.current++, text: `[${time}] ${msg}` }])
    }, [])

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })

    const saveTokens = useCallback((next: TokenRow[]) => {
        const saveable = next.map(({ name, decimal, mintAmount, liquidityToken, liquidityBNB }) =>
            ({ name, decimal, mintAmount, liquidityToken, liquidityBNB })
        )
        scheduleSave({ tokensJson: JSON.stringify(saveable) })
    }, [scheduleSave])

    const newSwapCmd = (): SwapCommand => ({ id: String(swapIdRef.current++), type: 'buy', amount: '', slippage: '5' })

    const saveSwapCommands = (cmds: SwapCommand[]) =>
        scheduleSave({ swapCommandsJson: JSON.stringify(cmds) })

    const addSwapCmd = () => setSwapCommands((prev) => {
        const next = [...prev, newSwapCmd()]
        saveSwapCommands(next)
        return next
    })
    const removeSwapCmd = (id: string) => setSwapCommands((prev) => {
        const next = prev.filter((c) => c.id !== id)
        saveSwapCommands(next)
        return next
    })
    const updateSwapCmd = (id: string, field: keyof SwapCommand, value: any) =>
        setSwapCommands((prev) => {
            const next = prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
            saveSwapCommands(next)
            return next
        })

    const exportSwapExcel = () => {
        const headers = ['STT', 'Loai', 'SoLuongBNB', 'Slippage']
        const rows = swapCommands.map((c, i) => ({
            STT: i + 1,
            Loai: c.type === 'buy' ? 'Mua' : 'Ban',
            SoLuongBNB: c.amount,
            Slippage: c.slippage,
        }))
        const ws = rows.length > 0
            ? XLSX.utils.json_to_sheet(rows)
            : XLSX.utils.aoa_to_sheet([headers])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SwapCommands')
        XLSX.writeFile(wb, 'swap-commands.xlsx')
    }

    const importSwapExcel = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target?.result, { type: 'array' })
                const ws = wb.Sheets[wb.SheetNames[0]]
                const rows = XLSX.utils.sheet_to_json<any>(ws)
                const cmds: SwapCommand[] = rows.map((r: any, i: number) => ({
                    id: String(Date.now() + i),
                    type: String(r.Loai || r.loai || r.type || 'buy').toLowerCase().includes('ban') ? 'sell' : 'buy',
                    amount: String(r.SoLuongBNB || r.amount || ''),
                    slippage: String(r.Slippage || r.slippage || '5'),
                }))
                setSwapCommands(cmds)
                saveSwapCommands(cmds)
                message.success(`Đã import ${cmds.length} lệnh`)
            } catch {
                message.error('File không hợp lệ')
            }
        }
        reader.readAsArrayBuffer(file)
        return false
    }

    const addRow = () => setTokens((prev) => {
        const next = [...prev, newRow()]
        saveTokens(next)
        return next
    })

    const removeRow = (id: string) => setTokens((prev) => {
        const next = prev.filter((r) => r.id !== id)
        saveTokens(next)
        return next
    })

    const updateRow = (id: string, field: keyof TokenRow, value: any) =>
        setTokens((prev) => {
            const next = prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
            saveTokens(next)
            return next
        })

    const updateRowStatus = (
        id: string,
        status: RowStatus,
        contractAddress?: string,
        errorMsg?: string
    ) =>
        setTokens((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, status, contractAddress, errorMsg } : r
            )
        )

    const handleStart = async () => {
        if (!mainKey || !swapKey || !mintKey) {
            message.error('Vui lòng nhập đủ 3 private key')
            return
        }
        if (!rpc) {
            message.error('Vui lòng nhập RPC URL')
            return
        }
        const valid = tokens.filter(
            (t) => t.name && t.mintAmount && t.liquidityToken && t.liquidityBNB
        )
        if (valid.length === 0) {
            message.error('Vui lòng nhập đầy đủ thông tin ít nhất 1 token')
            return
        }

        stopRef.current = false
        setRunning(true)
        setTokens((prev) =>
            prev.map((r) => ({ ...r, status: 'idle' as RowStatus, contractAddress: undefined, errorMsg: undefined }))
        )

        const initialSteps: Record<string, { tokenName: string; statuses: StepStatus[] }> = {}
        for (const t of valid) {
            initialSteps[t.id] = { tokenName: t.name, statuses: ['wait', 'wait', 'wait', 'wait', 'wait'] }
        }
        setStepStates(initialSteps)

        const onStepChange = (tokenId: string, step: number, status: 'process' | 'finish' | 'error') => {
            setStepStates((prev) => {
                const curr = prev[tokenId]
                if (!curr) return prev
                const statuses = [...curr.statuses] as StepStatus[]
                statuses[step] = status
                return { ...prev, [tokenId]: { ...curr, statuses } }
            })
        }

        try {
            addLog(`Đang compile contract (solc v${solcVersion})...`)
            const compileResult = await electron.compileContract(contractCode, solcVersion)
            addLog(`Compile thành công: contract "${compileResult.contractName}" [solc ${solcVersion}]`)

            const normalizeKey = (k: string) =>
                k.trim().startsWith('0x') ? k.trim() : `0x${k.trim()}`

            await runAutomation(
                {
                    rpc,
                    chainId: Number(chainId) || 56,
                    mainPrivateKey: normalizeKey(mainKey),
                    swapPrivateKey: normalizeKey(swapKey),
                    mintPrivateKey: normalizeKey(mintKey),
                    abi: compileResult.abi,
                    bytecode: compileResult.bytecode,
                    tokens: valid as AutomationToken[],
                    swapCommands,
                    swapDelayMs: swapDelay * 1000,
                    shouldStop: () => stopRef.current,
                },
                addLog,
                updateRowStatus,
                onStepChange
            )
        } catch (err: any) {
            const errMsg = err.reason || err.message || 'Unknown error'
            addLog(`LỖI: ${errMsg}`)
            message.error(errMsg)
        } finally {
            setRunning(false)
        }
    }

    const columns = [
        {
            title: 'STT',
            width: 50,
            render: (_: any, __: TokenRow, i: number) => i + 1,
        },
        {
            title: 'Tên token',
            render: (_: any, row: TokenRow) => (
                <Flex direction="column" gap={1}>
                    <Input
                        size="small"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        placeholder="VD: MYTOKEN"
                        disabled={running}
                    />
                    {row.contractAddress && (
                        <Tooltip title={row.contractAddress}>
                            <Link
                                href={`https://bscscan.com/address/${row.contractAddress}`}
                                target="_blank"
                                style={{ fontSize: 11 }}
                            >
                                {row.contractAddress.slice(0, 6)}…{row.contractAddress.slice(-4)}
                            </Link>
                        </Tooltip>
                    )}
                </Flex>
            ),
        },
        {
            title: 'Decimal',
            width: 90,
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    min={0}
                    max={18}
                    value={row.decimal}
                    onChange={(v) => updateRow(row.id, 'decimal', v ?? 18)}
                    disabled={running}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Mint amount',
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    stringMode
                    min="0"
                    value={row.mintAmount || undefined}
                    onChange={(v) => updateRow(row.id, 'mintAmount', v ?? '')}
                    formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={(v) => v ? v.replace(/,/g, '') : ''}
                    placeholder="VD: 1,000,000"
                    disabled={running}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Token liquidity',
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    stringMode
                    min="0"
                    value={row.liquidityToken || undefined}
                    onChange={(v) => updateRow(row.id, 'liquidityToken', v ?? '')}
                    formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={(v) => v ? v.replace(/,/g, '') : ''}
                    placeholder="VD: 500,000"
                    disabled={running}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'BNB liquidity',
            width: 130,
            render: (_: any, row: TokenRow) => (
                <Input
                    size="small"
                    value={row.liquidityBNB}
                    onChange={(e) => updateRow(row.id, 'liquidityBNB', e.target.value)}
                    placeholder="VD: 1.5"
                    disabled={running}
                />
            ),
        },
        {
            title: 'Trạng thái',
            width: 110,
            render: (_: any, row: TokenRow) => (
                <Tooltip title={row.errorMsg || ''}>
                    <Tag color={statusColor[row.status]}>{statusLabel[row.status]}</Tag>
                </Tooltip>
            ),
        },
        {
            title: '',
            width: 44,
            render: (_: any, row: TokenRow) => (
                <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeRow(row.id)}
                    disabled={running || tokens.length === 1}
                />
            ),
        },
    ]

    return (
        <Box bg="#141414" minH="100vh" p={4}>
            {/* Settings Modal */}
            <Modal
                title="Settings"
                open={settingsOpen}
                onCancel={() => setSettingsOpen(false)}
                footer={null}
                width={420}
            >
                <Stack spacing={4} mt={4}>
                    <Box>
                        <Text fontSize="sm" color="gray.400" mb={2}>Solidity Compiler Version</Text>
                        <Select
                            value={solcVersion}
                            options={solcVersionOptions}
                            onChange={(v) => {
                                setSolcVersion(v)
                                scheduleSave({ solcVersion: v })
                            }}
                            style={{ width: '100%' }}
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            Version khác 0.8.35 sẽ download lần đầu dùng (cần internet)
                        </Text>
                    </Box>
                </Stack>
            </Modal>

            {/* Header */}
            <Flex align="center" justify="space-between" mb={5}>
                <Title level={4} style={{ color: '#e0e0e0', margin: 0 }}>
                    Token Automation Tool
                </Title>
                <Flex align="center" gap={2}>
                    <AntText style={{ color: '#666', fontSize: 12 }}>
                        solc v{solcVersion}
                    </AntText>
                    <Button
                        icon={<SettingOutlined />}
                        size="small"
                        onClick={() => setSettingsOpen(true)}
                        style={{ color: '#888' }}
                    />
                </Flex>
            </Flex>

            {/* Connection & Keys */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <AntText style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Cấu hình kết nối &amp; ví
                </AntText>
                <Stack spacing={3} mt={3}>
                    <Flex align="center" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W}>RPC URL</Text>
                        <Input
                            value={rpc}
                            onChange={(e) => { setRpc(e.target.value); scheduleSave({ rpc: e.target.value }) }}
                            placeholder="https://bsc.drpc.org"
                            style={{ flex: 1 }}
                        />
                        <Text fontSize="sm" color="gray.400" minW="80px" textAlign="right">Chain ID</Text>
                        <Input
                            value={chainId}
                            onChange={(e) => { setChainId(e.target.value); scheduleSave({ chainId: e.target.value }) }}
                            placeholder="56"
                            style={{ width: 80 }}
                        />
                    </Flex>

                    <Flex align="center" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W}>Ví chủ (deploy)</Text>
                        <Input.Password
                            value={mainKey}
                            onChange={(e) => { setMainKey(e.target.value); scheduleSave({ mainKey: e.target.value }) }}
                            placeholder="Private key"
                            style={{ flex: 1 }}
                        />
                        <Flex direction="column" minW="260px" gap={0}>
                            <Text fontSize="xs" color={mainAddr ? 'green.400' : 'gray.600'} fontFamily="mono">
                                {mainAddr || '—'}
                            </Text>
                            {mainBal && <Text fontSize="xs" color="yellow.300">{mainBal}</Text>}
                        </Flex>
                    </Flex>

                    <Flex align="center" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W}>Ví swap</Text>
                        <Input.Password
                            value={swapKey}
                            onChange={(e) => { setSwapKey(e.target.value); scheduleSave({ swapKey: e.target.value }) }}
                            placeholder="Private key"
                            style={{ flex: 1 }}
                        />
                        <Flex direction="column" minW="260px" gap={0}>
                            <Text fontSize="xs" color={swapAddr ? 'blue.400' : 'gray.600'} fontFamily="mono">
                                {swapAddr || '—'}
                            </Text>
                            {swapBal && <Text fontSize="xs" color="yellow.300">{swapBal}</Text>}
                        </Flex>
                    </Flex>

                    <Flex align="center" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W}>Ví mint</Text>
                        <Input.Password
                            value={mintKey}
                            onChange={(e) => { setMintKey(e.target.value); scheduleSave({ mintKey: e.target.value }) }}
                            placeholder="Private key"
                            style={{ flex: 1 }}
                        />
                        <Flex direction="column" minW="260px" gap={0}>
                            <Text fontSize="xs" color={mintAddr ? 'purple.400' : 'gray.600'} fontFamily="mono">
                                {mintAddr || '—'}
                            </Text>
                            {mintBal && <Text fontSize="xs" color="yellow.300">{mintBal}</Text>}
                        </Flex>
                    </Flex>
                </Stack>
            </Box>

            {/* Contract Editor */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <AntText style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Contract Solidity
                </AntText>
                <Box mt={2} border="1px solid #333" borderRadius="4px" overflow="hidden">
                    <Editor
                        height="380px"
                        language="sol"
                        value={contractCode}
                        onChange={(v) => { setContractCode(v || ''); scheduleSave({ contractCode: v || '' }) }}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineHeight: 20,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            tabSize: 4,
                        }}
                    />
                </Box>
            </Box>

            {/* Token Table */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <Flex align="center" justify="space-between" mb={3}>
                    <AntText style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Danh sách token (chạy tuần tự)
                    </AntText>
                    <Button size="small" icon={<PlusOutlined />} onClick={addRow} disabled={running}>
                        Thêm token
                    </Button>
                </Flex>
                <Table
                    dataSource={tokens}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Box>

            {/* Swap Commands */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <Flex align="center" justify="space-between" mb={3}>
                    <AntText style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Lệnh swap (ví swap, chạy tuần tự sau add liquidity)
                    </AntText>
                    <Flex gap={2}>
                        <Button size="small" icon={<DownloadOutlined />} onClick={exportSwapExcel}>
                            Xuất Excel
                        </Button>
                        <label>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                style={{ display: 'none' }}
                                onChange={(e) => { if (e.target.files?.[0]) importSwapExcel(e.target.files[0]); e.target.value = '' }}
                            />
                            <Button size="small" icon={<UploadOutlined />} disabled={running} onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}>
                                Nhập Excel
                            </Button>
                        </label>
                        <Button size="small" icon={<PlusOutlined />} onClick={addSwapCmd} disabled={running}>
                            Thêm lệnh
                        </Button>
                    </Flex>
                </Flex>
                <Flex align="center" gap={3} mb={3}>
                    <Text fontSize="sm" color="gray.400">Delay giữa các lệnh (giây)</Text>
                    <InputNumber
                        size="small"
                        min={0}
                        value={swapDelay}
                        onChange={(v) => {
                            const val = v ?? 0
                            setSwapDelay(val)
                            scheduleSave({ swapDelay: String(val) })
                        }}
                        disabled={running}
                        style={{ width: 100 }}
                        addonAfter="s"
                    />
                </Flex>
                <Table
                    dataSource={swapCommands}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'Chưa có lệnh swap' }}
                    columns={[
                        {
                            title: 'STT',
                            width: 50,
                            render: (_: any, __: SwapCommand, i: number) => i + 1,
                        },
                        {
                            title: 'Loại',
                            width: 110,
                            render: (_: any, row: SwapCommand) => (
                                <Select
                                    size="small"
                                    value={row.type}
                                    onChange={(v) => updateSwapCmd(row.id, 'type', v)}
                                    disabled={running}
                                    style={{ width: '100%' }}
                                    options={[
                                        { value: 'buy', label: '🟢 Mua' },
                                        { value: 'sell', label: '🔴 Bán' },
                                    ]}
                                />
                            ),
                        },
                        {
                            title: 'Số lượng BNB',
                            render: (_: any, row: SwapCommand) => (
                                <InputNumber
                                    size="small"
                                    stringMode
                                    min="0"
                                    value={row.amount || undefined}
                                    onChange={(v) => updateSwapCmd(row.id, 'amount', v ?? '')}
                                    placeholder="VD: 0.1"
                                    disabled={running}
                                    style={{ width: '100%' }}
                                />
                            ),
                        },
                        {
                            title: 'Slippage %',
                            width: 110,
                            render: (_: any, row: SwapCommand) => (
                                <InputNumber
                                    size="small"
                                    min={0}
                                    max={100}
                                    value={Number(row.slippage) || 0}
                                    onChange={(v) => updateSwapCmd(row.id, 'slippage', String(v ?? 5))}
                                    formatter={(v) => `${v}%`}
                                    parser={(v) => Number(v ? v.replace('%', '') : 5)}
                                    disabled={running}
                                    style={{ width: '100%' }}
                                />
                            ),
                        },
                        {
                            title: '',
                            width: 44,
                            render: (_: any, row: SwapCommand) => (
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeSwapCmd(row.id)}
                                    disabled={running}
                                />
                            ),
                        },
                    ]}
                />
            </Box>

            {/* Step Progress */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <AntText style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 12 }}>
                    Tiến trình automation
                </AntText>
                {Object.keys(stepStates).length === 0
                    ? <AntText type="secondary" style={{ fontSize: 12 }}>Chưa có tiến trình nào</AntText>
                    : (
                        <Stack spacing={4}>
                            {Object.entries(stepStates).map(([tokenId, { tokenName, statuses }]) => {
                                const contractAddress = tokens.find((t) => t.id === tokenId)?.contractAddress
                                return (
                                    <Box key={tokenId}>
                                        <Flex align="center" gap={3} mb={2}>
                                            <AntText style={{ color: '#aaa', fontSize: 12 }}>
                                                {tokenName || tokenId}
                                            </AntText>
                                            {contractAddress && (
                                                <Tooltip title={contractAddress}>
                                                    <Link
                                                        href={`https://bscscan.com/address/${contractAddress}`}
                                                        target="_blank"
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {contractAddress.slice(0, 6)}…{contractAddress.slice(-4)}
                                                    </Link>
                                                </Tooltip>
                                            )}
                                        </Flex>
                                        <Steps
                                            size="small"
                                            items={[
                                                { title: 'Deploy & Initialize', status: statuses[0] },
                                                { title: 'Set Whitelist', status: statuses[1] },
                                                { title: 'Transfer Token', status: statuses[2] },
                                                { title: 'Add Liquidity', status: statuses[3] },
                                                { title: 'Chạy lệnh swap', status: statuses[4] },
                                            ]}
                                        />
                                    </Box>
                                )
                            })}
                        </Stack>
                    )
                }
            </Box>

            {/* Start */}
            <Box mb={4}>
                <Flex gap={2}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlayCircleOutlined />}
                        onClick={handleStart}
                        loading={running}
                        disabled={running}
                        style={{ flex: 1, height: 48, fontSize: 15 }}
                    >
                        {running ? 'Đang chạy automation...' : 'Bắt đầu Automation'}
                    </Button>
                    {running && (
                        <Button
                            danger
                            size="large"
                            icon={<StopOutlined />}
                            onClick={() => { stopRef.current = true }}
                            style={{ height: 48 }}
                        >
                            Dừng
                        </Button>
                    )}
                </Flex>
            </Box>

            {/* Log */}
            <Box bg="#0d0d0d" borderRadius="8px" p={3} border="1px solid #2a2a2a">
                <Flex align="center" justify="space-between" mb={2}>
                    <AntText style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Log
                    </AntText>
                    <Button size="small" onClick={() => setLogs([])} disabled={logs.length === 0}>
                        Clear
                    </Button>
                </Flex>
                <Box maxH="320px" overflowY="auto">
                    {logs.length === 0
                        ? <AntText type="secondary" style={{ fontSize: 12 }}>Chưa có log</AntText>
                        : logs.map(({ id, text }) => {
                            const isError = text.includes('LỖI') || text.includes('ERROR') || text.includes('thất bại')
                            const isSuccess = text.includes('thành công') || text.includes('hoàn thành') || text.includes('✓')
                            return (
                                <Text
                                    key={id}
                                    fontSize="12px"
                                    fontFamily="mono"
                                    lineHeight="1.7"
                                    color={isError ? 'red.400' : isSuccess ? 'green.400' : 'gray.300'}
                                    whiteSpace="pre-wrap"
                                >
                                    {text}
                                </Text>
                            )
                        })
                    }
                    <div ref={logEndRef} />
                </Box>
            </Box>
        </Box>
    )
}

export default Main
