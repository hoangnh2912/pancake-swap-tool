# Plan — Resume automation cho token bị lỗi

Nguồn: `SPEC.md`. Không có test framework tự động cho `automationService.ts` (on-chain flow) —
verification = `tsc --noEmit --skipLibCheck` sạch + đối chiếu logic bằng tay theo Acceptance
Criteria trong SPEC §6 (per SPEC §7 testing strategy).

## Task 1 — `automationService.ts`: thêm nhánh resume — DONE (commit fc7a7bf)

- [x] `AutomationParams['tokens']` item: thêm optional `resumeContractAddress?: string`.
- [x] Trong loop `for (const token of params.tokens)`: nếu `token.resumeContractAddress` có giá
      trị → bỏ qua step 0-4 (deploy proxy/initialize/whitelist/mint-transfer/add liquidity/clear
      scan records), set `contractAddress` + `deployed` từ địa chỉ có sẵn, gọi
      `onStepChange(token.id, 0..4, 'finish')`, log `[resume] Bỏ qua deploy — dùng lại contract đã có: ...`.
- [x] Guard `deleteMany` ScanWallet (dòng ~475-481 hiện tại) chỉ chạy khi KHÔNG resume.
- [x] Không đổi gì ở step 5.1 trở đi.
- Verify: `tsc --noEmit --skipLibCheck` sạch phần `automationService.ts`. Đọc lại code trace theo
  SPEC §6 AC #2 và #4 bằng tay.
- Depends on: none.

## Task 2 — `main.tsx`: `handleStart` phân loại resume/full/skip — DONE (commit 8d02bfb)

- [x] Trước khi chạy: phân loại `tokens` thành 3 nhóm theo `status`: `idle` → full run (reset
      `contractAddress`/`errorMsg`), `error` có `contractAddress` → resume (giữ
      `contractAddress`, set `resumeContractAddress` khi build params), `error` không có
      `contractAddress` → full run như `idle`, `success` → loại khỏi danh sách chạy, không đụng.
- [x] Nếu danh sách chạy rỗng (toàn bộ `success`) → `message.info(...)`, không gọi
      `runAutomation`.
- [x] `initialSteps`: token resume khởi tạo statuses = 5 bước đầu `'finish'`, còn lại `'wait'`;
      token full run giữ nguyên toàn bộ `'wait'` như cũ.
- [x] Build `params.tokens` truyền vào `runAutomation` gồm `resumeContractAddress` cho token đang
      resume.
- Verify: `tsc --noEmit --skipLibCheck` sạch phần `main.tsx`. Đối chiếu SPEC §6 AC #1, #2, #3, #4
  bằng tay (đọc code, không có UI test tự động).
- Depends on: Task 1 (field name `resumeContractAddress` phải khớp).

**Manual on-chain verify (testnet) — CHƯA làm, cần user tự test theo SPEC §7 trước khi coi tính
năng production-ready.**

## Ngoài phạm vi

Không đổi hành vi full-run bình thường, không thêm nút riêng, không persist
`contractAddress`/`status` vào config (theo SPEC §5).
