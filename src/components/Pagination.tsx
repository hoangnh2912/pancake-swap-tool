import {
    Pagination,
    PaginationContainer,
    PaginationPage,
    PaginationPageGroup,
    PaginationSeparator,
    usePagination,
} from "@ajna/pagination";
import { Center, Flex } from "@chakra-ui/react";
import colors from "../utils/colors";
const DEFAULT_PAGINATE_SIZE = 15;

const PaginationComponent = ({
  onPaginate,
  pagesCount,
  currentPage: currentPageProp,
}: {
  pagesCount: number;
  currentPage: number;
  onPaginate?: (page: number) => void;
}) => {
  const { currentPage, setCurrentPage, pages } = usePagination({
    initialState: {
      currentPage: currentPageProp,
      pageSize: DEFAULT_PAGINATE_SIZE,
    },
    limits: {
      inner: 1,
      outer: 1,
    },
    pagesCount,
  });
  return (
    <Center mt={"10"}>
      {pagesCount > 1 && (
        <Pagination
          pagesCount={pagesCount}
          currentPage={currentPage}
          onPageChange={(pageSelect) => {
            onPaginate && onPaginate(pageSelect);
            setCurrentPage(pageSelect);
          }}
        >
          <PaginationContainer gap={"15px"}>
            <Flex
              opacity={currentPage === 1 ? 0.5 : 1}
              alignItems={"center"}
              gap={"15px"}
            >
              <Center
                cursor={"pointer"}
                w={"32px"}
                h={"32px"}
                rounded={"full"}
                onClick={() => {
                  setCurrentPage(1);
                  onPaginate && onPaginate(1);
                }}
                bg={colors.dark.color}
                borderWidth={"1px"}
                borderColor={colors.common.border_page_button}
              >
                Đầu
              </Center>
              <Center
                w={"32px"}
                h={"32px"}
                cursor={"pointer"}
                rounded={"full"}
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  onPaginate && onPaginate(newPage);
                  setCurrentPage(newPage);
                }}
                bg={colors.dark.color}
                borderWidth={"1px"}
                borderColor={colors.common.border_page_button}
              >
                Back
              </Center>
            </Flex>
            <PaginationPageGroup
              separator={
                <PaginationSeparator
                  w={"32px"}
                  h={"32px"}
                  rounded={"full"}
                  bg={colors.dark.color}
                />
              }
              gap={"15px"}
              alignItems={"center"}
            >
              {pages.map((page: number) => (
                <PaginationPage
                  w={"32px"}
                  h={"32px"}
                  rounded={"full"}
                  bg={
                    page === currentPage
                      ? colors.common.primary
                      : colors.dark.color
                  }
                  color={colors.common.medium_gray}
                  borderWidth={"1px"}
                  borderColor={
                    page === currentPage
                      ? colors.common.primary
                      : colors.common.border_page_button
                  }
                  _hover={{
                    bg: colors.common.primary,
                    color: colors.dark.color,
                    borderColor: colors.common.primary,
                  }}
                  fontSize={"14px"}
                  fontWeight={"300"}
                  key={`pagination_page_${page}`}
                  page={page}
                  _current={{
                    bg: colors.common.primary,
                    color: colors.dark.color,
                  }}
                />
              ))}
            </PaginationPageGroup>
            <Flex
              opacity={currentPage < pagesCount ? 1 : 0.5}
              alignItems={"center"}
              gap={"15px"}
            >
              <Center
                w={"32px"}
                h={"32px"}
                cursor={"pointer"}
                rounded={"full"}
                onClick={() => {
                  const newPage = Math.min(currentPage + 1, pagesCount);
                  onPaginate && onPaginate(newPage);
                  setCurrentPage(newPage);
                }}
                bg={colors.dark.color}
                borderWidth={"1px"}
                borderColor={colors.common.border_page_button}
              >
                Next
              </Center>
              <Center
                cursor={"pointer"}
                w={"32px"}
                h={"32px"}
                rounded={"full"}
                bg={colors.dark.color}
                onClick={() => {
                  setCurrentPage(pagesCount);
                  onPaginate && onPaginate(pagesCount);
                }}
                borderWidth={"1px"}
                borderColor={colors.common.border_page_button}
              >
                Cuối
              </Center>
            </Flex>
          </PaginationContainer>
        </Pagination>
      )}
    </Center>
  );
};

export default PaginationComponent;
