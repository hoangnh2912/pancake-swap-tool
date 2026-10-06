# Plan — Bước "Fake Volume" trước khi swap

Nguồn: `SPEC.md`. Không có test framework tự động cho `automationService.ts` (on-chain flow) —
verification = `tsc --noEmit --skipLibCheck` sạch + đối chiếu logic bằng tay theo Acceptance
Criteria trong SPEC §4 (per SPEC §5 testing strategy) + verify thủ công trên BSC Testnet.

## Quyết định mặc định cho 3 điểm "Hỏi trước" trong SPEC §6 (chốt để làm, có thể đổi)

1. **Vị trí UI field:** đặt section mới "FAKE VOLUME (TRƯỚC KHI SWAP)" ngay **trên** block "Swap
   Commands" hiện có trong `main.tsx` — đúng thứ tự luồng chạy thật (4 → 4.1 → fake volume → 5.1).
2. **Soft-cap cảnh báo `times`:** hiển thị dòng cảnh báo nhỏ màu vàng khi `times > 10`
   ("mỗi vòng = 2 lần swap thật, tốn gas thật — cân nhắc số vòng lớn"), KHÔNG chặn Start.
3. **Tên step trong Steps UI:** đổi từ đề xuất "4.5" trong SPEC → **"4.2 Fake Volume"** — khớp
   đúng convention số đang dùng (`4. Add Liquidity` → `4.1 Transfer token mới cho ví đã quét` →
   `4.2 Fake Volume` → `5.1 Chạy lệnh swap`), nhất quán hơn "4.5" đứng cạnh "4.1".

## Điểm neo trong code hiện tại (đã verify, dùng làm căn cứ sửa chính xác)

- `src/utils/automationService.ts:326-333` — nhánh resume: set `statuses[0..4]` finish,
  `currentStep=4`, rồi **fall-through** (không `return`/`continue`) xuống đúng chỗ step mới sẽ
  chèn → Fake Volume tự động chạy lại cho cả token resume lẫn token full-deploy, không cần
  nhánh riêng.
- `src/utils/automationService.ts:564-568` — điểm hội tụ chính xác giữa 2 nhánh
  (deploy-mới / resume): dòng 564 `onStepChange(token.id, 4, 'finish')` đóng step "4.1", dòng
  566 `}` đóng khối if/else, dòng 568 bắt đầu comment "Steps 5.1 + 5.2". **Chèn step Fake Volume
  giữa dòng 566 và 568.**
- Mapping `statuses[]` hiện tại (UI `main.tsx:1852-1872`) ↔ `onStepChange(token.id, N, ...)`:
  statuses[0]=Deploy, [1]=Whitelist, [2]=Mint-transfer, [3]=Add Liquidity, [4]=4.1 (scan-clear),
  [5]=5.1 Swap, [6]=5.2 Scan&Airdrop, [7]=6. Mint+Bán90%, [8]=7. Chuyển BNB.
- Step mới chiếm **index 5**, mọi thứ từ 5 trở đi lùi +1. Các điểm PHẢI sửa (đã grep, danh sách
  đóng — không duyệt lại toàn file, chỉ sửa đúng các dòng này):
  - `onStepChange(token.id, 5, 'process')` dòng 570 → `6`
  - `onStepChange(token.id, 6, 'process')` dòng 571 → `7`
  - `onStepChange(token.id, 5, 'finish')` dòng 923 → `6`
  - `onStepChange(token.id, 6, 'finish')` dòng 924 → `7`
  - `onStepChange(token.id, 7, 'process')` dòng 935 → `8`
  - `onStepChange(token.id, 7, 'finish')` dòng 1012 → `8`
  - `onStepChange(token.id, 8, 'process')` dòng 1017 → `9`
  - `onStepChange(token.id, 8, 'finish')` dòng 1044 → `9`
  - `currentStep = 5` dòng 569 → `6`
  - `currentStep = 7` dòng 934 → `8`
  - `currentStep = 8` dòng 1016 → `9`
  - Dòng 1060 `onStepChange(token.id, currentStep, 'error')` dùng biến — tự đúng nếu các gán
    `currentStep` ở trên đã sửa đủ, không cần sửa trực tiếp dòng này.
  - (Số dòng là snapshot hiện tại — Task 2 phải `grep -n "onStepChange(token.id"` lại trước khi
    sửa để chắc không bị lệch do các edit trước đó trong cùng task.)

## Task 1 — Schema + contract source (nền tảng, không có hành vi mới) — DONE

- [x] `schema.zmodel`: thêm vào model `Config` (`fakeVolumeEnabled/Times/BnbAmount/Address`).
- [x] `yarn generate` + `yarn db:push` — chạy sạch, verify qua `sqlite3 ".schema Config"` thấy đủ
      4 cột mới.
- [x] File mới `src/utils/fakeVolumeContract.ts`: copy nguyên văn source Solidity từ
      `swap-ref.txt`, export default `FAKE_VOLUME_CONTRACT` (string) — theo đúng cách
      `defaultContract.ts` export `DEFAULT_CONTRACT`.
- [x] Xoá `swap-ref.txt` ở root sau khi copy xong.
- **Verify:** `tsc --noEmit` sạch. Test compile bằng script Node gọi thẳng `solc` (cùng gói +
  cùng input-shape `index.ts` dùng) → PASS, contract `FakeVolume` compile ra 7 abi entries,
  bytecode 10406 ký tự hex. **Phát hiện quan trọng:** `owner` trong contract là `private`, KHÔNG
  có getter `owner()` — đã sửa Task 2 bên dưới dùng `callStatic.withdraw()` thay vì `owner()`.
- **Depends on:** none.

## Task 2 — `automationService.ts`: deploy/cache + chạy step Fake Volume — DONE

- [ ] `AutomationParams`: thêm `fakeVolumeEnabled?: boolean`, `fakeVolumeTimes?: number`,
      `fakeVolumeBnbAmount?: string`, `fakeVolumeAddress?: string | null`,
      `onFakeVolumeDeployed?: (address: string) => void` (callback để `main.tsx` persist địa chỉ
      mới deploy — theo đúng pattern callback đã có, vd `onStepChange`, `onLog`).
- [ ] Trước vòng lặp `for (const token of params.tokens)` (đầu `runAutomation`, nếu
      `fakeVolumeEnabled`): resolve `fakeVolumeAddress` — nếu có sẵn, verify còn dùng được bằng
      `callStatic.withdraw()` (bọc try/catch) — **không dùng `owner()`**, `owner` trong contract
      là `private`, không có getter; `callStatic.withdraw()` revert nếu `swapWallet` không phải
      owner (đúng ownership check, không tốn gas thật, không cần balance). Fail → coi như chưa
      có; nếu không có/fail → deploy mới bằng `swapWallet` (constructor nhận `chainId`), gọi
      `onFakeVolumeDeployed`. Biến địa chỉ cuối cùng dùng chung cho toàn bộ token trong loop
      (không deploy lại mỗi token).
      _(Phát hiện lúc verify compile Task 1 — kế hoạch gốc đề `owner()` là sai, đã sửa.)_
- [ ] Chèn block mới giữa dòng 566/568 hiện tại (xem "Điểm neo" ở trên — grep lại trước khi sửa):
      `currentStep = 5; onStepChange(token.id, 5, 'process')` → nếu disabled/thiếu params → log
      bỏ qua + `onStepChange(token.id, 5, 'finish')` luôn; nếu enabled → gửi BNB
      (`swapWallet.sendTransaction`) → `await tx.wait()` → gọi `swap(contractAddress, times,
      parseEther(amount), {gasLimit, gasPrice})` → `await tx.wait()` → `withdraw()` (bắt buộc,
      lỗi thì throw) → `withdrawToken(contractAddress)` (bọc try/catch riêng, lỗi chỉ log warning
      không throw) → `onStepChange(token.id, 5, 'finish')`.
- [ ] Sửa 8 `onStepChange` + 3 `currentStep` theo bảng mapping ở trên (5→6, 6→7, 7→8, 8→9).
- [ ] Log mọi tx bước này qua `onLog` prefix `[4.2]` (khớp quyết định đổi tên ở trên).
- **Verify:** `tsc --noEmit` sạch. `grep -n "onStepChange(token.id\|currentStep = "` lại toàn bộ
  → xác nhận chuỗi index liên tục 0,1,2,3,4,5(mới),6,7,6,7,8,9 không trùng/sót (đã đối chiếu bằng
  mắt, khớp).
- **Depends on:** Task 1 (dùng `FAKE_VOLUME_CONTRACT` để compile ra bytecode/abi lúc deploy —
  thực ra compile xảy ra ở Task 3/main.tsx, Task 2 chỉ nhận `fakeVolumeAbi/Bytecode` qua params).

## Task 3 — `main.tsx`: UI, validate, wiring — DONE

- [ ] State mới: `fakeVolumeEnabled`, `fakeVolumeTimes`, `fakeVolumeBnbAmount` (load/save qua
      `scheduleSave`/`cfg.fakeVolume*` theo đúng pattern các field khác, vd `scanDelay`).
- [ ] Section UI mới "FAKE VOLUME (TRƯỚC KHI SWAP)" — vị trí: ngay trên block "Swap Commands"
      (quyết định ở trên). Switch bật/tắt + `InputNumber` số vòng (min=1) + `Input` BNB mỗi vòng.
      Cảnh báo text khi `times > 10` (không chặn).
- [ ] `handleStart`: validate khi `fakeVolumeEnabled` — `times > 0` và `bnbAmount` parse được
      `> 0`, thiếu thì `message.error` + chặn, không gọi `runAutomation` (theo đúng pattern
      validate `scanContracts`/`disperseAmount` hiện có).
- [ ] Build `params` truyền vào `runAutomation`: thêm `fakeVolumeEnabled`, `fakeVolumeTimes`
      (Number), `fakeVolumeBnbAmount`, `fakeVolumeAddress` (đọc từ Config hiện tại),
      `onFakeVolumeDeployed: (addr) => scheduleSave({ fakeVolumeAddress: addr })` (persist ngay,
      không đợi hết batch — nếu lỗi giữa chừng vẫn giữ được địa chỉ đã deploy).
- [ ] `Steps` items array (`main.tsx` khu vực đã xác định dòng ~1852-1872): chèn
      `{ title: '4.2 Fake Volume', status: statuses[5] }` giữa entry "4.1" và "5.1 Chạy lệnh
      swap"; đổi `statuses[5..8]` của 4 entry còn lại (5.1, 5.2, 6., 7.) → `statuses[6..9]`.
- [ ] `initialSteps` (chỗ khởi tạo mảng `statuses` toàn `'wait'`/resume `'finish'` khi bấm Start —
      đã sửa ở feature Resume trước đó): tăng độ dài mảng từ 9 → 10 phần tử.
- **Verify:** `tsc --noEmit` sạch (3 lần, sau mỗi nhóm thay đổi). `yarn package` build qua không
  lỗi webpack (241.84s, exit 0, "SUCCESS Packaging application").
  _(Lệch nhỏ so với plan: `onFakeVolumeDeployed` dùng `getElectron()?.saveConfig(...)` persist
  NGAY lập tức thay vì `scheduleSave` debounce 800ms — an toàn hơn cho 1 sự kiện quan trọng xảy
  ra 1 lần, tránh bị patch khác đè mất do `scheduleSave` không merge patch khi gọi dồn dập.)_
  _(Phát hiện thêm: statuses[4] "4.1" đang bị comment `/* TEMPORARILY DISABLED */` trong Steps UI
  từ trước — không phải do task này. "4.2 Fake Volume" chèn NGAY SAU block comment đó, statuses[5]
  — không cần bật lại 4.1 để làm việc này.)_
- **Depends on:** Task 2 (field name `AutomationParams` phải khớp).
- **Chưa verify on-chain thật** — sang Task 4 (cần ví/BNB testnet thật, phải do user chạy tay).

## Task 4 — Verify thủ công trên BSC Testnet (chainId 97)

- [ ] Case AC#1 (SPEC §4): bật Fake Volume, `times=2`, `amount=0.001` BNB, token mới (chưa có
      `fakeVolumeAddress`) → xác nhận log `[4.2]` đủ các bước, Steps UI chuyển đúng thứ tự.
- [ ] Case AC#2: chạy token thứ 2 cùng batch → xác nhận dùng lại contract cũ, không deploy lại.
- [ ] Case AC#3: tắt Fake Volume → xác nhận không có log `[4.2]`, hành vi y hệt trước khi thêm
      tính năng (so với 1 lần chạy test trước khi có Task 1-3, hoặc đối chiếu code review).
- [ ] Case AC#5: sau khi `[4.2]` xong, check balance contract `FakeVolume` trên BscScan testnet =
      0 (cả BNB lẫn token).
- [ ] Case AC#6: giả lập `swap()` revert (vd đặt `times` hợp lệ nhưng pool thanh khoản quá thấp
      so với `amount`) → xác nhận token dừng `status='error'`, KHÔNG tự chạy tiếp step 5.
- **Verify:** đối chiếu từng case với SPEC §4 Acceptance Criteria, tick đủ cả 6 AC (AC#4 đã verify
  ở Task 3).
- **Depends on:** Task 1, 2, 3 đều xong.
- **Checkpoint cuối:** chỉ báo tính năng "production-ready" sau khi cả 6 AC pass trên testnet —
  KHÔNG tự ý coi là xong chỉ dựa vào `tsc` sạch (giống lưu ý đã ghi trong plan Resume trước đó).

## Ngoài phạm vi (đã note trong SPEC §3, nhắc lại để không lan sang khi code)

Không cap cứng gas cho `times` lớn, không đổi `gasPrice`, không thêm bảng DB log riêng cho lịch
sử fake-volume, không tự xử lý trường hợp đổi RPC/chain giữa các lần chạy (tự fail-and-redeploy
là đủ, không cần logic riêng).
