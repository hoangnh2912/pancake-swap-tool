import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Image,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import { DEFAULT_PAGINATE_SIZE } from "../utils/constants";
import { tryPrivateKeyToAddress } from "../utils/utils";
import PaginationComponent from "./Pagination";
import StartProcess from "./StartProcess";

const AddStepCall = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const tabId = useStoreState((state) => state.tabId);
  const selectedChain = useStoreState((state) => state.selectedChain);
  const selectedToken = useStoreState((state) => state.selectedToken);

  const setSelectedChain = useStoreActions((action) => action.setSelectedChain);
  const setSelectedToken = useStoreActions((action) => action.setSelectedToken);

  const stepData = useStoreState((state) => state.steps.data);
  const pageCount = Math.ceil(stepData.length / DEFAULT_PAGINATE_SIZE);

  const stepDataPaginate = useMemo(() => {
    return stepData.slice(
      (currentPage - 1) * DEFAULT_PAGINATE_SIZE,
      currentPage * DEFAULT_PAGINATE_SIZE
    );
  }, [currentPage, stepData]);

  const currentScanWalletId = useStoreState(
    (state) => state.currentScanWallet.currentScanWalletId
  );

  const handleDeleteAll = useStoreActions((action) => action.steps.deleteAll);

  useEffect(() => {
    if (currentPage != pageCount) setCurrentPage(pageCount);
  }, [stepData.length, pageCount]);

  return (
    <Stack flex={1} boxShadow="md" p="4" bg={"white"} rounded={"md"}>
      <Text>{tabId}</Text>
      <Text fontWeight={"bold"}>Mạng blockchain</Text>
      <CheckboxGroup
        colorScheme="green"
        value={selectedChain}
        onChange={setSelectedChain}
      >
        <Stack spacing={"25px"} direction={"row"}>
          <Checkbox value="ETH">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/eth.png"
              />
              Ethereum
            </Flex>
          </Checkbox>
          <Checkbox value="MATIC">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/matic.png"
              />
              Polygon
            </Flex>
          </Checkbox>
          <Checkbox value="BSC">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/bnb.png"
              />
              Binance Smart Chain
            </Flex>
          </Checkbox>
        </Stack>
      </CheckboxGroup>
      <Divider />
      <Text fontWeight={"bold"}>Token</Text>
      <CheckboxGroup
        value={selectedToken}
        onChange={setSelectedToken}
        colorScheme="green"
      >
        <Stack spacing={"25px"} direction={"row"}>
          <Checkbox value="USDT">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/usdt.png"
              />
              USDT
            </Flex>
          </Checkbox>
          <Checkbox value="USDC">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/usdc.png"
              />
              USDC
            </Flex>
          </Checkbox>
          <Checkbox value="WBTC">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://s2.coinmarketcap.com/static/img/coins/200x200/3717.png"
              />
              WBTC
            </Flex>
          </Checkbox>
        </Stack>
      </CheckboxGroup>
      <Divider />
      <Flex justifyContent={"space-around"} alignItems={"center"}>
        <StartProcess />
        <Text>Tổng ví đã scan: {stepData.length}</Text>
        <Button
          onClick={handleDeleteAll as any}
          colorScheme="red"
          variant="solid"
        >
          Xoá tất cả
        </Button>
      </Flex>
      <Divider />
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Mnemonic</Th>
              <Th>Private Key</Th>
              <Th>Wallet</Th>
            </Tr>
          </Thead>
          <Tbody>
            {stepDataPaginate.map((item, index) => (
              <Tr
                bg={
                  Object.keys(item.amount).length > 0
                    ? "green.100"
                    : "yellow.100"
                }
                key={index}
              >
                <Td>
                  {currentScanWalletId == item.id ? <Spinner /> : item.id}
                </Td>
                <Td>{item.mnemonic}</Td>
                <Td>{item.privateKey}</Td>
                <Td
                  cursor={"pointer"}
                >
                  {tryPrivateKeyToAddress(item.privateKey)}
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
