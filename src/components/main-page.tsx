import { Flex, Stack, Text } from '@chakra-ui/react'
import { Button, Form, Input, InputNumber, message, Table, Tabs } from 'antd'
import { ethers } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import useStorage from '../hooks/useStorage'
import { useStoreState } from '../redux/hook'
import { WalletScanner } from '../utils/scanContract'
import { useCreateManyScanWallet, useFindManyScanWallet } from '../hooks/zenstack'

type ScanWalletForm = {
    fromBlock: number
    scanAddress: string
    concurrency: number
    blockChunk: number
    scanningFromBlock: number
    scanningToBlock: number
}

const MainPage = () => {
    const [formAirdrop] = Form.useForm<ScanWalletForm>()
    const contractScanner = useRef<WalletScanner | null>(null)

    const scanningFromBlock = Form.useWatch('scanningFromBlock', formAirdrop)
    const scanningToBlock = Form.useWatch('scanningToBlock', formAirdrop)
    const scanAddress = Form.useWatch('scanAddress', formAirdrop)

    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)

    const walletCount = 0

    const { data: scanWallets = [] } = useFindManyScanWallet({
        where: {
            wallet: {
                equals: scanAddress?.toLowerCase() || '0x',
            },
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
            createdAt: 'desc',
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
            formAirdrop.setFieldValue('scanAddress', cache.scanAddress)
        }
    }, [])

    const onSaveLocalCache = () => {
        setItem(getKeyCacheByTabId(tabId), {
            rpc,
            scanAddress: formAirdrop.getFieldValue('scanAddress'),
        })
    }

    const { mutateAsync: createManyScanWallet } = useCreateManyScanWallet()

    return (
        <Stack flex={1} boxShadow="md" p="4" bg={'white'} rounded={'md'}>
            <Text>{tabId}</Text>
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
                            <Stack flex={1} gap={'0px'}>
                                <Form
                                    form={formAirdrop}
                                    initialValues={{
                                        scanAddress: '0xb300000b72DEAEb607a12d5f54773D1C19c7028d', // USDT contract address
                                        blockChunk: 1000,
                                        concurrency: 1,
                                        walletIndex: 1,
                                    }}
                                    onFinish={async (values) => {
                                        if (contractScanner.current) {
                                            contractScanner.current.stop()
                                            setIsScanning(false)
                                        }
                                        contractScanner.current = WalletScanner.getInstance().save({
                                            wallet: values.scanAddress,
                                            fromBlock: values.fromBlock,
                                            rpcUrl: rpc,
                                            options: {
                                                blockChunk: values.blockChunk,
                                                concurrency: values.concurrency,
                                            },
                                            storeId: tabId,
                                            onScan(fromBlock, toBlock) {
                                                formAirdrop.setFieldValue(
                                                    'scanningFromBlock',
                                                    fromBlock
                                                )
                                                formAirdrop.setFieldValue(
                                                    'scanningToBlock',
                                                    toBlock
                                                )
                                            },
                                            onSave: async (transfers) => {
                                                await createManyScanWallet({
                                                    data: transfers.map((transfer) => ({
                                                        tx: transfer.transactionHash,
                                                        wallet: transfer.from?.toLowerCase(),
                                                        token: transfer.tokenAddress?.toLowerCase(),
                                                        destination: transfer.to?.toLowerCase(),
                                                        amount: transfer.amount,
                                                    })),
                                                })
                                            },
                                        })
                                        onSaveLocalCache()
                                        message.success('Lưu airdrop thành công')
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
                                    <Form.Item label="Kích thước quét block" name="blockChunk">
                                        <InputNumber min={1} placeholder="Kích thước quét block" />
                                    </Form.Item>
                                    <Form.Item label="Số lượt quét đồng thời" name="concurrency">
                                        <InputNumber min={1} placeholder="Số lượt quét đồng thời" />
                                    </Form.Item>
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
                                        onClick={() => {}}
                                    >
                                        Nhập file
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        type="dashed"
                                        style={{
                                            marginLeft: '8px',
                                            backgroundColor: 'yellow',
                                        }}
                                        onClick={() => {}}
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
                                        onChange: (page, pageSize) => {
                                            setCurrentPage(page)
                                            setPageSize(pageSize)
                                        },
                                    }}
                                    columns={[
                                        {
                                            title: 'STT',
                                            key: 'index',
                                            render: (_text, _record, index) =>
                                                (currentPage - 1) * pageSize + index + 1,
                                        }
                                        ,
                                        {
                                            title: 'Mã giao dịch',
                                            dataIndex: 'tx',
                                            key: 'tx',
                                            render: (text) => (
                                                <a
                                                    href={`https://bscscan.com/tx/${text}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </a>
                                            ),
                                        },
                                        {
                                            title: 'Ví quét',
                                            dataIndex: 'wallet',
                                            key: 'wallet',
                                            render: (text) => (
                                                <a
                                                    href={`https://bscscan.com/address/${text}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </a>
                                            ),
                                        },
                                        {
                                            title: 'Token',
                                            dataIndex: 'token',
                                            key: 'token',
                                            render: (text) => (
                                                <a
                                                    href={`https://bscscan.com/address/${text}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </a>
                                            ),
                                        },
                                        {
                                            title: 'Ví nhận',
                                            dataIndex: 'destination',
                                            key: 'destination',
                                            render: (text) => (
                                                <a
                                                    href={`https://bscscan.com/address/${text}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {text}
                                                </a>
                                            ),
                                        },
                                        {
                                            title: 'Số lượng',
                                            dataIndex: 'amount',
                                            key: 'amount',
                                        },
                                    ]}
                                />
                            </Stack>
                        ),
                    },
                ]}
            />
        </Stack>
    )
}

export default MainPage
