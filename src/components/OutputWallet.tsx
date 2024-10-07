import {
  Button,
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
import { useMemo, useState } from "react";
import { useStoreActions, useStoreState } from "../redux/hook";
import { DEFAULT_PAGINATE_SIZE } from "../utils/constants";
import { tryPrivateKeyToAddress } from "../utils/utils";
import PaginationComponent from "./Pagination";

const OutputWallet = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const outWalletData = useStoreState((state) => state.outputWallet.data);
  const pageCount = Math.ceil(outWalletData.length / DEFAULT_PAGINATE_SIZE);

  const outWalletDataPaginated = useMemo(() => {
    return outWalletData.slice(
      (currentPage - 1) * DEFAULT_PAGINATE_SIZE,
      currentPage * DEFAULT_PAGINATE_SIZE
    );
  }, [outWalletData, currentPage]);

  const clearOutWallet = useStoreActions(
    (state) => state.outputWallet.deleteAll
  );

  return (
    <Stack boxShadow="md" p="4" flex={1} bg={"white"} rounded={"md"} w="100%">
      <Text>Tổng transaction: {outWalletData.length}</Text>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Mnemonic</Th>
              <Th>Private Key</Th>
              <Th>Wallet</Th>
              <Th>Số dư</Th>
              <Th>
                <Button
                  onClick={clearOutWallet as any}
                  colorScheme="red"
                  variant="solid"
                >
                  Xoá tất cả
                </Button>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {outWalletDataPaginated.map((item, index) => (
              <Tr
                bg={
                  Object.keys(item.amount).length > 0
                    ? "green.100"
                    : "yellow.100"
                }
                key={index}
              >
                <Td>{item.id}</Td>
                <Td>{item.mnemonic}</Td>
                <Td>{item.privateKey}</Td>
                <Td cursor={"pointer"}>
                  {tryPrivateKeyToAddress(item.privateKey)}
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

export default OutputWallet;
