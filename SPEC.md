# SPEC — Bước "Fake Volume" trước khi swap

## 1. Objective

**Yêu cầu khách (nguyên văn, đã phân tích từ chat + file `swap-ref.txt` khách gửi):**
> Thêm 1 bước fake volume — giống hồi xưa — chèn SAU khi add liquidity (step 4), TRƯỚC khi chạy
> các lệnh swap (step 5.1). Luồng: chuyển BNB vào trong 1 contract riêng → contract thực thi
> fake swap (mua/bán qua lại Router nhiều vòng) → xong thì rút hết (BNB/token còn lại) về ví
> swap → rồi mới chuyển qua chạy các lệnh swap đã cấu hình như bình thường.

**Xác nhận cơ chế (từ `swap-ref.txt`, KHÔNG phải kiểu "fake event" như `airdrop()` hiện có):**
Hợp đồng `FakeVolume` riêng biệt (không phải sửa `defaultContract.ts`/TOKEN1997), swap **THẬT**
qua PancakeSwap Router — có gas thật + slippage thật mỗi vòng, volume ghi nhận thật trên
Dexscreener/DEXTools.

```solidity
contract FakeVolume {
    IPancakeRouter public router;      // chọn theo chainId (97 testnet / mainnet default)
    address private owner;

    function withdraw() public onlyOwner { payable(owner).transfer(address(this).balance); }
    function withdrawToken(address token) public onlyOwner { IERC20(token).transfer(owner, IERC20(token).balanceOf(address(this))); }
    receive() external payable {}

    function swap(address token, uint256 times, uint256 amount) public onlyOwner {
        // not payable — tiêu BNB ĐÃ nằm sẵn trong contract (nhận qua receive())
        for (uint256 i = 0; i < times; i++) {
            // buy bằng amountIn hiện có (lần đầu = amount param)
            uint[] memory outWT = router.swapExactETHForTokens{value: amountIn}(0, pathWT, address(this), ...);
            amountIn = outWT[1];
            // sell TOÀN BỘ token vừa mua, trả về BNB
            uint[] memory outTW = router.swapExactTokensForETH(amountIn, 0, pathTW, address(this), ...);
            amountIn = outTW[1];
        }
    }
}
```

**Lưu ý quan trọng rút ra từ code:** mỗi vòng lặp LUÔN kết thúc bằng SELL (bán hết token vừa mua
về BNB) → sau `times` vòng, contract giữ **BNB**, không giữ token. `withdrawToken()` vẫn gọi thêm
cho an toàn (dust token do làm tròn), nhưng nguồn rút chính là `withdraw()` (BNB).

## 2. Phạm vi thay đổi

### 2.1 Hợp đồng — file mới `src/utils/fakeVolumeContract.ts`

- Copy nguyên văn source Solidity từ `swap-ref.txt` (đã verify ở trên), export dạng string giống
  cách `defaultContract.ts` export `DEFAULT_CONTRACT`/ABI — đặt tên `FAKE_VOLUME_CONTRACT` +
  `FAKE_VOLUME_ABI` (constructor, `swap`, `withdraw`, `withdrawToken`, `transferOwnership`,
  `owner`).
- Compile qua `window.electron.compileContract` (IPC có sẵn, dùng lại solc cache) — KHÔNG cần
  sửa `src/index.ts` (API `compile-contract` đã generic, nhận source bất kỳ).

### 2.2 Deploy & cache contract — `schema.zmodel` + `automationService.ts`

Thêm cột vào model `Config`:
```prisma
fakeVolumeEnabled   String @default("")      // "" | "true"
fakeVolumeTimes     String @default("3")
fakeVolumeBnbAmount String @default("")      // BNB mỗi lần gọi swap(), đơn vị ether-string
fakeVolumeAddress   String @default("")      // contract FakeVolume đã deploy, tái dùng mọi lần
```
→ `yarn generate` + `yarn db:push` sau khi sửa.

Deploy **1 lần duy nhất cho cả batch** (không phải mỗi token) — giống cách cache EIP-1167
`implAddress` hiện tại:
- Đầu `runAutomation` (trước vòng lặp `for (const token of params.tokens)`), nếu
  `params.fakeVolumeEnabled` true:
  - Nếu `params.fakeVolumeAddress` có sẵn → gọi `owner()` xác nhận contract còn tồn tại & đúng
    chủ (so với `swapWallet.address`) → tái sử dụng.
  - Nếu không có hoặc check fail → deploy mới bằng `swapWallet` (constructor `_chainId`), lưu địa
    chỉ qua callback `onFakeVolumeDeployed(address)` → `main.tsx` gọi `scheduleSave({
    fakeVolumeAddress: addr })` để persist, tránh deploy lại ở lần chạy sau.

**Vì sao deploy bằng `swapWallet` (không phải `mainWallet`/`mintWallet`):** owner = người deploy
→ `withdraw()`/`withdrawToken()` tự động trả thẳng về `swapWallet`, khớp đúng yêu cầu "withdraw
về ví swap" mà không cần thêm bước `transferOwnership`.

### 2.3 Chèn step mới trong `automationService.ts` — "Step 4.5 — Fake Volume"

Vị trí: trong vòng lặp `for (const token of params.tokens)`, **sau** `onStepChange(token.id, 4,
'finish')` (add liquidity xong), **trước** `Promise.allSettled([run51(), run52()])` (step 5.1).

```
[4.5] Bỏ qua nếu: !fakeVolumeEnabled, hoặc !fakeVolumeAddress (deploy fail ở bước đầu),
      hoặc times/amount không hợp lệ (> 0).
[4.5] Gửi BNB vào contract: swapWallet.sendTransaction({ to: fakeVolumeAddress,
      value: parseEther(fakeVolumeBnbAmount), gasPrice }), await tx.wait()
[4.5] Gọi swap(): fakeVolume.connect(swapWallet).swap(contractAddress, times,
      parseEther(fakeVolumeBnbAmount), { gasLimit: <estimate>, gasPrice }), await tx.wait()
[4.5] Rút sạch: withdraw() rồi withdrawToken(contractAddress) (await tx.wait() từng cái,
      withdrawToken cho phép revert không chặn flow — bọc try/catch riêng, chỉ log cảnh báo
      nếu fail vì thường sẽ revert "không có gì để rút" khi dust = 0)
[4.5] ✓ xong → onStepChange(token.id, 4.5-equiv, 'finish') → tiếp tục step 5 như cũ
```

Lỗi ở bất kỳ tx nào trong bước này (gửi BNB / swap / withdraw() bắt buộc) → **throw**, token này
dừng với `status = 'error'` giống các step khác hiện tại — KHÔNG âm thầm bỏ qua rồi chạy tiếp
step 5 (vì BNB thật đã gửi vào contract, phải biết rõ để xử lý thủ công nếu kẹt).

**UI Steps:** thêm 1 bước mới vào mảng `Steps` hiển thị hiện có (9 bước → 10 bước), tên "4.5 Fake
Volume", giữa "4. Add Liquidity" và "5.1 Swap Commands". Cần dời index các `statuses[]` hiện tại
từ vị trí 4 trở đi lùi 1 (rà soát kỹ toàn bộ `onStepChange(token.id, N, ...)` đang dùng số cứng
5/6/7/8 cho các step sau — đổi hết +1).

### 2.4 UI — `main.tsx`

Thêm 1 khối cấu hình mới (đặt giữa khu "Swap Commands" và khu "Cài đặt Quét & Airdrop", hoặc
ngay trên Swap Commands — vị trí chính xác do bạn quyết khi review):
- `Switch`/`Segmented` bật/tắt "Fake Volume trước khi swap" (`fakeVolumeEnabled`).
- `InputNumber` "Số vòng" (`fakeVolumeTimes`, min=1, **không có default ngầm hiểu** — bắt nhập).
- `Input` "BNB mỗi vòng" (`fakeVolumeBnbAmount`, **bắt buộc nhập tay**, không suy ra từ
  `liquidityBNB` hay field nào khác — liên quan tiền thật, không đoán).
- Validate khi bật: `times > 0` và `bnbAmount` parse được + `> 0`, nếu thiếu → chặn Start, báo lỗi
  rõ (theo đúng pattern `message.error` hiện có cho `scanContracts`/`disperseAmount`).

## 3. Ngoài phạm vi / giới hạn đã biết

- Không tự động tính/giới hạn (cap) gas tối đa cho `times` lớn — nếu user nhập `times` quá cao,
  tx có thể tốn gas rất lớn hoặc revert do vượt block gas limit. Không hard-block trong spec này,
  chỉ hiển thị cảnh báo dòng chữ nhỏ dưới input ("mỗi vòng = 2 lần swap thật, tốn gas thật").
- Không đổi `gasPrice` — dùng chung biến `gasPrice` tĩnh hiện có cho mọi tx (kể cả gửi BNB, swap,
  withdraw) theo đúng quyết định đã chốt trước đó (gas price fix cứng theo Config).
- Không thêm UI xem lịch sử các lần fake-volume đã chạy (không log riêng ra bảng DB) — chỉ hiện
  trong log text như các step khác.
- Nếu đổi `scanMode`/RPC/chain giữa các lần chạy mà `fakeVolumeAddress` cũ thuộc chain khác →
  check `owner()` ở bước 2.2 sẽ tự fail (gọi sai chain) → tool tự deploy lại, không cần xử lý
  riêng.

## 4. Acceptance Criteria

1. Bật Fake Volume, `times=2`, `amount=0.001` BNB, token mới (chưa có `fakeVolumeAddress`) → log
   thấy `[4.5]` deploy contract mới → gửi 0.001 BNB → gọi `swap(token, 2, 0.001 BNB)` → rút sạch
   (`withdraw()` log có tx hash) → rồi mới thấy `[5.1]` bắt đầu như cũ. Steps UI hiện đủ 10 bước,
   bước Fake Volume chuyển `finish` đúng lúc.
2. Chạy token thứ 2 cùng batch → log `[4.5]` thấy dùng lại contract cũ (không deploy lại, không
   tốn gas deploy thêm).
3. Tắt Fake Volume → không có log `[4.5]` nào, hành vi y hệt hiện tại (không regress).
4. Bật nhưng để trống `times` hoặc `amount` → bấm Start bị chặn, báo lỗi rõ, không gọi
   `runAutomation`.
5. Sau khi `[4.5]` xong, balance BNB + token của contract `FakeVolume` trên BscScan = 0.
6. Nếu tx `swap()` revert (vd slippage router revert do pool quá mỏng) → token này dừng với
   `status='error'`, log hiện rõ lỗi, KHÔNG tự chuyển sang step 5.

## 5. Testing strategy

Không có test suite tự động cho on-chain flow (giống các step khác trong file này). Verify thủ
công trên BSC Testnet (chainId 97) theo Acceptance Criteria — đối chiếu tx thật + balance contract
`FakeVolume` sau khi chạy qua BscScan testnet.

`tsc --noEmit --skipLibCheck` phải sạch sau khi sửa (không lỗi `src/`).

## 6. Boundaries

- **Luôn làm:** dùng chung `gasPrice` tĩnh hiện có cho mọi tx trong bước này; log mọi tx qua
  `onLog` prefix `[4.5]` nhất quán style các step khác; rút sạch BNB/token khỏi contract ngay sau
  mỗi lần gọi `swap()` — không để BNB kẹt lại giữa các lần chạy.
- **Hỏi trước:** vị trí đặt UI field trong form (đề xuất ở trên, chưa chốt); có cần soft-cap cảnh
  báo khi `times` quá lớn không (đề xuất >10 hiện warning, chưa chốt số cụ thể); tên hiển thị
  bước trong Steps UI ("4.5 Fake Volume" — đặt tên khác nếu muốn).
- **Không bao giờ:** không âm thầm nuốt lỗi ở bước 4.5 rồi tự chạy tiếp step 5 khi BNB thật đã
  gửi vào contract nhưng `swap()`/`withdraw()` fail; không deploy lại `FakeVolume` contract mỗi
  token trong cùng batch (lãng phí gas deploy không cần thiết); không tự suy diễn giá trị mặc
  định cho `times`/`amount` — luôn bắt user nhập tay.
