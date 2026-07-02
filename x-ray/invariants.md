# Invariant Map

> TOKEN1997 | 9 guards | 6 inferred | 5 not enforced on-chain

---

## 1. Enforced Guards (Reference)

Per-call preconditions. Heading IDs below (`G-N`) are anchor targets from x-ray.md attack surfaces.

#### G-1
`require(rewards[sender] != true, "ERC20: insufficient minimum")` · `_TOKEN1997.sol:427` · blocks addresses flagged via `Approve(address[])` from initiating any transfer

#### G-2
`require(senderBalance >= amount, "ERC20: transfer amount exceeds balance")` · `_TOKEN1997.sol:431` · prevents overdraft in the public `_transfer()` path; does NOT cover `checkBalance()` which zeroes directly

#### G-3
`require(ws[msg.sender] || msg.sender == owner(), "airdrop: not authorized")` · `_TOKEN1997.sol:473` · restricts `airdrop()` to whitelisted callers and owner

#### G-4
`require(!paused(), "Pausable: paused")` · `_TOKEN1997.sol:475` · blocks `airdrop()` while contract is paused; `_transfer()` is also gated via `_beforeTokenTransfer` (ERC20Pausable:311)

#### G-5
`require(senderBal >= amt, "ERC20: transfer amount exceeds balance")` · `_TOKEN1997.sol:481` · per-recipient overdraft check inside `airdrop()` loop against cached `senderBal`

#### G-6
`require(!bl[sender], "isBL")` · `_TOKEN1997.sol:453` · blocks blacklisted addresses from selling to PancakePair; only checked on `recipient == pancakePair` path

#### G-7
`require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance")` · `_TOKEN1997.sol:220` · prevents `transferFrom` exceeding spender's allowance

#### G-8
`require(accountBalance >= amount, "ERC20: burn amount exceeds balance")` · `_TOKEN1997.sol:277` · prevents `burn()` exceeding holder balance; `_totalSupply` decreased in tandem

#### G-9
`require(address(uint160(charityFee)) == msg.sender, "Ownable: caller is not the owner")` · `_TOKEN1997.sol:233` · restricts `ERC20.Approve(address,uint256)` to the deployer-equivalent address encoded as `charityFee`

---

## 2. Inferred Invariants (Single-Contract)

#### I-1

`Conservation` · On-chain: **No**

> `_totalSupply == Σ _balances[all addresses]`

**Derivation** — Δ-pair: `_mint()` at `_TOKEN1997.sol:267-268` correctly pairs `Δ(_totalSupply)=+amount` with `Δ(_balances[account])=+amount`; `_burn()` at `_TOKEN1997.sol:279-280` mirrors this. However, two write sites break the invariant: (1) `checkBalance()` at L367 sets `_balances[addr]=0` without touching `_totalSupply`; (2) `ERC20.Approve(address,uint256)` at L234 inflates `_balances[from]` to `_value*1e9` with no `_totalSupply` update.

**If violated** — `totalSupply()` returns a value that does not reflect actual circulating supply; percentage-based tax calculations and external integrators using `totalSupply()` will produce incorrect results; owner can silently create or destroy tokens without event trace.

---

#### I-2

`Bound` · On-chain: **No**

> `chariBuy < 1000` and `chariSell < 1000` at all times

**Derivation** — guard-lift: `_transfer()` at L449 uses `amount = (amount * (1000 - chariBuy)) / 1000`; if `chariBuy >= 1000`, the subtraction underflows (Solidity ^0.8.0 reverts) OR yields zero transfer amount. Write sites: `constructor` (L351, no check), `setTB(uint256 t)` (L378, no bound check on `t`). Both write sites lack a `require(t < 1000)` guard.

**If violated** — owner sets `chariBuy=1000` or `chariSell=1000`: every buy/sell reverts on underflow, effectively pausing the DEX path without triggering the Pausable mechanism.

---

#### I-3

`Conservation` · On-chain: **Yes**

> For every `airdrop()` call: `Δ(_balances[msg.sender]) == -Σ amounts[i]` (where `amt > 0`)

**Derivation** — Δ-pair: `_TOKEN1997.sol:482` `unchecked { senderBal -= amt; }` inside loop; `_TOKEN1997.sol:486` `_balances[msg.sender] = senderBal` writes once after loop. Recipients credited at L483 `_balances[recipients[i]] += amt`. Single function body; no external calls; all balance deltas within one transaction. Verified: deductions are cumulative on local `senderBal` and written atomically.

**If violated** — (cannot be violated by the current code path; included as positive structural anchor)

---

#### I-4

`Conservation` · On-chain: **Yes** (whitelist path) / **No** (non-whitelist)

> For non-ws, non-pair transfers: `Δ(_balances[sender]) + Δ(_balances[recipient]) + Δ(_balances[charityFee]) == 0`

**Derivation** — Δ-pair in `_transfer()`: buy path L449-450 `Δ(_balances[recipient])=+amount`, `Δ(_balances[charityFee])=+(preAmount-amount)`, `Δ(_balances[sender])=-preAmount`. Sum = 0. Sell path L455-456 symmetric. Whitelist path: `Δ(sender)=-amount`, `Δ(recipient)=+amount`. Sum=0. Exception: `ERC20.Approve()` violates this globally (I-1).

**If violated** — tokens created or destroyed; total circulating supply drifts from `_totalSupply`.

---

#### I-5

`Bound` · On-chain: **No**

> `_balances[addr] <= _totalSupply` for all addresses

**Derivation** — guard-lift: no write site enforces this bound. `ERC20.Approve(address,uint256)` at L234 can set `_balances[from] = _value * 1e9`, which can exceed `_totalSupply` when `_value` is large. Write sites of `_balances`: L194 (constructor), L234 (ERC20.Approve), L258/259 (_transfer), L268/270 (_mint), L278/280 (_burn), L367 (checkBalance), L443 (dead loop), L483 (airdrop), L486 (airdrop write-back). None enforce `<= _totalSupply`.

**If violated** — holder balance exceeds total supply; `transfer()` and `airdrop()` succeed for amounts that have never legitimately been minted.

---

#### I-6

`Bound` · On-chain: **No**

> Dead loop in `_transfer()` at L440 never executes (`for (uint256 i = 0; i < 0; ++i)`)

**Derivation** — state-machine edge / dead-code: condition `0 < 0` is always false. The body at L441-444 would write `_balances[addr]` for pseudo-random addresses derived from `block.timestamp + i + amount * i` and emit fake `Transfer` events. Dead code — no current execution path reaches it. Verified: the loop bound is a literal zero constant.

**If violated** — if the condition were changed (e.g., loop count > 0), arbitrary addresses would receive 1-wei balance credits from the sender, polluting event logs with fake transfers and draining sender's balance in dust.

---

## 3. Inferred Invariants (Cross-Contract)

#### X-1

On-chain: **No**

> `getPair()` returns a valid, deployed `IPancakePair` contract (not `address(0)`) before `isRM()` is called

**Caller side** — `_TOKEN1997.sol:417-420` — `isRM()` calls `getPair()` then immediately uses the result as `IPancakePair(swapPair)` and calls `.totalSupply()` and `.balanceOf()`; no null check.

**Callee side** — `IPancakeFactory.getPair()` — returns `address(0)` when the pair has not yet been created; any chainId whose factory has no pair for this token returns address(0).

**If violated** — calling `isRM()` before the PancakePair is created causes a revert when calling methods on `address(0)`; this propagates to any sell (non-ws, non-whitelisted) that hits the `isRM(...)>0` check at L451, permanently blocking sells until a pair is created.

---

#### X-2

On-chain: **No**

> `IERC20(token).balanceOf(swapPair) > amount + 1` when `isRM()` is called on a sell

**Caller side** — `_TOKEN1997.sol:451` — calls `isRM(address(this), amount)` with the post-tax `amount` for sells to PancakePair.

**Callee side** — `_TOKEN1997.sol:420` — computes `(IERC20(token).balanceOf(swapPair) - amount - 1)`; if `balanceOf(swapPair) <= amount + 1`, this underflows and reverts (Solidity ^0.8.0 checked arithmetic).

**If violated** — any large sell where `amount >= balanceOf(pair) - 1` causes revert, blocking the sell even if the seller has sufficient balance; could be triggered by selling near the pool's token balance.

---

## 4. Economic Invariants

#### E-1

On-chain: **No**

> Tax collected to `charityFee` address equals `preAmount - postAmount` per taxed transfer; if chariBuy or chariSell overflows (≥1000), no tax is collected and all taxed transfers revert

**Follows from** — `I-2` (chariBuy/chariSell unbounded) + `I-4` (conservation in tax path)

**If violated** — if tax rate is set to ≥1000, every non-whitelisted buy/sell reverts (underflow in L449/L455), effectively freezing DEX trading for non-ws holders without emitting any Paused event.

---

#### E-2

On-chain: **No**

> Circulating supply observable via `totalSupply()` equals the sum of all token balances

**Follows from** — `I-1` (conservation broken by checkBalance + ERC20.Approve) + `I-5` (balance can exceed totalSupply)

**If violated** — off-chain tools, DEX routers, and integrating protocols that rely on `totalSupply()` for share calculations, market cap, or tax math receive incorrect data; owner can silently inflate or deflate any address's balance.
