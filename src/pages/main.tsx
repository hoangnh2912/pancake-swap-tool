import {
  AbsoluteCenter,
  Button,
  Center,
  CloseButton,
  Container,
  Flex,
  HStack,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { StoreProvider } from "easy-peasy";
import { useCallback, useEffect, useRef, useState } from "react";
import AddStepCall from "../components/AddStepCall";
import OutputWallet from "../components/OutputWallet";
import useStorage from "../hooks/useStorage";
import { StorePayload, getStore } from "../redux/store";
import { Shell } from "../utils/constants";
import { machineIdToReadable, verifyLicense } from "../utils/utils";
import $ from "jquery";
const Main = () => {
  const [isLoadCacheDone, setIsLoadCacheDone] = useState(false);
  const [machineId, setMachineId] = useState("");
  const [isValidLicense, setIsValidLicense] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const [allStore, setAllStore] = useState<
    {
      title: string;
      id: string;
      data: StorePayload;
    }[]
  >([
    {
      title: "Tab-1",
      id: "1a2b3c4d",
      data: getStore("1a2b3c4d"),
    },
  ]);
  const { removeItem, getKeyCacheByTabId, getItem, setItem } = useStorage();

  const [indexTab, setIndexTab] = useState(0);

  const getMachineId = () => {
    intervalRef.current = setInterval(() => {
      if ((window as any).machineId) {
        setMachineId((window as any).machineId);
        clearInterval(intervalRef.current);
      }
    }, 1000);
  };

  useEffect(() => {
    const cache = getItem<{
      tab: {
        title: string;
        id: string;
      }[];
    }>("tab");
    if (cache) {
      setAllStore(
        cache.tab.map(
          (
            tab: {
              title: string;
              id: string;
            },
            i: number
          ) => ({
            title: tab.title,
            data: getStore(tab.id),
            id: tab.id,
          })
        )
      );
    }
    setIsLoadCacheDone(true);
  }, []);

  const onSaveLocalCache = () => {
    if (!isLoadCacheDone) return;
    setItem("tab", {
      tab: allStore.map((v) => ({
        title: v.title,
        id: v.id,
      })),
    });
  };

  useEffect(() => {
    Shell.getPcUUID();
    onSaveLocalCache();
    getMachineId();
  }, [allStore.length, isLoadCacheDone]);

  const storeTabTitles = allStore.map((v) => v.title);

  const createNewTab = useCallback(() => {
    const key = `Tab-${allStore.length + 1}`;
    const newId = Math.random().toString(16).substring(7);
    setAllStore((prev) => [
      ...prev,
      {
        title: key,
        data: getStore(newId),
        id: newId,
      },
    ]);
  }, [allStore.length]);

  const closeTab = useCallback(
    (index: number) => {
      setAllStore((prev) => {
        const idCloseTab = prev[index].id;
        setIndexTab((prevIdx) => {
          const idOfCurrentTab = prev[prevIdx].id;
          if (idCloseTab === idOfCurrentTab) {
            return Math.max(0, prevIdx - 1);
          }
          return prevIdx;
        });
        removeItem(getKeyCacheByTabId(idCloseTab));
        return prev.filter((v) => v.id !== idCloseTab);
      });
    },
    [setIndexTab]
  );

  const onChangeTab = useCallback((index: number) => {
    setIndexTab(index);
  }, []);

  const toast = useToast();

  if (!isValidLicense)
    return (
      <Flex w={"100%"} h={"100vh"}>
        <AbsoluteCenter>
          <Stack gap={4}>
            <Text>Nhập license key</Text>
            <Text>Mã phần phềm: {machineIdToReadable(machineId)}</Text>
            <Input id="license" maxLength={999} />
            <Button
              onClick={() => {
                if (
                  verifyLicense(
                    machineIdToReadable(machineId),
                    $("#license").val().toString()
                  )
                ) {
                  setIsValidLicense(true);
                } else {
                  toast({
                    title: "License không hợp lệ",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                  });
                }
              }}
            >
              Xác nhận
            </Button>
          </Stack>
        </AbsoluteCenter>
      </Flex>
    );

  return (
    <Tabs index={indexTab} variant="unstyled" isFitted onChange={onChangeTab}>
      <TabList>
        {storeTabTitles.map((v, i) => (
          <Tab
            _selected={{ color: "white", bg: "green" }}
            minW={"200px"}
            key={i}
            justifyContent={"space-between"}
          >
            {v}
            {i !== 0 && (
              <CloseButton
                size={"sm"}
                onClick={closeTab.bind(null, i)}
                ml={"15px"}
                aria-label="close tab"
              />
            )}
          </Tab>
        ))}
        {allStore.length < 8 && (
          <Stack
            onClick={createNewTab}
            cursor={"pointer"}
            px={"10px"}
            bg={"yellowgreen"}
          >
            <Text fontSize={"2xl"}>+</Text>
          </Stack>
        )}
      </TabList>
      <TabPanels>
        {isLoadCacheDone &&
          allStore.map((store) => (
            <StoreProvider store={store.data} key={store.id}>
              <TabPanel>
                <VStack flex={1} bg={"#EDF2F7"} p="6" w={"100%"}>
                  <HStack flex={1} w={"100%"} alignItems={"start"}>
                    <AddStepCall />
                  </HStack>
                  <OutputWallet />
                </VStack>
              </TabPanel>
            </StoreProvider>
          ))}
      </TabPanels>
    </Tabs>
  );
};

export default Main;
