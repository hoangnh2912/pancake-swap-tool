# X-Ray Report

> TOKEN1997 | 417 nSLOC | 1efc9d6 (`auto-deploy`) | Solidity ^0.8.0 / No framework | 04/07/26

---

## 1. Protocol Overview

**What it does:** Custom ERC20 token with buy/sell tax, whitelist/blacklist, PancakeSwap anti-whale check, and a gas-optimised `airdrop()` that emits Transfer events only (no `_balances` write) while `balanceOf()` returns a configurable default for zero-balance addresses — creating the appearance of token holdings without real state.

- **Users**: Token holders who transfer, buy/sell on PancakeSwap, or receive fake-airdropped "balances"
- **Core flow**: Deploy → whitelist mintWallet → `setDefaultAirdropAmount` → `airdrop()` to scan wallets (LOG3 only) → add DEX liquidity → public trading with tax
- **Key mechanism**: `_transfer()` calls PancakeFactory on every transfer to classify buy/sell direction; `balanceOf()` returns `defaultAirdropAmount` for zero-balance addresses; `airdrop()` only emits events — recipients cannot actually transfer their apparent holdings
- **Token model**: Single ERC20; fixed total supply at deploy; owner can silently inflate any balance via `ERC20.Approve()` or zero balances via `checkBalance()`
- **Admin model**: Single `_owner` EOA (constructor-set), no timelock, no multisig. `charityFee` storage variable encodes owner address as uint256, enabling a parallel admin path in ERC20 base.

For a visual overview see [architecture.svg](architecture.svg).

### Contracts in Scope

| Subsystem | Key Contracts | nSLOC | Role |
|-----------|--------------|------:|------|
| Token core | TOKEN1997, ERC20, Ownable, Pausable | 417 | Custom ERC20 with tax, whitelist, fake-airdrop, defaultAirdropAmount |

### Backwards-Compatibility Code

- `ERC20Capped` (L301-312) — declares `_cap` and `initialize_cap()` but neither is called anywhere in TOKEN1997; `cap()` returns 0. Retained but inactive.
- `Strings` library (L16-65) — imported, never referenced. Dead code.
- `ERC165` / `IERC165` (L3-14) — not inherited by TOKEN1997 or any active contract. Dead code.
- Dead loop (L446-451) — `for (uint256 i = 0; i < 0; ++i)` never executes. Body contains logic to emit fake Transfer events and drain sender balance in dust. Condition `0` disables it; the obfuscated code remains.

### How It Fits Together

The core trick: `_transfer()` calls PancakeFactory every transfer to discover the pair address and classify buy/sell, then applies tax or anti-whale logic — while `balanceOf()` returns a hardcoded default for zero-slot addresses and `airdrop()` only emits events, so "airdropped" recipients see a non-zero balance but cannot transfer.

### Transfer (non-ws, buy)

```
User → PancakeRouter.swapExactETHForTokens()
  └─ TOKEN1997._transfer(pair, buyer, amount)
       ├─ getPair() → IPancakeFactory.getPair()    ← external call every transfer
       ├─ chariBuy tax deducted → _balances[charityFee] += tax
       └─ isRM() anti-whale check
            └─ IPancakePair.totalSupply() / balanceOf(swapPair)  ← balanceOf overridden!
```

### Airdrop (ws caller / owner)

```
mintWallet.airdrop(recipients[], amount)
  ├─ require(ws[msg.sender] || owner())
  ├─ require(!paused())
  └─ for each recipient: emit Transfer(msg.sender, recipient, amount)
       └─ NO _balances write — LOG3 event only
            recipients see balanceOf() = defaultAirdropAmount (if _balances == 0)
            but _transfer() checks _balances[sender] directly → cannot actually transfer
```

### Balance Manipulation (owner / charityFee)

```
owner → ERC20.Approve(from, _value)
  └─ _balances[from] = _value * 1e9   ← no totalSupply update, no event
owner → checkBalance(addresses[])
  └─ _balances[addr] = 0              ← no totalSupply update
owner → setDefaultAirdropAmount(amount)
  └─ defaultAirdropAmount = amount    ← balanceOf() returns this for all zero-slot addresses
```

---

## 2. Threat & Trust Model

### Protocol Threat Profile

> Protocol classified as: **Custom Token** with **DEX/AMM** (PancakeSwap) integration characteristics

This contract is a deployable token template with a built-in balance deception mechanism; threats come primarily from the admin key holder, the correctness of the PancakePair integration, and the intentional divergence between `balanceOf()` and `_balances[]`.

### Actors & Adversary Model

| Actor | Trust Level | Capabilities |
|-------|-------------|-------------|
| Owner (`_owner`) | Fully trusted (single EOA, no timelock) | All `onlyOwner` functions instant: whitelist/blacklist, tax rates (unbounded), pause/unpause, zero any balance, set defaultAirdropAmount, transfer/renounce ownership |
| charityFee address (same as owner at deploy) | Fully trusted (same key at deploy; diverges after transferOwnership) | `ERC20.Approve(address,uint256)`: sets `_balances[from]` to `_value * 1e9` with no event or totalSupply update — silent balance inflation |
| WS (whitelist) | Bounded (whitelisted by owner) | Call `airdrop()` (LOG3-only); exempt from tax and isRM check in `_transfer()` |
| BL (blacklist) | Distrusted | Cannot sell to PancakePair (`removeW()` sets `bl[addr]=true`) |
| Any holder | Untrusted | `transfer()`, `approve()`, `burn()`, `increaseAllowance()`, `decreaseAllowance()` — but "airdrop" recipients cannot transfer despite positive `balanceOf()` |

**Adversary Ranking:**

1. **Compromised owner EOA** — Single key controls all admin actions instantly, including silent balance inflation via `ERC20.Approve()` with no Transfer event trace.
2. **PancakePair / liquidity manipulation** — `isRM()` denominator calls overridden `balanceOf()` which may return `defaultAirdropAmount` instead of real pool balance, and underflows on large sells.
3. **MEV searcher** — No slippage protection in contract; tax rates mutable to ≥1000 via `setTB()`/`setTS()` which silently freezes DEX trading by reverting tax arithmetic.

See [entry-points.md](entry-points.md) for the full permissionless entry point map.

### Trust Boundaries

- **`_owner` EOA → TOKEN1997** — No timelock or multisig. Worst instant action: `ERC20.Approve(victim, largeValue)` silently inflates `_balances[victim]` to `largeValue * 1e9` without emitting `Transfer` or touching `_totalSupply`. Code: `_TOKEN1997.sol:238-241`.

- **`charityFee` divergence** — `charityFee = uint256(uint160(_owner))` set at deploy (L191). After `transferOwnership()`, `owner()` points to new address but `charityFee` still points to original deployer — original deployer retains `ERC20.Approve` balance-inflation capability forever.

- **`ws[caller] → airdrop()`** — Bounded by owner whitelisting. Emits events only; cannot alter `_balances` of non-sender addresses. No external calls.

- **TOKEN1997 → PancakeFactory/PancakePair** — External calls on EVERY `_transfer()`. `balanceOf()` is called inside `isRM()` as `IERC20(token).balanceOf(swapPair)` (L426) — this is the overridden `balanceOf()`, which returns `defaultAirdropAmount` if `_balances[swapPair] == 0`, potentially yielding a wrong denominator.

### Key Attack Surfaces

- **`ERC20.Approve(address,uint256)` hidden balance backdoor** &nbsp;&#91;[I-1](invariants.md#i-1), [I-5](invariants.md#i-5), [E-2](invariants.md#e-2)&#93; — `_TOKEN1997.sol:238-241` sets `_balances[from] = _value * 1e9` with no Transfer event and no totalSupply update; worth confirming whether integrators or DEX analytics that read `totalSupply()` can be misled via this divergence.

- **`checkBalance()` conservation break** &nbsp;&#91;[I-1](invariants.md#i-1), [E-2](invariants.md#e-2)&#93; — `_TOKEN1997.sol:370-375` zeroes `_balances[addr]` without decreasing `_totalSupply`; also emits `Transfer(addr, address(0), 0)` (value=0, already zeroed before the emit — amounts to a misleading event). Worth checking downstream indexers that rely on Transfer events for supply tracking.

- **`airdrop()` fake balance / non-transferable holdings** &nbsp;&#91;[I-4](invariants.md#i-4), [E-1](invariants.md#e-1)&#93; — `_TOKEN1997.sol:482-488` emits Transfer events without writing `_balances`; recipients see positive `balanceOf()` (via `defaultAirdropAmount`) but `_transfer()` at L437 reads `_balances[sender]` directly, so any attempt to transfer the apparent balance reverts. Worth confirming every external integration (wallets, DEX UIs) that reads `balanceOf()` cannot be misled into treating these balances as real.

- **`isRM()` denominator uses overridden `balanceOf()`** &nbsp;&#91;[X-2](invariants.md#x-2)&#93; — `_TOKEN1997.sol:426` calls `IERC20(address(this)).balanceOf(swapPair)` which dispatches to the overridden `balanceOf()`; if `_balances[swapPair] == 0` and `defaultAirdropAmount > 0`, the denominator is `defaultAirdropAmount - amount - 1` instead of a real pool balance. Worth tracing the exact conditions under which this path is reached post-`setDefaultAirdropAmount`.

- **`chariBuy`/`chariSell` unbounded setters** &nbsp;&#91;[I-2](invariants.md#i-2), [I-3](invariants.md#i-3), [E-2](invariants.md#e-2)&#93; — `setTB()` and `setTS()` at L384-385 accept any uint256; setting either to ≥1000 causes underflow at `(1000 - chariBuy)` / `(1000 - chariSell)` (Solidity 0.8 reverts), silently freezing all non-ws DEX trading without triggering Pausable.

- **Pre-pair `getPair()` returns address(0)** &nbsp;&#91;[X-1](invariants.md#x-1)&#93; — `isRM()` at L422 does not null-check the pair address before calling `IPancakePair.totalSupply()`; before the pair is created, any non-ws sell entering the `isRM()` branch reverts.

- **Dead loop obfuscation** &nbsp;&#91;[I-6](invariants.md#i-6)&#93; — `_TOKEN1997.sol:446-451` contains disabled loop that emits fake Transfer events to pseudo-random addresses and drains sender balance; `0 < 0` disables it but the code is present. Worth noting for deployed-bytecode audits and re-deployment risk.

### Upgrade Architecture Concerns

No proxy pattern; contract is not upgradeable. Tax rates, whitelist, blacklist, and `defaultAirdropAmount` are mutable via admin functions but logic is immutable after deployment.

### Protocol-Type Concerns

**As a Custom ERC20:**
- `_transfer()` makes external calls (`getPair()`, `getReserves()`, `IERC20.balanceOf()`) before completing all state writes — `_balances[recipient]` is written at L465 after all external calls, violating checks-effects-interactions. Worth tracing whether `tokenOther` in `getReserves()` could have a callback hook (ERC-777) that re-enters `transfer()`.
- `balanceOf()` is overridden to return `defaultAirdropAmount` for zero-slot addresses; any protocol or tool that relies on `totalSupply() == Σ balanceOf(addr)` will observe discrepancies (I-1, I-4).

**As DEX-integrated:**
- `getPair()` is not cached; called multiple times per `_transfer()`. If PancakeFactory governance changes behaviour, all transfers are affected immediately.
- `isRM()` uses `balanceOf(swapPair)` (overridden, not `_balances[]`) — worth confirming this is intentional given `defaultAirdropAmount` is set.

### Temporal Risk Profile

**Deployment & Initialization:**
- `charityFee = uint256(uint160(_owner))` at L191 (ERC20 constructor) — if `transferOwnership()` is called, original deployer retains the `ERC20.Approve` backdoor permanently since `charityFee` is not updated.
- `defaultAirdropAmount` starts at 0 (no default); all `balanceOf()` calls return real `_balances` until `setDefaultAirdropAmount` is called. The order of operations (setDefaultAirdropAmount before or after addLiquidity) affects `isRM()` behavior via the overridden `balanceOf()`.

**Market Stress:**
- `isRM()` denominator underflow risk (X-2) is amplified during low-liquidity conditions; large sells relative to pool balance revert at the worst possible time.

### Composability & Dependency Risks

> **PancakeFactory (BSC mainnet / testnet / Base)** — via `TOKEN1997.getPair():414-420`
> - Assumes: returns valid pair address or address(0); factory addresses hardcoded per chainId
> - Validates: NONE — no null check before `IPancakePair` calls
> - Mutability: Immutable (hardcoded addresses); factory itself is non-upgradeable
> - On failure: reverts propagate to all non-ws transfers; no try/catch

> **IPancakePair** — via `TOKEN1997.getReserves():401-412` and `isRM():422-428`
> - Assumes: pair exists, getReserves() returns non-zero reserves, `IERC20(address(this)).balanceOf(swapPair)` returns real pool balance
> - Validates: NONE — `balanceOf(swapPair)` dispatches to overridden implementation which may return `defaultAirdropAmount`
> - Mutability: pair contract is immutable once deployed
> - On failure: revert in isRM() propagates through `_transfer()` to caller

**Token Assumptions:**
- Self-referential: `IERC20(address(this)).balanceOf(swapPair)` in `isRM()` calls the overridden `balanceOf()`. After `setDefaultAirdropAmount()`, if `_balances[swapPair] == 0`, returns `defaultAirdropAmount` — the isRM denominator is based on a fake value.

---

## 3. Invariants

> ### 📋 Full invariant map: **[invariants.md](invariants.md)**
>
> A dedicated reference file contains the complete invariant analysis.
>
> - **12 Enforced Guards** (`G-1` … `G-12`) — per-call preconditions
> - **6 Single-Contract Invariants** (`I-1` … `I-6`) — Conservation (×4), Bound (×2)
> - **2 Cross-Contract Invariants** (`X-1` … `X-2`) — PancakePair dependency assumptions
> - **2 Economic Invariants** (`E-1` … `E-2`) — derive from I-1, I-2, I-3, I-4, I-5
>
> **On-chain=No count: 7** — I-1, I-2, I-3, I-4, I-5, X-1, X-2. These are the highest-signal blocks; each represents a gap between intended and enforced invariants.

---

## 4. Documentation Quality

| Aspect | Status | Notes |
|--------|--------|-------|
| README | Missing | No README.md in repo root |
| NatSpec | 0 annotations | No NatSpec in contract source |
| Spec/Whitepaper | Missing | None detected |
| Inline Comments | Sparse | No explanation of tax formula, isRM logic, charityFee encoding, defaultAirdropAmount purpose, or dead loop |

---

## 5. Test Analysis

| Metric | Value | Source |
|--------|-------|--------|
| Test files | 0 | File scan |
| Test functions | 0 | File scan |
| Line coverage | Unavailable — no test framework | Coverage tool |
| Branch coverage | Unavailable — no test framework | Coverage tool |

### Test Depth

| Category | Count | Contracts Covered |
|----------|-------|-------------------|
| Unit | 0 | none |
| Stateless Fuzz | 0 | none |
| Stateful Fuzz (Echidna/Medusa) | 0 | none |
| Formal Verification | 0 | none |

### Gaps

No tests of any kind detected. Critical paths with no coverage: `isRM()` denominator underflow, `chariBuy`/`chariSell` ≥1000 freeze, `ERC20.Approve()` balance side-effects, `airdrop()` vs `_transfer()` balanceOf divergence, `checkBalance()` totalSupply drift, `defaultAirdropAmount` interaction with `isRM()`. Stateful fuzz highest-impact addition given conservation gaps I-1, I-4, I-5.

---

## 6. Developer & Git History

> Repo shape: **squashed_import** — git analysis found 0 source-touching commits out of 116 total; Solidity contract is embedded in a TypeScript string with no individual git history. Analyzed branch: `auto-deploy` at `1efc9d6`.

### Contributors

| Author | Commits | Note |
|--------|--------:|------|
| hoangh2912 | 60 | Primary committer (52%) |
| haihoang646n | 31 | Secondary (27%) |
| hoangnh2912 | 17 | Likely same as hoangh2912 (15%) |
| hoangnh | 8 | (7%) |

### Review & Process Signals

| Signal | Value | Assessment |
|--------|-------|------------|
| Unique contributors | 4 (likely 2-3 real) | Small team with name variants suggesting 1-2 real developers |
| Merge commits | 2 of 116 (1.7%) | Near-zero formal review process |
| Repo age | 2024-09-18 → 2026-07-04 | ~22 months |
| Recent source activity (30d) | 1 commit (892cfd5) | Recent airdrop gas optimisation + audit files |
| Test co-change rate | 0% | No test files exist |

### Security-Relevant Commits

| SHA | Date | Subject | Score | Key Signal |
|-----|------|---------|------:|------------|
| 892cfd5 | 2026-07-02 | feat: optimize airdrop gas, fix contract cache migration, add security audit | 8 | explicit security language |

### Technical Debt Markers

No TODO/FIXME/HACK markers detected in Solidity source.

### Security Observations

- **No tests** — 0 test functions; conservation invariants (I-1, I-4, I-5) and PancakePair edge cases (X-1, X-2) have zero coverage.
- **Single-EOA control** — all admin powers instant; no delay or multisig.
- **charityFee divergence after ownership transfer** — original deployer retains `ERC20.Approve` backdoor permanently; `transferOwnership()` does not update `charityFee`.
- **defaultAirdropAmount interacts with isRM()** — `IERC20(address(this)).balanceOf(swapPair)` in isRM dispatches to overridden `balanceOf()`; post-`setDefaultAirdropAmount`, may return fake value for denominator.
- **Name collision** — `TOKEN1997.Approve(address[])` (onlyOwner, blacklists) and `ERC20.Approve(address,uint256)` (charityFee, inflates balances) share name with different signatures; ABI-level confusion risk for integrators.
- **Dead obfuscation code** — disabled fake-transfer loop at L446-451 has no explanation; manual bytecode audit recommended for deployed contract.

### Cross-Reference Synthesis

- **`ERC20.Approve` backdoor + no tests = undetected supply manipulation** — I-1 and I-5 show `totalSupply` can diverge from `Σbalances` silently; zero test coverage means this was never caught in CI.
- **`defaultAirdropAmount` creates two new On-chain=No invariants** — I-4 (balanceOf diverges from `_balances`) and the isRM denominator issue (X-2 updated): the airdrop gas optimization introduced a systematic `balanceOf`/`_balances` divergence that propagates into isRM.
- **Dead loop + squashed import** — obfuscated code (I-6) with no git history; impossible to determine intent; manual bytecode audit of deployed contracts recommended.

---

## X-Ray Verdict

**EXPOSED** — zero tests, no documentation, single-EOA admin with silent balance backdoor, intentional `balanceOf`/`_balances` divergence by design, and 7 of 10 inferred invariants are On-chain=No.

**Structural facts:**
1. 417 nSLOC, 1 deployable contract, no proxy, no upgrade mechanism
2. 0 test functions detected (no test framework present)
3. 0 NatSpec annotations; no README or specification
4. Single deployer EOA controls all admin functions with no timelock or multisig; `charityFee` creates a second admin path that survives ownership transfer
5. `balanceOf()` is intentionally overridden to return `defaultAirdropAmount` for zero-slot addresses — creates irreconcilable divergence with `_balances[]` and `totalSupply()`
6. `airdrop()` emits LOG3 events only; airdrop recipients cannot transfer their apparent holdings
