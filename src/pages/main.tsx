import {
    CloseButton,
    HStack,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
} from '@chakra-ui/react'
import { StoreProvider } from 'easy-peasy'
import { useCallback, useEffect, useRef, useState } from 'react'
import MainPage from '../components/main-page'
import useStorage from '../hooks/useStorage'
import { StorePayload, getStore } from '../redux/store'

const Main = () => {
    const isLoadCacheDone = useRef(false)

    const [allStore, setAllStore] = useState<
        {
            title: string
            id: string
            data: StorePayload
        }[]
    >([
        {
            title: 'Tab-1',
            id: '1a2b3c4d',
            data: getStore('1a2b3c4d'),
        },
    ])
    const { removeItem, getKeyCacheByTabId, getItem, setItem } = useStorage()

    const [indexTab, setIndexTab] = useState(0)

    useEffect(() => {
        const cache = getItem<{
            tab: {
                title: string
                id: string
            }[]
        }>('tab')
        if (cache) {
            setAllStore(
                cache.tab.map(
                    (
                        tab: {
                            title: string
                            id: string
                        },
                        i: number
                    ) => ({
                        title: tab.title,
                        data: getStore(tab.id),
                        id: tab.id,
                    })
                )
            )
        }
        isLoadCacheDone.current = true
    }, [])

    const onSaveLocalCache = () => {
        if (!isLoadCacheDone.current) return
        setItem('tab', {
            tab: allStore.map((v) => ({
                title: v.title,
                id: v.id,
            })),
        })
    }

    useEffect(() => {
        onSaveLocalCache()
    }, [allStore.length])

    const storeTabTitles = allStore.map((v) => v.title)

    const createNewTab = useCallback(() => {
        const key = `Tab-${allStore.length + 1}`
        const newId = Math.random().toString(16).substring(7)
        setAllStore((prev) => [
            ...prev,
            {
                title: key,
                data: getStore(newId),
                id: newId,
            },
        ])
    }, [allStore.length])

    const closeTab = useCallback(
        (index: number) => {
            setAllStore((prev) => {
                const idCloseTab = prev[index].id
                setIndexTab((prevIdx) => {
                    const idOfCurrentTab = prev[prevIdx].id
                    if (idCloseTab === idOfCurrentTab) {
                        return Math.max(0, prevIdx - 1)
                    }
                    return prevIdx
                })
                removeItem(getKeyCacheByTabId(idCloseTab))
                return prev.filter((v) => v.id !== idCloseTab)
            })
        },
        [setIndexTab]
    )

    const onChangeTab = useCallback((index: number) => {
        setIndexTab(index)
    }, [])

    return (
        <Tabs index={indexTab} variant="unstyled" isFitted onChange={onChangeTab}>
            <TabList>
                {storeTabTitles.map((v, i) => (
                    <Tab
                        key={v.toLowerCase()}
                        _selected={{ color: 'white', bg: 'green' }}
                        minW={'200px'}
                        justifyContent={'space-between'}
                    >
                        {v}
                        {i !== 0 && (
                            <CloseButton
                                size={'sm'}
                                onClick={closeTab.bind(null, i)}
                                ml={'15px'}
                                aria-label="close tab"
                            />
                        )}
                    </Tab>
                ))}
                {allStore.length < 8 && (
                    <Stack onClick={createNewTab} cursor={'pointer'} px={'10px'} bg={'yellowgreen'}>
                        <Text fontSize={'2xl'}>+</Text>
                    </Stack>
                )}
            </TabList>
            <TabPanels>
                {isLoadCacheDone.current &&
                    allStore.map((store) => (
                        <StoreProvider key={store.id} store={store.data}>
                            <TabPanel>
                                <VStack flex={1} bg={'#EDF2F7'} p="6" w={'100%'}>
                                    <HStack flex={1} w={'100%'} alignItems={'start'}>
                                        <MainPage />
                                    </HStack>
                                </VStack>
                            </TabPanel>
                        </StoreProvider>
                    ))}
            </TabPanels>
        </Tabs>
    )
}

export default Main
