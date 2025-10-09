import { createId } from '@paralleldrive/cuid2'
import { Tabs } from 'antd'
import MainPage from '../components/main-page'
import {
    useCreateTab,
    useDeleteManyStepper,
    useDeleteManyTransaction,
    useDeleteTab,
    useFindManyTab,
} from '../hooks/zenstack'

const Main = () => {
    const { data: tabs = [] } = useFindManyTab()

    const { mutateAsync: createTab } = useCreateTab()

    const { mutateAsync: deleteTransaction } = useDeleteManyTransaction()
    const { mutateAsync: deleteStepper } = useDeleteManyStepper()
    const { mutateAsync: deleteTab } = useDeleteTab()

    const createNewTab = () => {
        createTab({
            data: {
                name: createId(),
            },
        })
    }

    const closeTab = async (id: string) => {
        await deleteTransaction({ where: { stepper: { tabId: id } } })
        await deleteStepper({ where: { tabId: id } })
        await deleteTab({ where: { id } })
    }
    return (
        <Tabs
            type="editable-card"
            onEdit={(targetKey: string, action: 'add' | 'remove') => {
                if (action === 'add') {
                    createNewTab()
                } else {
                    closeTab(targetKey)
                }
            }}
            items={tabs.map((tab) => ({
                key: tab.id,
                label: tab.id,
                children: <MainPage key={tab.id} tabId={tab.id} />,
            }))}
        />
    )
}

export default Main
