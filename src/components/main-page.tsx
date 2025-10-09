import { Flex, Stack, Text, useToast } from '@chakra-ui/react'
import { Button, Col, Form, Input, InputNumber, message, Row, Select, Table, Upload } from 'antd'
import { useRef, useState } from 'react'
import { type Stepper } from '../../prisma/client'
import { STEPPER_TYPES, TOKEN_ADDRESS } from '../utils/constants'
import { ContractScanner } from '../utils/scanContract'
import { tryPrivateKeyToAddress } from '../utils/utils'

type StepperForm = Stepper & {
    stepperType: (typeof STEPPER_TYPES)[number]['value']
    deployTokenFile?: File
    abi?: string
    function?: string
    steps: Stepper[]
}

const MainPage = ({ tabId }: { tabId: string }) => {
    const [form] = Form.useForm<StepperForm>()

    const contractScanner = useRef<ContractScanner | null>(null)

    const stepperType = Form.useWatch('stepperType', form) || 'send'
    const steps = Form.useWatch('steps', form) || []
    const [privateKeys, setPrivateKeys] = useState([
        '4cd6b7f576b0c95a499b045bf058c62fc8c6d4c9a2a79351f630e9ce6907c042',
    ])

    const [privateKeysFile, setPrivateKeysFile] = useState<File | null>(null)
    const [allowance, setAllowance] = useState<string>()
    const [isScanning, setIsScanning] = useState<boolean>()
    const [isApproving, setIsApproving] = useState<boolean>()
    const [rpc, setRpc] = useState<string>('https://bsc.drpc.org')

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
        }
        reader.readAsText(file)
    }

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
            <Row gutter={12}>
                <Col span={12}>
                    <Form
                        form={form}
                        initialValues={{
                            stepperType: 'send',
                            gasPrice: 0.01,
                            value: 0,
                            steps: [],
                        }}
                        onFinish={async (values) => {
                            if (contractScanner.current) {
                                contractScanner.current.stop()
                                setIsScanning(false)
                            }
                            contractScanner.current = new ContractScanner()
                            setAllowance(await contractScanner.current.initTokens())
                            message.success('Lưu airdrop thành công')
                        }}
                    >
                        <Form.Item label="Ví" name="from">
                            <Select
                                showSearch
                                placeholder="Chọn ví"
                                options={privateKeys.map((key, idx) => ({
                                    label:
                                        tryPrivateKeyToAddress(key) || 'Private key không hợp lệ',
                                    value: idx + 1,
                                }))}
                            />
                        </Form.Item>
                        <Form.Item label="Thực hiện" name="stepperType">
                            <Select options={STEPPER_TYPES} />
                        </Form.Item>
                        {stepperType === 'deploy' ? (
                            <Form.Item label="File token" name="deployTokenFile">
                                <Upload.Dragger
                                    beforeUpload={(file) => {
                                        form.setFieldValue('deployTokenFile', file)
                                        return false
                                    }}
                                    multiple={false}
                                    maxCount={1}
                                />
                            </Form.Item>
                        ) : (
                            <>
                                <Form.Item label="Địa chỉ tới" name="to">
                                    <Input placeholder="Nhập địa chỉ tới" />
                                </Form.Item>
                                <Form.Item label="ABI" name="abi">
                                    <Input placeholder="Nhập ABI" />
                                </Form.Item>
                                <Form.Item label="Hàm" name="function">
                                    <Select showSearch placeholder="Chọn hàm" />
                                </Form.Item>
                            </>
                        )}
                        <Form.Item label="Số lượng BNB" name="value">
                            <InputNumber
                                placeholder="Nhập số lượng BNB"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="Gas Price (Gwei)" name="gasPrice">
                            <InputNumber placeholder="Nhập gas price" />
                        </Form.Item>
                        <Form.Item hidden name="steps" />
                        <Button htmlType="submit" type="primary">
                            Thêm step
                        </Button>
                    </Form>
                </Col>
                <Col span={12}>
                    <Table />
                </Col>
            </Row>
        </Stack>
    )
}

export default MainPage
