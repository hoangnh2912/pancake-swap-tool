import { createStore, type EasyPeasyConfig, type Store } from 'easy-peasy'
import type StoreModel from './model'

type StorePayload = Store<StoreModel, EasyPeasyConfig<undefined, {}>>

const getStore = (id: string) => createStore<StoreModel>({ tabId: id })

export { getStore }
export type { StorePayload }
