# SPEC — Resume automation cho token bị lỗi (retry per-token)

## 1. Objective

**Vấn đề khách báo (nguyên văn, đã phân tích):**
> Đang chạy 24/24 token, 1 token bị lỗi giữa chừng (ví dụ bước swap không thực hiện được) →
> automation dừng hẳn token đó, báo lỗi. Khách phải chạy lại nhưng **không muốn mất tiến độ**:
> không muốn deploy lại contract (đã tốn gas), không muốn mất ví đã quét được (`ScanWallet` cũ),
> và không cần retry đúng lệnh swap bị lỗi — chỉ cần chạy lại toàn bộ danh sách lệnh swap từ đầu.

**Mục tiêu:** Khi 1 token có `status = 'error'` (đã có `contractAddress` — tức đã deploy xong),
bấm nút chạy chung ("Bắt đầu Automation") sẽ **resume** riêng token đó thay vì chạy lại từ đầu:

- **Bỏ qua** step 0–4 (Deploy & Initialize, Set Whitelist, Transfer Token mint wallet, Add
  Liquidity, Clear+transfer ví đã quét) — dùng lại `contractAddress` đã có.
- **Chạy lại** step 5.1 (swap — luôn bắt đầu từ lệnh đầu tiên trong danh sách, không phải lệnh bị
  lỗi) + 5.2 (quét & airdrop) song song như luồng bình thường, rồi tiếp tục 6 (mint thêm + bán
  90%) và 7 (chuyển BNB về ví chủ) — tức resume chạy tiếp **hết pipeline còn lại**, không dừng
  giữa chừng.
- **Không xoá** `ScanWallet` cũ của token đó khi resume (hiện code đang `deleteMany` mỗi lần chạy
  — xem Finding bên dưới).

Token có `status = 'idle'` (chưa từng chạy) vẫn chạy full pipeline từ step 0 như hiện tại. Token
có `status = 'success'` không bị động tới khi bấm lại nút chạy chung (không tự re-run).

## 2. Finding trong code hiện tại (căn cứ để sửa)

`src/utils/automationService.ts:475-481` — mỗi lần `runAutomation` chạy (kể cả full run bình
thường), có đoạn:

```ts
if (hasScanConfig) {
    const scanAddrs = params.scanContracts.map((c) => c.address).filter(Boolean)
    await zenStackFunction('ScanWallet' as any, 'deleteMany', {
        where: { wallet: { in: scanAddrs } },
    })
    onLog('[1.1] ✓ Cleared scan records')
}
```

Đây chính là chỗ xoá "ví tổng quét cũ" mà khách không muốn mất khi resume. Khi resume phải
**skip toàn bộ step 4 (bao gồm deleteMany này)**, không chỉ riêng dòng deleteMany.

`src/pages/main.tsx:704-714` — `handleStart` hiện tại reset **toàn bộ** tokens về `idle` và xoá
`contractAddress` trước khi chạy:

```ts
setTokens((prev) =>
    prev.map((r) => ({ ...r, status: 'idle' as RowStatus, contractAddress: undefined, errorMsg: undefined }))
)
```

Việc này xoá mất `contractAddress` cần để resume — phải sửa để chỉ reset các row sẽ chạy lại từ
đầu (status hiện tại là `idle`), giữ nguyên `contractAddress` của row `error` (sẽ dùng để resume),
và không đụng tới row `success`.

## 3. Phạm vi thay đổi

### 3.1 `src/utils/automationService.ts`

- `AutomationParams['tokens']` items thêm optional field trên mỗi token (hoặc tương đương):
  `resumeContractAddress?: string` — nếu có giá trị này, coi token đó là đang resume.
- Trong vòng lặp `for (const token of params.tokens)`:
  - Nếu `token.resumeContractAddress` có giá trị:
    - Bỏ qua toàn bộ khối step 0 → step 4 (deploy proxy, initialize, whitelist, mint-transfer,
      add liquidity, clear scan records).
    - Gán trực tiếp `contractAddress = token.resumeContractAddress` và
      `deployed = new ethers.Contract(contractAddress, params.abi, mainWallet)`.
    - Gọi `onStepChange(token.id, 0..4, 'finish')` ngay lập tức để UI Steps hiển thị các bước đã
      xong (không hiển thị `wait`/`process` cho các bước không chạy lại).
    - Log rõ ràng: `onLog(\`[resume] Bỏ qua deploy — dùng lại contract đã có: ${contractAddress}\`)`.
  - Nếu không có `resumeContractAddress`: giữ nguyên logic hiện tại (deploy full từ đầu).
  - Từ step 5.1 trở đi (swap, scan/airdrop, sell 90%, transfer BNB) logic **giữ nguyên 100%** —
    không cần thay đổi gì, vì:
    - `run51` vốn đã luôn bắt đầu từ `i = 0` (lệnh swap đầu tiên) mỗi lần được gọi → tự nhiên thoả
      yêu cầu "chạy lại lệnh swap đầu tiên, không retry lệnh bị lỗi".
    - `run52` (scan+airdrop) đọc `ScanWallet` hiện có từ DB làm điểm khởi đầu dedupe
      (`Pre-loaded N ví đã quét từ DB`) — vì dữ liệu cũ không bị xoá, hành vi này tự động đúng.
- Không thay đổi hành vi hiện tại của full-run bình thường (deleteMany scan records vẫn giữ
  nguyên khi **không** resume — ngoài phạm vi yêu cầu này).

### 3.2 `src/pages/main.tsx`

- `handleStart`:
  - Xác định tập token sẽ chạy trong lần bấm này:
    - `status === 'idle'` (hoặc chưa từng set) → full run, reset `contractAddress`/`errorMsg` về
      `undefined` như hiện tại.
    - `status === 'error'`:
      - Nếu có `contractAddress` → resume (giữ nguyên `contractAddress`, chỉ reset
        `status → 'running'`, giữ nguyên `errorMsg` cho tới khi có kết quả mới).
      - Nếu KHÔNG có `contractAddress` (lỗi xảy ra trước khi deploy xong) → full run như token
        `idle` (deploy lại từ đầu, theo quyết định đã chốt).
    - `status === 'success'` → **không** đưa vào danh sách chạy, giữ nguyên nguyên trạng, không
      gọi `runAutomation` cho token này.
  - Validate (`valid = tokens.filter(...)`) áp dụng như cũ nhưng chỉ trên tập token sẽ chạy ở
    trên (loại `success` ra trước khi validate/filter).
  - Khi build `params.tokens` truyền vào `runAutomation`, với token đang resume thêm
    `resumeContractAddress: token.contractAddress`.
  - `initialSteps` (cho `Steps` UI): với token resume, khởi tạo statuses = `['finish','finish',
    'finish','finish','finish','wait','wait','wait','wait']` (5 bước đầu coi như xong) thay vì
    toàn bộ `'wait'` như hiện tại — để UI không "giật lùi" hiển thị lại các bước đã hoàn thành.
  - Nếu tất cả token đều `success` (không còn gì để chạy) khi bấm nút chung → báo
    `message.info('Không có token nào cần chạy lại — tất cả đã hoàn thành')` và không gọi
    `runAutomation`.

## 4. UI/UX không đổi

- Không thêm nút riêng per-row — dùng chung nút "Bắt đầu Automation" hiện có (quyết định đã chốt
  với user), tool tự phân loại theo `status` của từng row.
- `Steps` chi tiết theo token (đoạn hiển thị `1. Deploy & Initialize` … `7. Chuyển BNB về ví chủ`)
  không đổi cấu trúc, chỉ đổi trạng thái khởi tạo khi resume (xem 3.2).

## 5. Ngoài phạm vi / giới hạn đã biết

- `contractAddress`/`status` của `TokenRow` hiện **không được persist** vào config
  (`tokensJson` chỉ lưu các field khác — xem `Omit<TokenRow, 'status' | 'contractAddress' |
  'errorMsg'>` tại chỗ load config). Nghĩa là nếu tool bị đóng/reload trước khi bấm resume,
  `contractAddress` sẽ mất và token đó buộc phải chạy lại từ đầu (deploy mới). Đây là giới hạn đã
  biết, **không sửa trong spec này** (không được yêu cầu, và persist private-key-liên-quan-context
  cần cân nhắc riêng).
- Không đổi hành vi xoá `ScanWallet` khi chạy full run bình thường (không resume) — chỉ chặn xoá
  khi đang resume.

## 6. Acceptance Criteria

1. Chạy 1 token thành công (`status = 'success'`) → bấm nút chạy chung lần nữa → token đó KHÔNG
   chạy lại (không gọi lại `runAutomation` cho nó), giữ nguyên `contractAddress`/log cũ.
2. Chạy token, cho lỗi giả lập ở bước 5.1 (swap) → `status = 'error'`, `contractAddress` vẫn còn
   trên row → bấm nút chạy chung → token đó:
   - Log hiển thị `[resume] Bỏ qua deploy — dùng lại contract đã có: 0x...`.
   - Steps UI: bước 1–5 (index 0-4) hiển thị `finish` ngay, không chạy lại on-chain tx nào cho
     deploy/whitelist/mint-transfer/liquidity.
   - Step 5.1 chạy lại từ lệnh swap đầu tiên trong danh sách (không phải lệnh bị lỗi).
   - `ScanWallet` rows có sẵn trong DB cho token đó (nếu có) vẫn còn nguyên, không bị `deleteMany`.
   - Nếu chạy hết không lỗi tiếp → tiếp tục step 6 (mint+bán 90%) và step 7 (chuyển BNB) tự động,
     `status` cuối cùng → `'success'`.
3. Token lỗi trước khi có `contractAddress` (ví dụ lỗi compile hoặc lỗi ngay bước deploy) → bấm
   chạy lại → chạy full pipeline từ step 0 (deploy mới), y như token `idle`.
4. Full run bình thường (không có token nào `error`/`success` từ trước, toàn bộ `idle`) → hành vi
   không đổi so với hiện tại.

## 7. Testing strategy

Không có test suite tự động hiện có cho `automationService.ts` (chạy on-chain, khó unit test).
Verify thủ công theo Acceptance Criteria bằng `yarn start` trên BSC Testnet (chainId 97):
- Case 2 giả lập lỗi: tạm set `slippagePct` cực thấp hoặc balance không đủ để 1 lệnh swap trong
  step 5.1 revert có chủ đích, xác nhận token dừng đúng, sau đó verify resume theo AC #2.
- Kiểm tra bằng mắt cột `Steps` + đọc log console, đối chiếu DB (`ScanWallet`) trước/sau qua
  `yarn generate` hooks hoặc query trực tiếp SQLite.

`tsc --noEmit --skipLibCheck` phải sạch sau khi sửa (không lỗi `src/`).

## 8. Boundaries

- **Luôn làm:** giữ nguyên logic on-chain hiện có cho từng step (không đổi thứ tự, không đổi gas
  limit/gas price hiện tại) — chỉ thêm nhánh rẽ resume/skip, không refactor lại phần deploy.
- **Hỏi trước:** nếu phát hiện cần đổi cấu trúc `AutomationParams` theo cách phá vỡ tương thích
  lớn (ví dụ đổi `tokens` từ mảng object sang shape khác) — báo lại trước khi làm.
- **Không bao giờ:** không thêm logic tự động retry vô hạn (không tự động resume khi lỗi — vẫn
  cần user bấm nút thủ công như hiện tại). Không đổi hành vi xoá `ScanWallet` của full-run bình
  thường.
