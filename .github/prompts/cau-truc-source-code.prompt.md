---
mode: agent
description: Cấu trúc toàn bộ source code dự án pancake-swap-tool — cây thư mục, phân tầng kiến trúc, IPC channels, database schema, build scripts
tools:
  - codebase
  - search
  - fetch
---

# Cấu trúc Source Code — pancake-swap-tool

Đây là Electron desktop app (BSC wallet scanner + airdrop tool). Dưới đây là toàn bộ cấu trúc file và vai trò của từng thư mục/file.

## Cây thư mục

```
pancake-swap-tool/
├── package.json                   — Dependencies, scripts (start/make/package/format)
├── tsconfig.json                  — TypeScript config
├── biome.json                     — Biome formatter + linter
├── forge.config.ts                — Electron Forge config (makers: squirrel, zip, deb, rpm)
├── webpack.main.config.ts         — Webpack bundle cho Electron main process
├── webpack.renderer.config.ts     — Webpack bundle cho renderer (React)
├── webpack.plugins.ts             — Webpack plugins dùng chung
├── webpack.rules.ts               — Loader rules (ts-loader, css-loader, node-loader)
├── credentials.json               — Runtime credentials (gitignored)
│
├── prisma/
│   ├── schema.prisma              — Prisma schema: SQLite, model ScanContract + ScanBalance
│   ├── client/                    — Pre-built Prisma client (commit sẵn để dùng khi package)
│   │   ├── index.js / index.d.ts
│   │   ├── query_engine-windows.dll.node   — Native engine Windows
│   │   ├── libquery_engine-darwin.dylib.node
│   │   └── runtime/
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20250903133955_init/migration.sql
│
└── src/
    ├── index.ts           — Electron Main Process (entry point)
    ├── preload.ts         — Electron preload script (IPC bridge → window.electronAPI)
    ├── app.tsx            — React root (ChakraProvider wrapper)
    ├── renderer.ts        — Renderer bootstrap (import CSS + render app)
    ├── web3.ts            — ethers.js factory helpers (provider, wallet, contracts)
    ├── index.html         — HTML shell được webpack inject
    ├── index.css          — Global CSS reset
    │
    ├── pages/
    │   └── main.tsx       — Multi-tab manager (antd Tabs editable-card + easy-peasy StoreProvider)
    │
    ├── components/
    │   └── main-page.tsx  — UI chính: Form quét contract + Form kiểm tra balance
    │
    ├── hooks/
    │   ├── useStorage.ts      — localStorage wrapper (JSON, key scope theo tabId)
    │   ├── useCountWallet.ts  — Đếm ví đã quét / đã airdrop (IPC countSheet)
    │   └── useMemoryInfo.ts   — Poll memory usage mỗi 3 giây (IPC getMemoryInfo)
    │
    ├── redux/
    │   ├── model.ts       — StoreModel: { tabId: string }
    │   ├── store.ts       — Factory getStore(id): tạo easy-peasy store per tab
    │   └── hook.ts        — Typed hooks: useStoreState, useStoreActions
    │
    └── utils/
        ├── scanContract.ts       — ContractScanner class (engine quét + airdrop)
        ├── scanWalletBalance.ts  — WalletBalanceScanner class (kiểm tra balance)
        ├── abi.ts                — ABIs: ERC20, Router PancakeSwap V2, Factory, Multicall
        ├── constants.ts          — PANCAKE_ADDRESS, TOKEN_ADDRESS, electronAPI types
        ├── toast.ts              — Chakra standalone toast wrapper
        ├── utils.ts              — Helpers: tryPrivateKeyToAddress, shortenIfAddress, formatEther...
        └── colors.ts             — Design system (dark/light theme palettes)
```

## Phân tầng kiến trúc

```
┌─────────────────────────────────────────────────────┐
│                  Renderer Process                    │
│  app.tsx → pages/main.tsx → components/main-page.tsx│
│  hooks/  ←→  redux/  ←→  utils/scan*.ts             │
│  window.electronAPI (preload bridge)                 │
└──────────────────┬──────────────────────────────────┘
                   │  IPC (contextBridge)
┌──────────────────▼──────────────────────────────────┐
│                  Main Process                        │
│  src/index.ts                                        │
│  ipcMain.handle('sheets:*', 'get-memory-info', ...)  │
│  PrismaClient ←→ SQLite (prisma/scan-wallet.sqlite)  │
└─────────────────────────────────────────────────────┘
```

## IPC Channels (preload.ts → index.ts)

| Channel | Direction | Mô tả |
|---|---|---|
| `sheets:read` | renderer → main | Lấy danh sách ví chưa airdrop |
| `sheets:write` | renderer → main | Lưu ví mới vào DB |
| `sheets:writeBalance` | renderer → main | Lưu balance của ví |
| `sheets:check` | renderer → main | Kiểm tra ví đã tồn tại chưa |
| `sheets:count` | renderer → main | Đếm tổng / đã airdrop |
| `sheets:save` | renderer → main | Xuất CSV |
| `sheets:import` | renderer → main | Import CSV |
| `sheets:deleteAll` | renderer → main | Xoá toàn bộ record |
| `sheets:deleteAirdrop` | renderer → main | Xoá record đã airdrop |
| `get-memory-info` | renderer → main | Lấy memory stats |
| `open-link` | renderer → main | Mở URL ngoài browser |
| `set-progress-bar` | renderer → main | Update taskbar progress |
| `message` | main → renderer | Gửi thông báo log tới UI |

## Database Schema (SQLite)

```prisma
model ScanContract {
  id        Int      @id @default(autoincrement())
  wallet    String                          // địa chỉ ví phát hiện
  contract  String                          // contract được tương tác
  balance   String?                         // balance tại thời điểm quét
  token     String?                         // ERC20 token address
  isAirdrop Boolean  @default(false)        // đã airdrop chưa
  createdAt DateTime @default(now())
}

model ScanBalance {
  id        Int      @id @default(autoincrement())
  wallet    String                          // địa chỉ ví
  balance   String                          // balance (raw string)
  token     String                          // token address
  createdAt DateTime @default(now())
}
```

## Scripts

```bash
yarn start    # Dev (Electron Forge + webpack hot reload)
yarn package  # Build app (unpackaged binary)
yarn make     # Build + tạo installer (Squirrel .exe / .zip / deb / rpm)
yarn format   # Biome format + lint fix
yarn lint     # ESLint check
```

## Database Location

| Mode | Path |
|---|---|
| Development | `prisma/scan-wallet.sqlite` (project root) |
| Packaged | `resources/prisma/scan-wallet.sqlite` (next to .exe) |
