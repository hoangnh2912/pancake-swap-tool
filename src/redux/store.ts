import { createStore, type EasyPeasyConfig, type Store } from 'easy-peasy'
import type StoreModel from './model'

const storePayload: StoreModel = {
    tabId: '1a2b3c4d',
}

type StorePayload = Store<StoreModel, EasyPeasyConfig<undefined, {}>>

const getStore = (id: string) => createStore<StoreModel>({ ...storePayload, tabId: id })

export { getStore }
export type { StorePayload }
