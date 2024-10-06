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
import { DEFAULT_PAGINATE_SIZE, Shell } from "../utils/constants";
import { shortenHex, tryPrivateKeyToAddress } from "../utils/utils";
import PaginationComponent from "./Pagination";

const OutputWallet = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const outWalletData = useStoreState((state) => state.outputWallet.data);
  const pageCount = Math.ceil(outWalletData.length / DEFAULT_PAGINATE_SIZE);

  const txsDataPaginated = useMemo(() => {
    return outWalletData.slice(
      (currentPage - 1) * DEFAULT_PAGINATE_SIZE,
      currentPage * DEFAULT_PAGINATE_SIZE
    );
  }, [outWalletData, currentPage]);

  const clearOutWallet = useStoreActions(
    (state) => state.outputWallet.deleteAll
  );

  const deleteOutWallet = useStoreActions((state) => state.outputWallet.delete);

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
            {txsDataPaginated.map((item, index) => (
              <Tr
                bg={
                  Object.keys(item.amount).length > 0
                    ? "green.100"
                    : "yellow.100"
                }
                key={index}
              >
                <Td>
                  {item.id}
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
                <Td>{`${item.amount}`}</Td>
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
