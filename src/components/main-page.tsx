import { Flex, Stack, Text } from '@chakra-ui/react'
import {
    Button,
    Checkbox,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Table,
    Tabs,
    Typography,
} from 'antd'
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
import type { Prisma } from '../../prisma/client'
import dayjs from 'dayjs'
import zenStackFunction from '../utils/zenstack-function'

type ScanWalletForm = {
    fromBlock: number
    scanAddress: string
    concurrency: number
    blockChunk: number
    scanningFromBlock: number
    scanningToBlock: number

    //transfer token fields
    privateKey: string
    tokenAddress: string
    fromAddress: string
    transferDelayMs: number
    amount: string
    metadata?: any
}

const MainPage = () => {
    const [formScanWallet] = Form.useForm<ScanWalletForm>()
    const contractScanner = useRef<WalletScanner | null>(null)

    const metadata = Form.useWatch('metadata', formScanWallet)

    const scanningFromBlock = Form.useWatch('scanningFromBlock', formScanWallet)
    const scanningToBlock = Form.useWatch('scanningToBlock', formScanWallet)
    const scanAddress = Form.useWatch('scanAddress', formScanWallet)

    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)

    const walletCount = 0
    const { data: scanWallets = [], refetch } = useFindManyScanWallet({
        where: {
            wallet: scanAddress,
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
            createdAt: 'desc',
        },
    })
    const { data: countWalletCount = 0, refetch: refetchCount } = useCountScanWallet({
        where: {
            wallet: scanAddress,
        },
    })

    const [isScanning, setIsScanning] = useState<boolean>()
    const [rpc, setRpc] = useState<string>('https://bsc.drpc.org')

    const tabId = useStoreState((state) => state.tabId)

    const { setItem, getItem, getKeyCacheByTabId } = useStorage()

    useEffect(() => {
        const cache = getItem<{
            rpc: string
            scanAddress: string
        }>(getKeyCacheByTabId(tabId))
        if (cache) {
            setRpc(cache.rpc)
            formScanWallet.setFieldValue('scanAddress', cache.scanAddress)
        }
        message.info('Đã tải cài đặt từ bộ nhớ local')
    }, [])

    const onSaveLocalCache = () => {
        setItem(getKeyCacheByTabId(tabId), {
            rpc,
            scanAddress: formScanWallet.getFieldValue('scanAddress'),
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
                                        scanAddress: '0xb300000b72DEAEb607a12d5f54773D1C19c7028d', // USDT contract address
                                        blockChunk: 1000,
                                        concurrency: 1,
                                        walletIndex: 1,
                                        fromAddress: '',
                                        amount: '0',
                                        tokenAddress: '0x55d398326f99059ff775485246999027b3197955',
                                        transferDelayMs: 1, // 1 minute
                                    }}
                                    onValuesChange={(changedValue) => {
                                        if (changedValue.privateKey) {
                                            const privateKey =
                                                formScanWallet.getFieldValue('privateKey')
                                            if (ethers.utils.isHexString(privateKey, 32)) {
                                                const wallet = new ethers.Wallet(privateKey)
                                                formScanWallet.setFieldValue(
                                                    'fromAddress',
                                                    wallet.address
                                                )
                                            } else {
                                                formScanWallet.setFieldValue('fromAddress', '')
                                            }
                                        }
                                    }}
                                    onFinish={async (values) => {
                                        if (contractScanner.current) {
                                            contractScanner.current.stop()
                                            setIsScanning(false)
                                        }
                                        contractScanner.current = await WalletScanner.getInstance().save({
                                            wallet: values.scanAddress,
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
                                        label="Địa chỉ quét"
                                        name="scanAddress"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập địa chỉ quét',
                                            },
                                            {
                                                validator: async (_, value) => {
                                                    if (!ethers.utils.isAddress(value)) {
                                                        return Promise.reject(
                                                            new Error('Địa chỉ quét không hợp lệ')
                                                        )
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nhập địa chỉ quét" />
                                    </Form.Item>
                                    <p>Số ví đã quét: {walletCount} </p>
                                    <Form.Item label="Thời gian chờ giữa các lần chuyển token (phút)" name="transferDelayMs">
                                        <InputNumber min={1} placeholder="Thời gian chờ giữa các lần chuyển token (phút)" />
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
                                                required: true,
                                                message: 'Vui lòng nhập private key',
                                            },
                                            {
                                                validator: async (_, value) => {
                                                    if (
                                                        value &&
                                                        !ethers.utils.isHexString(value, 32)
                                                    ) {
                                                        return Promise.reject(
                                                            new Error('Private key không hợp lệ')
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
                                                    wallet: scanAddress,
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
                                            link.download = `scan-${scanAddress || ''}-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.csv`
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
                                                        wallet: scanAddress,
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
                ]}
            />
        </Stack>
    )
}

export default MainPage
