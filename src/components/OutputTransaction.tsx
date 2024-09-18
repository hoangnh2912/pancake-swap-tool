import {
  Button,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import {
  DEFAULT_PAGINATE_SIZE,
  Shell
} from "../utils/constants";
import { shortenIfAddress } from "../utils/utils";
import PaginationComponent from "./Pagination";

const OutputTransaction = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const txsData = useStoreState((state) => state.txs.data);
  const pageCount = Math.ceil(txsData.length / DEFAULT_PAGINATE_SIZE);

  const txsDataPaginated = useMemo(() => {
    return txsData.slice(
      (currentPage - 1) * DEFAULT_PAGINATE_SIZE,
      currentPage * DEFAULT_PAGINATE_SIZE
    );
  }, [txsData, currentPage]);

  const clearAllTxs = useStoreActions((state) => state.txs.deleteAll);

  const deleteTx = useStoreActions((state) => state.txs.delete);
  const chainNetwork = useStoreState((state) => state.chainNetwork);

  return (
    <Stack boxShadow="md" p="4" flex={1} bg={"white"} rounded={"md"} w="100%">
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Trạng thái</Th>
              <Th>Mạng</Th>
              <Th>TxHash</Th>
              <Th>Time</Th>
              <Th>Lệnh</Th>
              <Th>Số lượng</Th>
              <Th>Slippage</Th>
              <Th>Địa chỉ token</Th>
              <Th>
                <Button
                  onClick={clearAllTxs as any}
                  colorScheme="red"
                  variant="solid"
                >
                  Xoá tất cả
                </Button>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {txsDataPaginated.map((item, index) => (
              <Tr
                bg={
                  item.transactionReceipt?.timestamp
                    ? item.method == "buy"
                      ? "green.100"
                      : "red.100"
                    : "yellow.100"
                }
                key={index}
              >
                <Td>{item.id}</Td>
                <Td>{item.status}</Td>
                <Td>{item.chainNetworkName}</Td>
                <Td
                  onClick={() =>
                    Shell.openExternal(
                      `${chainNetwork.explorer}/tx/${
                        item.transactionReceipt?.transactionHash
                      }`
                    )
                  }
                  cursor={"pointer"}
                >
                  {shortenIfAddress(item.transactionReceipt?.transactionHash)}
                </Td>
                <Td>
                  {new Date(
                    parseInt(`${item.transactionReceipt?.timestamp}000`)
                  ).toLocaleString()}
                </Td>
                <Td>{item.method == "buy" ? "Mua" : "Bán"}</Td>
                <Td>{item.amount}</Td>
                <Td>{item.slippage}</Td>
                <Td
                  onClick={() =>
                    Shell.openExternal(
                      `${chainNetwork.explorer}/address/${item.tokenAddress}`
                    )
                  }
                  cursor={"pointer"}
                >
                  {shortenIfAddress(item.tokenAddress)}
                </Td>
                <Td>
                  <Button
                    onClick={() =>
                      deleteTx(item.transactionReceipt.transactionHash)
                    }
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

export default OutputTransaction;
