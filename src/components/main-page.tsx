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
import { Button, Form, Input, InputNumber, Select, Switch, Table, Tabs, Tag } from "antd";
import { ethers } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import useStorage from "../hooks/useStorage";
import { useStoreActions, useStoreState } from "../redux/hook";
import { StepDetail } from "../redux/model";
import {
  electronAPI,
  PANCAKE_ADDRESS,
  TOKEN_ADDRESS
} from "../utils/constants";
import { ContractScanner, WalletBalanceAirdrop, } from "../utils/scanContract";
import { WalletBalance, WalletBalanceScanner } from "../utils/scanWalletBalance";
import {
  chainNetworkColor,
  formatEtherWithDecimals,
  tryPrivateKeyToAddress
} from "../utils/utils";

type ScanWalletAirdrop = {
  fromBlock: number;
  scanAddress: string;
  airdropContract: string;
  concurrency: number;
  blockChunk: number;
  tokens: string[];
  wallets: Record<string, WalletBalanceAirdrop>;
  scanningFromBlock: number;
  scanningToBlock: number;
  airdropAmount: number;
  airdropToken: string;
  walletIndex: number;
  isAirdrop: boolean;
}

type ScanWalletBalance = {
  concurrency: number;
  tokens: string[];
  wallets: Record<string, WalletBalance>;
}

const MainPage = () => {
  const [formAirdrop] = Form.useForm<ScanWalletAirdrop>();
  const [formBalance] = Form.useForm<ScanWalletBalance>();

  const contractScanner = useRef<ContractScanner | null>(null);
  const walletBalanceScanner = useRef<WalletBalanceScanner | null>(null);

  const walletAirdrops = Form.useWatch("wallets", formAirdrop) || {};
  const scanningFromBlock = Form.useWatch("scanningFromBlock", formAirdrop);
  const scanningToBlock = Form.useWatch("scanningToBlock", formAirdrop);
  const walletIndex = Form.useWatch("walletIndex", formAirdrop) || 1;
  const isAirdrop = !!Form.useWatch("isAirdrop", formAirdrop);

  const walletBalances = Form.useWatch("wallets", formBalance) || {};

  const [privateKeys, setPrivateKeys] = useState([
    "4cd6b7f576b0c95a499b045bf058c62fc8c6d4c9a2a79351f630e9ce6907c042",
  ]);

  const [privateKeysFile, setPrivateKeysFile] = useState<File | null>(null);
  const [walletsFile, setWalletsFile] = useState<File | null>(null);
  const [filterTable, setFilterTable] = useState<Record<string, any>>({
    airdrop: false,
  });

  const tabId = useStoreState((state) => state.tabId);
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

  const exportWalletScan = (allWallet: WalletBalance[]) => {
    const addresses = allWallet.map((wallet, idx) => ({
      index: idx + 1,
      address: wallet.address,
      balance: `${chainNetwork.symbol}: ${wallet.native}`,
      tokens: wallet.tokens,
    }));
    const blob = new Blob([addresses.map(e => `${e.index} ${e.address} ${e.balance} ${Object.entries(e.tokens).map(([k, v]) => `${k}: ${v}`).join(", ")}`).join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallet_scan.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const exportWalletAirdropToDirectly = (allWallet: string[]) => {
    electronAPI?.saveFile(JSON.stringify({
      filename: `wallet_airdrop_${tabId}.txt`,
      content: allWallet.join("\n"),
    }));
  }

  const exportWalletBalanceToDirectly = (allWallet: string[]) => {
    electronAPI?.saveFile(JSON.stringify({
      filename: `wallet_balance_${tabId}.txt`,
      content: allWallet.join("\n"),
    }));
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

  const importWallets = (file: File) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = reader.result as string;
      // Here the content has been read successfuly
      const allWallets = content
        .split("\n")
        .map((k) => k.trim()
          .replace(/"/g, "")
          .replace(/'/g, "")
        )

      if (allWallets.length === 0) {
        toast({
          title: "Không có ví hợp lệ",
          description: "Vui lòng kiểm tra lại file chứa ví",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const checkedWallets = allWallets.filter((k) => ethers.utils.isAddress(k));

      setWalletsFile(file);
      if (checkedWallets.length < allWallets.length) {
        toast({
          title: "Một số ví không hợp lệ",
          description: "Đã lọc ra các ví không hợp lệ",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      formBalance.setFieldValue("wallets", checkedWallets.reduce(
        (acc, curr) => {
          return {
            ...acc,
            [curr]: {
              address: curr,
              balance: 0,
              tokens: {}
            }
          }
        },
        {} as Record<string, WalletBalance>
      ));
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
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        dataSource={privateKeys.map((key, idx) => ({
          idx: idx + 1,
          address: tryPrivateKeyToAddress(key),
          balance: formatEtherWithDecimals(getWalletBalance(key))
        }))}
      />
      <Tabs defaultActiveKey="1" items={[
        {
          key: "1",
          label: "Quét ví và airdrop",
          children: <Stack flex={1} gap={"0px"}>
            <Form form={formAirdrop}
              initialValues={{
                scanAddress: "0xb300000b72DEAEb607a12d5f54773D1C19c7028d", // USDT contract address
                airdropContract: "0xA235bA05F6436dFAD445F2585f520b2eF394b36E", // Airdrop contract address
                blockChunk: 1000,
                concurrency: 1,
                airdropAmount: 1,
                airdropToken: '0x82a28b2c3e48f25ddf1bef3e27c65838b566423d',
                walletIndex: 1,
                tokens: []
              }}
              onFinish={async (values) => {
                if (contractScanner.current) {
                  contractScanner.current.stop();
                  setIsScanning(false);
                  delete contractScanner.current;
                }
                contractScanner.current = new ContractScanner({
                  isAirdrop: values.isAirdrop,
                  contractAddress: values.scanAddress,
                  fromBlock: values.fromBlock,
                  airdropContract: values.airdropContract,
                  tokens: values.tokens.length > 0 ? values.tokens.reduce((acc, q) => {
                    const token = TOKEN_ADDRESS.find(e => e.value === q)?.label
                    return {
                      ...acc,
                      [token]: q
                    }
                  }, {}) : {},
                  rpcUrl: chainNetwork.rpc,
                  options: {
                    blockChunk: values.blockChunk,
                    concurrency: values.concurrency,
                  },
                  storeId: tabId,
                  onWallet(wallet) {
                    exportWalletAirdropToDirectly(
                      [
                        ...Object.keys(formAirdrop.getFieldValue("wallets") || {}), wallet.address
                      ]
                    )
                    formAirdrop.setFieldValue("wallets", {
                      ...(formAirdrop.getFieldValue("wallets") || {}),
                      [wallet.address]: wallet
                    });
                  },
                  airdropAmount: values.airdropAmount,
                  airdropToken: values.airdropToken,
                  onScan(fromBlock, toBlock) {
                    formAirdrop.setFieldValue("scanningFromBlock", fromBlock);
                    formAirdrop.setFieldValue("scanningToBlock", toBlock);
                  },
                  privateKeySigner: privateKeys[values.walletIndex - 1],
                  onAirdropped: (wallet) => {
                    formAirdrop.setFieldValue("wallets", {
                      ...(formAirdrop.getFieldValue("wallets")),
                      [wallet.address]: {
                        ...wallet,
                        airdrop: true
                      }
                    });
                  }
                });
                await contractScanner.current.initTokens();
                setIsScanning(true);
                await contractScanner.current.start();
              }}>
              <Form.Item label="Kích hoạt airdrop" name="isAirdrop">
                <Switch />
              </Form.Item>
              {isAirdrop && <Form.Item label="Chọn ví" name="walletIndex"
                required
              >
                <InputNumber
                  placeholder="Chọn ví theo thứ tự"
                  defaultValue={1}
                />
              </Form.Item>}
              {walletIndex && privateKeys.length > 0 && privateKeys[walletIndex - 1] && <Text
                style={{
                  marginBottom: '10px',
                }}
              >Ví gửi token: {tryPrivateKeyToAddress(privateKeys[walletIndex - 1])}</Text>}
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

              {isAirdrop && <>
                <Form.Item label="Địa chỉ airdrop" name="airdropContract" rules={[{ required: true, message: "Vui lòng nhập địa chỉ quét" }, {
                  validator: async (_, value) => {
                    if (!ethers.utils.isAddress(value)) {
                      return Promise.reject(new Error("Địa chỉ quét không hợp lệ"));
                    }
                  }
                }]}>
                  <Input
                    placeholder="Nhập địa chỉ airdrop"
                  />
                </Form.Item>
                <Form.Item label="Địa chỉ token airdrop" name="airdropToken" rules={[{ required: true, message: "Vui lòng nhập địa chỉ quét" }, {
                  validator: async (_, value) => {
                    if (!ethers.utils.isAddress(value)) {
                      return Promise.reject(new Error("Địa chỉ quét không hợp lệ"));
                    }
                  }
                }]}>
                  <Input
                    placeholder="Nhập địa chỉ token airdrop"
                  />
                </Form.Item>
                <Form.Item label="Số lượng airdrop" name="airdropAmount" >
                  <InputNumber
                    placeholder="Nhập số lượng airdrop"
                  />
                </Form.Item>
              </>}

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
              <Form.Item hidden name="scanningFromBlock" />
              <Form.Item hidden name="scanningToBlock" />
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
            </Form>
            {scanningFromBlock !== undefined && scanningToBlock !== undefined &&
              (<Text fontWeight={"bold"}>Đang quét từ block {scanningFromBlock} đến block {scanningToBlock}</Text>)
            }
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
                  align: "center"
                },
                {
                  title: "Token",
                  dataIndex: "tokens",
                  key: "tokens",
                  align: "center",
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
                {
                  title: "Airdrop",
                  align: "center",
                  filters: [
                    {
                      text: "Đã airdrop",
                      value: true
                    },
                    {
                      text: "Chưa airdrop",
                      value: false
                    }
                  ],
                  dataIndex: "airdrop",
                  filterMultiple: false,
                  key: "airdrop",
                  render: (_, record) => {
                    const isAirdropped = record.airdrop;
                    return (
                      <Tag color={isAirdropped ? "green" : "red"}>
                        {isAirdropped ? "Đã airdrop" : "Chưa airdrop"}
                      </Tag>
                    );
                  }
                },
              ]}
              onChange={(_, filter) => {
                setFilterTable(prev => filter.airdrop && filter.airdrop.length > 0 ? {
                  ...prev,
                  airdrop: filter.airdrop[0]
                } : {
                  ...prev,
                  airdrop: undefined
                });
              }}
              pagination={{
                defaultPageSize: 30,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} ví`
              }}
              dataSource={Object.values(walletAirdrops).filter(e => filterTable.airdrop ? e.airdrop === filterTable.airdrop : true)}
            />
            <Button type="primary"
              onClick={() => exportWalletScan(Object.values(walletAirdrops))}
            >
              Xuất kết quả quét
            </Button>
          </Stack>,
        },
        {
          key: "2",
          label: "Quét balance ví",
          children: <Stack flex={1} gap={"5px"}>
            <Flex gap={"5px"} alignItems={"center"}>
              <Text>Nhập ví</Text>
              <Stack
                onClick={() => {
                  let input = document.createElement("input");
                  input.hidden = true;
                  input.type = "file";
                  input.accept = ".txt";
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.item(0);
                    importWallets(file);
                    input.remove();
                  };
                  input.click();
                }}
                w={'300px'}
                h={"20px"}
                justifyContent="center"
                alignItems="center"
                borderRadius="lg"
                overflow="hidden"
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
                    alert("Vui lòng chọn file .txt chứa ví");
                    return;
                  }
                  importWallets(file);
                }}
              >
                {walletsFile ? (
                  <Text color={"white"}>{walletsFile.name}</Text>
                ) : (
                  <Text color={"white"}>Chọn file chứa ví</Text>
                )}
              </Stack>
            </Flex>
            <Form form={formBalance}
              initialValues={{
                concurrency: 1,
                tokens: []
              }}
              onFinish={async (values) => {
                if (walletBalanceScanner.current) {
                  walletBalanceScanner.current.stop();
                  setIsScanning(false);
                  delete walletBalanceScanner.current;
                }
                walletBalanceScanner.current = new WalletBalanceScanner({
                  tokens: values.tokens.length > 0 ? values.tokens.reduce((acc, q) => {
                    const token = TOKEN_ADDRESS.find(e => e.value === q)?.label
                    return {
                      ...acc,
                      [token]: q
                    }
                  }, {}) : {},
                  rpcUrl: chainNetwork.rpc,
                  options: {
                    concurrency: values.concurrency,
                  },
                  wallets: walletBalances,
                  storeId: tabId,
                  onWallet(wallet) {
                    exportWalletBalanceToDirectly(
                      [
                        ...Object.keys(formBalance.getFieldValue("wallets") || {}), wallet.address
                      ]
                    )
                    formBalance.setFieldValue("wallets", {
                      ...(formBalance.getFieldValue("wallets") || {}),
                      [wallet.address]: wallet
                    });
                  },
                });
                await walletBalanceScanner.current.initTokens();
                setIsScanning(true);
                await walletBalanceScanner.current.start();
              }}>
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
                  walletBalanceScanner.current?.stop();
                  setIsScanning(false);
                }}
              >
                Dừng quét
              </Button>}
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
                  align: "center"
                },
                {
                  title: "Token",
                  dataIndex: "tokens",
                  key: "tokens",
                  align: "center",
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
              pagination={{
                defaultPageSize: 30,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} ví`
              }}
              dataSource={Object.values(walletBalances)}
            />
            <Button type="primary"
              onClick={() => exportWalletScan(Object.values(walletBalances))}
            >
              Xuất kết quả quét
            </Button>
          </Stack>,
        },
      ]} />

    </Stack >
  );
};

export default MainPage;
