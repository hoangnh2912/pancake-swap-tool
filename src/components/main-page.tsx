import { Flex, Stack, Text, useToast } from '@chakra-ui/react'
import { Button, Form, Input, InputNumber, message, Select, Switch, Table, Tabs, } from 'antd'
import { ethers } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import useStorage from '../hooks/useStorage'
import { useStoreState } from '../redux/hook'
import { electronAPI, TOKEN_ADDRESS } from '../utils/constants'
import { ContractScanner, } from '../utils/scanContract'
import { WalletBalanceScanner } from '../utils/scanWalletBalance'
import { tryPrivateKeyToAddress } from '../utils/utils'

type ScanWalletAirdrop = {
    fromBlock: number
    scanAddress: string
    concurrency: number
    blockChunk: number
    tokens: string[]
    scanningFromBlock: number
    scanningToBlock: number
    airdropAmount: number
    airdropToken: string
    walletIndex: number
    isAirdrop: boolean
}

type ScanWalletBalance = {
    concurrency: number
    tokens: string[]
    fileName: string
}

const MainPage = () => {
    const [formAirdrop] = Form.useForm<ScanWalletAirdrop>()
    const [formBalance] = Form.useForm<ScanWalletBalance>()

    const contractScanner = useRef<ContractScanner | null>(null)
    const walletBalanceScanner = useRef<WalletBalanceScanner | null>(null)

    const scanningFromBlock = Form.useWatch('scanningFromBlock', formAirdrop)
    const scanningToBlock = Form.useWatch('scanningToBlock', formAirdrop)
    const walletIndex = Form.useWatch('walletIndex', formAirdrop) || 1
    const isAirdrop = !!Form.useWatch('isAirdrop', formAirdrop)
    const scanAddress = Form.useWatch('scanAddress', formAirdrop)
    const airdropToken = Form.useWatch('airdropToken', formAirdrop)

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
        }>(getKeyCacheByTabId(tabId))
        if (cache) {
            setPrivateKeys(cache.privateKeys)
            setRpc(cache.rpc)
        }
    }, [])

    const onSaveLocalCache = () => {
        setItem(getKeyCacheByTabId(tabId), {
            privateKeys,
            rpc,
        })
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
            setPrivateKeys(checkedPrivateKeys)
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
                        <Input
                            onChange={(e) =>
                                setRpc(e.target.value)
                            }
                            value={rpc}
                        />
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
                {privateKeys.length > 0 && (
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
                                        scanAddress: '0xb300000b72DEAEb607a12d5f54773D1C19c7028d', // USDT contract address
                                        blockChunk: 1000,
                                        concurrency: 1,
                                        airdropAmount: 1,
                                        airdropToken: '0x82a28b2c3e48f25ddf1bef3e27c65838b566423d',
                                        walletIndex: 1,
                                        tokens: [],
                                    }}
                                    onFinish={async (values) => {
                                        if (contractScanner.current) {
                                            contractScanner.current.stop()
                                            setIsScanning(false)
                                        }
                                        contractScanner.current = new ContractScanner({
                                            isAirdrop: values.isAirdrop,
                                            contractAddress: values.scanAddress,
                                            fromBlock: values.fromBlock,
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
                                                blockChunk: values.blockChunk,
                                                concurrency: values.concurrency,
                                            },
                                            storeId: tabId,
                                            airdropAmount: values.airdropAmount,
                                            airdropToken: values.airdropToken,
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
                                            privateKeySigner: privateKeys[values.walletIndex - 1],
                                        })
                                        setAllowance(await contractScanner.current.initTokens())
                                        message.success('Lưu airdrop thành công')
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
                                    <Button htmlType="button" type="primary"
                                        style={{
                                            marginLeft: '8px',
                                        }}
                                        loading={isScanning}
                                        disabled={isAirdrop && !allowance}
                                        onClick={() => {
                                            setIsScanning(true)
                                            contractScanner.current?.start()
                                        }}
                                    >
                                        Quét
                                    </Button>
                                    <Button htmlType="button" type="dashed"
                                        style={{
                                            marginLeft: '8px',
                                            backgroundColor: 'yellow',
                                        }}
                                        onClick={() => {
                                            electronAPI.saveFile(isAirdrop ? airdropToken : `ct_${scanAddress}`)
                                        }}
                                    >
                                        Xuất file
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
                                    {isAirdrop && <Button
                                        htmlType="button"
                                        type="primary"
                                        style={{
                                            backgroundColor: 'red',
                                            marginLeft: '8px',
                                        }}
                                        loading={isApproving}
                                        onClick={async () => {
                                            console.log('Approving airdrop...');
                                            setIsApproving(true)
                                            setAllowance(await contractScanner.current?.approveAirdrop())
                                            setIsApproving(false)
                                        }}
                                    >
                                        {allowance ? allowance : '0'} Approve airdrop
                                    </Button>}
                                </Form>
                                {scanningFromBlock !== undefined &&
                                    scanningToBlock !== undefined && (
                                        <Text fontWeight={'bold'}>
                                            Đang quét từ block {scanningFromBlock} đến block{' '}
                                            {scanningToBlock}
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
                                            walletBalanceScanner.current = new WalletBalanceScanner({
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
                                            })
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
