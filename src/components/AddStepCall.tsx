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
import { useEffect, useMemo, useRef, useState } from "react";
import useStorage from "../hooks/useStorage";
import { useStoreActions, useStoreState } from "../redux/hook";
import { StepDetail } from "../redux/model";
import { DEFAULT_PAGINATE_SIZE, Shell } from "../utils/constants";
import { shortenHex, tryPrivateKeyToAddress } from "../utils/utils";
import PaginationComponent from "./Pagination";
import StartProcess from "./StartProcess";

const AddStepCall = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const tabId = useStoreState((state) => state.tabId);
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
      <CheckboxGroup colorScheme="green">
        <Stack spacing={"25px"} direction={"row"}>
          <Checkbox value="eth">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/eth.png"
              />
              Ethereum
            </Flex>
          </Checkbox>
          <Checkbox value="matic">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/matic.png"
              />
              Polygon
            </Flex>
          </Checkbox>
          <Checkbox value="bsc">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/bnb.png"
              />
              Binance Smart Chain
            </Flex>
          </Checkbox>
          <Checkbox value="sol">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/sol.png"
              />
              Solana
            </Flex>
          </Checkbox>
        </Stack>
      </CheckboxGroup>
      <Divider />
      <Text fontWeight={"bold"}>Crypto</Text>
      <CheckboxGroup colorScheme="green">
        <Stack spacing={"25px"} direction={"row"}>
          <Checkbox value="btc">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/btc.png"
              />
              BTC
            </Flex>
          </Checkbox>
          <Checkbox value="eth">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/eth.png"
              />
              ETH
            </Flex>
          </Checkbox>
          <Checkbox value="bsc">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/bnb.png"
              />
              BNB
            </Flex>
          </Checkbox>
          <Checkbox value="sol">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/sol.png"
              />
              SOL
            </Flex>
          </Checkbox>
          <Checkbox value="usdt">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/usdt.png"
              />
              USDT
            </Flex>
          </Checkbox>
          <Checkbox value="usdc">
            <Flex gap={"5px"} alignItems={"center"}>
              <Image
                w={"35px"}
                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/usdc.png"
              />
              USDC
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
              <Th>Số dư</Th>
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
                <Td>{shortenHex(item.mnemonic)}</Td>
                <Td>{shortenHex(item.privateKey)}</Td>
                <Td
                  onClick={() =>
                    Shell.openExternal(
                      `${"todo"}/address/${tryPrivateKeyToAddress(
                        item.privateKey
                      )}`
                    )
                  }
                  cursor={"pointer"}
                >
                  {shortenHex(tryPrivateKeyToAddress(item.privateKey))}
                </Td>
                <Td>{`${Object.keys(item.amount)
                  .map(
                    (k) =>
                      `${k}: ${Object.keys(item.amount[k])
                        .map((t) => `${item.amount[k][t]} ${t}`)
                        .join(",")}`
                  )
                  .join("|")}`}</Td>
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
