import { Input, Spin, Tabs } from 'antd'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Main, { type TabStatus } from './main'

const STORAGE_KEY = 'tabs-v2'

interface TabItem {
    id: string
    title: string
}

const defaultTabs: TabItem[] = [{ id: 'default', title: 'Tab 1' }]

function loadTabs(): TabItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch {}
    return defaultTabs
}

function TabLabel({
    title,
    status,
    editing,
    onDoubleClick,
    onRename,
}: {
    title: string
    status: TabStatus | undefined
    editing: boolean
    onDoubleClick: () => void
    onRename: (v: string) => void
}) {
    if (editing) {
        return (
            <Input
                size="small"
                defaultValue={title}
                autoFocus
                onBlur={(e) => onRename(e.target.value)}
                onPressEnter={(e) => onRename((e.target as HTMLInputElement).value)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 80 }}
            />
        )
    }

    const ratio = status && status.tokenTotal > 0
        ? `${status.successCount}/${status.tokenTotal}`
        : null

    const baseRow: React.CSSProperties = {
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: 'nowrap',
    }

    return (
        <span
            style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
            onDoubleClick={onDoubleClick}
        >
            <span>{title}</span>

            {status?.running && (
                <span style={{ ...baseRow, color: '#40a9ff' }}>
                    <Spin size="small" style={{ lineHeight: 1 }} />
                    {ratio && <span>{ratio}</span>}
                </span>
            )}

            {status?.hasError && (
                <span style={{ ...baseRow, color: '#ff7875' }}>
                    <AlertTriangle size={13} />
                    {!status.running && ratio && <span>{ratio}</span>}
                </span>
            )}

            {status && !status.running && status.done && !status.hasError && (
                <span style={{ ...baseRow, color: '#95de64' }}>
                    <CheckCircle size={13} />
                    {ratio && <span>{ratio}</span>}
                </span>
            )}
        </span>
    )
}

export default function TabManager() {
    const [tabs, setTabs] = useState<TabItem[]>(loadTabs)
    const [activeKey, setActiveKey] = useState<string>(() => loadTabs()[0]?.id ?? 'default')
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [tabStatuses, setTabStatuses] = useState<Record<string, TabStatus>>({})
    const [navHeight, setNavHeight] = useState(46)
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = navRef.current
        if (!el) return
        const obs = new ResizeObserver(() => {
            setNavHeight(el.offsetHeight)
        })
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    const saveTabs = useCallback((next: TabItem[]) => {
        setTabs(next)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }, [])

    const addTab = useCallback(() => {
        const id = `tab-${Date.now()}`
        const next = [...tabs, { id, title: `Tab ${tabs.length + 1}` }]
        saveTabs(next)
        setActiveKey(id)
    }, [tabs, saveTabs])

    const removeTab = useCallback(
        (targetKey: string) => {
            if (tabs.length <= 1) return
            const idx = tabs.findIndex((t) => t.id === targetKey)
            const next = tabs.filter((t) => t.id !== targetKey)
            saveTabs(next)
            setTabStatuses((prev) => {
                const copy = { ...prev }
                delete copy[targetKey]
                return copy
            })
            if (activeKey === targetKey) {
                setActiveKey(next[Math.max(0, idx - 1)]?.id ?? next[0].id)
            }
        },
        [tabs, activeKey, saveTabs]
    )

    const commitRename = useCallback(
        (id: string, title: string) => {
            saveTabs(tabs.map((t) => (t.id === id ? { ...t, title: title || t.title } : t)))
            setEditingKey(null)
        },
        [tabs, saveTabs]
    )

    const handleStatusChange = useCallback((tabId: string, status: TabStatus) => {
        setTabStatuses((prev) => ({ ...prev, [tabId]: status }))
    }, [])

    return (
        /* Outer div: 100vh height, overflow hidden — Tabs fills it */
        <div style={{ height: '100vh', overflow: 'hidden', background: '#141414' }}>
            <Tabs
                type="editable-card"
                activeKey={activeKey}
                onChange={setActiveKey}
                onEdit={(targetKey, action) => {
                    if (action === 'add') addTab()
                    else if (action === 'remove') removeTab(String(targetKey))
                }}
                style={{ height: '100%' }}
                animated={false}
                renderTabBar={(props, DefaultTabBar) => (
                    <div ref={navRef}>
                        <DefaultTabBar
                            {...props}
                            style={{
                                background: '#141414',
                                borderBottom: '1px solid #2a2a2a',
                                margin: 0,
                                padding: '4px 8px 0',
                            }}
                        />
                    </div>
                )}
                items={tabs.map((tab) => ({
                    key: tab.id,
                    closable: tabs.length > 1,
                    label: (
                        <TabLabel
                            title={tab.title}
                            status={tabStatuses[tab.id]}
                            editing={editingKey === tab.id}
                            onDoubleClick={() => setEditingKey(tab.id)}
                            onRename={(v) => commitRename(tab.id, v)}
                        />
                    ),
                    children: (
                        <div style={{
                            height: `calc(100vh - ${navHeight}px)`,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                        }}>
                            <Main
                                tabId={tab.id}
                                onStatusChange={(s) => handleStatusChange(tab.id, s)}
                            />
                        </div>
                    ),
                }))}
            />
        </div>
    )
}
