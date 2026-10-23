import { Button, Dropdown, Input, Modal, Spin, Tabs, message } from 'antd'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { runningWalletsStore } from '../utils/walletRegistry'
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

const electron = () => (window as any).electron
const fileName = (p: string) => p.split(/[\\/]/).pop()

// Lỗi từ ipcRenderer.invoke có prefix "Error invoking remote method '...': Error: " — bỏ đi
const ipcErrorMessage = (err: any) =>
    String(err?.message || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '')

// Phiên bản app + nút kiểm tra cập nhật (OTA chỉ có ở bản cài Windows). App tự kiểm tra khi mở;
// chỉ báo kết quả "đã mới nhất"/lỗi khi người dùng tự bấm.
function UpdateControl() {
    const [state, setState] = useState<{ status: string; message?: string }>({ status: 'idle' })
    const manual = useRef(false)
    useEffect(() => {
        electron().updateState().then(setState)
        return electron().onUpdateStatus((st: { status: string; message?: string }) => {
            setState(st)
            if (st.status === 'downloading') message.info('Có bản mới — đang tải về…')
            if (!manual.current) return
            if (st.status === 'latest') message.success('Đang dùng bản mới nhất')
            if (st.status === 'error') message.error(`Lỗi kiểm tra cập nhật: ${st.message}`)
            if (st.status !== 'checking') manual.current = false
        })
    }, [])
    const check = async () => {
        manual.current = true
        const st = await electron().checkForUpdates()
        if (st.status === 'unsupported') {
            manual.current = false
            message.info('Tự cập nhật chỉ có ở bản cài đặt (installer) trên Windows')
        }
    }
    const busy = state.status === 'checking' || state.status === 'downloading'
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#888' }}>v{electron().appVersion}</span>
            <Button size="small" loading={busy} onClick={check}>
                {state.status === 'downloading' ? 'Đang tải bản mới' : state.status === 'downloaded' ? 'Cài bản mới' : 'Kiểm tra cập nhật'}
            </Button>
        </span>
    )
}

// Hỏi mật khẩu bằng Modal — resolve null nếu huỷ. confirm=true: nhập 2 lần (khi đặt mật khẩu mới)
function askPassword(title: string, confirm: boolean): Promise<string | null> {
    return new Promise((resolve) => {
        let pw = ''
        let pw2 = ''
        Modal.confirm({
            title,
            icon: null,
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <Input.Password autoFocus placeholder="Mật khẩu" onChange={(e) => (pw = e.target.value)} />
                    {confirm && (
                        <>
                            <Input.Password placeholder="Nhập lại mật khẩu" onChange={(e) => (pw2 = e.target.value)} />
                            <span style={{ fontSize: 12, color: '#faad14' }}>
                                File chứa private key — quên mật khẩu là không mở lại được file.
                            </span>
                        </>
                    )}
                </div>
            ),
            okText: 'OK',
            cancelText: 'Huỷ',
            onOk: () => {
                if (!pw) {
                    message.error('Chưa nhập mật khẩu')
                    return Promise.reject()
                }
                if (confirm && pw !== pw2) {
                    message.error('Mật khẩu nhập lại không khớp')
                    return Promise.reject()
                }
                resolve(pw)
            },
            onCancel: () => resolve(null),
        })
    })
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

    // project: undefined = đang tải; path null = chưa mở file nào → chặn UI ở màn hình chọn file
    const [project, setProject] = useState<{ path: string | null; recent: string[] }>()

    // Nguồn gốc của tabs là Config._global.tabsJson (nằm trong file .adp); localStorage chỉ là cache
    const saveTabs = useCallback((next: TabItem[]) => {
        setTabs(next)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        electron()?.projectSetTabs(next)
    }, [])

    useEffect(() => {
        electron()
            ?.projectInfo()
            .then((info: { path: string | null; recent: string[]; tabs: TabItem[] | null }) => {
                setProject(info)
                if (!info.path) return
                if (info.tabs) {
                    setTabs(info.tabs)
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(info.tabs))
                    setActiveKey((k) => (info.tabs!.some((t) => t.id === k) ? k : info.tabs![0].id))
                } else {
                    electron().projectSetTabs(loadTabs()) // DB cũ chưa có tabsJson — đưa tabs vào file
                }
            })
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

    const openProject = async (filePath?: string | null) => {
        if (Object.keys(runningWalletsStore.state).length > 0) {
            message.error('Đang chạy automation — dừng trước khi mở file khác')
            return
        }
        const target = filePath ?? (await electron()?.projectPickOpen())
        if (!target) return
        const name = target.split(/[\\/]/).pop()
        for (;;) {
            const pw = await askPassword(`Mở ${name}`, false)
            if (pw === null) return
            try {
                const res = await electron().projectOpen(target, pw)
                if (res.tabs?.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(res.tabs))
                message.success(`Đã mở ${name} — đang tải lại...`)
                setTimeout(() => window.location.reload(), 800)
                return
            } catch (err) {
                const msg = ipcErrorMessage(err)
                message.error(msg)
                if (!msg.startsWith('Sai mật khẩu')) return // sai mật khẩu thì cho nhập lại
            }
        }
    }

    const closeProject = async () => {
        if (Object.keys(runningWalletsStore.state).length > 0) {
            message.error('Đang chạy automation — dừng trước khi đóng file')
            return
        }
        try {
            await electron().projectClose()
            localStorage.removeItem(STORAGE_KEY)
            window.location.reload()
        } catch (err) {
            message.error(`Không đóng được file: ${ipcErrorMessage(err)}`)
        }
    }

    const clearRecent = async () => {
        await electron().projectClearRecent()
        setProject((p) => p && { ...p, recent: [] })
    }

    // App tự ghi file .adp khi dữ liệu đổi — Lưu chỉ ép ghi ngay; Lưu thành/Tạo mới chuyển sang file mới
    const saveProject = async (saveAs: boolean) => {
        try {
            if (!saveAs && project?.path) {
                message.success(`Đã lưu: ${await electron().projectSave()}`)
                return
            }
            const pw = await askPassword('Đặt mật khẩu cho file', true)
            if (pw === null) return
            const saved = await electron().projectSaveAs(pw)
            if (!saved) return
            message.success(`Đã lưu: ${saved}`)
            if (!project?.path) setTimeout(() => window.location.reload(), 500) // vừa tạo file đầu tiên → vào app
            else setProject((p) => p && { ...p, path: saved, recent: [saved, ...p.recent.filter((r) => r !== saved)] })
        } catch (err) {
            message.error(`Lưu lỗi: ${ipcErrorMessage(err)}`)
        }
    }

    // Menu File / phím tắt và file mở từ Finder/Explorer — dùng ref để listener luôn gọi bản mới nhất
    const actionsRef = useRef({ openProject, saveProject, closeProject })
    actionsRef.current = { openProject, saveProject, closeProject }
    useEffect(() => {
        const el = electron()
        if (!el?.onProjectMenu) return
        const offMenu = el.onProjectMenu((action: string) => {
            if (action === 'open') actionsRef.current.openProject()
            else if (action === 'close') actionsRef.current.closeProject()
            else actionsRef.current.saveProject(action === 'saveAs')
        })
        const offOpen = el.onProjectOpenRequest((p: string) => actionsRef.current.openProject(p))
        const offErr = el.onProjectSaveError((msg: string) => message.error(`Lỗi ghi file .adp: ${msg}`, 8))
        el.projectTakePending().then((p: string | null) => p && actionsRef.current.openProject(p))
        return () => {
            offMenu()
            offOpen()
            offErr()
        }
    }, [])

    const handleStatusChange = useCallback((tabId: string, status: TabStatus) => {
        setTabStatuses((prev) => ({ ...prev, [tabId]: status }))
    }, [])

    if (!project?.path) {
        return (
            <div style={{
                height: '100vh', background: '#141414', color: '#ddd',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
                {project === undefined ? <Spin /> : (
                    <>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>Mở file dự án (.adp) để bắt đầu</div>
                        <div style={{ fontSize: 12, color: '#888', maxWidth: 420, textAlign: 'center' }}>
                            Toàn bộ dữ liệu (tab, config, private key, ví đã quét) được lưu và mã hoá trong file .adp.
                        </div>
                        <Button type="primary" onClick={() => openProject()}>Mở file…</Button>
                        {project.recent.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 420, marginTop: 8 }}>
                                <div style={{ fontSize: 12, color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Mở gần đây</span>
                                    <a onClick={clearRecent}>Xoá danh sách</a>
                                </div>
                                {project.recent.map((p) => (
                                    <Button key={p} block title={p} style={{ textAlign: 'left' }} onClick={() => openProject(p)}>
                                        <b>{fileName(p)}</b>
                                        <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>{p}</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                        <Button onClick={() => saveProject(true)}>Tạo file mới từ dữ liệu hiện có trên máy…</Button>
                        <div style={{ marginTop: 16 }}><UpdateControl /></div>
                    </>
                )}
            </div>
        )
    }

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
                tabBarExtraContent={{
                    right: (
                        <span style={{ display: 'inline-flex', gap: 8, paddingRight: 8 }}>
                            <Dropdown.Button
                                size="small"
                                onClick={() => openProject()}
                                menu={{
                                    items: project.recent.length
                                        ? [
                                              ...project.recent.map((p) => ({ key: p, label: fileName(p), title: p })),
                                              { type: 'divider' as const },
                                              { key: '__clear', label: 'Xoá danh sách gần đây' },
                                          ]
                                        : [{ key: '__none', label: 'Chưa có file gần đây', disabled: true }],
                                    onClick: ({ key }) => (key === '__clear' ? clearRecent() : openProject(key)),
                                }}
                            >
                                Mở file
                            </Dropdown.Button>
                            <Button size="small" onClick={() => saveProject(false)}>Lưu</Button>
                            <Button size="small" onClick={() => saveProject(true)}>Lưu thành…</Button>
                            <Button size="small" onClick={closeProject}>Đóng file</Button>
                            <UpdateControl />
                        </span>
                    ),
                }}
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
