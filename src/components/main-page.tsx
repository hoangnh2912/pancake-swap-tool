import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useToast
} from "@chakra-ui/react";
import { Button, Form, Input, InputNumber, Progress, Select, Table, Tabs } from "antd";
import { ethers } from "ethers";
import $ from "jquery";
import { useCallback, useEffect, useRef, useState } from "react";
import useStorage from "../hooks/useStorage";
import { useStoreActions, useStoreState } from "../redux/hook";
import { StepDetail } from "../redux/model";
import {
  PANCAKE_ADDRESS,
  TOKEN_ADDRESS,
  ZERO_ADDRESS
} from "../utils/constants";
import { ContractScanner, WalletBalance } from "../utils/scanContract";
import {
  chainNetworkColor,
  formatEtherWithDecimals,
  shortenIfAddress,
  tryPrivateKeyToAddress,
} from "../utils/utils";

type ScanWallet = {
  fromBlock: number;
  scanAddress: string;
  concurrency: number;
  blockChunk: number;
  tokens: string[];
  wallets: WalletBalance[];
}

const MainPage = () => {
  const [form] = Form.useForm<ScanWallet>();

  const contractScanner = useRef<ContractScanner | null>(null);
  const wallets = Form.useWatch("wallets", form) || [];

  const [privateKeys, setPrivateKeys] = useState([
    "4cd6b7f576b0c95a499b045bf058c62fc8c6d4c9a2a79351f630e9ce6907c042",
  ]);

  const [progress, setProgress] = useState(0);

  const [privateKeysFile, setPrivateKeysFile] = useState<File | null>(null);

  const tabId = useStoreState((state) => state.tabId);
  const pairData = useStoreState((state) => state.steps.pairData);
  const stepData = useStoreState((state) => state.steps.data);

  const chainNetwork = useStoreState((state) => state.chainNetwork);

  const isLoadCacheDone = useRef(false);

  const walletData = useStoreState((state) => state.wallets.data);

  const getWalletBalance = useCallback(
    (privateKey: string) => {
      try {
        const address = tryPrivateKeyToAddress(privateKey);
        const walletDataItem = walletData[address];
        return walletDataItem.balance[chainNetwork.symbol].toString();
      } catch (error) {
        return "0";
      }
    },
    [walletData]
  );

  const tokenAddress = useStoreState((state) => state.steps.tokenAddress);
  const isScanning = useStoreState((state) => state.scan.isScanning);
  const delay = useStoreState((state) => state.steps.delay);
  const setDelay = useStoreActions((action) => action.steps.setDelay);
  const setChainNetwork = useStoreActions(
    (action) => action.chainNetwork.setChainNetwork
  );

  const setTokenAddress = useStoreActions(
    (action) => action.steps.setTokenAddress
  );

  const addStep = useStoreActions((action) => action.steps.add);
  const setIsScanning = useStoreActions((action) => action.scan.setIsScanning);

  const { setItem, getItem, getKeyCacheByTabId } = useStorage();

  useEffect(() => {
    const cache = getItem<{
      privateKeys: string[];
      rpc: string;
      rpcSubmit: string;
      name: string;
      explorer: string;
      factory: string;
      router: string;
      symbol: string;
      weth: string;
      tokenAddress: string;
      delay: number;
      gasPrice: string;
      gasLimit: string;
      steps: StepDetail[];
    }>(getKeyCacheByTabId(tabId));
    if (cache) {
      setPrivateKeys(cache.privateKeys);
      setChainNetwork({
        ...cache
      });
      setDelay(cache.delay);
      setTokenAddress(cache.tokenAddress);
      cache.steps.forEach((step: any) => {
        addStep(step);
      });
    }
    isLoadCacheDone.current = true;
  }, []);

  const onSaveLocalCache = () => {
    if (!isLoadCacheDone.current) return;
    setItem(getKeyCacheByTabId(tabId), {
      privateKeys,
      ...chainNetwork,
      delay,
      steps: stepData,
      tokenAddress,
    });
  };
  const onDragEnter = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    onSaveLocalCache();
  }, [
    privateKeys,
    chainNetwork.name,
    delay,
    stepData,
    tokenAddress,
    chainNetwork.gasLimit,
    chainNetwork.gasPrice,
    chainNetwork.rpc,
    chainNetwork.rpcSubmit,
  ]);
  const toast = useToast();


  const exportWalletAddresses = () => {
    const addresses = privateKeys.map((key, idx) => ({
      index: idx + 1,
      privateKey: key.trim(),
      address: tryPrivateKeyToAddress(key)
    }));
    const blob = new Blob([addresses.map(e => `${e.index + 1} ${e.address} ${e.privateKey}`).join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallet_addresses.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const exportWalletScan = () => {
    const addresses = wallets.map((wallet, idx) => ({
      index: idx + 1,
      address: wallet.address,
      balance: `${wallet.native} ${chainNetwork.symbol}`,
      tokens: wallet.tokens,
    }));
    (window as any).Shell.saveFile(addresses.map(e => `${e.index + 1} ${e.address} ${e.balance} ${JSON.stringify(e.tokens)}`).join("\n"));

    // const blob = new Blob([addresses.map(e => `${e.index + 1} ${e.address} ${e.balance} ${JSON.stringify(e.tokens)}`).join("\n")], { type: "text/plain" });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "wallet_scan.txt";
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
  }

  const importPrivateKeys = (file: File) => {

    const reader = new FileReader();
    reader.onload = function (e) {
      const content = reader.result as string;
      // Here the content has been read successfuly
      const allPrivateKeys = content
        .split("\n")
        .map((k) => k.trim()
          .replace(/"/g, "")
          .replace(/'/g, "")
        )

      const checkedPrivateKeys = allPrivateKeys.filter((k) => !!tryPrivateKeyToAddress(k));
      if (checkedPrivateKeys.length === 0) {
        toast({
          title: "Không có private key hợp lệ",
          description: "Vui lòng kiểm tra lại file chứa private key",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      setPrivateKeysFile(file);
      if (checkedPrivateKeys.length < allPrivateKeys.length) {
        toast({
          title: "Một số private key không hợp lệ",
          description: "Đã lọc ra các private key không hợp lệ",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      setPrivateKeys(checkedPrivateKeys);
      onSaveLocalCache();
    }
    reader.readAsText(file);
  }

  if (!isLoadCacheDone.current) return null;

  return (
    <Stack flex={1} boxShadow="md" p="4" bg={"white"} rounded={"md"}>
      <Text>{tabId}</Text>
      <Text fontWeight={"bold"}>Mạng blockchain</Text>
      <Menu>
        <MenuButton
          {...chainNetworkColor(chainNetwork.name)}
          _hover={{
            ...chainNetworkColor(chainNetwork.name),
          }}
          as={Button}
        >
          {chainNetwork.name}
        </MenuButton>
        <MenuList>
          {Object.entries(PANCAKE_ADDRESS).map(([key, value]) =>
            Object.entries(value).map(([key2, value2]) => (
              <MenuItem
                key={`${key}-${key2}`}
                onClick={() => {
                  setChainNetwork({
                    explorer: value2.Explorer,
                    factory: value2.Factory,
                    name: value2.Name,
                    router: value2.Router,
                    rpc: value2.RPC,
                    symbol: value2.Symbol,
                    weth: value2.WETH,
                  });
                }}
              >
                {value2.Name}
              </MenuItem>
            ))
          )}
        </MenuList>
      </Menu>

      <Flex gap={"10px"}>
        <Flex flex={1} direction={"column"}>
          <Flex gap={"5px"} alignItems={"center"}>
            <Text>Nhập RPC</Text>
            <Input
              onChange={(e) =>
                setChainNetwork({
                  rpc: e.target.value,
                })
              }
              value={chainNetwork.rpc}
            />
          </Flex>
          <Flex gap={"5px"} alignItems={"center"}>
            <Text>Nhập RPC Submit</Text>
            <Input
              onChange={(e) =>
                setChainNetwork({
                  rpcSubmit: e.target.value,
                })
              }
              value={chainNetwork.rpcSubmit}
            />
          </Flex>
        </Flex>
      </Flex>

      <Tabs defaultActiveKey="1" items={[
        {
          key: "1",
          label: "Quét ví",
          children: <Stack flex={1} gap={"0px"}>
            <Text fontWeight={"bold"}>Quét ví</Text>
            <Form form={form}
              initialValues={{
                scanAddress: "0x4dec822fB95d76b2D2254bEaF3f258A7E8A1760c", // USDT contract address
                fromBlock: 58155294,
                blockChunk: 1000,
                concurrency: 1,
                tokens: [TOKEN_ADDRESS[0]]
              }}
              onFinish={async (values) => {
                contractScanner.current = new ContractScanner({
                  contractAddress: values.scanAddress,
                  fromBlock: values.fromBlock,
                  toBlock: 'latest',
                  tokens: values.tokens.reduce((acc, q) => {
                    const token = TOKEN_ADDRESS.find(e => e.value === q)?.label
                    return {
                      ...acc,
                      [token]: q
                    }
                  }, {}),
                  rpcUrl: chainNetwork.rpc,
                  options: {
                    blockChunk: values.blockChunk,
                    concurrency: values.concurrency,
                  },
                  storeId: tabId,
                  onWallet(wallet) {
                    form.setFieldValue("wallets", [
                      ...(form.getFieldValue("wallets") || []),
                      wallet
                    ]);
                  },
                });
                await contractScanner.current.initTokens();
                setIsScanning(true);
                await contractScanner.current.start(setProgress);
                setIsScanning(false);
                exportWalletScan()
              }}>
              <Form.Item label="Địa chỉ quét" name="scanAddress"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ quét" }, {
                  validator: async (_, value) => {
                    if (!ethers.utils.isAddress(value)) {
                      return Promise.reject(new Error("Địa chỉ quét không hợp lệ"));
                    }
                  }
                }]}
              >
                <Input
                  placeholder="Nhập địa chỉ quét"
                />
              </Form.Item>
              <Form.Item label="Từ block" name="fromBlock">
                <InputNumber
                  placeholder="Từ block"
                />
              </Form.Item>
              <Form.Item label="Kích thước quét block" name="blockChunk">
                <InputNumber
                  min={1}
                  placeholder="Kích thước quét block"
                />
              </Form.Item>
              <Form.Item label="Số lượt quét đồng thời" name="concurrency">
                <InputNumber
                  min={1}
                  placeholder="Số lượt quét đồng thời"
                />
              </Form.Item>
              <Form.Item label="Chọn loại token" name="tokens">
                <Select
                  placeholder="Chọn loại token"
                  mode="multiple"
                  options={TOKEN_ADDRESS}
                />
              </Form.Item>
              <Form.Item hidden name="wallets" />
              <Button
                htmlType="submit"
                type="primary"
                loading={isScanning}
              >
                Quét
              </Button>
              {isScanning && <Button
                htmlType="button"
                type="primary"
                style={{
                  backgroundColor: 'red',
                  marginLeft: '8px'
                }}
                onClick={() => {
                  contractScanner.current?.stop();
                  setIsScanning(false);
                }}
              >
                Dừng quét
              </Button>}
              {isScanning &&
                <Progress percent={progress} />
              }
            </Form>
            <Text fontWeight={"bold"}>Kết quả quét</Text>
            <Table
              columns={[
                {
                  title: "STT",
                  width: 50,
                  render: (_, __, index) => index + 1
                },
                {
                  title: "Địa chỉ ví",
                  dataIndex: "address",
                  key: "address",
                },
                {
                  title: "Số dư",
                  dataIndex: "native",
                  key: "native",
                },
                {
                  title: "Token",
                  dataIndex: "tokens",
                  key: "tokens",
                  render: (tokens: Record<string, string>) => (
                    <ul>
                      {Object.entries(tokens).map(([symbol, balance]) => (
                        <li key={symbol}>
                          {symbol}: {balance}
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]}
              dataSource={wallets}
            />
            <Button type="primary"
              onClick={exportWalletScan}
            >
              Xuất kết quả quét
            </Button>
          </Stack>,
        },
        {
          key: "2",
          label: "Airdrop",
          children: <Stack flex={1}>
            <Text fontWeight={"bold"}>Lệnh chuyển tiền</Text>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Nhập private key</Text>
              <Stack
                onClick={() => {
                  let input = document.createElement("input");
                  input.hidden = true;
                  input.type = "file";
                  input.accept = ".txt";
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.item(0);
                    importPrivateKeys(file);
                    input.remove();
                  };
                  input.click();
                }}
                w={'300px'}
                h={"50px"}
                justifyContent="center"
                alignItems="center"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="5px 5px 5px 5px rgba(0,0,0,0.3)"
                _hover={{
                  bg: "#0D166D",
                }}
                border="2px dashed gray"
                bg="#0D164D"
                style={{
                  aspectRatio: "2.5",
                }}
                cursor="pointer"
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files.item(0);
                  if (!file || file.type !== "text/plain") {
                    alert("Vui lòng chọn file .txt chứa private key");
                    return;
                  }
                  importPrivateKeys(file);
                }}
              >
                {privateKeysFile ? (
                  <Text color={"white"}>{privateKeysFile.name}</Text>
                ) : (
                  <Text color={"white"}>Chọn file chứa private key</Text>
                )}
              </Stack>
              {privateKeys.length > 0 && <Button
                onClick={() => exportWalletAddresses()}
                type="primary"
              >
                Xuất địa chỉ ví
              </Button>}
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
                  dataIndex: 'address'
                },
                {
                  title: 'Số dư',
                  dataIndex: 'balance'
                }
              ]}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
              }}
              dataSource={privateKeys.map((key, idx) => ({
                idx: idx + 1,
                address: tryPrivateKeyToAddress(key),
                balance: formatEtherWithDecimals(getWalletBalance(key))
              }))}
            />
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Nhập delay giữa các lần chuyển (giây)</Text>
              <Input
                type="number"
                onChange={(e) => setDelay(parseInt(e.target.value) * 1000)}
                value={delay / 1000}
              />
            </Flex>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Ví nhận</Text>
              <Input.TextArea
                rows={5}
                id="receivedWallet" />
            </Flex>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Nhập số lượng {chainNetwork.symbol}</Text>
              <Input id="amount" type="number" defaultValue={1} />
            </Flex>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Nhập gasPrice </Text>
              <Input
                id="gasPrice"
                type="number"
                onChange={(e) => {
                  setChainNetwork({
                    gasPrice: e.target.value,
                  });
                }}
                defaultValue={chainNetwork.gasPrice}
              />
            </Flex>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Nhập gasLimit </Text>
              <Input
                id="gasLimit"
                placeholder="Để trống sẽ tự tính toán"
                type="number"
                onChange={(e) => {
                  setChainNetwork({
                    gasLimit: e.target.value,
                  });
                }}
                defaultValue={chainNetwork.gasLimit}
              />
            </Flex>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Số lệnh</Text>
              <Input
                id="stepCount"
                placeholder="Số lệnh"
                type="number"
                defaultValue={1}
              />
            </Flex>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Số thứ tự ví</Text>
              <Input
                id="walletIndex"
                placeholder="Chọn ví theo thứ tự"
                type="number"
                defaultValue={1}
              />
            </Flex>
            <Button
              onClick={() => {
                const stepCount = Math.min(parseInt($("#stepCount").val() as string), 1);
                const walletIndex = Math.min(1, parseInt(
                  $("#walletIndex").val() as string
                ));
                if (!privateKeys || privateKeys.length === 0) {
                  alert("Vui lòng nhập private key trước khi thêm lệnh");
                  return;
                }
                if (stepCount <= 0) {
                  alert("Số lệnh phải lớn hơn 0");
                  return;
                }
                if (stepCount > privateKeys.length) {
                  alert(
                    `Số lệnh không thể lớn hơn số ví hiện tại (${privateKeys.length})`
                  );
                  return;
                }

                if (walletIndex <= 0 || walletIndex > privateKeys.length) {
                  alert(
                    `Số thứ tự ví phải từ 1 đến ${privateKeys.length}, hiện tại chỉ có ${privateKeys.length} ví`
                  );
                  return;
                }
                if (walletIndex + stepCount - 1 > privateKeys.length) {
                  alert(
                    `Số lệnh không thể vượt quá số ví hiện tại (${privateKeys.length}), vui lòng chọn lại số lệnh hoặc ví`
                  );
                  return;
                }
                for (let i = walletIndex - 1; i < stepCount; i++) {
                  addStep({
                    amount: $("#amount").val() as string,
                    id: Math.random().toString(16).substring(7),
                    method: $("#method").val() as string,
                    slippage: $("#slippage").val() as string,
                    amountCalculate: {
                      value: ethers.BigNumber.from(0),
                    },
                    privateKey: privateKeys[i],
                    receivedWallet: $("#receivedWallet").val() as string,
                  })
                }
              }
              }
              disabled={
                pairData.address == ZERO_ADDRESS ||
                !pairData.address ||
                !tokenAddress
              }
              variant="solid"
            >
              Thêm
            </Button>
            <Text>Tổng lệnh: {stepData.length}</Text>
            <Table
              columns={[
                {
                  title: 'ID',
                  dataIndex: 'id',
                  key: 'id',
                },
                {
                  title: 'Ví chuyển',
                  dataIndex: 'walletFrom',
                  key: 'walletFrom',
                },
                {
                  title: 'Ví nhận',
                  dataIndex: 'walletTo',
                  key: 'walletTo',
                },
                {
                  title: `Số lượng ${chainNetwork.symbol}`,
                  dataIndex: 'amount',
                  key: 'amount',
                },
                {
                  title: 'Số lượng token',
                  dataIndex: 'amountCalculate',
                  key: 'amountCalculate',
                  render: (text, record) => formatEtherWithDecimals(record.amountCalculate.value),
                },
              ]}
              dataSource={stepData.map((item) => ({
                ...item,
                walletFrom: shortenIfAddress(tryPrivateKeyToAddress(item.privateKey)),
                walletTo: shortenIfAddress(item.receivedWallet),
              }))}
            />
          </Stack>,
        }
      ]} />

    </Stack >
  );
};

export default MainPage;
