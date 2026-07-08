import {
    DeleteOutlined,
    DownloadOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    SettingOutlined,
    StopOutlined,
    UploadOutlined,
} from '@ant-design/icons'
import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import {
    Button,
    Input,
    InputNumber,
    Modal,
    Select,
    Steps,
    Table,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd'
import { ethers } from 'ethers'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface TabStatus {
    running: boolean
    hasError: boolean
    done: boolean
    successCount: number
    tokenTotal: number
}
import type { AutomationToken, ScanContractConfig, StepStatus, SwapCommand } from '../utils/automationService'
import { runAutomation } from '../utils/automationService'
import { buildProvider, parseRpcList } from '../utils/buildProvider'
import DEFAULT_CONTRACT from '../utils/defaultContract'
import * as XLSX from 'xlsx'
import {
    useCountScanWallet,
    useCreateManyScanWallet,
    useFindManyScanWallet,
} from '../hooks/zenstack'
import zenStackFunction from '../utils/zenstack-function'

const { Title, Text: AntText, Link } = Typography

type RowStatus = 'idle' | 'running' | 'success' | 'error'

interface TokenRow {
    id: string
    name: string
    symbol: string
    decimal: number
    mintAmount: string
    liquidityToken: string
    liquidityBNB: string
    sellMintAmount: string
    taxBuy: string
    taxSell: string
    totalSupply: string
    status: RowStatus
    contractAddress?: string
    errorMsg?: string
}

let _rowId = 1
const newRow = (): TokenRow => ({
    id: String(_rowId++),
    name: '',
    symbol: '',
    decimal: 18,
    mintAmount: '',
    liquidityToken: '',
    liquidityBNB: '',
    sellMintAmount: '',
    taxBuy: '0',
    taxSell: '0',
    totalSupply: '',
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

const getElectron = () => (window as any).electron

const SCAN_PAGE_SIZE = 20

const ScanContractPanel = ({ contractAddress }: { contractAddress: string }) => {
    const [page, setPage] = useState(1)

    const { data: total = 0 } = useCountScanWallet(
        { where: { wallet: contractAddress } },
        { refetchInterval: 5000 }
    )
    const { data: transferred = 0 } = useCountScanWallet(
        { where: { wallet: contractAddress, isTransferred: true } },
        { refetchInterval: 5000 }
    )
    const { data: rows = [] } = useFindManyScanWallet(
        {
            where: { wallet: contractAddress },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * SCAN_PAGE_SIZE,
            take: SCAN_PAGE_SIZE,
        },
        { refetchInterval: 5000 }
    )

    const shortAddr = `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`

    return (
        <>
            <Flex gap={8} mb={3}>
                <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                        Tổng ví quét được
                    </Text>
                    <Text fontSize="2xl" color="blue.400" fontWeight="bold" fontFamily="mono">
                        {total as number}
                    </Text>
                </Box>
                <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                        Đã transfer
                    </Text>
                    <Text fontSize="2xl" color="green.400" fontWeight="bold" fontFamily="mono">
                        {transferred as number}
                    </Text>
                </Box>
                <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                        Chưa transfer
                    </Text>
                    <Text fontSize="2xl" color="yellow.300" fontWeight="bold" fontFamily="mono">
                        {(total as number) - (transferred as number)}
                    </Text>
                </Box>
            </Flex>
            <Table
                size="small"
                dataSource={rows as any[]}
                rowKey="id"
                pagination={{
                    current: page,
                    pageSize: SCAN_PAGE_SIZE,
                    total: total as number,
                    onChange: setPage,
                    showSizeChanger: false,
                    showTotal: (t) => `${t} ví`,
                }}
                columns={[
                    {
                        title: 'STT',
                        width: 60,
                        render: (_: any, __: any, i: number) =>
                            (page - 1) * SCAN_PAGE_SIZE + i + 1,
                    },
                    {
                        title: 'Ví nhận',
                        dataIndex: 'destination',
                        render: (v: string) => (
                            <AntText code style={{ fontSize: 11 }}>
                                {v}
                            </AntText>
                        ),
                    },
                    {
                        title: 'Số lượng',
                        dataIndex: 'amount',
                        width: 120,
                    },
                    {
                        title: 'Trạng thái',
                        dataIndex: 'isTransferred',
                        width: 110,
                        render: (v: boolean) => (
                            <Tag color={v ? 'success' : 'warning'}>
                                {v ? 'Đã transfer' : 'Chưa'}
                            </Tag>
                        ),
                    },
                ]}
                scroll={{ y: 300 }}
                style={{ marginTop: 8 }}
            />
        </>
    )
}

const Main = ({
    tabId = 'default',
    onStatusChange,
}: {
    tabId?: string
    onStatusChange?: (status: TabStatus) => void
}) => {
    const [rpcList, setRpcList] = useState('https://bsc.drpc.org')
    const [chainId, setChainId] = useState('56')
    const [mainKey, setMainKey] = useState('')
    const [swapKey, setSwapKey] = useState('')
    const [mintKey, setMintKey] = useState('')
    const [contractCode, setContractCode] = useState(DEFAULT_CONTRACT)
    const [tokens, setTokens] = useState<TokenRow[]>([newRow()])
    const [running, setRunning] = useState(false)
    const [logs, setLogs] = useState<{ id: number; text: string }[]>([])
    const [solcVersion, setSolcVersion] = useState('0.8.27')
    const [solcVersionOptions, setSolcVersionOptions] = useState<
        { value: string; label: string }[]
    >([])
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [stepStates, setStepStates] = useState<
        Record<string, { tokenName: string; statuses: StepStatus[] }>
    >({})
    const [swapCommands, setSwapCommands] = useState<SwapCommand[]>([])
    const [swapDelay, setSwapDelay] = useState<number>(0)
    const [transferBnbToMain, setTransferBnbToMain] = useState('')
    const [scanContracts, setScanContracts] = useState<ScanContractConfig[]>([])
    const [scanContractErrors, setScanContractErrors] = useState<Record<number, string>>({})
    const [disperseAmount, setDisperseAmount] = useState('')
    const [disperseBatchSize, setDisperseBatchSize] = useState<number>(10000)
    const [scanDelay, setScanDelay] = useState<number>(30)
    const [scanMaxDuration, setScanMaxDuration] = useState<number>(0)
    const [implAddress, setImplAddress] = useState<string | null>(null)
    const [factoryAddress, setFactoryAddress] = useState<string | null>(null)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const stopRef = useRef(false)

    const validateScanContractAddress = useCallback(
        (addr: string, ignoreIndex: number): string | null => {
            const v = addr.trim()
            if (!v) return null // empty is OK, not an error
            if (!/^0x[0-9a-fA-F]{40}$/.test(v)) return 'Địa chỉ không hợp lệ'
            const dup = scanContracts.find(
                (c, j) => j !== ignoreIndex && c.address.trim().toLowerCase() === v.toLowerCase()
            )
            if (dup) return 'Địa chỉ bị trùng'
            return null
        },
        [scanContracts]
    )

    useEffect(() => {
        onStatusChange?.({
            running,
            hasError: tokens.some((t) => t.status === 'error'),
            done: !running && tokens.some((t) => t.status === 'success'),
            successCount: tokens.filter((t) => t.status === 'success').length,
            tokenTotal: tokens.length,
        })
    }, [running, tokens, onStatusChange])

    // Re-validate scan contracts on any change (covers load + edits)
    useEffect(() => {
        const errors: Record<number, string> = {}
        scanContracts.forEach((c, i) => {
            const err = validateScanContractAddress(c.address, i)
            if (err) errors[i] = err
        })
        setScanContractErrors(errors)
    }, [scanContracts, validateScanContractAddress])

    const scanContractAddresses = scanContracts.map((c) => c.address).filter(Boolean)
    const hasScanContracts = scanContractAddresses.length > 0
    const [scanTabKey, setScanTabKey] = useState<string>('')
    const { mutateAsync: createManyScanWallet } = useCreateManyScanWallet()

    const mainAddr = deriveAddress(mainKey)
    const swapAddr = deriveAddress(swapKey)
    const mintAddr = deriveAddress(mintKey)

    const [mainBal, setMainBal] = useState('')
    const [swapBal, setSwapBal] = useState('')
    const [mintBal, setMintBal] = useState('')

    useEffect(() => {
        const urls = parseRpcList(rpcList)
        if (urls.length === 0) return
        const provider = buildProvider(urls)
        const fetchBal = (addr: string, set: (v: string) => void) => {
            if (!addr) {
                set('')
                return
            }
            provider
                .getBalance(addr)
                .then((b) =>
                    set(`${Number.parseFloat(ethers.utils.formatEther(b)).toFixed(4)} BNB`)
                )
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
    }, [mainAddr, swapAddr, mintAddr, rpcList])

    // Load config + version list on mount
    useEffect(() => {
        const el = getElectron()
        if (!el) return
        el.getSolcVersions().then((opts: { value: string; label: string }[]) => {
            setSolcVersionOptions(opts)
        })
        el.loadConfig(tabId).then((cfg: any) => {
            if (!cfg) return
            if (cfg.rpc) setRpcList(cfg.rpc)
            if (cfg.chainId) setChainId(cfg.chainId)
            if (cfg.mainKey) setMainKey(cfg.mainKey)
            if (cfg.swapKey) setSwapKey(cfg.swapKey)
            if (cfg.mintKey) setMintKey(cfg.mintKey)
            if (cfg.contractCode) setContractCode(
                cfg.contractCode.includes('function airdrop') ? cfg.contractCode : DEFAULT_CONTRACT
            )
            if (cfg.solcVersion) setSolcVersion(cfg.solcVersion)
            if (cfg.tokensJson) {
                try {
                    const saved = JSON.parse(cfg.tokensJson) as Omit<
                        TokenRow,
                        'status' | 'contractAddress' | 'errorMsg'
                    >[]
                    if (Array.isArray(saved) && saved.length > 0) {
                        setTokens(
                            saved.map((t) => ({ ...t, symbol: t.symbol ?? '', id: String(_rowId++), status: 'idle' }))
                        )
                    }
                } catch {
                    /* ignore */
                }
            }
            if (cfg.swapCommandsJson) {
                try {
                    const saved = JSON.parse(cfg.swapCommandsJson) as SwapCommand[]
                    if (Array.isArray(saved))
                        setSwapCommands(
                            saved.map((c) => ({ ...c, id: String(swapIdRef.current++) }))
                        )
                } catch {
                    /* ignore */
                }
            }
            if (cfg.swapDelay) setSwapDelay(Number(cfg.swapDelay) || 0)
            if (cfg.transferBnbToMain) setTransferBnbToMain(cfg.transferBnbToMain)
            if (cfg.scanContractsJson) {
                try {
                    const saved = JSON.parse(cfg.scanContractsJson) as ScanContractConfig[]
                    if (Array.isArray(saved))
                        setScanContracts(saved.map((c) => ({ address: c.address })))
                } catch {}
            } else if (cfg.scanContract) {
                setScanContracts([{ address: cfg.scanContract }])
            }
            if (cfg.disperseAmount) setDisperseAmount(cfg.disperseAmount)
            if (cfg.disperseBatchSize) setDisperseBatchSize(Number(cfg.disperseBatchSize) || 10000)
            if (cfg.scanDelay) setScanDelay(Number(cfg.scanDelay) || 30)
            if (cfg.scanMaxDuration) setScanMaxDuration(Number(cfg.scanMaxDuration) || 0)
            if (cfg.implAddress) setImplAddress(cfg.implAddress)
            if (cfg.factoryAddress) setFactoryAddress(cfg.factoryAddress)
            if (cfg.logsJson) {
                try {
                    const saved = JSON.parse(cfg.logsJson)
                    if (Array.isArray(saved) && saved.length > 0) setLogs(saved)
                } catch {
                    /* ignore */
                }
            }
            if (cfg.stepStatesJson) {
                try {
                    const saved = JSON.parse(cfg.stepStatesJson)
                    if (saved && typeof saved === 'object') setStepStates(saved)
                } catch {
                    /* ignore */
                }
            }
        })
    }, [])

    const scheduleSave = useCallback((patch: Record<string, string>) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
            getElectron()?.saveConfig(patch, tabId)
        }, 800)
    }, [tabId])

    const logIdRef = useRef(0)
    const swapIdRef = useRef(1)
    const logSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const addLog = useCallback((msg: string) => {
        const time = new Date().toLocaleTimeString('vi-VN')
        setLogs((prev) => {
            const next = [...prev, { id: logIdRef.current++, text: `[${time}] ${msg}` }]
            const trimmed = next.slice(-500)
            if (logSaveTimer.current) clearTimeout(logSaveTimer.current)
            logSaveTimer.current = setTimeout(() => {
                getElectron()?.saveConfig({ logsJson: JSON.stringify(trimmed) }, tabId)
            }, 1500)
            return trimmed
        })
    }, [])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const addScanLog = useCallback((_msg: string) => {}, [])

    const saveTokens = useCallback(
        (next: TokenRow[]) => {
            const saveable = next.map(
                ({
                    name,
                    symbol,
                    decimal,
                    mintAmount,
                    liquidityToken,
                    liquidityBNB,
                    sellMintAmount,
                    taxBuy,
                    taxSell,
                    totalSupply,
                }) => ({
                    name,
                    symbol,
                    decimal,
                    mintAmount,
                    liquidityToken,
                    liquidityBNB,
                    sellMintAmount,
                    taxBuy,
                    taxSell,
                    totalSupply,
                })
            )
            scheduleSave({ tokensJson: JSON.stringify(saveable) })
        },
        [scheduleSave]
    )

    const newSwapCmd = (): SwapCommand => ({
        id: String(swapIdRef.current++),
        type: 'buy',
        amount: '',
        slippage: '5',
    })

    const saveSwapCommands = (cmds: SwapCommand[]) =>
        scheduleSave({ swapCommandsJson: JSON.stringify(cmds) })

    const addSwapCmd = () =>
        setSwapCommands((prev) => {
            const next = [...prev, newSwapCmd()]
            saveSwapCommands(next)
            return next
        })
    const removeSwapCmd = (id: string) =>
        setSwapCommands((prev) => {
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
        const ws =
            rows.length > 0 ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([headers])
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
                    type: String(r.Loai || r.loai || r.type || 'buy')
                        .toLowerCase()
                        .includes('ban')
                        ? 'sell'
                        : 'buy',
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

    const exportScanWallets = async () => {
        if (scanContractAddresses.length === 0) return
        try {
            const data: any[] =
                (await zenStackFunction('ScanWallet' as any, 'findMany', {
                    where: { wallet: { in: scanContractAddresses } },
                })) ?? []
            const rows = data
                .filter((r: any) => r.destination)
                .map((r: any, i: number) => ({
                    STT: i + 1,
                    DiaChi: r.destination,
                    DaTransfer: r.isTransferred ? 'Co' : 'Chua',
                }))
            const ws = XLSX.utils.json_to_sheet(
                rows.length > 0 ? rows : [{ STT: '', DiaChi: '', DaTransfer: '' }]
            )
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'ScanWallets')
            XLSX.writeFile(wb, 'scan-wallets.xlsx')
            message.success(`Đã xuất ${rows.length} địa chỉ`)
        } catch (e) {
            console.error('exportScanWallets error:', e)
            message.error('Xuất file thất bại')
        }
    }

    const importScanWallets = (file: File) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const ext = file.name.toLowerCase().split('.').pop()
                let addresses: string[] = []
                if (ext === 'xlsx' || ext === 'xls') {
                    const wb = XLSX.read(e.target?.result, { type: 'array' })
                    const ws = wb.Sheets[wb.SheetNames[0]]
                    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
                    for (const row of rows) {
                        for (const cell of row) {
                            const val = String(cell ?? '').trim()
                            if (/^0x[0-9a-fA-F]{40}$/.test(val)) addresses.push(val)
                        }
                    }
                } else {
                    const text = new TextDecoder().decode(e.target?.result as ArrayBuffer)
                    addresses = text.split(/[\r\n,;]+/).map((l) => l.trim())
                }
                const valid = [...new Set(addresses.filter((a) => /^0x[0-9a-fA-F]{40}$/.test(a)))]
                if (valid.length === 0) {
                    message.error('Không tìm thấy địa chỉ hợp lệ')
                    return
                }
                const importTarget = scanTabKey || scanContractAddresses[0] || 'imported'
                await createManyScanWallet({
                    data: valid.map((addr) => ({
                        wallet: importTarget,
                        tx: 'imported',
                        destination: addr,
                        isTransferred: false,
                    })),
                })
                message.success(`Đã nhập ${valid.length} địa chỉ`)
            } catch {
                message.error('Import thất bại')
            }
        }
        reader.readAsArrayBuffer(file)
        return false
    }

    const addRow = () =>
        setTokens((prev) => {
            const next = [...prev, newRow()]
            saveTokens(next)
            return next
        })

    const removeRow = (id: string) =>
        setTokens((prev) => {
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
    ) => {
        setTokens((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status, contractAddress, errorMsg } : r))
        )
        // Save implementation address when first token deploys successfully
        if (status === 'success' && contractAddress && !implAddress) {
            setImplAddress(contractAddress)
            getElectron()?.saveConfig({ implAddress: contractAddress }, tabId)
        }
    }

    const handleStart = async () => {
        if (!mainKey || !swapKey || !mintKey) {
            message.error('Vui lòng nhập đủ 3 private key')
            return
        }
        const rpcUrls = parseRpcList(rpcList)
        if (rpcUrls.length === 0) {
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
            prev.map((r) => ({
                ...r,
                status: 'idle' as RowStatus,
                contractAddress: undefined,
                errorMsg: undefined,
            }))
        )

        const initialSteps: Record<string, { tokenName: string; statuses: StepStatus[] }> = {}
        for (const t of valid) {
            initialSteps[t.id] = {
                tokenName: t.name,
                statuses: ['wait', 'wait', 'wait', 'wait', 'wait', 'wait', 'wait', 'wait', 'wait'],
            }
        }
        setStepStates(initialSteps)

        const onStepChange = (
            tokenId: string,
            step: number,
            status: 'process' | 'finish' | 'error'
        ) => {
            setStepStates((prev) => {
                const curr = prev[tokenId]
                if (!curr) return prev
                const statuses = [...curr.statuses] as StepStatus[]
                statuses[step] = status
                const next = { ...prev, [tokenId]: { ...curr, statuses } }
                getElectron()?.saveConfig({ stepStatesJson: JSON.stringify(next) }, tabId)
                return next
            })
        }

        try {
            addLog(`Đang compile contract (solc v${solcVersion})...`)
            const compileResult = await getElectron()?.compileContract(contractCode, solcVersion)
            addLog(
                `Compile thành công: contract "${compileResult.contractName}" [solc ${solcVersion}]`
            )

            const normalizeKey = (k: string) =>
                k.trim().startsWith('0x') ? k.trim() : `0x${k.trim()}`

            // Deploy ProxyFactory once if needed (for atomic clone+init)
            let currentFactoryAddr = factoryAddress
            if (implAddress && !currentFactoryAddr && compileResult.allContracts?.['ProxyFactory']) {
                const provider = buildProvider(rpcUrls)
                const mainWallet = new ethers.Wallet(normalizeKey(mainKey), provider)
                const factoryInfo = compileResult.allContracts['ProxyFactory']
                addLog('Deploying ProxyFactory (one-time)...')
                const factoryFactory = new ethers.ContractFactory(
                    factoryInfo.abi,
                    factoryInfo.bytecode,
                    mainWallet
                )
                const factoryDeployed = await factoryFactory.deploy(
                    { gasLimit: 500_000 }
                )
                await factoryDeployed.deployed()
                currentFactoryAddr = factoryDeployed.address
                setFactoryAddress(currentFactoryAddr)
                getElectron()?.saveConfig({ factoryAddress: currentFactoryAddr }, tabId)
                addLog(`ProxyFactory deployed: ${currentFactoryAddr}`)
            }

            await runAutomation(
                {
                    rpcList: rpcUrls,
                    chainId: Number(chainId) || 56,
                    mainPrivateKey: normalizeKey(mainKey),
                    swapPrivateKey: normalizeKey(swapKey),
                    mintPrivateKey: normalizeKey(mintKey),
                    abi: compileResult.abi,
                    bytecode: compileResult.bytecode,
                    allContracts: compileResult.allContracts,
                    tokens: valid as AutomationToken[],
                    swapCommands,
                    swapDelayMs: swapDelay * 1000,
                    transferBnbToMain,
                    scanContracts: scanContracts
                        .filter((c) => c.address)
                        .map((c) => ({ address: c.address.trim() })),
                    disperseAmount,
                    disperseBatchSize,
                    scanDelaySeconds: scanDelay,
                    scanMaxDurationSeconds: scanMaxDuration || 0,
                    existingImplementationAddress: implAddress,
                    existingFactoryAddress: factoryAddress,
                    shouldStop: () => stopRef.current,
                },
                addLog,
                updateRowStatus,
                onStepChange,
                addScanLog
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
            title: 'Tên / Symbol',
            render: (_: any, row: TokenRow) => (
                <Flex direction="column" gap={1}>
                    <Input
                        size="small"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        placeholder="Tên: VD: My Token"
                        disabled={running}
                    />
                    <Input
                        size="small"
                        value={row.symbol}
                        onChange={(e) => updateRow(row.id, 'symbol', e.target.value)}
                        placeholder="Symbol: VD: MTK"
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
            title: 'Mint amount(Ví mint)',
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    stringMode
                    min="0"
                    value={row.mintAmount || undefined}
                    onChange={(v) => updateRow(row.id, 'mintAmount', v ?? '')}
                    formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(v) => (v ? v.replace(/,/g, '') : '')}
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
                    formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(v) => (v ? v.replace(/,/g, '') : '')}
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
            title: 'Mint thêm (bán hết)',
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    stringMode
                    min="0"
                    value={row.sellMintAmount || undefined}
                    onChange={(v) => updateRow(row.id, 'sellMintAmount', v ?? '')}
                    formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(v) => (v ? v.replace(/,/g, '') : '')}
                    placeholder="VD: 100,000"
                    disabled={running}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Tax Buy %',
            width: 100,
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    min={0}
                    max={100}
                    value={Number(row.taxBuy) || 0}
                    onChange={(v) => updateRow(row.id, 'taxBuy', String(v ?? 0))}
                    disabled={running}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Tax Sell %',
            width: 100,
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    min={0}
                    // max={100}
                    value={Number(row.taxSell) || 0}
                    onChange={(v) => updateRow(row.id, 'taxSell', String(v ?? 0))}
                    disabled={running}
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Total Supply (Ví chủ deploy)',
            render: (_: any, row: TokenRow) => (
                <InputNumber
                    size="small"
                    stringMode
                    min="0"
                    value={row.totalSupply || undefined}
                    onChange={(v) => updateRow(row.id, 'totalSupply', v ?? '')}
                    formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(v) => (v ? v.replace(/,/g, '') : '')}
                    placeholder="Mặc định: Mint+Liq"
                    disabled={running}
                    style={{ width: '100%' }}
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
                        <Text fontSize="sm" color="gray.400" mb={2}>
                            Solidity Compiler Version
                        </Text>
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
                    <Box>
                        <Text fontSize="sm" color="gray.400" mb={2}>
                            Proxy Implementation Cache
                        </Text>
                        {implAddress ? (
                            <>
                                <AntText code style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                                    {implAddress}
                                </AntText>
                                <Button
                                    size="small"
                                    danger
                                    onClick={() => {
                                        setImplAddress(null)
                                        getElectron()?.saveConfig({ implAddress: '' }, tabId)
                                        message.info('Đã xoá implementation cache')
                                    }}
                                    disabled={running}
                                >
                                    Reset Implementation
                                </Button>
                            </>
                        ) : (
                            <Text fontSize="xs" color="gray.500">
                                Chưa có — token đầu tiên sẽ deploy implementation
                            </Text>
                        )}
                    </Box>
                </Stack>
            </Modal>

            {/* Header */}
            <Flex align="center" justify="space-between" mb={5}>
                <Title level={4} style={{ color: '#e0e0e0', margin: 0 }}>
                    Token Automation Tool
                </Title>
                <Flex align="center" gap={2}>
                    <AntText style={{ color: '#666', fontSize: 12 }}>solc v{solcVersion}</AntText>
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
                <AntText
                    style={{
                        color: '#666',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                    }}
                >
                    Cấu hình kết nối &amp; ví
                </AntText>
                <Stack spacing={3} mt={3}>
                    <Flex align="start" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W} pt={1}>
                            RPC URLs
                        </Text>
                        <Input.TextArea
                            value={rpcList}
                            onChange={(e) => {
                                setRpcList(e.target.value)
                                scheduleSave({ rpc: e.target.value })
                            }}
                            placeholder={'https://bsc.drpc.org\nhttps://bsc-rpc.publicnode.com'}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}
                        />
                        <Text fontSize="sm" color="gray.400" minW="80px" textAlign="right">
                            Chain ID
                        </Text>
                        <Input
                            value={chainId}
                            onChange={(e) => {
                                setChainId(e.target.value)
                                scheduleSave({ chainId: e.target.value })
                            }}
                            placeholder="56"
                            style={{ width: 80 }}
                        />
                    </Flex>

                    <Flex align="center" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W}>
                            Ví chủ (deploy)
                        </Text>
                        <Input.Password
                            value={mainKey}
                            onChange={(e) => {
                                setMainKey(e.target.value)
                                scheduleSave({ mainKey: e.target.value })
                            }}
                            placeholder="Private key"
                            style={{ flex: 1 }}
                        />
                        <Flex direction="column" minW="260px" gap={0}>
                            <Text
                                fontSize="xs"
                                color={mainAddr ? 'green.400' : 'gray.600'}
                                fontFamily="mono"
                            >
                                {mainAddr || '—'}
                            </Text>
                            {mainBal && (
                                <Text fontSize="xs" color="yellow.300">
                                    {mainBal}
                                </Text>
                            )}
                        </Flex>
                    </Flex>

                    <Flex align="center" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W}>
                            Ví swap
                        </Text>
                        <Input.Password
                            value={swapKey}
                            onChange={(e) => {
                                setSwapKey(e.target.value)
                                scheduleSave({ swapKey: e.target.value })
                            }}
                            placeholder="Private key"
                            style={{ flex: 1 }}
                        />
                        <Flex direction="column" minW="260px" gap={0}>
                            <Text
                                fontSize="xs"
                                color={swapAddr ? 'blue.400' : 'gray.600'}
                                fontFamily="mono"
                            >
                                {swapAddr || '—'}
                            </Text>
                            {swapBal && (
                                <Text fontSize="xs" color="yellow.300">
                                    {swapBal}
                                </Text>
                            )}
                        </Flex>
                    </Flex>

                    <Flex align="center" gap={3}>
                        <Text fontSize="sm" color="gray.400" minW={LABEL_W}>
                            Ví mint
                        </Text>
                        <Input.Password
                            value={mintKey}
                            onChange={(e) => {
                                setMintKey(e.target.value)
                                scheduleSave({ mintKey: e.target.value })
                            }}
                            placeholder="Private key"
                            style={{ flex: 1 }}
                        />
                        <Flex direction="column" minW="260px" gap={0}>
                            <Text
                                fontSize="xs"
                                color={mintAddr ? 'purple.400' : 'gray.600'}
                                fontFamily="mono"
                            >
                                {mintAddr || '—'}
                            </Text>
                            {mintBal && (
                                <Text fontSize="xs" color="yellow.300">
                                    {mintBal}
                                </Text>
                            )}
                        </Flex>
                    </Flex>
                </Stack>
            </Box>

            {/* Contract Editor */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <AntText
                    style={{
                        color: '#666',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                    }}
                >
                    Contract Solidity
                </AntText>
                <Box mt={2} border="1px solid #333" borderRadius="4px" overflow="hidden">
                    <Editor
                        height="380px"
                        language="sol"
                        value={contractCode}
                        onChange={(v) => {
                            setContractCode(v || '')
                            scheduleSave({ contractCode: v || '' })
                        }}
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
                    <AntText
                        style={{
                            color: '#666',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        Danh sách token (chạy tuần tự)
                    </AntText>
                    <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={addRow}
                        disabled={running}
                    >
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
                    <AntText
                        style={{
                            color: '#666',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
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
                                onChange={(e) => {
                                    if (e.target.files?.[0]) importSwapExcel(e.target.files[0])
                                    e.target.value = ''
                                }}
                            />
                            <Button
                                size="small"
                                icon={<UploadOutlined />}
                                disabled={running}
                                onClick={(e) =>
                                    (
                                        e.currentTarget.previousElementSibling as HTMLInputElement
                                    )?.click()
                                }
                            >
                                Nhập Excel
                            </Button>
                        </label>
                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={addSwapCmd}
                            disabled={running}
                        >
                            Thêm lệnh
                        </Button>
                    </Flex>
                </Flex>
                <Flex align="center" gap={3} mb={3}>
                    <Text fontSize="sm" color="gray.400">
                        Delay giữa các lệnh (giây)
                    </Text>
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
                    <Text fontSize="sm" color="gray.400" ml={4}>
                        BNB chuyển về ví chủ (step 7)
                    </Text>
                    <Input
                        size="small"
                        value={transferBnbToMain}
                        onChange={(e) => {
                            setTransferBnbToMain(e.target.value)
                            scheduleSave({ transferBnbToMain: e.target.value })
                        }}
                        disabled={running}
                        placeholder="VD: 0.5"
                        style={{ width: 120 }}
                        addonAfter="BNB"
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
                                    onChange={(v) =>
                                        updateSwapCmd(row.id, 'slippage', String(v ?? 5))
                                    }
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

            {/* Scan Settings (Step 5.2) */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <Flex align="center" justify="space-between" mb={3}>
                    <AntText
                        style={{
                            color: '#666',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        Cài đặt quét & airdrop (step 5.2 / 1.1)
                    </AntText>
                    <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            const next = [...scanContracts, { address: '' }]
                            setScanContracts(next)
                            scheduleSave({ scanContractsJson: JSON.stringify(next) })
                        }}
                        disabled={running}
                    >
                        Thêm contract
                    </Button>
                </Flex>
                <Flex align="center" gap={3} wrap="wrap" mb={3}>
                    <Text fontSize="sm" color="gray.400">
                        Amount/ví
                    </Text>
                    <Input
                        size="small"
                        value={disperseAmount}
                        onChange={(e) => {
                            setDisperseAmount(e.target.value)
                            scheduleSave({ disperseAmount: e.target.value })
                        }}
                        disabled={running}
                        placeholder="VD: 1000"
                        style={{ width: 130 }}
                    />
                    <Text fontSize="sm" color="gray.400" ml={2}>
                        Batch
                    </Text>
                    <InputNumber
                        size="small"
                        min={1}
                        max={50000}
                        value={disperseBatchSize}
                        onChange={(v) => {
                            const val = Number(v) || 10000
                            setDisperseBatchSize(val)
                            scheduleSave({ disperseBatchSize: String(val) })
                        }}
                        disabled={running}
                        style={{ width: 90 }}
                    />
                    <Text fontSize="sm" color="gray.400" ml={2}>
                        Delay
                    </Text>
                    <InputNumber
                        size="small"
                        min={1}
                        value={scanDelay}
                        onChange={(v) => {
                            const val = v ?? 30
                            setScanDelay(val)
                            scheduleSave({ scanDelay: String(val) })
                        }}
                        disabled={running}
                        style={{ width: 90 }}
                        addonAfter="s"
                    />
                    <Text fontSize="sm" color="gray.400" ml={2}>
                        Max time
                    </Text>
                    <InputNumber
                        size="small"
                        min={0}
                        value={scanMaxDuration}
                        onChange={(v) => {
                            const val = v ?? 0
                            setScanMaxDuration(val)
                            scheduleSave({ scanMaxDuration: String(val) })
                        }}
                        disabled={running}
                        style={{ width: 90 }}
                        addonAfter="s"
                    />
                    <Text fontSize="xs" color="gray.500">
                        (0 = không giới hạn)
                    </Text>
                </Flex>
                {scanContracts.length === 0 ? (
                    <AntText type="secondary" style={{ fontSize: 12 }}>
                        Chưa cấu hình contract quét — nhấn "Thêm contract"
                    </AntText>
                ) : (
                    <Stack spacing={2}>
                        {scanContracts.map((cfg, i) => (
                            <Flex key={i} align="center" gap={2}>
                                <Text fontSize="sm" color="gray.500" minW="20px">
                                    {i + 1}.
                                </Text>
                                <Input
                                    size="small"
                                    value={cfg.address}
                                    status={scanContractErrors[i] ? 'error' : undefined}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        const next = scanContracts.map((c, j) =>
                                            j === i ? { ...c, address: val } : c
                                        )
                                        setScanContracts(next)
                                        scheduleSave({ scanContractsJson: JSON.stringify(next) })
                                        const err = validateScanContractAddress(val, i)
                                        setScanContractErrors((prev) => {
                                            const copy = { ...prev }
                                            if (err) copy[i] = err
                                            else delete copy[i]
                                            return copy
                                        })
                                    }}
                                    disabled={running}
                                    placeholder="Contract address 0x..."
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        const next = scanContracts.filter((_, j) => j !== i)
                                        setScanContracts(next)
                                        scheduleSave({ scanContractsJson: JSON.stringify(next) })
                                        setScanContractErrors((prev) => {
                                            const copy = { ...prev }
                                            delete copy[i]
                                            // reindex keys after removal
                                            const reindexed: Record<number, string> = {}
                                            Object.entries(copy).forEach(([k, v]) => {
                                                const idx = Number(k)
                                                reindexed[idx > i ? idx - 1 : idx] = v
                                            })
                                            return reindexed
                                        })
                                    }}
                                    disabled={running}
                                />
                            </Flex>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* Scan Dashboard */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <Flex align="center" justify="space-between" mb={3}>
                    <AntText
                        style={{
                            color: '#666',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        Scan Dashboard
                    </AntText>
                    <Flex gap={2}>
                        <Button
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={exportScanWallets}
                            disabled={!hasScanContracts}
                        >
                            Xuất ví ra file
                        </Button>
                        <label>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv,.txt"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) importScanWallets(e.target.files[0])
                                    e.target.value = ''
                                }}
                            />
                            <Button
                                size="small"
                                icon={<UploadOutlined />}
                                disabled={!hasScanContracts || running}
                                onClick={(e) =>
                                    (
                                        e.currentTarget.previousElementSibling as HTMLInputElement
                                    )?.click()
                                }
                            >
                                Nhập ví vào
                            </Button>
                        </label>
                    </Flex>
                </Flex>
                {scanContracts.length === 0 ? (
                    <AntText type="secondary" style={{ fontSize: 12 }}>
                        Chưa cấu hình contract quét — thêm contract ở trên
                    </AntText>
                ) : (
                    <Tabs
                        size="small"
                        activeKey={scanTabKey || scanContracts[0]?.address}
                        onChange={setScanTabKey}
                        items={scanContracts.map((cfg) => ({
                            key: cfg.address,
                            label: `${cfg.address.slice(0, 8)}...${cfg.address.slice(-6)}`,
                            children: <ScanContractPanel contractAddress={cfg.address} />,
                        }))}
                        style={{ marginTop: -8 }}
                    />
                )}
            </Box>

            {/* Step Progress */}
            <Box bg="#1c1c1c" borderRadius="8px" p={4} mb={4} border="1px solid #2a2a2a">
                <AntText
                    style={{
                        color: '#666',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        display: 'block',
                        marginBottom: 12,
                    }}
                >
                    Tiến trình automation
                </AntText>
                {Object.keys(stepStates).length === 0 ? (
                    <AntText type="secondary" style={{ fontSize: 12 }}>
                        Chưa có tiến trình nào
                    </AntText>
                ) : (
                    <Stack spacing={4}>
                        {Object.entries(stepStates).map(([tokenId, { tokenName, statuses }]) => {
                            const contractAddress = tokens.find(
                                (t) => t.id === tokenId
                            )?.contractAddress
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
                                                    {contractAddress.slice(0, 6)}…
                                                    {contractAddress.slice(-4)}
                                                </Link>
                                            </Tooltip>
                                        )}
                                    </Flex>
                                    <Steps
                                        size="small"
                                        items={[
                                            {
                                                title: '1. Deploy & Initialize',
                                                status: statuses[0],
                                            },
                                            { title: '2. Set Whitelist', status: statuses[1] },
                                            { title: '3. Transfer Token (Mint wallet)', status: statuses[2] },
                                            { title: '4. Add Liquidity', status: statuses[3] },
                                            /* TEMPORARILY DISABLED: step 4.1
                                            {
                                                title: '4.1 Transfer token mới cho ví đã quét',
                                                status: statuses[4],
                                            },
                                            */
                                            { title: '5.1 Chạy lệnh swap', status: statuses[5] },
                                            { title: '5.2 Quét & Airdrop', status: statuses[6] },
                                            {
                                                title: '6. Mint thêm & Bán 90%',
                                                status: statuses[7],
                                            },
                                            {
                                                title: '7. Chuyển BNB về ví chủ',
                                                status: statuses[8],
                                            },
                                        ]}
                                    />
                                </Box>
                            )
                        })}
                    </Stack>
                )}
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
                            onClick={() => {
                                stopRef.current = true
                            }}
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
                    <AntText
                        style={{
                            color: '#666',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        Log
                    </AntText>
                    <Button
                        size="small"
                        disabled={logs.length === 0}
                        onClick={() => {
                            if (logSaveTimer.current) clearTimeout(logSaveTimer.current)
                            setLogs([])
                            getElectron()?.saveConfig({ logsJson: '[]' }, tabId)
                        }}
                    >
                        Clear
                    </Button>
                </Flex>
                <Box maxH="320px" overflowY="auto">
                    {logs.length === 0 ? (
                        <AntText type="secondary" style={{ fontSize: 12 }}>
                            Chưa có log
                        </AntText>
                    ) : (
                        logs.map(({ id, text }) => {
                            const isError =
                                text.includes('LỖI') ||
                                text.includes('ERROR') ||
                                text.includes('thất bại')
                            const isSuccess =
                                text.includes('thành công') ||
                                text.includes('hoàn thành') ||
                                text.includes('✓')
                            return (
                                <Text
                                    key={id}
                                    fontSize="12px"
                                    fontFamily="mono"
                                    lineHeight="1.7"
                                    color={
                                        isError ? 'red.400' : isSuccess ? 'green.400' : 'gray.300'
                                    }
                                    whiteSpace="pre-wrap"
                                >
                                    {text}
                                </Text>
                            )
                        })
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default Main
