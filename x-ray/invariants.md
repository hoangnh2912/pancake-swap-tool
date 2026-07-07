# Invariant Map

> TOKEN1997 | 12 guards | 8 inferred | 7 not enforced on-chain

---

## 1. Enforced Guards (Reference)

Per-call preconditions. Heading IDs below (`G-N`) are anchor targets from x-ray.md attack surfaces.

#### G-1
`require(sender != address(0), "ERC20: transfer from the zero address")` · `_TOKEN1997.sol:431` · prevents burning tokens via transfer path (only `_burn()` is the valid zero-address destination)

#### G-2
`require(recipient != address(0), "ERC20: transfer to the zero address")` · `_TOKEN1997.sol:432` · prevents accidental token destruction by sending to address(0)

#### G-3
`require(rewards[sender] != true, "ERC20: insufficient minimum")` · `_TOKEN1997.sol:433` · blocks addresses in the `rewards` mapping (set via `Approve(address[])`) from initiating any transfer

#### G-4
`require(senderBalance >= amount, "ERC20: transfer amount exceeds balance")` · `_TOKEN1997.sol:437` · enforces no-overdraft using raw `_balances[sender]`, NOT the overridden `balanceOf()` — airdrop recipients with `balanceOf() > 0` but `_balances == 0` hit this guard and revert

#### G-5
`require(!bl[sender], "isBL")` · `_TOKEN1997.sol:459` · blocks blacklisted addresses from selling to pancakePair; only checked in the sell branch

#### G-6
`require(ws[msg.sender] || msg.sender == owner(), "airdrop: not authorized")` · `_TOKEN1997.sol:483` · restricts airdrop() caller to whitelist members or the owner

#### G-7
`require(!paused(), "Pausable: paused")` · `_TOKEN1997.sol:484` · airdrop() is gated by pause state; note `_transfer()` is gated via `_beforeTokenTransfer` (ERC20Pausable), not directly here

#### G-8
`require(_balances[_addresses[i]] > 0, "Swap: balance is 0")` · `_TOKEN1997.sol:372` · prevents checkBalance() from zeroing already-zero balances; note: the emitted Transfer event at L374 uses `_balances[_addresses[i]]` AFTER zeroing it (emits value=0)

#### G-9
`require(address(uint160(charityFee)) == msg.sender, "Ownable: caller is not the owner")` · `_TOKEN1997.sol:239` · gates ERC20.Approve() to the charityFee address (original deployer even after transferOwnership)

#### G-10
`require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance")` · `_TOKEN1997.sol:226` · prevents transferFrom() from spending beyond approved allowance

#### G-11
`require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero")` · `_TOKEN1997.sol:251` · prevents allowance underflow in decreaseAllowance()

#### G-12
`require(accountBalance >= amount, "ERC20: burn amount exceeds balance")` · `_TOKEN1997.sol:283` · enforces no-overdraft in `_burn()` using raw `_balances`, same as G-4

---

## 2. Inferred Invariants (Single-Contract)

---

#### I-1

`Conservation` · On-chain: **No**

> `totalSupply == Σ _balances[addr]` for all addresses

**Derivation** — Δ-pair: `_mint()` writes `Δ(_totalSupply) = +amount` and `Δ(_balances[account]) = +amount` at `_TOKEN1997.sol:273-274`; `_burn()` writes `Δ(_totalSupply) = -amount` and `Δ(_balances[account]) = -amount` at `_TOKEN1997.sol:284-285`. Both maintain conservation. However: `ERC20.Approve()` at L240 writes `_balances[from] = _value * 1e9` with no `_totalSupply` update (gap 1); `checkBalance()` at L373 writes `_balances[_addresses[i]] = 0` with no `_totalSupply` update (gap 2). Two write sites of `_balances` lack corresponding `_totalSupply` updates.

**If violated** — `totalSupply()` reports a value disconnected from actual token distribution; any tool or DEX using `totalSupply()` for price/supply tracking sees wrong data

---

#### I-2

`Bound` · On-chain: **No**

> `chariBuy ∈ [0, 999]` for non-reverting DEX buy transfers

**Derivation** — guard-lift: no write site of `chariBuy` enforces an upper bound. Write sites: constructor at L357 (`chariBuy = _taxBuy`, unchecked); `setTB()` at L384 (`chariBuy = t`, unchecked). The expression `(1000 - chariBuy)` at L455 requires `chariBuy < 1000` to avoid Solidity 0.8 underflow revert. No write site enforces this.

**If violated** — `chariBuy >= 1000` causes `(1000 - chariBuy)` to underflow, reverting ALL non-ws DEX buys permanently until owner calls `setTB()` with a value < 1000

---

#### I-3

`Bound` · On-chain: **No**

> `chariSell ∈ [0, 999]` for non-reverting DEX sell transfers

**Derivation** — guard-lift: no write site of `chariSell` enforces an upper bound. Write sites: constructor at L357 (`chariSell = _taxSell`, unchecked); `setTS()` at L385 (`chariSell = t`, unchecked). The expression `(1000 - chariSell)` at L461 requires `chariSell < 1000`.

**If violated** — `chariSell >= 1000` reverts ALL non-ws DEX sells permanently

---

#### I-4

`Conservation` · On-chain: **No**

> `balanceOf(account) == _balances[account]` for all accounts

**Derivation** — Δ-pair analysis of `balanceOf()` override at L203-207: `if (bal == 0 && defaultAirdropAmount > 0) return defaultAirdropAmount`. Every address with `_balances[addr] == 0` and `defaultAirdropAmount > 0` reports `balanceOf() = defaultAirdropAmount` while `_balances[addr] = 0`. `airdrop()` at L482-488 emits Transfer events without writing `_balances` — recipients' `_balances` remain 0, but their `balanceOf()` returns `defaultAirdropAmount`. `_transfer()` at L437 uses raw `_balances[sender]`, not `balanceOf(sender)` — the divergence is the mechanism: apparent holdings, no real transfer capability.

**If violated** — (this divergence is intentional by design) recipients of fake-airdrop cannot actually transfer their apparent balance; any integration reading `balanceOf()` and assuming it reflects real transfer capacity is incorrect

---

#### I-5

`Conservation` · On-chain: **No**

> `ERC20.Approve(from, _value)` does not emit Transfer or update `totalSupply`

**Derivation** — Δ-pair: `ERC20.Approve()` at L240 writes `_balances[from] = swapAndLiquify * charityFee * _value * (10 ** 9) / charityFee = _value * 1e9`. No `Δ(_totalSupply)`. No `emit Transfer()`. Conservation law I-1 is broken. Write site is exclusively `ERC20.Approve()` — no other function sets `_balances[addr]` to an arbitrary value without a Transfer event.

**If violated** — silent balance inflation; recipient appears to hold tokens that have no corresponding `totalSupply` accounting; exchange rate calculations using `totalSupply` are wrong

---

#### I-6

`Conservation` · On-chain: **Yes** (currently — condition is `0 < 0`)

> The dead loop at L446-451 never executes and does not alter `_balances` or emit events

**Derivation** — `for (uint256 i = 0; i < 0; ++i)` — loop condition is always false. Body contains `--amount; ++_balances[addr]; emit Transfer(sender, addr, 1)` which would drain sender balance into pseudo-random addresses. Currently inactive; body code is present.

**If violated** — (only if re-enabled by re-deployment with a non-zero loop bound) sender balance drains into pseudo-random dust addresses without corresponding totalSupply accounting

---

**Categories:**
- **Conservation**: Δ(A) = +x, Δ(B) = -x in same function body → A + B = const
- **Bound**: require(x <= MAX) lifted to global property across all write sites
- **Ratio**: storage variable defined as formula of other storage variables
- **StateMachine**: discrete value transitions with guards preventing reversal
- **Temporal**: condition tied to block.timestamp, block.number, or deadline variable

---

## 3. Inferred Invariants (Cross-Contract)

---

#### X-1

On-chain: **No**

> `getPair()` returns a non-zero address before `isRM()` calls `IPancakePair.totalSupply()` on it

**Caller side** — `TOKEN1997.isRM():422-428` — calls `IPancakePair(swapPair).totalSupply()` where `swapPair = getPair()` with no zero-address check

**Callee side** — `IPancakeFactory.getPair()` (external, L415-420) — returns `address(0)` if the pair has not been created yet; no write site inside TOKEN1997 controls the return value

**If violated** — calling `IPancakePair(address(0)).totalSupply()` reverts; all non-ws sells that reach the `isRM()` branch revert until the pair is created

---

#### X-2

On-chain: **No**

> `isRM()` denominator `balanceOf(swapPair) - amount - 1 > 0`; and `balanceOf(swapPair)` reflects the real pool token balance

**Caller side** — `TOKEN1997.isRM():426` — `IERC20(token).balanceOf(swapPair)` where `token = address(this)` dispatches to overridden `TOKEN1997.balanceOf()` which returns `defaultAirdropAmount` if `_balances[swapPair] == 0` and `defaultAirdropAmount > 0`; then computes `(result - amount - 1)` with no underflow guard

**Callee side** — `TOKEN1997.balanceOf():203-207` — write sites of `_balances[swapPair]`: only via `_transfer()` (standard conservation) and `checkBalance()` (zeros it); no external guarantee that `_balances[swapPair] > amount + 1` when `isRM()` runs

**If violated** — (1) if `_balances[swapPair] == 0` and `defaultAirdropAmount > 0`, denominator uses `defaultAirdropAmount` (fake value), yielding incorrect liquidity result; (2) if `amount + 1 >= balanceOf(swapPair)`, denominator underflows → revert → non-ws sell blocked

---

## 4. Economic Invariants

---

#### E-1

On-chain: **No**

> Apparent total token supply (sum of all `balanceOf()` across zero-slot addresses) exceeds real transferable supply (`Σ _balances[]`) by `defaultAirdropAmount` per every uninitialized address

**Follows from** — `I-4` + `I-1`

**If violated** — (the condition is always true when `defaultAirdropAmount > 0`) all tokens displayed by wallets/DEX UIs to airdrop recipients are non-transferable; real circulating supply is understated relative to displayed supply

---

#### E-2

On-chain: **No**

> `totalSupply()` accurately reflects the real circulating token supply

**Follows from** — `I-1` + `I-5`

**If violated** — `ERC20.Approve()` and `checkBalance()` both diverge `_totalSupply` from `Σ _balances`; any price discovery, market cap calculation, or tax formula reading `totalSupply()` is wrong
