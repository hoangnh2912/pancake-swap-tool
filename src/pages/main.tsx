import {
  CloseButton,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { StoreProvider } from "easy-peasy";
import { useCallback, useEffect, useRef, useState } from "react";
import AddStepCall from "../components/AddStepCall";
import OutputTransaction from "../components/OutputTransaction";
import StartProcess from "../components/StartProcess";
import { StorePayload, getStore } from "../redux/store";
import useStorage from "../hooks/useStorage";

const Main = () => {
  const isLoadCacheDone = useRef(false);

  const [allStore, setAllStore] = useState<
    {
      title: string;
      data: StorePayload;
    }[]
  >([
    {
      title: "Tab-1",
      data: getStore(0),
    },
  ]);
  const { removeItem, getKeyCacheByTabIdx, getItem, setItem } = useStorage();

  const [indexTab, setIndexTab] = useState(0);

  useEffect(() => {
    const cache = getItem<{
      tab: string[];
    }>("tab");
    if (cache) {
      setAllStore(
        cache.tab.map((v: string, i: number) => ({
          title: v,
          data: getStore(i),
        }))
      );
    }
    isLoadCacheDone.current = true;
  }, []);

  const onSaveLocalCache = () => {
    if (!isLoadCacheDone.current) return;
    setItem("tab", {
      tab: allStore.map((v) => v.title),
    });
  };

  useEffect(() => {
    onSaveLocalCache();
  }, [allStore.length]);

  const storeKeys = allStore.map((v) => v.title);

  const createNewTab = useCallback(() => {
    const key = `Tab-${allStore.length + 1}`;
    setAllStore((prev) => [
      ...prev,
      {
        title: key,
        data: getStore(allStore.length),
      },
    ]);
  }, [allStore.length]);

  const closeTab = useCallback(
    (index: number) => {
      setAllStore((prev) => {
        const newStore = [...prev];
        newStore.splice(index, 1);
        setIndexTab((prevIdx) => {
          if (prevIdx === newStore.length) {
            return Math.max(0, prevIdx - 1);
          }
          return prevIdx;
        });
        removeItem(getKeyCacheByTabIdx(index));
        return newStore;
      });
    },
    [setIndexTab]
  );

  return (
    <Tabs index={indexTab} onChange={setIndexTab}>
      <TabList>
        {storeKeys.map((v, i) => (
          <Tab justifyContent={"space-between"}>
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
        <Tab onClick={createNewTab}>
          <Text fontSize={"2xl"}>+</Text>
        </Tab>
      </TabList>
      <TabPanels>
        {allStore.map((store) => (
          <StoreProvider store={store.data}>
            <TabPanel>
              <VStack flex={1} bg={"#EDF2F7"} p="6" w={"100%"}>
                <HStack flex={1} w={"100%"} alignItems={"start"}>
                  <AddStepCall />
                </HStack>
                <StartProcess />
                <OutputTransaction />
              </VStack>
            </TabPanel>
          </StoreProvider>
        ))}
      </TabPanels>
    </Tabs>
  );
};

export default Main;
