---
mode: agent
description: Danh sách thư viện trong pancake-swap-tool — electron, antd, ethers v5, prisma, easy-peasy — vai trò và ví dụ sử dụng thực tế
tools:
  - codebase
  - search
  - fetch
---

# Thư viện Sử Dụng — pancake-swap-tool

## Core Platform

### electron `28.2.3`
**Vai trò:** Desktop app shell — chạy app như phần mềm native trên Windows/macOS/Linux.

```typescript
// src/index.ts
import { BrowserWindow, app, ipcMain, shell } from 'electron'

const win = new BrowserWindow({
  width: 1280, height: 720,
  webPreferences: { contextIsolation: true, preload: PRELOAD_PATH }
})
win.loadURL(WEBPACK_ENTRY)

// IPC từ main process
ipcMain.handle('sheets:read', async (event, token, contract) => {
  return await prisma.scanContract.findMany({ where: { token, contract } })
})
```

### @electron-forge `7.x`
**Vai trò:** Build, package và tạo installer cho Electron app.

```bash
yarn start    # Dev mode với hot reload
yarn make     # Tạo installer: .exe (Squirrel), .zip, .deb, .rpm
yarn package  # Build unpackaged binary
```

---

## UI Framework

### react `18.x` + react-dom `18.x`
**Vai trò:** UI framework chính cho renderer process.

```tsx
// src/app.tsx
import { createRoot } from 'react-dom/client'
const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

### antd `5.x` — Ant Design
**Vai trò:** Component library chính của app (form, table, tabs...).

**Components đang dùng:**
```tsx
import { Button, Form, Input, InputNumber, Select, Switch, Table, Tabs } from 'antd'

// Multi-tab (pages/main.tsx)
<Tabs type="editable-card" onEdit={onEdit} items={items} />

// Form quét (main-page.tsx)
const [form] = Form.useForm<ScanWalletAirdrop>()
const value = Form.useWatch('fieldName', form)
<Form form={form} onFinish={handleSubmit}>
  <Form.Item name="scanAddress" rules={[{ required: true }]}>
    <Input placeholder="Contract address" />
  </Form.Item>
  <Form.Item name="blockChunk">
    <InputNumber min={100} max={5000} />
  </Form.Item>
</Form>

// Table kết quả
<Table
  dataSource={data}
  columns={columns}
  pagination={{ pageSize: 10 }}
  rowKey="id"
/>

// Select token
<Select options={TOKEN_ADDRESS} mode="multiple" />
```

### @chakra-ui/react `2.x` + @chakra-ui/icons `2.x`
**Vai trò:** Layout primitives + toast notifications.

```tsx
// Layout (main-page.tsx)
import { Flex, Stack, Text, useToast } from '@chakra-ui/react'

<Flex direction="column" gap={4}>
  <Stack spacing={2}>
    <Text fontSize="sm" color="gray.500">Wallet count: {count}</Text>
  </Stack>
</Flex>

// Toast
const toast = useToast()
toast({ title: 'Đã lưu', status: 'success', duration: 3000 })

// Icons
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'
```

### @emotion/react `11.x` + @emotion/styled `11.x`
**Vai trò:** CSS-in-JS engine (peer dependency của Chakra UI, dùng tự động).

---

## Blockchain / Web3

### ethers `5.x`
**Vai trò:** Thư viện tương tác với BSC blockchain (RPC, wallet, contract calls).

**Cách dùng trong project:**

```typescript
// src/web3.ts — tạo provider
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider('https://bsc.drpc.org')

// Tạo wallet signer
const wallet = new ethers.Wallet(privateKey, provider)

// Contract instance
const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, wallet)
const balance = await erc20.balanceOf(address)  // → BigNumber
const decimals = await erc20.decimals()          // → number

// Approve
await erc20.approve(spenderAddress, ethers.constants.MaxUint256)

// Gọi hàm airdrop của contract
const contract = new ethers.Contract(contractAddress, ERC20_ABI, wallet)
const tx = await contract.airdrop(walletList, amountPerWallet)
await tx.wait()

// Lấy logs sự kiện
const logs = await provider.getLogs({
  address: contractAddress,
  fromBlock: 1000000,
  toBlock: 1001000,
})

// Format số
ethers.utils.formatUnits(balance, 18)  // BigNumber → string
ethers.utils.parseUnits('1.5', 18)     // string → BigNumber

// Lấy block hiện tại
const latest = await provider.getBlockNumber()

// Lấy native balance
const bnbBalance = await provider.getBalance(walletAddress)
```

**Lưu ý:** Dự án dùng ethers v5 (API khác v6):
- `new ethers.providers.JsonRpcProvider(...)` (v5) — không phải `new ethers.JsonRpcProvider(...)` (v6)
- `ethers.BigNumber` (v5) — không phải `bigint` (v6)

---

## Database

### prisma `6.x` + @prisma/client `6.x`
**Vai trò:** ORM cho SQLite database, chỉ dùng trong main process.

```typescript
// src/index.ts
import { PrismaClient } from '../prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: `file:${path.join(app.getAppPath(), 'prisma', 'scan-wallet.sqlite')}`
})

// Query
const wallets = await prisma.scanContract.findMany({
  where: { token: tokenAddress, contract: contractAddress, isAirdrop: false },
  select: { wallet: true }
})

// Insert
await prisma.scanContract.create({
  data: { wallet, contract, token, balance, isAirdrop: false }
})

// Count
const count = await prisma.scanContract.count({
  where: { contract: contractAddress, isAirdrop: true }
})

// Delete
await prisma.scanContract.deleteMany({
  where: { contract: contractAddress, isAirdrop: true }
})
```

**Commands:**
```bash
npx prisma migrate dev --name init    # tạo migration mới
npx prisma generate                   # tái tạo Prisma client
npx prisma studio                     # GUI xem dữ liệu
```

### sqlite3 `5.x`
**Vai trò:** Native SQLite binding (peer dependency của Prisma, không dùng trực tiếp).

---

## State Management

### easy-peasy `6.x`
**Vai trò:** Redux-based state management, tạo store riêng cho mỗi tab.

```typescript
// src/redux/model.ts
import { type State, type Actions } from 'easy-peasy'
interface StoreModel { tabId: string }

// src/redux/store.ts
import { createStore } from 'easy-peasy'
export const getStore = (id: string) =>
  createStore<StoreModel>({ tabId: id })

// src/redux/hook.ts
import { createStateHook, createActionCreators } from 'easy-peasy'
export const useStoreState = createStateHook<StoreModel>()

// Dùng trong component
const tabId = useStoreState((state) => state.tabId)

// Wrap mỗi tab với store riêng
import { StoreProvider } from 'easy-peasy'
<StoreProvider store={getStore(tabId)}>
  <MainPage />
</StoreProvider>
```

---

## Utilities

### dayjs `1.11.x`
**Vai trò:** Xử lý format ngày giờ (nhẹ hơn moment.js).

```typescript
import dayjs from 'dayjs'
dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss')
dayjs().unix()   // Unix timestamp
```

### p-limit (được import trong scanContract.ts)
**Vai trò:** Giới hạn số lượng Promise chạy đồng thời (concurrency control).

```typescript
import pLimit from 'p-limit'

const limit = pLimit(10)  // tối đa 10 concurrent tasks

const results = await Promise.all(
  blockRanges.map(({ from, to }) =>
    limit(() => provider.getLogs({ fromBlock: from, toBlock: to, address: contract }))
  )
)
```

### axios `1.x`
**Vai trò:** HTTP client (available, dùng khi cần gọi external REST API).

```typescript
import axios from 'axios'
const res = await axios.get('https://api.example.com/data')
```

### framer-motion `11.x`
**Vai trò:** Animation library (available, dùng cho transitions/animations).

```tsx
import { motion } from 'framer-motion'
<motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>...</motion.div>
```

### react-icons `5.x`
**Vai trò:** Icon pack đa dạng (Font Awesome, Material, Feather...).

```tsx
import { FiSearch, FiDownload } from 'react-icons/fi'
import { AiOutlineWallet } from 'react-icons/ai'
<FiSearch size={16} />
```

### @ajna/pagination `1.x`
**Vai trò:** Chakra UI-compatible pagination component.

```tsx
import { Pagination, usePagination } from '@ajna/pagination'

const { pages, currentPage, setCurrentPage } = usePagination({
  total: totalCount,
  initialState: { pageSize: 10, currentPage: 1 }
})

<Pagination currentPage={currentPage} total={totalCount} pagesCount={pages.length} onPageChange={setCurrentPage}>
  <PaginationContainer>
    <PaginationPrevious />
    <PaginationPageGroup>
      {pages.map(page => <PaginationPage key={page} page={page} />)}
    </PaginationPageGroup>
    <PaginationNext />
  </PaginationContainer>
</Pagination>
```

### googleapis `157.x`
**Vai trò:** Google APIs client (available, có thể dùng export sang Google Sheets).

### jquery `3.x`
**Vai trò:** DOM utilities (available, import sẵn).

---

## Build & Dev Tools

### webpack + ts-loader
**Vai trò:** Bundle TypeScript/React cho cả main process và renderer.

```typescript
// webpack.rules.ts
{ test: /\.tsx?$/, loader: 'ts-loader' }
{ test: /\.node$/, loader: 'node-loader' }  // cho Prisma native engine
{ test: /\.css$/, use: ['style-loader', 'css-loader'] }
```

### @biomejs/biome `2.x`
**Vai trò:** Formatter + linter nhanh (thay thế ESLint + Prettier).

```bash
yarn format   # biome format --write --fix
# Cấu hình trong biome.json
```

### @vercel/webpack-asset-relocator-loader `1.7.3`
**Vai trò:** Relocate native `.node` files (Prisma, sqlite3) khi package app.

### fork-ts-checker-webpack-plugin
**Vai trò:** Type check TypeScript song song với webpack compilation (không block build).

### typescript `~4.5.4`
**Vai trò:** Type system. Config trong `tsconfig.json`.

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "jsx": "react",
    "strict": true
  }
}
```

---

## Summary — Dependency Map

```
Electron (Main Process)
  ├── prisma + @prisma/client + sqlite3  → Database (SQLite)
  └── fs, path, ipcMain                 → System I/O + IPC

React (Renderer Process)
  ├── antd                              → UI components (Table, Form, Tabs...)
  ├── @chakra-ui/react                  → Layout + Toast
  ├── @emotion/react + styled           → CSS-in-JS (Chakra peer dep)
  ├── easy-peasy                        → State management per-tab
  ├── ethers v5                         → Blockchain interactions (BSC)
  ├── p-limit                           → Concurrency control
  ├── dayjs                             → Date formatting
  ├── @ajna/pagination                  → Pagination UI
  ├── react-icons                       → Icons
  └── framer-motion, axios, jquery      → Available utilities

Build
  ├── @electron-forge                   → Package + installer
  ├── webpack + ts-loader               → Bundle
  ├── @biomejs/biome                    → Format + lint
  └── typescript ~4.5                  → Type system
```
