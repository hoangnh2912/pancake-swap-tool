import { Flex, Stack, Text, useToast } from '@chakra-ui/react'
import { Button, Form, Input, InputNumber, message, Progress, Select, Switch, Table, Tabs } from 'antd'
import { ethers } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import useStorage from '../hooks/useStorage'
import { useStoreState } from '../redux/hook'
import { electronAPI, TOKEN_ADDRESS } from '../utils/constants'
import { ContractScanner } from '../utils/scanContract'
import { WalletBalanceScanner } from '../utils/scanWalletBalance'
import { tryPrivateKeyToAddress } from '../utils/utils'
import useCountWallet from '../hooks/useCountWallet'

type ScanWalletAirdrop = {
    fromBlock: number
    scanAddresses: string
    concurrency: number
    blockChunk: number
    tokens: string[]
    scanningFromBlock: number
    scanningToBlock: number
    airdropAmount: number
    airdropToken: string
    walletIndex: number
    isAirdrop: boolean
    isFakeAirdrop: boolean
    gasPrice: number
    airdropDuration: number
    countAirdropUntilDeleteAll: number
}

type ScanWalletBalance = {
    concurrency: number
    tokens: string[]
    fileName: string
}

const buildTokenMap = (tokenArr: string[]): Record<string, string> => {
    if (!tokenArr?.length) return {}
    const result: Record<string, string> = {}
    for (const q of tokenArr) {
        const label = TOKEN_ADDRESS.find((e) => e.value === q)?.label ?? q
        result[label] = q
    }
    return result
}

const MainPage = () => {
    const [formAirdrop] = Form.useForm<ScanWalletAirdrop>()
    const [formBalance] = Form.useForm<ScanWalletBalance>()

    const contractScanner = useRef<ContractScanner | null>(null)
    const walletBalanceScanner = useRef<WalletBalanceScanner | null>(null)
    const isAbortingRef = useRef(false)

    const scanningFromBlock = Form.useWatch('scanningFromBlock', formAirdrop)
    const scanningToBlock = Form.useWatch('scanningToBlock', formAirdrop)
    const walletIndex = Form.useWatch('walletIndex', formAirdrop) || 1
    const isAirdrop = !!Form.useWatch('isAirdrop', formAirdrop)
    const airdropToken = Form.useWatch('airdropToken', formAirdrop)
    const {
        airdropCount,
        refetch: refetchCount,
        walletCount,
    } = useCountWallet(airdropToken, '')

    // Progress khi đang quét nhiều contract
    const [scanProgress, setScanProgress] = useState<{
        current: number
        total: number
        address: string
    } | null>(null)
    const [isTransferring, setIsTransferring] = useState(false)

    const [privateKeys, setPrivateKeys] = useState([
        '4cd6b7f576b0c95a499b045bf058c62fc8c6d4c9a2a79351f630e9ce6907c042',
    ])

    const [privateKeysFile, setPrivateKeysFile] = useState<File | null>(null)
    const [allowance, setAllowance] = useState<string>()
    const [isScanning, setIsScanning] = useState<boolean>()
    const [isApproving, setIsApproving] = useState<boolean>()
    const [rpc, setRpc] = useState<string>('https://bsc.drpc.org')

    const tabId = useStoreState((state) => state.tabId)

    const { setItem, getItem, getKeyCacheByTabId } = useStorage()

    useEffect(() => {
        const cache = getItem<{
            privateKeys: string[]
            rpc: string
            scanAddresses: string
        }>(getKeyCacheByTabId(tabId))
        if (cache) {
            setPrivateKeys(cache.privateKeys ?? [])
            setRpc(cache.rpc)
            formAirdrop.setFieldValue('scanAddresses', cache.scanAddresses)
        }
        electronAPI.onMessage((msg) => {
            message.info(msg)
        })
    }, [])

    const onSaveLocalCache = () => {
        setItem(getKeyCacheByTabId(tabId), {
            privateKeys,
            rpc,
            scanAddresses: formAirdrop.getFieldValue('scanAddresses'),
        })
    }

    const getContractAddresses = (): string[] => {
        const raw: string = formAirdrop.getFieldValue('scanAddresses') ?? ''
        return raw
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => ethers.utils.isAddress(a))
    }
    const onDragEnter = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const onDragOver = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'copy'
    }

    const onDragLeave = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const toast = useToast()

    const exportWalletAddresses = () => {
        const addresses = privateKeys.map((key, idx) => ({
            index: idx + 1,
            privateKey: key.trim(),
            address: tryPrivateKeyToAddress(key),
        }))
        const blob = new Blob(
            [addresses.map((e) => `${e.index + 1} ${e.address} ${e.privateKey}`).join('\n')],
            { type: 'text/plain' }
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'wallet_addresses.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const importPrivateKeys = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const content = reader.result as string
            // Here the content has been read successfuly
            const allPrivateKeys = content
                .split('\n')
                .map((k) => k.trim().replace(/"/g, '').replace(/'/g, ''))

            const checkedPrivateKeys = allPrivateKeys.filter((k) => !!tryPrivateKeyToAddress(k))
            if (checkedPrivateKeys.length === 0) {
                toast({
                    title: 'Không có private key hợp lệ',
                    description: 'Vui lòng kiểm tra lại file chứa private key',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                })
                return
            }
            setPrivateKeysFile(file)
            if (checkedPrivateKeys.length < allPrivateKeys.length) {
                toast({
                    title: 'Một số private key không hợp lệ',
                    description: 'Đã lọc ra các private key không hợp lệ',
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                })
            }
            setPrivateKeys(checkedPrivateKeys ?? [])
            onSaveLocalCache()
        }
        reader.readAsText(file)
    }

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
            <Flex gap={'5px'} alignItems={'center'}>
                <Text>Nhập private key</Text>
                <Stack
                    onClick={() => {
                        let input = document.createElement('input')
                        input.hidden = true
                        input.type = 'file'
                        input.accept = '.txt'
                        input.onchange = (e: any) => {
                            const file = e.target?.files?.item(0)
                            importPrivateKeys(file)
                            input.remove()
                        }
                        input.click()
                    }}
                    w={'300px'}
                    h={'30px'}
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="5px 5px 5px 5px rgba(0,0,0,0.3)"
                    _hover={{
                        bg: '#0D166D',
                    }}
                    border="2px dashed gray"
                    bg="#0D164D"
                    style={{
                        aspectRatio: '2.5',
                    }}
                    cursor="pointer"
                    onDragEnter={onDragEnter}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const file = e.dataTransfer.files.item(0)
                        if (!file || file.type !== 'text/plain') {
                            alert('Vui lòng chọn file .txt chứa private key')
                            return
                        }
                        importPrivateKeys(file)
                    }}
                >
                    {privateKeysFile ? (
                        <Text color={'white'}>{privateKeysFile.name}</Text>
                    ) : (
                        <Text color={'white'}>Chọn file chứa private key</Text>
                    )}
                </Stack>
                {privateKeys?.length > 0 && (
                    <Button onClick={() => exportWalletAddresses()} type="primary">
                        Xuất địa chỉ ví
                    </Button>
                )}
            </Flex>
            <Text>Danh sách ví</Text>
            <Table
                columns={[
                    {
                        title: 'STT',
                        dataIndex: 'idx',
                        width: 50,
                    },
                    {
                        title: 'Địa chỉ',
                        dataIndex: 'address',
                    },
                ]}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                }}
                dataSource={privateKeys.map((key, idx) => ({
                    idx: idx + 1,
                    address: tryPrivateKeyToAddress(key),
                }))}
            />
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: 'Quét ví và airdrop',
                        children: (
                            <Stack flex={1} gap={'0px'}>
                                <Form
                                    form={formAirdrop}
                                    initialValues={{
                                        scanAddresses: '0xb300000b72DEAEb607a12d5f54773D1C19c7028d',
                                        blockChunk: 1000,
                                        concurrency: 1,
                                        airdropAmount: 1,
                                        airdropToken: '0x82a28b2c3e48f25ddf1bef3e27c65838b566423d',
                                        walletIndex: 1,
                                        tokens: [],
                                        countAirdropUntilDeleteAll: 7000,
                                    }}
                                    onFinish={async (values) => {
                                        // Lưu cài đặt và init token để approve
                                        const addresses = getContractAddresses()
                                        if (addresses.length === 0) {
                                            message.error('Không có địa chỉ contract hợp lệ')
                                            return
                                        }
                                        // Dùng contract đầu tiên để init (approve token)
                                        contractScanner.current = ContractScanner.getInstance().save({
                                            isAirdrop: true,
                                            contractAddress: '',
                                            fromBlock: values.fromBlock,
                                            tokens: buildTokenMap(values.tokens),
                                            rpcUrl: rpc,
                                            options: {
                                                blockChunk: values.blockChunk,
                                                concurrency: values.concurrency,
                                            },
                                            storeId: tabId,
                                            airdropAmount: values.airdropAmount,
                                            airdropToken: values.airdropToken,
                                            onScan(fromBlock, toBlock) {
                                                formAirdrop.setFieldValue('scanningFromBlock', fromBlock)
                                                formAirdrop.setFieldValue('scanningToBlock', toBlock)
                                            },
                                            privateKeySigner: privateKeys[values.walletIndex - 1],
                                            isFakeAirdrop: values.isFakeAirdrop,
                                            gasPrice: values.gasPrice || 0.1,
                                            diffSeconds: values.airdropDuration || 180,
                                            countAirdropUntilDeleteAll: values.countAirdropUntilDeleteAll,
                                        })
                                        setAllowance(await contractScanner.current.initTokens())
                                        onSaveLocalCache()
                                        message.success(`Đã lưu cài đặt — sẵn sàng quét ${addresses.length} contract`)
                                    }}
                                >
                                    <Form.Item label="Kích hoạt airdrop" name="isAirdrop">
                                        <Switch />
                                    </Form.Item>
                                    {isAirdrop && (
                                        <Form.Item label="Chọn ví" name="walletIndex" required>
                                            <InputNumber
                                                placeholder="Chọn ví theo thứ tự"
                                                defaultValue={1}
                                            />
                                        </Form.Item>
                                    )}
                                    {walletIndex &&
                                        privateKeys.length > 0 &&
                                        privateKeys[walletIndex - 1] && (
                                            <Text
                                                style={{
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                Ví gửi token:{' '}
                                                {tryPrivateKeyToAddress(
                                                    privateKeys[walletIndex - 1]
                                                )}
                                            </Text>
                                        )}
                                    <Form.Item
                                        label="Danh sách contract cần quét"
                                        name="scanAddresses"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập ít nhất 1 địa chỉ contract',
                                            },
                                            {
                                                validator: async (_, value: string) => {
                                                    const lines = (value ?? '')
                                                        .split('\n')
                                                        .map((a) => a.trim())
                                                        .filter(Boolean)
                                                    const invalid = lines.filter(
                                                        (a) => !ethers.utils.isAddress(a)
                                                    )
                                                    if (invalid.length > 0) {
                                                        return Promise.reject(
                                                            new Error(
                                                                `Địa chỉ không hợp lệ: ${invalid[0]}`
                                                            )
                                                        )
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            rows={5}
                                            placeholder="Nhập danh sách contract, mỗi dòng 1 địa chỉ&#10;0xabc...&#10;0xdef..."
                                        />
                                    </Form.Item>
                                    <p>Tổng ví đã quét (tất cả contract): <b>{walletCount}</b></p>
                                    <p>Tổng ví đã transfer: <b>{airdropCount}</b></p>
                                    {isAirdrop && (
                                        <>
                                            <Form.Item
                                                label="Địa chỉ token airdrop"
                                                name="airdropToken"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Vui lòng nhập địa chỉ quét',
                                                    },
                                                    {
                                                        validator: async (_, value) => {
                                                            if (!ethers.utils.isAddress(value)) {
                                                                return Promise.reject(
                                                                    new Error(
                                                                        'Địa chỉ quét không hợp lệ'
                                                                    )
                                                                )
                                                            }
                                                        },
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Nhập địa chỉ token airdrop" />
                                            </Form.Item>
                                            <Form.Item
                                                label="Số lượng airdrop"
                                                name="airdropAmount"
                                            >
                                                <InputNumber placeholder="Nhập số lượng airdrop" />
                                            </Form.Item>
                                            <Form.Item
                                                label="Airdrop giả (không thực hiện chuyển token)"
                                                name="isFakeAirdrop"
                                            >
                                                <Switch />
                                            </Form.Item>
                                            <Form.Item label="Gas Price (Gwei)" name="gasPrice">
                                                <InputNumber
                                                    defaultValue={0.1}
                                                    placeholder="Nhập gas price"
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                label="Thời gian giữa mỗi lần airdrop (giây)"
                                                name="airdropDuration"
                                            >
                                                <InputNumber
                                                    defaultValue={180}
                                                    placeholder="Nhập giây"
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                label="Số lượng airdrop tối đa trước khi xoá tất cả dữ liệu"
                                                name="countAirdropUntilDeleteAll"
                                            >
                                                <InputNumber
                                                    defaultValue={7000}
                                                    placeholder="Nhập số lượng"
                                                />
                                            </Form.Item>
                                        </>
                                    )}

                                    <Form.Item label="Kích thước quét block" name="blockChunk">
                                        <InputNumber min={1} placeholder="Kích thước quét block" />
                                    </Form.Item>
                                    <Form.Item label="Số lượt quét đồng thời" name="concurrency">
                                        <InputNumber min={1} placeholder="Số lượt quét đồng thời" />
                                    </Form.Item>
                                    <Form.Item label="Chọn loại token" name="tokens">
                                        <Select
                                            placeholder="Chọn loại token"
                                            mode="multiple"
                                            options={TOKEN_ADDRESS}
                                        />
                                    </Form.Item>
                                    <Form.Item hidden name="wallets" />
                                    <Form.Item hidden name="scanningFromBlock" />
                                    <Form.Item hidden name="scanningToBlock" />
                                    <Button htmlType="submit" type="primary">
                                        Lưu cài đặt
                                    </Button>
                                    {/* Nút Quét tất cả contracts tuần tự */}
                                    <Button
                                        htmlType="button"
                                        type="primary"
                                        style={{ marginLeft: '8px' }}
                                        loading={isScanning}
                                        onClick={async () => {
                                            const addresses = getContractAddresses()
                                            if (addresses.length === 0) {
                                                message.error('Không có địa chỉ contract hợp lệ')
                                                return
                                            }
                                            if (!contractScanner.current) {
                                                message.error('Vui lòng nhấn "Lưu cài đặt" trước')
                                                return
                                            }
                                            isAbortingRef.current = false
                                            setIsScanning(true)
                                            const values = formAirdrop.getFieldsValue()
                                            for (let i = 0; i < addresses.length; i++) {
                                                if (isAbortingRef.current) break
                                                const addr = addresses[i]
                                                setScanProgress({ current: i + 1, total: addresses.length, address: addr })
                                                const scanner = ContractScanner.getInstance().save({
                                                    isAirdrop: false,
                                                    scanOnce: true,
                                                    contractAddress: addr,
                                                    fromBlock: values.fromBlock,
                                                    tokens: buildTokenMap(values.tokens),
                                                    rpcUrl: rpc,
                                                    options: {
                                                        blockChunk: values.blockChunk,
                                                        concurrency: values.concurrency,
                                                    },
                                                    storeId: tabId,
                                                    airdropAmount: values.airdropAmount,
                                                    airdropToken: values.airdropToken,
                                                    onScan(fromBlock, toBlock) {
                                                        formAirdrop.setFieldValue('scanningFromBlock', fromBlock)
                                                        formAirdrop.setFieldValue('scanningToBlock', toBlock)
                                                    },
                                                    privateKeySigner: privateKeys[values.walletIndex - 1],
                                                    isFakeAirdrop: values.isFakeAirdrop,
                                                    gasPrice: values.gasPrice || 0.1,
                                                    diffSeconds: values.airdropDuration || 180,
                                                    countAirdropUntilDeleteAll: values.countAirdropUntilDeleteAll,
                                                })
                                                await scanner.start()
                                                message.info(`Hoàn thành contract ${i + 1}/${addresses.length}: ${addr}`)
                                            }
                                            setScanProgress(null)
                                            setIsScanning(false)
                                            if (!isAbortingRef.current) {
                                                message.success(`Đã quét xong ${addresses.length} contract! Nhấn "Transfer tất cả" để gửi token.`)
                                                await refetchCount()
                                            }
                                        }}
                                    >
                                        Quét tất cả ({getContractAddresses().length} contract)
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        type="dashed"
                                        style={{ marginLeft: '8px', backgroundColor: 'yellow' }}
                                        onClick={() => { electronAPI.readFile() }}
                                    >
                                        Nhập file
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        type="dashed"
                                        style={{ marginLeft: '8px', backgroundColor: 'yellow' }}
                                        onClick={() => { electronAPI.saveFile(airdropToken, '') }}
                                    >
                                        Xuất file (tất cả)
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        style={{ marginLeft: '8px', backgroundColor: 'red' }}
                                        type="primary"
                                        onClick={async () => {
                                            try {
                                                await electronAPI.deleteAll(airdropToken, '')
                                                await refetchCount()
                                                message.success('Xoá dữ liệu thành công')
                                            } catch (error) {
                                                message.error(`Xoá dữ liệu thất bại: ${error}`)
                                            }
                                        }}
                                    >
                                        Xoá tất cả dữ liệu
                                    </Button>
                                    <Button
                                        htmlType="button"
                                        style={{ marginLeft: '8px', backgroundColor: 'red' }}
                                        type="primary"
                                        onClick={async () => {
                                            try {
                                                await electronAPI.deleteAirdrop(airdropToken, '')
                                                await refetchCount()
                                                message.success('Xoá dữ liệu thành công')
                                            } catch (error) {
                                                message.error(`Xoá dữ liệu thất bại: ${error}`)
                                            }
                                        }}
                                    >
                                        Xoá ví đã transfer
                                    </Button>
                                    {/* Transfer 1 lần cho tất cả ví từ mọi contract */}
                                    <Button
                                        htmlType="button"
                                        style={{ marginLeft: '8px', backgroundColor: 'green' }}
                                        type="primary"
                                        loading={isTransferring}
                                        disabled={!allowance}
                                        onClick={async () => {
                                            if (!contractScanner.current) {
                                                message.error('Vui lòng nhấn "Lưu cài đặt" trước')
                                                return
                                            }
                                            setIsTransferring(true)
                                            // Aggregate scanner: contractAddress = '' → đọc tất cả ví
                                            const values = formAirdrop.getFieldsValue()
                                            const aggScanner = ContractScanner.getInstance().save({
                                                isAirdrop: true,
                                                contractAddress: '',
                                                fromBlock: 0,
                                                tokens: buildTokenMap(values.tokens),
                                                rpcUrl: rpc,
                                                options: {},
                                                storeId: tabId,
                                                airdropAmount: values.airdropAmount,
                                                airdropToken: values.airdropToken,
                                                onScan: undefined,
                                                privateKeySigner: privateKeys[values.walletIndex - 1],
                                                isFakeAirdrop: values.isFakeAirdrop,
                                                gasPrice: values.gasPrice || 0.1,
                                                diffSeconds: 0,
                                                countAirdropUntilDeleteAll: values.countAirdropUntilDeleteAll,
                                            })
                                            await aggScanner.doAirdrop(false)
                                            await refetchCount()
                                            setIsTransferring(false)
                                        }}
                                    >
                                        Transfer tất cả ({walletCount - airdropCount} ví chờ)
                                    </Button>
                                    {isScanning && (
                                        <Button
                                            htmlType="button"
                                            type="primary"
                                            style={{ backgroundColor: 'red', marginLeft: '8px' }}
                                            onClick={() => {
                                                isAbortingRef.current = true
                                                contractScanner.current?.stop()
                                                setIsScanning(false)
                                                setScanProgress(null)
                                            }}
                                        >
                                            Dừng quét
                                        </Button>
                                    )}
                                    {isAirdrop && (
                                        <Button
                                            htmlType="button"
                                            type="primary"
                                            style={{ backgroundColor: 'red', marginLeft: '8px' }}
                                            loading={isApproving}
                                            onClick={async () => {
                                                setIsApproving(true)
                                                setAllowance(await contractScanner.current?.approveAirdrop())
                                                setIsApproving(false)
                                            }}
                                        >
                                            {allowance ? allowance : '0'} Approve token
                                        </Button>
                                    )}
                                </Form>
                                {scanProgress && (
                                    <Stack gap={'4px'} mt={'8px'}>
                                        <Text fontWeight={'bold'}>
                                            Đang quét contract {scanProgress.current}/{scanProgress.total}:
                                        </Text>
                                        <Text fontSize={'sm'} color={'gray.600'}>{scanProgress.address}</Text>
                                        <Progress
                                            percent={Math.round((scanProgress.current / scanProgress.total) * 100)}
                                            status="active"
                                        />
                                    </Stack>
                                )}
                                {scanningFromBlock !== undefined && scanningToBlock !== undefined && (
                                    <Text fontWeight={'bold'}>
                                        Đang quét từ block {scanningFromBlock} đến block {scanningToBlock}
                                    </Text>
                                )}
                            </Stack>
                        ),
                    },
                    {
                        key: '2',
                        label: 'Quét balance ví',
                        children: (
                            <Stack flex={1} gap={'5px'}>
                                <Form
                                    form={formBalance}
                                    initialValues={{
                                        concurrency: 1,
                                        tokens: [],
                                    }}
                                    onFinish={async (values) => {
                                        if (walletBalanceScanner.current) {
                                            walletBalanceScanner.current.stop()
                                            setIsScanning(false)
                                        }
                                        if (!walletBalanceScanner.current) {
                                            walletBalanceScanner.current = new WalletBalanceScanner(
                                                {
                                                    tokens:
                                                        values.tokens.length > 0
                                                            ? values.tokens.reduce((acc, q) => {
                                                                const token = TOKEN_ADDRESS.find(
                                                                    (e) => e.value === q
                                                                )?.label
                                                                return {
                                                                    ...acc,
                                                                    [token]: q,
                                                                }
                                                            }, {})
                                                            : {},
                                                    rpcUrl: rpc,
                                                    options: {
                                                        concurrency: values.concurrency,
                                                    },
                                                    storeId: tabId,
                                                    fileName: values.fileName,
                                                }
                                            )
                                            await walletBalanceScanner.current.initTokens()
                                        }
                                        setIsScanning(true)
                                        await walletBalanceScanner.current.start()
                                    }}
                                >
                                    <Form.Item label="Tên file" name="fileName">
                                        <Input placeholder="Tên file" />
                                    </Form.Item>
                                    <Form.Item label="Số lượt quét đồng thời" name="concurrency">
                                        <InputNumber min={1} placeholder="Số lượt quét đồng thời" />
                                    </Form.Item>
                                    <Form.Item label="Chọn loại token" name="tokens">
                                        <Select
                                            placeholder="Chọn loại token"
                                            mode="multiple"
                                            options={TOKEN_ADDRESS}
                                        />
                                    </Form.Item>
                                    <Form.Item hidden name="wallets" />
                                    <Button htmlType="submit" type="primary" loading={isScanning}>
                                        Quét
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
                                                walletBalanceScanner.current?.stop()
                                                setIsScanning(false)
                                            }}
                                        >
                                            Dừng quét
                                        </Button>
                                    )}
                                </Form>
                            </Stack>
                        ),
                    },
                ]}
            />
        </Stack>
    )
}

export default MainPage
