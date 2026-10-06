# Todo — Bước "Fake Volume" trước khi swap

Chi tiết đầy đủ + acceptance criteria: `tasks/plan.md` (nguồn: `SPEC.md`).

- [x] **Task 1** — Schema (`schema.zmodel` + generate/db:push) + `src/utils/fakeVolumeContract.ts`
      (copy source từ `swap-ref.txt`, xoá file tạm sau). Verify: compile qua solc script OK (phát
      hiện `owner` private, không có getter — đã cập nhật Task 2 dùng `callStatic.withdraw()`).
- [ ] **Task 2** — `automationService.ts`: deploy/cache contract (1 lần/batch, owner=swapWallet) +
      chèn step "4.2 Fake Volume" (index 5) giữa dòng 566/568 hiện tại + shift index 5→6→7→8→9
      cho 8 `onStepChange` + 3 `currentStep` theo bảng trong plan.md. Verify: tsc sạch, grep xác
      nhận không sót index cũ.
- [ ] **Task 3** — `main.tsx`: field UI (switch + times + bnbAmount) trên block Swap Commands,
      validate khi bật, wiring `params` + `onFakeVolumeDeployed`, thêm entry Steps UI, tăng
      `initialSteps` 9→10. Verify: tsc sạch, `yarn package` sạch, validate chặn đúng khi thiếu
      input.
- [ ] **Task 4** — Verify thủ công BSC Testnet, tick đủ 6 Acceptance Criteria (SPEC §4).

Checkpoint sau mỗi task — dừng xác nhận trước khi sang task kế (xem chi tiết lý do trong
plan.md). KHÔNG coi tính năng xong khi mới tsc sạch — phải pass Task 4 trên testnet.
