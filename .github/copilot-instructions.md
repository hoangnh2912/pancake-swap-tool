# Copilot Instructions — pancake-swap-tool

## Tổng quan dự án

Đây là **Electron desktop app** để quét ví BSC, phát hiện ví tương tác với smart contract ERC20, lưu vào SQLite và tự động airdrop token hàng loạt.

**Stack chính:**
- Electron 28 + React 18 + TypeScript
- antd 5 (UI) + Chakra UI 2 (layout/toast)
- ethers v5 (blockchain BSC)
- Prisma 6 + SQLite (database, chỉ dùng trong main process)
- easy-peasy (state management per-tab)
- Electron Forge + webpack (build)

## Skills có sẵn

Dùng các skills sau khi cần tra cứu hoặc làm việc với codebase:

- **[/cau-truc-source-code](.github/prompts/cau-truc-source-code.prompt.md)** — Cây thư mục đầy đủ, phân tầng kiến trúc Main/Renderer, IPC channels, database schema, scripts
- **[/mo-ta-components](.github/prompts/mo-ta-components.prompt.md)** — Mô tả chi tiết từng file/class: vai trò, API public, flow hoạt động, ví dụ code
- **[/thu-vien-su-dung](.github/prompts/thu-vien-su-dung.prompt.md)** — Tất cả thư viện (ethers, prisma, antd, easy-peasy...) với ví dụ sử dụng thực tế

## Coding Conventions

- **Language:** TypeScript strict mode, không dùng `any` trừ bắt buộc
- **Formatter:** Biome (`yarn format`) — không dùng Prettier
- **IPC:** Renderer KHÔNG gọi Prisma trực tiếp — luôn qua `window.electronAPI` (preload bridge)
- **ethers version:** v5 — dùng `ethers.providers.JsonRpcProvider`, `ethers.BigNumber` (không phải v6 API)
- **State:** Mỗi tab có store easy-peasy riêng — không dùng global state
- **Database:** Chỉ truy cập Prisma trong `src/index.ts` (main process)
- **Concurrency:** Dùng `p-limit` để giới hạn số lượng concurrent blockchain calls

## Lưu ý quan trọng

- `prisma/client/` đã được commit sẵn (pre-built) để dùng khi package app — không xoá
- Native `.node` files (Prisma engine, sqlite3) được handle bởi `node-loader` và `@vercel/webpack-asset-relocator-loader`
- Database path khác nhau giữa dev và packaged (xem `src/index.ts` dòng khởi tạo PrismaClient)
- Contract ABI trong `src/utils/scanContract.ts` là ABI của token contract target (có custom `airdrop(address[], uint256)` function)
