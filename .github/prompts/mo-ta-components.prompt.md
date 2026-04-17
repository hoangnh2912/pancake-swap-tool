---
mode: agent
description: Mô tả chi tiết tác dụng của từng component trong pancake-swap-tool — Main Process, preload, React pages, hooks, redux, utility classes
tools:
  - codebase
  - search
  - usages
---

# Mô tả Components — pancake-swap-tool

## src/index.ts — Electron Main Process

**Vai trò:** Entry point của toàn bộ app. Chạy trong Node.js environment.

**Chức năng chính:**
- Tạo `BrowserWindow` (1280×720, maximize, menu bar ẩn)
- Khởi tạo `PrismaClient` với path SQLite dynamic:
  - Dev: `prisma/scan-wallet.sqlite`
  - Packaged: `resources/prisma/scan-wallet.sqlite`
- Đăng ký tất cả **IPC handlers** (`ipcMain.handle`) để renderer gọi xuống DB:

```typescript
// CRUD ScanContract
ipcMain.handle('sheets:check', ...)    // kiểm tra ví đã tồn tại chưa
ipcMain.handle('sheets:read', ...)     // lấy danh sách ví chưa airdrop
ipcMain.handle('sheets:write', ...)    // lưu ví mới (bulk)
ipcMain.handle('sheets:count', ...)    // đếm tổng / đã airdrop
ipcMain.handle('sheets:deleteAll', ...)
ipcMain.handle('sheets:deleteAirdrop', ...)
ipcMain.handle('sheets:save', ...)     // xuất CSV
ipcMain.handle('sheets:import', ...)   // import CSV

// System
ipcMain.handle('get-memory-info', ...)        // process.memoryUsage()
ipcMain.on('open-link', ...)                  // shell.openExternal
ipcMain.on('set-progress-bar', ...)           // taskbar progress
```

- Graceful disconnect Prisma khi app đóng (`before-quit`)

---

## src/preload.ts — IPC Bridge (contextBridge)

**Vai trò:** Cầu nối bảo mật giữa renderer và main process. Expose API qua `window.electronAPI`.

**Cơ chế:** `contextBridge.exposeInMainWorld` — renderer KHÔNG có quyền Node.js trực tiếp.

```typescript
window.electronAPI = {
  openExternal(url)
  onMessage(callback)           // nhận log từ main process
  readSheet(token, contract)    // → IPC sheets:read
  writeSheet(token, contract, ...wallets)
  writeSheetBalance(wallet, token, balance)
  checkSheet(wallet, contract, token)
  countSheet(token, contract)   // → { countAll, countAirdrop }
  saveFile(token, contract)     // xuất CSV
  readFile()                    // import CSV
  deleteAll(token, contract)
  deleteAirdrop(token, contract)
  getMemoryInfo()               // → ProcessMemoryInfo + appPath
}
```

---

## src/app.tsx — React Root

**Vai trò:** Khởi tạo React tree, bọc toàn bộ providers.

```tsx
<ChakraProvider>
  <Main />      {/* pages/main.tsx */}
  <ToastContainer />
</ChakraProvider>
```

---

## src/web3.ts — ethers.js Factory Helpers

**Vai trò:** Tập trung các hàm tạo instance ethers.js, tránh lặp code.

```typescript
getProvider(rpc: string)                    // → JsonRpcProvider
getWallet(provider, privateKey)             // → Wallet (signer)
getRouterContract(provider?)                // → PancakeSwap V2 Router
getFactoryContract(provider?)               // → PancakeSwap V2 Factory
getERC20Contract(address, signerOrProvider) // → ERC20 token contract
getOfPairBalance(pairAddress, provider)     // → { reserve0, reserve1 }
```

---

## src/pages/main.tsx — Multi-Tab Manager

**Vai trò:** Quản lý nhiều phiên quét độc lập qua tab system.

**Tính năng:**
- `antd Tabs` dạng `editable-card`: thêm/xoá tab tự do
- Mỗi tab có ID riêng (`nanoid`), persist vào `localStorage`
- Mỗi tab có `StoreProvider` riêng (easy-peasy) → state hoàn toàn isolated
- Hiển thị memory usage ở header (qua `useMemoryInfo`)
- Load danh sách tab từ `localStorage` khi khởi động

```tsx
// Mỗi tab được wrap độc lập
<StoreProvider store={getStore(tabId)}>
  <MainPage />
</StoreProvider>
```

---

## src/components/main-page.tsx — UI Chính (2 Tab)

**Vai trò:** Component UI lớn nhất, chứa toàn bộ logic tương tác của người dùng.

### Tab 1: Contract Scanner & Airdrop

**Form config (`ScanWalletAirdrop`):**
| Field | Type | Mô tả |
|---|---|---|
| `scanAddress` | string | Địa chỉ contract cần quét |
| `fromBlock` | number | Block bắt đầu quét |
| `scanningFromBlock` | number | Block hiện tại đang quét (live) |
| `scanningToBlock` | number | Block cuối cùng đang quét (live) |
| `blockChunk` | number | Số block mỗi chunk (default 500) |
| `concurrency` | number | Số chunk song song |
| `tokens` | string[] | Danh sách token theo dõi |
| `airdropAmount` | number | Số lượng token airdrop mỗi ví |
| `airdropToken` | string | Địa chỉ token dùng để airdrop |
| `isAirdrop` | boolean | Bật/tắt airdrop tự động |
| `isFakeAirdrop` | boolean | Fake mode (log thay vì gửi thật) |
| `gasPrice` | number | Gas price (Gwei) |
| `airdropDuration` | number | Delay giữa các lần airdrop (giây) |
| `countAirdropUntilDeleteAll` | number | Xoá DB khi đạt N lần airdrop |
| `walletIndex` | number | Index wallet trong private key list |

**Private keys:** Quản lý danh sách private key (textarea + import file), tự động persist vào `localStorage` theo `tabId`.

**Kết nối `ContractScanner`:**
```typescript
contractScanner.current = new ContractScanner()
contractScanner.current.start({
  rpcUrl, contractAddress, fromBlock, tokens, airdropToken,
  airdropAmount, isAirdrop, isFakeAirdrop, gasPrice, ...
})
contractScanner.current.stop()
```

**Bảng kết quả (antd Table):** wallet, token, balance, isAirdrop, createdAt.  
**Nút hành động:** Export CSV, Import CSV, Xoá tất cả, Xoá đã airdrop, Approve token.

**Counter live:** `useCountWallet(airdropToken, scanAddress)` → hiển thị số ví đã quét / đã airdrop, tự refresh mỗi 3 giây.

### Tab 2: Wallet Balance Scanner

**Form config (`ScanWalletBalance`):**
| Field | Mô tả |
|---|---|
| `concurrency` | Số ví kiểm tra song song |
| `tokens` | Danh sách token cần check |
| `fileName` | Tên file output |

**Kết nối `WalletBalanceScanner`:**
```typescript
walletBalanceScanner.current = new WalletBalanceScanner()
walletBalanceScanner.current.start({ wallets, tokens, concurrency })
```

---

## src/utils/scanContract.ts — ContractScanner Class

**Vai trò:** Engine chính xử lý toàn bộ logic quét blockchain + airdrop. Singleton.

**Cấu trúc:**
```typescript
export class ContractScanner {
  static getInstance(): ContractScanner      // singleton accessor
  constructor(params: ScanParams)
  async start(): Promise<void>               // bắt đầu quét + airdrop loop
  stop(): void                               // dừng quét
}
```

**Params khi khởi tạo:**
```typescript
type ScanParams = {
  rpcUrl: string
  contractAddress: string
  fromBlock: number
  airdropAmount: number
  airdropToken: string              // ERC20 dùng để airdrop
  tokens: Record<string, string>    // token theo dõi balance
  privateKeySigner: string          // private key ký airdrop tx
  isAirdrop: boolean
  isFakeAirdrop: boolean            // true = chỉ log, không gửi thật
  gasPrice: number
  diffSeconds: number               // delay giữa các lần airdrop
  countAirdropUntilDeleteAll: number
  options?: { blockChunk, concurrency, interval }
  onScan?: (from, to) => void       // callback cập nhật UI
}
```

**Flow quét:**
1. Lấy `latestBlock` từ RPC
2. Chia `[fromBlock, latestBlock]` thành chunks `blockChunk` blocks
3. Dùng `p-limit(concurrency)` chạy song song:
   - `provider.getLogs({ address: contractAddress, fromBlock, toBlock })`
   - Parse logs → lấy địa chỉ ví từ `topics[1]` (sender) và `topics[2]` (receiver)
   - `electronAPI.checkSheet()` → bỏ qua ví đã lưu
   - `provider.getBalance(wallet)` → lấy native balance
4. Sau mỗi batch → `electronAPI.writeSheet()` lưu vào DB

**Flow airdrop (khi `isAirdrop = true`):**
1. `electronAPI.readSheet(token, contract)` → lấy ví chưa airdrop
2. Check `allowance` → nếu thiếu thì `approve` token
3. `isFakeAirdrop = false`: gọi `airdropTokenContract.airdrop(wallets, amount)`
4. `isFakeAirdrop = true`: chỉ log, đánh dấu đã airdrop
5. `electronAPI.writeSheet(..., 'TRUE')` → update `isAirdrop = true`
6. Khi `countAirdrop >= countAirdropUntilDeleteAll` → `electronAPI.deleteAirdrop()`

**ABI dùng trong contract này:** ABI tùy chỉnh của contract target (có `airdrop(address[], uint256)` function).

---

## src/utils/scanWalletBalance.ts — WalletBalanceScanner Class

**Vai trò:** Kiểm tra balance (native BNB + ERC20) của danh sách ví.

```typescript
export class WalletBalanceScanner {
  async start(params: {
    wallets: string[]
    tokens: string[]
    concurrency: number
    rpcUrl: string
  }): Promise<WalletBalanceAirdrop[]>
}
```

- Dùng `p-limit(concurrency)` để giới hạn request song song
- Với mỗi ví: gọi `provider.getBalance()` + `erc20.balanceOf()` cho từng token
- Lưu kết quả qua `electronAPI.writeSheetBalance()`

---

## src/hooks/useStorage.ts

**Vai trò:** Wrapper `localStorage` với JSON serialization, key scope theo `tabId`.

```typescript
const { setItem, getItem, removeItem, getKeyCacheByTabId } = useStorage()

setItem('key', { foo: 'bar' })          // localStorage.setItem với JSON.stringify
const val = getItem<{ foo: string }>('key')  // JSON.parse + type cast
removeItem('key')
getKeyCacheByTabId(tabId)               // tạo key `cache_${tabId}`
```

**Dùng trong:** `main-page.tsx` (persist form settings), `main.tsx` (persist tab list).

---

## src/hooks/useCountWallet.ts

**Vai trò:** Theo dõi số lượng ví đã quét và đã airdrop theo thời gian thực.

```typescript
const { walletCount, airdropCount, refetch } = useCountWallet(tokenAddress, contractAddress)
```

- Gọi `electronAPI.countSheet(token, contract)` mỗi 3 giây qua `setInterval`
- Re-setup interval khi `tokenAddress` hoặc `contractAddress` thay đổi
- Dừng interval khi component unmount

---

## src/hooks/useMemoryInfo.ts

**Vai trò:** Poll memory usage của Electron process mỗi 3 giây.

```typescript
const { memoryInfo, appPath } = useMemoryInfo()
// memoryInfo: Electron.ProcessMemoryInfo
// appPath: đường dẫn app
```

- Dùng trong `pages/main.tsx` để hiển thị RAM usage ở header tab

---

## src/redux/model.ts — StoreModel

```typescript
interface StoreModel {
  tabId: string   // ID của tab hiện tại
}
```

---

## src/redux/store.ts — Store Factory

```typescript
export type StorePayload = ReturnType<typeof getStore>

export const getStore = (id: string): StorePayload =>
  createStore<StoreModel>({ tabId: id })
```

- Mỗi tab gọi `getStore(tabId)` → tạo store độc lập
- Truyền vào `<StoreProvider store={store}>` trong `main.tsx`

---

## src/redux/hook.ts — Typed Hooks

```typescript
export const useStoreState = createStateHook<StoreModel>()
export const useStoreActions = createActionCreators<StoreModel>()

// Dùng trong component
const tabId = useStoreState((state) => state.tabId)
```

---

## src/utils/utils.ts — Helpers

```typescript
tryPrivateKeyToAddress(pk: string): string | null
// Thử convert private key → address, return null nếu invalid

shortenIfAddress(address: string, extraShort?: boolean): string
// '0x1234...5678' hoặc extraShort: '0x12...78'

formatEtherWithDecimals(value: BigNumber, decimals: number): string
// ethers.utils.formatUnits(value, decimals)

chainNetworkColor(name: string): string
// 'BSC' → '#F0B90B', 'ETH' → '#627EEA', ...

sleep(ms: number): Promise<void>
// await sleep(1000)
```

---

## src/utils/constants.ts — Config & Types

```typescript
PANCAKE_ADDRESS.BSC.Mainnet.{Router, Factory, WETH, RPC, Explorer}
PANCAKE_ADDRESS.BSC.Testnet.{Router, Factory, WETH, RPC, Token, Explorer}

TOKEN_ADDRESS = [
  { label: 'USDT', value: '0x55d398...' },
  { label: 'USDC', value: '0x8ac76a...' },
  { label: 'ETH',  value: '0x2170ed...' },
  { label: 'WBNB', value: '0xbb4CdB...' },
  { label: 'BTC',  value: '0x0555E3...' },
]

ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
ENVIRONMENT = 'Mainnet' | 'Testnet'
DEFAULT_PAGINATE_SIZE = 10

// Type declaration cho window.electronAPI
const electronAPI = window.electronAPI as { readSheet, writeSheet, ... }
```

---

## src/utils/colors.ts — Design System

```typescript
export const colors = {
  dark: { bg_nav, colors: [...] },
  light: { bg, colors: [...], neutrals: [...] },
  common: {
    primary, secondary,
    network: { BSC: '#F0B90B', ETH: '#627EEA', ... },
    state: { success, error, warning, info },
  }
}
```

---

## src/utils/toast.ts — Toast Helper

```typescript
logAsToast(...messages: string[]): void
// Hiển thị Chakra standalone toast (info) + console.log
```

---

## prisma/schema.prisma — Database Models

```prisma
model ScanContract {
  id        Int      @id @default(autoincrement())
  wallet    String                    // địa chỉ ví phát hiện
  contract  String                    // contract được tương tác
  balance   String?                   // balance tại thời điểm quét
  token     String?                   // ERC20 token address
  isAirdrop Boolean  @default(false)  // đã airdrop chưa
  createdAt DateTime @default(now())
}

model ScanBalance {
  id        Int      @id @default(autoincrement())
  wallet    String
  balance   String
  token     String
  createdAt DateTime @default(now())
}
```
