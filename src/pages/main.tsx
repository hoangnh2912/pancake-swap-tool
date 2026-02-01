import { Tabs } from 'antd'
import { StoreProvider } from 'easy-peasy'
import { useEffect, useRef, useState } from 'react'
import MainPage from '../components/main-page'
import useStorage from '../hooks/useStorage'
import { getStore, type StorePayload } from '../redux/store'

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
            title: 'Tab-1a2b3c4d',
            id: '1a2b3c4d',
            data: getStore('1a2b3c4d'),
        },
    ])
    const { removeItem, getKeyCacheByTabId, getItem, setItem } = useStorage()

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

    const createNewTab = () => {
        const newId = Math.random().toString(16).substring(7)
        const key = `Tab-${newId}`
        setAllStore((prev) => [
            ...prev,
            {
                title: key,
                data: getStore(newId),
                id: newId,
            },
        ])
    }

    const closeTab = (storeId: string) => {
        setAllStore((prev) => {
            const idCloseTab = storeId
            removeItem(getKeyCacheByTabId(idCloseTab))
            return prev.filter((v) => v.id !== idCloseTab)
        })
    }
    return (
        <>
            <Tabs
                defaultActiveKey="1a2b3c4d"
                type="editable-card"
                onEdit={(targetKey: string, action: 'add' | 'remove') => {
                    if (action === 'add') {
                        createNewTab()
                    } else {
                        closeTab(targetKey)
                    }
                }}
                items={allStore.map((store) => ({
                    key: store.id,
                    label: store.title,
                    children: (
                        <StoreProvider key={store.id} store={store.data}>
                            <MainPage />
                        </StoreProvider>
                    ),
                }))}
            />
        </>
    )
}

export default Main
