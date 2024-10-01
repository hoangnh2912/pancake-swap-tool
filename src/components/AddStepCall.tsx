import {
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Wallet, ethers } from "ethers";
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
  const [numOfstep, setNumOfStep] = useState(1);

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
  ]);

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
        <Textarea
          noOfLines={10}
          defaultValue={privateKeys.join("\n")}
          onChange={(e) =>
            setPrivateKeys(
              e.target.value
                .split("\n")
                .filter((k) => !!tryPrivateKeyToAddress(k))
            )
          }
        />
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
        </Flex>
        <Flex flex={1} direction={"column"}>
          <Flex gap={"5px"} alignItems={"center"}>
            <Text>Nhập delay (giây)</Text>
            <Input
              type="number"
              onChange={(e) => setDelay(parseInt(e.target.value) * 1000)}
              value={delay / 1000}
            />
          </Flex>
          <Flex gap={"5px"} alignItems={"center"}>
            <Text>Nhập địa chỉ token </Text>
            <Input
              onChange={(e) => setTokenAddress(e.target.value)}
              value={tokenAddress}
            />
          </Flex>
        </Flex>
      </Flex>

      <Text fontWeight={"bold"}>Thêm lệnh</Text>
      <Flex gap={"10px"}>
        <Stack flex={1}>
          <Flex gap={"5px"} alignItems={"center"}>
            <Text>Chọn ví</Text>
            <Select id="privateKey">
              {privateKeys.map((key, idx) => (
                <option key={`${key}-${idx}`} value={key}>
                  {`${tryPrivateKeyToAddress(key)} ${formatEtherWithDecimals(
                    getWalletBalance(key)
                  )} ${chainNetwork.symbol} `}
                </option>
              ))}
            </Select>
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
              defaultValue={'200000'}
            />
          </Flex>
          <Flex gap={"5px"} alignItems={"center"}>
            <Text>Nhập số lượng lệnh </Text>
            <Input
              placeholder="Để trống sẽ tự tính toán"
              type="number"
              onChange={(e) => {
                if (e.target.value && parseInt(e.target.value) > 0)
                  setNumOfStep(parseInt(e.target.value));
              }}
              defaultValue={1}
            />
          </Flex>
          <Button
            onClick={() => {
              for (let i = 0; i < numOfstep; i++) {
                addStep({
                  amount: $("#amount").val() as string,
                  id: Math.random().toString(16).substring(7),
                  method: "buy",
                  amountCalculate: {
                    value: ethers.BigNumber.from(0),
                  },
                  privateKey: $("#privateKey").val() as string,
                });
              }
            }}
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
          <Text fontWeight={"bold"}>Thông tin pair</Text>
          <Text>Pair Address:{pairData.address}</Text>
          {pairData.address == ZERO_ADDRESS && (
            <Text color={"red"}>
              Địa chỉ pair không tồn tại, hãy tạo LQ trước khi swap
            </Text>
          )}
          <Text>Pair Balance</Text>
          {Object.keys(pairData.pairBalance).map((key) => (
            <Text key={key}>
              {formatEtherWithDecimals(pairData.pairBalance[key])} {key}
            </Text>
          ))}
          <Text>
            Price {chainNetwork.symbol}:{" "}
            {!!priceWETH9 ? parseFloat(priceWETH9).toFixed(2) : "0"} USD
          </Text>
          <Text>Price Token: {priceToken}</Text>
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
                key={index}
              >
                <Td>{currentTxId == item.id ? <Spinner /> : item.id} </Td>
                <Td
                  onClick={() =>
                    Shell.openExternal(
                      `${
                        chainNetwork.explorer
                      }/address/${tryPrivateKeyToAddress(item.privateKey)}`
                    )
                  }
                  cursor={"pointer"}
                >
                  {shortenIfAddress(tryPrivateKeyToAddress(item.privateKey))}
                </Td>
                <Td>{item.method == "buy" ? "Mua" : "Bán"}</Td>
                <Td>{item.amount}</Td>
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
