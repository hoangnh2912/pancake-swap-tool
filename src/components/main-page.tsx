import { Flex, Stack, Text } from '@chakra-ui/react'
import {
    Button,
    Checkbox,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Progress,
    Table,
    Tag,
    Tabs,
    Typography,
    Upload,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { ethers } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import useStorage from '../hooks/useStorage'
import {
    useCountScanWallet,
    useCreateManyScanWallet,
    useDeleteManyScanWallet,
    useFindManyScanWallet,
    useUpdateManyScanWallet,
} from '../hooks/zenstack'
import { useStoreState } from '../redux/hook'
import { WalletScanner } from '../utils/scanWallet'
import type { BatchProgress } from '../utils/scanWallet'
import type { Prisma } from '../../prisma/client'
import dayjs from 'dayjs'
import zenStackFunction from '../utils/zenstack-function'
import { ERC20_ABI, DISPERSE_ABI } from '../utils/abi'

type ScanWalletForm = {
    fromBlock: number
    scanAddresses: string
    concurrency: number
    blockChunk: number
    scanningFromBlock: number
    scanningToBlock: number

    //transfer token fields
    privateKey: string
    tokenAddress: string
    fromAddress: string
    transferDelayMs: number
    transferBatchSize: number
    amount: string
    metadata?: any
}

type MultiTransferForm = {
    privateKey: string
    tokenAddress: string
    fromAddress: string
    batchSize: number
    recipientList: Array<{ address: string; amount: string }>
    fileList?: UploadFile[]
}

const MainPage = () => {
    const [formScanWallet] = Form.useForm<ScanWalletForm>()
    const [formMultiTransfer] = Form.useForm<MultiTransferForm>()
    const contractScanner = useRef<WalletScanner | null>(null)

    const metadata = Form.useWatch('metadata', formScanWallet)

    const scanningFromBlock = Form.useWatch('scanningFromBlock', formScanWallet)
    const scanningToBlock = Form.useWatch('scanningToBlock', formScanWallet)
    const scanAddresses = Form.useWatch('scanAddresses', formScanWallet)
    const addressList = (scanAddresses || '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter((s: string) => ethers.utils.isAddress(s))

    const recipientList = Form.useWatch('recipientList', formMultiTransfer)

    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)

    const walletCount = 0
    const { data: scanWallets = [], refetch } = useFindManyScanWallet({
        where: {
            wallet: { in: addressList },
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
            createdAt: 'desc',
        },
    })
    const { data: countWalletCount = 0, refetch: refetchCount } = useCountScanWallet({
        where: {
            wallet: { in: addressList },
        },
    })

    const [isScanning, setIsScanning] = useState<boolean>()
    const [rpc, setRpc] = useState<string>('https://bsc.drpc.org')
    const [isTransferring, setIsTransferring] = useState<boolean>(false)
    const [batchLogs, setBatchLogs] = useState<BatchProgress[]>([])
    const [multiTransferBatchLogs, setMultiTransferBatchLogs] = useState<BatchProgress[]>([])

    const tabId = useStoreState((state) => state.tabId)

    const { setItem, getItem, getKeyCacheByTabId } = useStorage()

    useEffect(() => {
        const cache = getItem<{
            rpc: string
            scanAddresses: string
        }>(getKeyCacheByTabId(tabId))
        if (cache) {
            setRpc(cache.rpc)
            formScanWallet.setFieldValue('scanAddresses', cache.scanAddresses)
        }
        message.info('Đã tải cài đặt từ bộ nhớ local')
    }, [])

    const onSaveLocalCache = () => {
        setItem(getKeyCacheByTabId(tabId), {
            rpc,
            scanAddresses: formScanWallet.getFieldValue('scanAddresses'),
        })
    }

    const { mutateAsync: createManyScanWallet } = useCreateManyScanWallet()
    const { mutateAsync: updateScanWallet } = useUpdateManyScanWallet()
    const { mutateAsync: deleteManyScanWallet } = useDeleteManyScanWallet()
    return (
        <Stack flex={1} boxShadow="md" p="4" bg={'white'} rounded={'md'}>
            <Flex gap={'10px'}>
                <Flex flex={1} direction={'column'}>
                    <Flex gap={'5px'} alignItems={'center'}>
                        <Text>Nhập RPC</Text>
                        <Input onChange={(e) => setRpc(e.target.value)} value={rpc} />
                    </Flex>
                </Flex>
            </Flex>
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: 'Quét ví',
                        children: (
                            <Col>
                                <Form
                                    form={formScanWallet}
                                    initialValues={{
                                        scanAddresses: '',
                                        blockChunk: 1000,
                                        concurrency: 1,
                                        walletIndex: 1,
                                        fromAddress: '',
                                        amount: '0',
                                        tokenAddress: '0x55d398326f99059ff775485246999027b3197955',
                                        transferDelayMs: 1,
                                        transferBatchSize: 300,
                                    }}
                                    onValuesChange={(changedValue) => {
                                        if (changedValue.privateKey) {
                                            const privateKey =
                                                formScanWallet.getFieldValue('privateKey')
                                            try {
                                                const wallet = new ethers.Wallet(privateKey)
                                                formScanWallet.setFieldValue(
                                                    'fromAddress',
                                                    wallet.address
                                                )
                                            } catch {
                                                formScanWallet.setFieldValue('fromAddress', '')
                                            }
                                        }
                                    }}
                                    onFinish={async (values) => {
                                        if (contractScanner.current) {
                                            contractScanner.current.stop()
                                            setIsScanning(false)
                                        }
                                        contractScanner.current =
                                            await WalletScanner.getInstance().save({
                                                wallets: (values.scanAddresses || '')
                                                    .split('\n')
                                                    .map((s: string) => s.trim())
                                                    .filter((s: string) =>
                                                        ethers.utils.isAddress(s)
                                                    ),
                                                fromBlock: values.fromBlock,
                                                rpcUrl: rpc,
                                                options: {
                                                    blockChunk: values.blockChunk,
                                                    concurrency: values.concurrency,
                                                },
                                                storeId: tabId,
                                                amount: values.amount,
                                                tokenAddress: values.tokenAddress,
                                                privateKey: values.privateKey,
                                                transferDelayMs: values.transferDelayMs * 60000,
                                                transferBatchSize: values.transferBatchSize,
                                                onBatchProgress(progress) {
                                                    setBatchLogs((prev) => {
                                                        const idx = prev.findIndex(
                                                            (b) => b.batchIndex === progress.batchIndex
                                                        )
                                                        if (idx >= 0) {
                                                            const next = [...prev]
                                                            next[idx] = progress
                                                            return next
                                                        }
                                                        return [...prev, progress]
                                                    })
                                                },
                                                onScan(fromBlock, toBlock) {
                                                    formScanWallet.setFieldValue(
                                                        'scanningFromBlock',
                                                        fromBlock
                                                    )
                                                    formScanWallet.setFieldValue(
                                                        'scanningToBlock',
                                                        toBlock
                                                    )
                                                },
                                                onSave: async (transfers) => {
                                                    if (transfers.length === 0) {
                                                        return
                                                    }
                                                    await createManyScanWallet({
                                                        data: transfers.map((transfer) => ({
                                                            tx: transfer.transactionHash,
                                                            wallet: transfer.from,
                                                            token: transfer.tokenAddress,
                                                            destination: transfer.to,
                                                            amount: transfer.amount,
                                                        })),
                                                    })
                                                    refetch()
                                                    refetchCount()
                                                },
                                            })
                                        onSaveLocalCache()
                                    }}
                                >
                                    <Form.Item
                                        label="Danh sách địa chỉ contract cần quét (mỗi dòng một địa chỉ)"
                                        name="scanAddresses"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập ít nhất 1 địa chỉ',
                                            },
                                            {
                                                validator: async (_, value) => {
                                                    const lines = (value || '')
                                                        .split('\n')
                                                        .map((s: string) => s.trim())
                                                        .filter(Boolean)
                                                    if (lines.length === 0) {
                                                        return Promise.reject(
                                                            new Error('Vui lòng nhập ít nhất 1 địa chỉ')
                                                        )
                                                    }
                                                    const invalid = lines.filter(
                                                        (l: string) => !ethers.utils.isAddress(l)
                                                    )
                                                    if (invalid.length > 0) {
                                                        return Promise.reject(
                                                            new Error(`Địa chỉ không hợp lệ: ${invalid[0]}`)
                                                        )
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            placeholder="Nhập các địa chỉ contract, mỗi dòng một địa chỉ"
                                            autoSize={{ minRows: 3, maxRows: 8 }}
                                        />
                                    </Form.Item>
                                    <p>Số contract đang quét: {addressList.length} | Tổng ví đã quét: {countWalletCount}</p>
                                    <Form.Item
                                        label="Thời gian chờ giữa các lần chuyển token (phút)"
                                        name="transferDelayMs"
                                    >
                                        <InputNumber
                                            min={1}
                                            placeholder="Thời gian chờ giữa các lần chuyển token (phút)"
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Số ví mỗi batch transfer (do gas limit)"
                                        name="transferBatchSize"
                                    >
                                        <InputNumber min={1} max={500} />
                                    </Form.Item>
                                    <Form.Item label="Kích thước quét block" name="blockChunk">
                                        <InputNumber min={1} placeholder="Kích thước quét block" />
                                    </Form.Item>
                                    <Form.Item label="Số lượt quét đồng thời" name="concurrency">
                                        <InputNumber min={1} placeholder="Số lượt quét đồng thời" />
                                    </Form.Item>
                                    <Typography.Title level={4}>Transfer token</Typography.Title>
                                    <Form.Item name={'metadata'} hidden />
                                    <Form.Item
                                        label="Địa chỉ token"
                                        name="tokenAddress"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập địa chỉ token',
                                            },
                                            {
                                                validator: async (_, value) => {
                                                    if (!ethers.utils.isAddress(value)) {
                                                        return Promise.reject(
                                                            new Error('Địa chỉ token không hợp lệ')
                                                        )
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nhập địa chỉ token" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Private Key ví gửi"
                                        name="privateKey"
                                        rules={[
                                            {
                                                validator: async (_, value) => {
                                                    try {
                                                        new ethers.Wallet(value)
                                                    } catch {
                                                        return Promise.reject(
                                                            new Error(
                                                                'Vui lòng nhập private key hợp lệ'
                                                            )
                                                        )
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nhập private key" />
                                    </Form.Item>
                                    <Form.Item label="Số lượng" name="amount">
                                        <InputNumber min={0} defaultValue={0} />
                                    </Form.Item>
                                    <Form.Item label="Địa chỉ ví gửi" name="fromAddress">
                                        <Input readOnly />
                                    </Form.Item>
                                    {metadata?.isTransferring && (
                                        <div>
                                            Đang chuyển token đến ví {metadata?.destination} -
                                            TxHash: {metadata?.txHash} - Tổng số ví:{' '}
                                            {metadata?.total} - Decimals: {metadata?.decimals}
                                        </div>
                                    )}
                                    <Form.Item hidden name="wallets" />
                                    <Form.Item hidden name="scanningFromBlock" />
                                    <Form.Item hidden name="scanningToBlock" />
                                    <Button htmlType="submit" type="primary">
                                        Lưu cài đặt
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        type="primary"
                                        style={{
                                            marginLeft: '8px',
                                        }}
                                        loading={isScanning}
                                        onClick={() => {
                                            setIsScanning(true)
                                            contractScanner.current?.start()
                                        }}
                                    >
                                        Quét
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        type="dashed"
                                        style={{
                                            marginLeft: '8px',
                                            backgroundColor: 'yellow',
                                        }}
                                        onClick={async () => {
                                            const data = await zenStackFunction<
                                                Prisma.ScanWalletFindManyArgs,
                                                Prisma.ScanWalletGetPayload<{}>[]
                                            >('ScanWallet', 'findMany', {
                                                where: {
                                                    wallet: { in: addressList },
                                                },
                                                skip: (currentPage - 1) * pageSize,
                                                take: pageSize,
                                                orderBy: {
                                                    createdAt: 'desc',
                                                },
                                            })
                                            // Generate CSV content
                                            let csvContent = 'stt,tx,scan,token,to,amount\n'
                                            data?.forEach((item, index) => {
                                                csvContent += `${index + 1},${item.tx},${item.wallet},${item.token},${item.destination},${item.amount}\n`
                                            })
                                            // Create a blob and trigger download
                                            const blob = new Blob([csvContent], {
                                                type: 'text/csv;charset=utf-8;',
                                            })
                                            const link = document.createElement('a')
                                            const url = URL.createObjectURL(blob)
                                            link.href = url
                                            link.download = `scan-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.csv`
                                            document.body.appendChild(link)
                                            link.click()
                                            document.body.removeChild(link)
                                        }}
                                    >
                                        Xuất file
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        style={{
                                            marginLeft: '8px',
                                            backgroundColor: 'red',
                                        }}
                                        type="primary"
                                        onClick={async () => {
                                            try {
                                                await deleteManyScanWallet({
                                                    where: {
                                                        wallet: { in: addressList },
                                                    },
                                                })
                                                message.success('Xoá dữ liệu thành công')
                                            } catch (error) {
                                                message.error(`Xoá dữ liệu thất bại: ${error}`)
                                            }
                                        }}
                                    >
                                        Xoá dữ liệu đã quét
                                    </Button>
                                    {isScanning && (
                                        <Button
                                            htmlType="button"
                                            type="primary"
                                            style={{
                                                backgroundColor: 'red',
                                                marginLeft: '8px',
                                            }}
                                            onClick={() => {
                                                contractScanner.current?.stop()
                                                setIsScanning(false)
                                            }}
                                        >
                                            Dừng quét
                                        </Button>
                                    )}
                                </Form>
                                {scanningFromBlock !== undefined &&
                                    scanningToBlock !== undefined && (
                                        <Text fontWeight={'bold'}>
                                            Đang quét từ block {scanningFromBlock} đến block{' '}
                                            {scanningToBlock}
                                        </Text>
                                    )}
                                {batchLogs.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <Typography.Title level={5} style={{ marginBottom: 6 }}>
                                            Lịch sử batch transfer ({batchLogs.length} batch)
                                        </Typography.Title>
                                        <Table
                                            size="small"
                                            dataSource={batchLogs}
                                            rowKey="batchIndex"
                                            pagination={false}
                                            columns={[
                                                {
                                                    title: 'Batch',
                                                    width: 80,
                                                    render: (_, r) =>
                                                        `${r.batchIndex}/${r.totalBatches}`,
                                                },
                                                {
                                                    title: 'Số ví',
                                                    dataIndex: 'recipientCount',
                                                    width: 80,
                                                },
                                                {
                                                    title: 'Trạng thái',
                                                    width: 120,
                                                    render: (_, r) => {
                                                        if (r.status === 'confirmed')
                                                            return <Tag color="success">Đã xác nhận</Tag>
                                                        if (r.status === 'sending')
                                                            return <Tag color="processing">Đang gửi</Tag>
                                                        return <Tag color="error">Lỗi</Tag>
                                                    },
                                                },
                                                {
                                                    title: 'TxHash',
                                                    render: (_, r) =>
                                                        r.txHash ? (
                                                            <Typography.Link
                                                                href={`https://bscscan.com/tx/${r.txHash}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                ellipsis
                                                                style={{ maxWidth: 300 }}
                                                            >
                                                                {r.txHash}
                                                            </Typography.Link>
                                                        ) : (
                                                            <span style={{ color: 'red' }}>{r.error}</span>
                                                        ),
                                                },
                                                {
                                                    title: 'Thời gian',
                                                    width: 140,
                                                    render: (_, r) =>
                                                        dayjs(r.timestamp).format('HH:mm:ss DD/MM/YYYY'),
                                                },
                                            ]}
                                        />
                                    </div>
                                )}
                                <Table
                                    size="small"
                                    dataSource={scanWallets}
                                    pagination={{
                                        current: currentPage,
                                        pageSize: pageSize,
                                        total: countWalletCount,
                                        onChange: (page, pageSize) => {
                                            setCurrentPage(page)
                                            setPageSize(pageSize)
                                        },
                                    }}
                                    columns={[
                                        {
                                            title: 'STT',
                                            width: 40,
                                            render: (_text, _record, index) =>
                                                (currentPage - 1) * pageSize + index + 1,
                                        },
                                        {
                                            title: 'Thời gian quét',
                                            width: 120,
                                            render: (_text, record) =>
                                                dayjs(record.createdAt).format(
                                                    'HH:mm:ss DD/MM/YYYY'
                                                ),
                                        },
                                        {
                                            title: 'Mã giao dịch',
                                            width: 200,
                                            render: (_, { tx: text }) => (
                                                <Typography.Link
                                                    href={`https://bscscan.com/tx/${text}`}
                                                    target="_blank"
                                                    style={{
                                                        width: 200,
                                                    }}
                                                    ellipsis
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </Typography.Link>
                                            ),
                                        },
                                        {
                                            title: 'Ví quét',
                                            render: (_, { wallet: text }) => (
                                                <Typography.Link
                                                    href={`https://bscscan.com/address/${text}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </Typography.Link>
                                            ),
                                        },
                                        {
                                            title: 'Token',
                                            render: (_, { token: text }) => (
                                                <Typography.Link
                                                    href={`https://bscscan.com/address/${text}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </Typography.Link>
                                            ),
                                        },
                                        {
                                            title: 'Ví nhận',
                                            render: (_, { destination: text }) => (
                                                <Typography.Link
                                                    href={`https://bscscan.com/address/${text}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </Typography.Link>
                                            ),
                                        },
                                        {
                                            title: 'Số lượng',
                                            key: 'amount',
                                            render: (_text, record) => (
                                                <span>
                                                    {ethers.utils
                                                        .formatUnits(record.amount, 18)
                                                        .toString()}
                                                </span>
                                            ),
                                        },
                                        {
                                            title: 'Transfer',
                                            width: 80,
                                            align: 'center',
                                            render: (_, record) => (
                                                <Checkbox checked={record.isTransferred} />
                                            ),
                                        },
                                    ]}
                                />
                            </Col>
                        ),
                    },
                    {
                        key: '2',
                        label: 'Chuyển nhiều ví',
                        children: (
                            <Col>
                                <Form
                                    form={formMultiTransfer}
                                    layout="vertical"
                                    initialValues={{
                                        recipientList: [],
                                        batchSize: 300,
                                    }}
                                    onValuesChange={(changedValue) => {
                                        if (changedValue.privateKey) {
                                            const privateKey =
                                                formMultiTransfer.getFieldValue('privateKey')
                                            try {
                                                const wallet = new ethers.Wallet(privateKey)
                                                formMultiTransfer.setFieldValue(
                                                    'fromAddress',
                                                    wallet.address
                                                )
                                            } catch {
                                                formMultiTransfer.setFieldValue('fromAddress', '')
                                            }
                                        }
                                    }}
                                >
                                    <Form.Item
                                        label="Private Key"
                                        name="privateKey"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập private key',
                                            },
                                            {
                                                validator: async (_, value) => {
                                                    try {
                                                        new ethers.Wallet(value)
                                                    } catch {
                                                        return Promise.reject(
                                                            new Error('Private key không hợp lệ')
                                                        )
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <Input.Password placeholder="Nhập private key" />
                                    </Form.Item>

                                    <Form.Item label="Địa chỉ ví gửi" name="fromAddress">
                                        <Input readOnly />
                                    </Form.Item>

                                    <Form.Item
                                        label="Địa chỉ token"
                                        name="tokenAddress"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập địa chỉ token',
                                            },
                                            {
                                                validator: async (_, value) => {
                                                    if (!ethers.utils.isAddress(value)) {
                                                        return Promise.reject(
                                                            new Error('Địa chỉ token không hợp lệ')
                                                        )
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nhập địa chỉ token ERC20" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Số ví mỗi batch (do gas limit)"
                                        name="batchSize"
                                    >
                                        <InputNumber min={1} max={500} />
                                    </Form.Item>

                                    <Form.Item label="Tải file danh sách địa chỉ và số lượng">
                                        <Upload
                                            accept=".txt"
                                            maxCount={1}
                                            beforeUpload={(file) => {
                                                const reader = new FileReader()
                                                reader.onload = (e) => {
                                                    const text = e.target?.result as string
                                                    const lines = text
                                                        .split('\n')
                                                        .map((line) => line.trim())
                                                        .filter((line) => line.length > 0)

                                                    const recipientList: Array<{
                                                        address: string
                                                        amount: string
                                                    }> = []

                                                    let invalidLines = 0

                                                    for (const line of lines) {
                                                        const [address, amount] = line
                                                            .split(/[,\s]+/)
                                                            .map((s) => s.trim())
                                                        if (
                                                            address &&
                                                            amount &&
                                                            ethers.utils.isAddress(address)
                                                        ) {
                                                            recipientList.push({ address, amount })
                                                        } else {
                                                            invalidLines++
                                                        }
                                                    }

                                                    formMultiTransfer.setFieldValue(
                                                        'recipientList',
                                                        recipientList
                                                    )

                                                    if (recipientList.length > 0) {
                                                        message.success(
                                                            `Đã tải ${recipientList.length} địa chỉ hợp lệ${invalidLines > 0 ? ` (${invalidLines} dòng không hợp lệ)` : ''}`
                                                        )
                                                    } else {
                                                        message.error(
                                                            'Không tìm thấy địa chỉ hợp lệ trong file'
                                                        )
                                                    }
                                                }
                                                reader.readAsText(file)
                                                return false
                                            }}
                                        >
                                            <Button icon={<UploadOutlined />}>Chọn file TXT</Button>
                                        </Upload>
                                        <Text fontSize="sm" color="gray.500" mt={2}>
                                            Format: Mỗi dòng chứa địa chỉ và số lượng, cách nhau
                                            bằng dấu phẩy hoặc khoảng trắng
                                            <br />
                                            Ví dụ: 0x123...abc 100 hoặc 0x123...abc,100
                                        </Text>
                                    </Form.Item>

                                    <Form.Item name="recipientList" hidden />

                                    {recipientList && recipientList.length > 0 && (
                                        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                            <Typography.Title level={5}>
                                                Danh sách địa chỉ nhận: {recipientList.length} địa
                                                chỉ
                                            </Typography.Title>
                                            <Table
                                                size="small"
                                                dataSource={recipientList}
                                                pagination={{
                                                    pageSize: 10,
                                                    showTotal: (total) => `Tổng ${total} địa chỉ`,
                                                }}
                                                scroll={{ y: 400 }}
                                                columns={[
                                                    {
                                                        title: 'STT',
                                                        width: 60,
                                                        align: 'center',
                                                        render: (_text, _record, index) =>
                                                            index + 1,
                                                    },
                                                    {
                                                        title: 'Địa chỉ ví nhận',
                                                        dataIndex: 'address',
                                                        key: 'address',
                                                        render: (address: string) => (
                                                            <Typography.Link
                                                                href={`https://bscscan.com/address/${address}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                {address}
                                                            </Typography.Link>
                                                        ),
                                                    },
                                                    {
                                                        title: 'Số lượng token',
                                                        dataIndex: 'amount',
                                                        key: 'amount',
                                                        width: 150,
                                                        align: 'right',
                                                        render: (amount: string) => (
                                                            <span style={{ fontWeight: 'bold' }}>
                                                                {amount}
                                                            </span>
                                                        ),
                                                    },
                                                ]}
                                                summary={(data) => {
                                                    const total = data.reduce((sum, item) => {
                                                        return (
                                                            sum +
                                                            Number.parseFloat(item.amount || '0')
                                                        )
                                                    }, 0)
                                                    return (
                                                        <Table.Summary.Row>
                                                            <Table.Summary.Cell
                                                                index={0}
                                                                colSpan={2}
                                                            >
                                                                <strong>Tổng cộng</strong>
                                                            </Table.Summary.Cell>
                                                            <Table.Summary.Cell
                                                                index={1}
                                                                align="right"
                                                            >
                                                                <strong
                                                                    style={{ color: '#1890ff' }}
                                                                >
                                                                    {total.toLocaleString()}
                                                                </strong>
                                                            </Table.Summary.Cell>
                                                        </Table.Summary.Row>
                                                    )
                                                }}
                                            />
                                        </div>
                                    )}

                                    {multiTransferBatchLogs.length > 0 && (() => {
                                        const total = multiTransferBatchLogs[0]?.totalBatches ?? multiTransferBatchLogs.length
                                        const confirmed = multiTransferBatchLogs.filter(b => b.status === 'confirmed').length
                                        const sending = multiTransferBatchLogs.find(b => b.status === 'sending')
                                        const percent = Math.round((confirmed / total) * 100)
                                        return (
                                            <div style={{ marginBottom: 8, padding: '8px 12px', background: '#f5f5f5', borderRadius: 6 }}>
                                                <Text fontWeight="bold" fontSize="sm">
                                                    Tiến độ: Batch {sending?.batchIndex ?? confirmed}/{total}
                                                    {sending && ` — Đang gửi ${sending.recipientCount} ví`}
                                                </Text>
                                                <Progress
                                                    percent={percent}
                                                    status={sending ? 'active' : confirmed === total ? 'success' : 'normal'}
                                                    format={() => `${confirmed}/${total} batch`}
                                                />
                                            </div>
                                        )
                                    })()}

                                    {multiTransferBatchLogs.length > 0 && (
                                        <div style={{ marginBottom: 12 }}>
                                            <Typography.Title level={5} style={{ marginBottom: 6 }}>
                                                Lịch sử batch transfer ({multiTransferBatchLogs.length} batch)
                                            </Typography.Title>
                                            <Table
                                                size="small"
                                                dataSource={multiTransferBatchLogs}
                                                rowKey="batchIndex"
                                                pagination={false}
                                                rowClassName={(r) => r.status === 'sending' ? 'ant-table-row-selected' : ''}
                                                columns={[
                                                    {
                                                        title: 'Batch',
                                                        width: 80,
                                                        render: (_, r) => `${r.batchIndex}/${r.totalBatches}`,
                                                    },
                                                    {
                                                        title: 'Số ví',
                                                        dataIndex: 'recipientCount',
                                                        width: 80,
                                                    },
                                                    {
                                                        title: 'Trạng thái',
                                                        width: 120,
                                                        render: (_, r) => {
                                                            if (r.status === 'confirmed')
                                                                return <Tag color="success">Đã xác nhận</Tag>
                                                            if (r.status === 'sending')
                                                                return <Tag color="processing">Đang gửi</Tag>
                                                            return <Tag color="error">Lỗi</Tag>
                                                        },
                                                    },
                                                    {
                                                        title: 'TxHash',
                                                        render: (_, r) =>
                                                            r.txHash ? (
                                                                <Typography.Link
                                                                    href={`https://bscscan.com/tx/${r.txHash}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    ellipsis
                                                                    style={{ maxWidth: 300 }}
                                                                >
                                                                    {r.txHash}
                                                                </Typography.Link>
                                                            ) : (
                                                                <span style={{ color: 'red' }}>{r.error}</span>
                                                            ),
                                                    },
                                                    {
                                                        title: 'Thời gian',
                                                        width: 140,
                                                        render: (_, r) =>
                                                            dayjs(r.timestamp).format('HH:mm:ss DD/MM/YYYY'),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    )}

                                    <Button
                                        type="primary"
                                        loading={isTransferring}
                                        onClick={async () => {
                                            try {
                                                await formMultiTransfer.validateFields()
                                                const values = formMultiTransfer.getFieldsValue()

                                                if (
                                                    !values.recipientList ||
                                                    values.recipientList.length === 0
                                                ) {
                                                    message.error(
                                                        'Vui lòng tải file danh sách địa chỉ'
                                                    )
                                                    return
                                                }

                                                setIsTransferring(true)
                                                setMultiTransferBatchLogs([])

                                                const provider =
                                                    new ethers.providers.JsonRpcProvider(rpc)
                                                const wallet = new ethers.Wallet(
                                                    values.privateKey,
                                                    provider
                                                )
                                                const tokenContract = new ethers.Contract(
                                                    values.tokenAddress,
                                                    ERC20_ABI,
                                                    wallet
                                                )

                                                // Disperse contract address
                                                const disperseAddress =
                                                    '0xD152f549545093347A162Dce210e7293f1452150'
                                                const disperseContract = new ethers.Contract(
                                                    disperseAddress,
                                                    DISPERSE_ABI,
                                                    wallet
                                                )

                                                const decimals = await tokenContract.decimals()

                                                // Prepare recipients and amounts
                                                const recipients = values.recipientList.map(
                                                    (r) => r.address
                                                )
                                                const amounts = values.recipientList.map((r) =>
                                                    ethers.utils.parseUnits(r.amount, decimals)
                                                )

                                                // Calculate total amount
                                                const totalAmount = amounts.reduce(
                                                    (sum, amount) => sum.add(amount),
                                                    ethers.BigNumber.from(0)
                                                )

                                                const currentAllowance =
                                                    await tokenContract.allowance(
                                                        wallet.address,
                                                        disperseAddress
                                                    )

                                                // Approve if needed
                                                if (currentAllowance.lt(totalAmount)) {
                                                    const approveTx = await tokenContract.approve(
                                                        disperseAddress,
                                                        ethers.constants.MaxUint256,
                                                        {
                                                            gasPrice: 50000000,
                                                        }
                                                    )
                                                    await approveTx.wait()
                                                    message.success('Approve thành công')
                                                }

                                                // Execute batch transfer
                                                const BATCH_SIZE = values.batchSize ?? 300
                                                const batches: Array<{ recipients: string[]; amounts: any[] }> = []
                                                for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
                                                    batches.push({
                                                        recipients: recipients.slice(i, i + BATCH_SIZE),
                                                        amounts: amounts.slice(i, i + BATCH_SIZE),
                                                    })
                                                }

                                                for (let i = 0; i < batches.length; i++) {
                                                    const batch = batches[i]
                                                    let batchTx: any
                                                    try {
                                                        batchTx = await disperseContract.disperseTokenSimple(
                                                            values.tokenAddress,
                                                            batch.recipients,
                                                            batch.amounts,
                                                            { gasPrice: 50000000 }
                                                        )
                                                    } catch (err: any) {
                                                        setMultiTransferBatchLogs((prev) => [...prev, {
                                                            batchIndex: i + 1,
                                                            totalBatches: batches.length,
                                                            recipientCount: batch.recipients.length,
                                                            status: 'error',
                                                            error: err?.message || 'Unknown error',
                                                            timestamp: Date.now(),
                                                        }])
                                                        throw err
                                                    }
                                                    setMultiTransferBatchLogs((prev) => {
                                                        const next = [...prev]
                                                        const idx = next.findIndex((b) => b.batchIndex === i + 1)
                                                        const entry: BatchProgress = {
                                                            batchIndex: i + 1,
                                                            totalBatches: batches.length,
                                                            recipientCount: batch.recipients.length,
                                                            status: 'sending',
                                                            txHash: batchTx.hash,
                                                            timestamp: Date.now(),
                                                        }
                                                        if (idx >= 0) { next[idx] = entry; return next }
                                                        return [...next, entry]
                                                    })
                                                    await batchTx.wait()
                                                    setMultiTransferBatchLogs((prev) => {
                                                        const next = [...prev]
                                                        const idx = next.findIndex((b) => b.batchIndex === i + 1)
                                                        const entry: BatchProgress = {
                                                            batchIndex: i + 1,
                                                            totalBatches: batches.length,
                                                            recipientCount: batch.recipients.length,
                                                            status: 'confirmed',
                                                            txHash: batchTx.hash,
                                                            timestamp: Date.now(),
                                                        }
                                                        if (idx >= 0) { next[idx] = entry; return next }
                                                        return [...next, entry]
                                                    })
                                                    message.success(
                                                        `Batch ${i + 1}/${batches.length} — Đã xác nhận: ${batchTx.hash}`
                                                    )
                                                }

                                                message.success(
                                                    `Đã chuyển thành công token cho ${recipients.length} địa chỉ trong ${batches.length} batch`
                                                )
                                            } catch (error: any) {
                                                console.error('Transfer error:', error)
                                                message.error(
                                                    `Lỗi: ${error?.message || error?.reason || error}`
                                                )
                                            } finally {
                                                setIsTransferring(false)
                                            }
                                        }}
                                    >
                                        Chuyển token
                                    </Button>
                                </Form>
                            </Col>
                        ),
                    },
                ]}
            />
        </Stack>
    )
}

export default MainPage
