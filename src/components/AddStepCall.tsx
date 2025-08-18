import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Toast,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { Input, Select, Table } from "antd";
import $ from "jquery";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useReloadFetchOnchain from "../hooks/useReloadMinOut";
import useStorage from "../hooks/useStorage";
import useTokenPrice from "../hooks/useTokenPrice";
import { useStoreActions, useStoreState } from "../redux/hook";
import { StepDetail } from "../redux/model";
import {
  DEFAULT_PAGINATE_SIZE,
  PANCAKE_ADDRESS,
  Shell,
  ZERO_ADDRESS,
} from "../utils/constants";
import {
  chainNetworkColor,
  formatEtherWithDecimals,
  shortenIfAddress,
  tryPrivateKeyToAddress,
} from "../utils/utils";
import PaginationComponent from "./Pagination";

const AddStepCall = () => {
  const [privateKeys, setPrivateKeys] = useState([
    "4cd6b7f576b0c95a499b045bf058c62fc8c6d4c9a2a79351f630e9ce6907c042",
  ]);
  useReloadFetchOnchain({
    privateKeys,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [privateKeysFile, setPrivateKeysFile] = useState<File | null>(null);

  const tabId = useStoreState((state) => state.tabId);
  const pairData = useStoreState((state) => state.steps.pairData);
  const stepData = useStoreState((state) => state.steps.data);

  const pageCount = Math.ceil(stepData.length / DEFAULT_PAGINATE_SIZE);

  const stepDataPaginate = useMemo(() => {
    return stepData.slice(
      (currentPage - 1) * DEFAULT_PAGINATE_SIZE,
      currentPage * DEFAULT_PAGINATE_SIZE
    );
  }, [currentPage, stepData]);

  const chainNetwork = useStoreState((state) => state.chainNetwork);

  const priceWETH9 = useTokenPrice(chainNetwork.symbol);

  const priceToken = useMemo(() => {
    try {
      return pairData.pairBalance[chainNetwork.symbol]
        .mul(parseInt(priceWETH9))
        .div(pairData.pairBalance["TK"])
        .toString();
    } catch (error) {
      return "0";
    }
  }, [pairData.pairBalance, priceWETH9]);

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

  const currentTxId = useStoreState((state) => state.currentTx.currentTxId);
  const tokenAddress = useStoreState((state) => state.steps.tokenAddress);
  const delay = useStoreState((state) => state.steps.delay);
  const setDelay = useStoreActions((action) => action.steps.setDelay);
  const setChainNetwork = useStoreActions(
    (action) => action.chainNetwork.setChainNetwork
  );

  const setTokenAddress = useStoreActions(
    (action) => action.steps.setTokenAddress
  );

  const addStep = useStoreActions((action) => action.steps.add);
  const handleDelete = useStoreActions((action) => action.steps.delete);
  const handleDeleteAll = useStoreActions((action) => action.steps.deleteAll);

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
        rpc: cache.rpc,
        rpcSubmit: cache.rpcSubmit,
        name: cache.name,
        explorer: cache.explorer,
        factory: cache.factory,
        router: cache.router,
        symbol: cache.symbol,
        weth: cache.weth,
        gasPrice: cache.gasPrice,
        gasLimit: cache.gasLimit,
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
      <Text fontWeight={"bold"}>Kịch bản chạy</Text>
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
          colorScheme="blue"
          variant="solid"
        >
          Xuất địa chỉ ví
        </Button>}
      </Flex>
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

      <Flex gap={"10px"}>
        <Stack flex={1}>
          <Text fontWeight={"bold"}>Lệnh chuyển tiền</Text>
          <Text>Danh sách ví</Text>
          <Table
            columns={[
              {
                title: 'STT',
                dataIndex: 'idx'
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
            isDisabled={
              pairData.address == ZERO_ADDRESS ||
              !pairData.address ||
              !tokenAddress
            }
            colorScheme="green"
            variant="solid"
          >
            Thêm
          </Button>
        </Stack>
        <Stack flex={1} gap={"5px"}>
          <Text fontWeight={"bold"}>Quét ví</Text>
          <Input
            id="scanAddress"
            placeholder="Nhập địa chỉ quét"
          />
          <Input
            id="scanAmount"
            placeholder="Số lượng ví"
          />
          <Select
            placeholder="Chọn loại coin"
            mode="multiple"
            options={[
              {
                label: "BNB", value: "0x",
              },
              { label: "USDT", value: "0x55d398326f99059ff775485246999027b3197955" },
              { label: "USDC", value: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d" },
              { label: "ETH", value: "0x2170ed0880ac9a755fd29b2688956bd959f933f8" },
              { label: "WBNB", value: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
              { label: "BTC", value: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c" },
            ]}
          />
        </Stack>
      </Flex>
      <Text>Tổng lệnh: {stepData.length}</Text>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Wallet</Th>
              <Th>Lệnh</Th>
              <Th>Số lượng {chainNetwork.symbol}</Th>
              <Th>Slippage</Th>
              <Th>Số lượng token</Th>
              <Th>Địa chỉ token</Th>
              <Th>
                <Button
                  onClick={() => handleDeleteAll()}
                  colorScheme="red"
                  variant="solid"
                >
                  Xoá tất cả
                </Button>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {stepDataPaginate.map((item, index) => (
              <Tr
                bg={item.method == "buy" ? "green.100" : "red.100"}
                key={item.id}
              >
                <Td>{currentTxId == item.id ? <Spinner /> : item.id} </Td>
                <Td
                  onClick={() =>
                    Shell.openExternal(
                      `${chainNetwork.explorer
                      }/address/${tryPrivateKeyToAddress(item.privateKey)}`
                    )
                  }
                  cursor={"pointer"}
                >
                  {shortenIfAddress(tryPrivateKeyToAddress(item.privateKey))}
                </Td>
                <Td>{item.method == "buy" ? "Mua" : "Bán"}</Td>
                <Td>{item.amount}</Td>
                <Td>{item.slippage}</Td>
                <Td>{formatEtherWithDecimals(item.amountCalculate.value)} </Td>
                <Td
                  onClick={() =>
                    Shell.openExternal(
                      `${chainNetwork.explorer}/address/${tokenAddress}`
                    )
                  }
                  cursor={"pointer"}
                >
                  {shortenIfAddress(tokenAddress)}
                </Td>
                <Td>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    colorScheme="red"
                    variant="solid"
                  >
                    Xoá
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <PaginationComponent
        currentPage={currentPage}
        pagesCount={pageCount}
        onPaginate={setCurrentPage}
      />
    </Stack>
  );
};

export default AddStepCall;
