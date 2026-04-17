# pancake-swap-tool — Hướng dẫn cho Copilot Agent

## Mục đích ứng dụng

Desktop app viết bằng **Electron + React + TypeScript**. Chức năng chính:
1. **Quét ví BSC**: lắng nghe sự kiện ERC20 Transfer từ một địa chỉ ví, lưu kết quả vào SQLite.
2. **Tự động chuyển token**: sau mỗi batch quét, dùng hợp đồng Disperse để gửi token đến tất cả ví nhận chưa được chuyển.
3. **Chuyển nhiều ví thủ công**: nhập danh sách địa chỉ + số lượng, gọi Disperse một lần.

---

## Cấu trúc thư mục

```
d:\CODE\pancake-swap-tool\
├── package.json
├── schema.zmodel              ← ZenStack schema (source of truth cho DB + API + hooks)
├── forge.config.ts            ← Electron Forge config
├── webpack.*.ts               ← Webpack configs (main/renderer/rules/plugins)
├── biome.json                 ← Formatter/linter config
├── prisma/
│   ├── schema.prisma          ← Auto-generated từ schema.zmodel (KHÔNG sửa tay)
│   └── client/                ← Generated Prisma client
└── src/
    ├── index.ts               ← Electron Main Process entry
    ├── server.ts              ← Hono HTTP server (port 8080) + ZenStack middleware
    ├── app.tsx                ← Renderer entry, React providers
    ├── renderer.ts            ← Renderer bootstrap
    ├── preload.ts             ← Electron preload (rỗng)
    ├── index.html
    ├── index.css
    ├── pages/
    │   └── main.tsx           ← Root page: multi-tab manager
    ├── components/
    │   └── main-page.tsx      ← UI chính (form quét + form chuyển + bảng)
    ├── hooks/
    │   ├── useStorage.ts      ← localStorage wrapper
    │   └── zenstack/          ← Auto-generated React Query hooks (KHÔNG sửa tay)
    │       ├── index.ts
    │       ├── scan-wallet.ts
    │       └── __model_meta.ts
    ├── redux/
    │   ├── model.ts           ← StoreModel interface
    │   ├── store.ts           ← easy-peasy store factory
    │   └── hook.ts            ← Typed hooks
    └── utils/
        ├── scanWallet.ts      ← WalletScanner class (core blockchain logic)
        ├── zenstack-function.ts ← HTTP helper gọi ZenStack REST (ngoài React)
        ├── abi.ts             ← Smart contract ABIs
        ├── constants.ts       ← Địa chỉ contract, danh sách token
        ├── toast.ts           ← Chakra standalone toast
        ├── utils.ts           ← Helper functions
        └── colors.ts
```

---

## Chi tiết từng file quan trọng

### `src/index.ts` — Electron Main Process
- Khởi `BrowserWindow` (1280×720, maximize, no menu bar, contextIsolation=true).
- Khởi `PrismaClient` với đường dẫn SQLite:
  - Dev: `<appPath>/prisma/scan-transfer.sqlite`
  - Packaged: `<appPath>/../prisma/scan-transfer.sqlite`
- Import `./server` để Hono server chạy song song ngay khi Electron start.
- Lifecycle: `ready` → `createWindow`, `window-all-closed` → quit (non-macOS), `before-quit` → `prisma.$disconnect()`.

### `src/server.ts` — Hono HTTP Server
- `serve({ fetch: app.fetch, hostname: '0.0.0.0', port: 8080 })`.
- Mount `createHonoHandler({ getPrisma: () => prisma })` tại `/api/model/*`.
- CORS `*` — cần thiết vì renderer gọi từ `localhost` khác origin.
- ZenStack tự expose CRUD endpoints: `/api/model/scanWallet/findMany`, `/create`, `/createMany`, `/updateMany`, `/deleteMany`, `/count`, v.v.

### `src/app.tsx` — React Root (Renderer)
```tsx
<QueryClientProvider client={queryClient}>
  <ChakraProvider>
    <ZenStackHooksProvider value={{ endpoint: 'http://localhost:8080/api/model', fetch: window.fetch }}>
      <Main />
      <ToastContainer />
    </ZenStackHooksProvider>
  </ChakraProvider>
</QueryClientProvider>
```
- Export `endpoint` và `fetchInstance` để `zenstack-function.ts` dùng.

### `src/pages/main.tsx` — Multi-Tab
- State: `allStore[]` — mảng `{ title, id, data: Store }`.
- Antd `Tabs` dạng `editable-card`: add/remove tab.
- Mỗi tab tạo `easy-peasy StoreProvider` riêng với `tabId` khác nhau.
- Persist tab list vào `localStorage` key `"tab"`.
- Default tab: `id = '1a2b3c4d'`.

### `src/components/main-page.tsx` — UI Chính
**Tab 1 — Quét ví:**
- Form fields: `scanAddresses` (TextArea, mỗi dòng 1 địa chỉ contract), `blockChunk`, `concurrency`, `privateKey` (→ auto-fill `fromAddress`), `tokenAddress`, `amount`, `transferDelayMs`.
- Parse: `addressList = scanAddresses.split('\n').filter(isAddress)` — dùng cho mọi DB query.
- `onFinish`: gọi `WalletScanner.getInstance().save({ wallets: addressList, ... })`, lưu cache RPC + scanAddresses.
- Buttons: **Lưu cài đặt** (submit), **Quét** (start scanner), **Dừng quét** (stop), **Xuất file** (CSV download), **Xoá dữ liệu** (deleteMany).
- Bảng kết quả: dùng `useFindManyScanWallet({ where: { wallet: { in: addressList } } })` + `useCountScanWallet`, pagination manual.
- Columns: STT, Thời gian quét, Mã giao dịch (link BscScan), Ví quét, Token, Ví nhận, Số lượng (`formatUnits(18)`), Transfer (checkbox).

**Tab 2 — Chuyển nhiều ví:**
- Form fields: `privateKey`, `fromAddress` (readonly), `tokenAddress`, `recipientList[]`, upload file CSV.
- Gọi Disperse contract trực tiếp (không qua WalletScanner).

### `src/utils/scanWallet.ts` — WalletScanner (Singleton)
Pattern: Singleton (`getInstance()`), phải gọi `.save(params)` trước khi `.start()`.

```
start() loop:
  while(!stopped):
    latest = provider.getBlockNumber()
    for block in [currentBlock..latest] by blockChunk:
      scanERC20Transfers(from, to)       ← Promise.all scan tất cả wallets[i]
        └─ _scanSingleWallet(wallet, ...) ← getLogs từng contract
      onSave(tokenTransfers)             ← createManyScanWallet
      transferToken()                    ← Disperse.disperseTokenSimple (1 lần cho tất cả)
      clearResults()
      currentBlock = end + 1
    sleep(interval)
```

**`_scanSingleWallet(wallet, fromBlock, toBlock)`**: Dùng `provider.getLogs` với topics:
- `[0]` = `keccak256("Transfer(address,address,uint256)")`
- `[1]` = `hexZeroPad(wallet, 32)` (from address)
- `[2]` = null (any to address)

**`transferToken`**:
- Rate-limit bằng `transferDelayMs` (so sánh `Date.now() - lastTransferUpdate`).
- Query DB: `ScanWallet.findMany({ where: { wallet: { in: this.wallets }, isTransferred: false } })`.
- Deduplicate recipients bằng `Set`.
- Check + approve token cho Disperse contract (`0xD152f549545093347A162Dce210e7293f1452150`).
- Gọi `disperseTokenSimple(token, recipients[], amount)` — **1 lần cho tất cả contracts**.
- Update `isTransferred = true` cho tất cả recipients.

### `src/utils/zenstack-function.ts` — REST Helper
Dùng ngoài React (trong WalletScanner):
```ts
zenStackFunction<T, K>('ScanWallet', 'findMany', queryArgs)
// → GET http://localhost:8080/api/model/scanWallet/findMany?q=<encoded>
```
Map action → method: find/count/aggregate → GET, create/upsert → POST, update → PATCH, delete → DELETE.

### `src/utils/abi.ts`
- `ERC20_ABI`: standard ERC20 (transfer, approve, allowance, decimals, balanceOf, transferFrom).
- `DISPERSE_ABI`: Disperse.app contract (disperseTokenSimple).
- `ROUTER_PANCAKE_V2_ABI`: PancakeSwap V2 Router (addLiquidity, swap...).
- `MULTICALL_ABI`: Multicall aggregate.

### `src/utils/constants.ts`
```ts
PANCAKE_ADDRESS.BSC.Mainnet.Router  = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
PANCAKE_ADDRESS.BSC.Mainnet.Factory = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
PANCAKE_ADDRESS.BSC.Mainnet.WETH    = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
TOKEN_ADDRESS = [USDT, USDC, ETH, WBNB, BTC] // BSC mainnet addresses
ZERO_ADDRESS  = '0x0000...0000'
```

### `src/hooks/zenstack/` — Auto-generated (ZenStack)
**KHÔNG sửa tay.** Chạy `yarn generate` để tái tạo.
Hooks có sẵn:
- `useFindManyScanWallet(args?, options?)` → `ScanWallet[]`
- `useCountScanWallet(args?, options?)` → `number`
- `useCreateScanWallet` / `useCreateManyScanWallet`
- `useUpdateManyScanWallet`
- `useDeleteManyScanWallet`
- `useFindUniqueScanWallet`
- (và các biến thể Infinite, Suspense)

### `src/redux/`
- `StoreModel`: `{ tabId: string }` — chỉ lưu ID tab hiện tại.
- `getStore(id)`: tạo `easy-peasy` store mới với `tabId = id`.
- `useStoreState(state => state.tabId)`: lấy tabId trong component.

### `src/hooks/useStorage.ts`
```ts
setItem(key, value)              // localStorage.setItem(key, JSON.stringify(value))
getItem<T>(key): T | null        // JSON.parse(localStorage.getItem(key))
removeItem(key)
getKeyCacheByTabId(tabId): string // → `cache-${tabId}`
```

---

## Database Schema

**Model `ScanWallet`** (SQLite via Prisma):
```prisma
model ScanWallet {
  id            String   @id @default(cuid())
  wallet        String              // địa chỉ ví được quét (source)
  tx            String              // transaction hash
  token         String?             // địa chỉ token ERC20
  destination   String?             // ví nhận token
  amount        String?             // số lượng (raw BigNumber string, 18 decimals)
  isTransferred Boolean @default(false)  // đã Disperse chưa
  createdAt     DateTime @default(now())
  @@index([destination])
}
```

**Để thêm model mới:**
1. Sửa `schema.zmodel` (không sửa `prisma/schema.prisma`).
2. Chạy `yarn generate` → tái tạo hooks + prisma schema.
3. Chạy `yarn db:push` → migrate SQLite.

---

## Thư viện và cách dùng

### Blockchain
- **ethers v5** (`import { ethers } from 'ethers'`):
  - `new ethers.providers.JsonRpcProvider(rpcUrl)` — kết nối RPC.
  - `new ethers.Wallet(privateKey, provider)` — ký transaction.
  - `new ethers.Contract(address, abi, signer)` — gọi smart contract.
  - `provider.getLogs({ fromBlock, toBlock, topics })` — query events.
  - `ethers.utils.id(sig)` — keccak256 hash.
  - `ethers.utils.hexZeroPad(addr, 32)` — pad địa chỉ cho topics.
  - `ethers.utils.formatUnits(amount, decimals)` — format số lượng.
  - `ethers.utils.parseUnits(amount, decimals)` — parse số lượng.
  - `ethers.utils.isAddress(addr)` — validate địa chỉ.

### Database / API
- **Prisma 6**: ORM SQLite. Chỉ dùng trong `index.ts` và `server.ts` (main process).
- **ZenStack 2**: Extend Prisma, auto-generate REST API + React hooks.
  - Config trong `schema.zmodel`: `plugin hooks { provider = '@zenstackhq/tanstack-query'; target = 'react'; output = 'src/hooks/zenstack' }`.
  - Renderer **không import Prisma trực tiếp** — chỉ gọi qua HTTP hoặc hooks.

### HTTP / Server
- **Hono 4** + **@hono/node-server**: HTTP server trong main process.
  - `app.use('*', cors(...))`, `app.use('/api/model/*', createHonoHandler(...))`.

### UI
- **Antd 5**: Layout chính — Tabs, Form, Table, Input, Button, Upload, Typography, message, notification.
- **@chakra-ui/react 2**: Layout primitives (Flex, Stack, Text) + standalone Toast.
- **framer-motion 11**: Animation (available, dùng khi cần).

### State
- **@tanstack/react-query 5**: Cache data từ ZenStack hooks.
- **easy-peasy 6**: `createStore`, `StoreProvider`, `createTypedHooks` — state per tab.

### Dev tools
- **electron-forge 7**: `yarn start` (dev), `yarn make` (build installer).
- **biome 2**: `yarn format` — format + lint.
- **TypeScript ~4.5**: strict mode.

---

## Luồng dữ liệu (Data Flow)

```
[Electron Main Process]
  index.ts
    ├── PrismaClient → scan-transfer.sqlite
    └── server.ts
          └── Hono :8080
                └── /api/model/* ← ZenStack CRUD REST

[Renderer Process — React]
  app.tsx
    └── ZenStackHooksProvider (endpoint=:8080)
          └── main.tsx (multi-tab)
                └── main-page.tsx
                      ├── useFindManyScanWallet()   → GET /api/model/scanWallet/findMany
                      ├── useCreateManyScanWallet() → POST /api/model/scanWallet/createMany
                      ├── useDeleteManyScanWallet() → DELETE /api/model/scanWallet/deleteMany
                      └── WalletScanner (singleton)
                            ├── ethers.getLogs()  → BSC RPC
                            ├── zenStackFunction('ScanWallet','createMany',...)  → POST :8080
                            ├── Disperse.disperseTokenSimple()                  → BSC RPC
                            └── zenStackFunction('ScanWallet','updateMany',...)  → PATCH :8080
```

---

## Quy tắc bắt buộc khi sửa code

1. **KHÔNG sửa `prisma/schema.prisma`** — file này generated từ `schema.zmodel`.
2. **KHÔNG sửa `src/hooks/zenstack/`** — generated bởi `yarn generate`.
3. Thêm model mới: sửa `schema.zmodel` → `yarn generate` → `yarn db:push`.
4. `WalletScanner` là Singleton — chỉ có 1 instance toàn app (dùng `getInstance()`).
5. Renderer không có quyền truy cập Node.js API (`contextIsolation: true`) — không import `fs`, `path`, v.v. trong renderer.
6. Tất cả giao tiếp DB từ renderer đều qua HTTP `:8080`.
7. Private key được lưu tạm trong form state — **không persist vào DB hoặc localStorage**.

---

## Lệnh thường dùng

```bash
yarn start      # Chạy dev (Electron + Webpack HMR)
yarn make       # Build installer
yarn generate   # Tái tạo Prisma schema + ZenStack hooks từ schema.zmodel
yarn db:push    # Apply schema changes vào SQLite
yarn format     # Format code với Biome
```

---

## Địa chỉ smart contract quan trọng (BSC Mainnet)

| Contract | Address |
|---|---|
| Disperse.app | `0xD152f549545093347A162Dce210e7293f1452150` |
| PancakeSwap V2 Router | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| PancakeSwap V2 Factory | `0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73` |
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| USDT (BSC) | `0x55d398326f99059ff775485246999027b3197955` |
| USDC (BSC) | `0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d` |

Default RPC: `https://bsc.drpc.org`
