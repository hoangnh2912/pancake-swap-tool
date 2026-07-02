# X-Ray Report

> TOKEN1997 | 417 nSLOC | 40152a2 (`auto-deploy`) | Solidity ^0.8.0 / No framework | 02/07/26

---

## 1. Protocol Overview

**What it does:** Custom ERC20 token with configurable buy/sell tax, whitelist/blacklist access control, PancakeSwap anti-whale mechanism, and a gas-optimised `airdrop()` function that bypasses the standard tax transfer path.

- **Users**: Token holders who transfer, buy/sell on PancakeSwap, or receive airdropped tokens
- **Core flow**: Deploy → whitelist mintWallet → airdrop to scan wallets → DEX liquidity added → public trading with tax
- **Key mechanism**: `_transfer()` calls `getPair()` on every transfer to detect buy/sell direction and apply tax to non-whitelisted addresses; `isRM()` blocks sells that would remove too much liquidity
- **Token model**: Single ERC20; fixed total supply at deploy; owner can mint via `ERC20.Approve()` backdoor or zero balances via `checkBalance()`
- **Admin model**: Single `_owner` EOA (set at constructor), no timelock, no multisig. `charityFee` storage variable encodes owner address as uint256, enabling a parallel admin path in ERC20 base.

For a visual overview see [architecture.svg](architecture.svg).

### Contracts in Scope

| Subsystem | Key Contracts | nSLOC | Role |
|-----------|--------------|------:|------|
| Token core | TOKEN1997, ERC20, Ownable, Pausable | 417 | Custom ERC20 with tax, whitelist, airdrop |

### Backwards-Compatibility Code

- `ERC20Capped` (L295-306) — declares `_cap` and `initialize_cap()` but neither is called anywhere in TOKEN1997; `cap()` returns 0. Retained in file but inactive.
- `Strings` library (L16-65) — imported, never referenced. Dead code.
- `ERC165` / `IERC165` (L3-14) — not inherited by TOKEN1997 or any active contract. Dead code.
- Dead loop (L440-445) — `for (uint256 i = 0; i < 0; ++i)` never executes. Body contains logic to emit fake Transfer events and credit pseudo-random addresses with 1-wei dust. Condition was presumably lowered to 0 to disable it; the code remains.

### How It Fits Together

The core trick: `_transfer()` calls the external PancakeFactory on every transfer to discover the pair address and classify the transfer as buy, sell, or wallet-to-wallet — then applies tax or anti-whale logic accordingly, while the owner's `airdrop()` path bypasses all of this for gas savings.

### Transfer (non-ws, buy)

```
User → PancakeRouter.swapExactETHForTokens()
  └─ TOKEN1997.transfer(buyer, amount)        ← via router
       ├─ getPair() → IPancakeFactory.getPair()   ← external call every transfer
       ├─ chariBuy tax deducted → _balances[charityFee] += tax
       └─ isRM() anti-whale check
            └─ IPancakePair.totalSupply() / IERC20.balanceOf()  ← reverts if pair addr(0)
```

### Airdrop (ws caller)

```
mintWallet.airdrop(recipients[], amounts[])
  ├─ require(ws[msg.sender] || owner())
  ├─ require(!paused())
  ├─ senderBal = _balances[msg.sender]    ← single SLOAD
  ├─ for each recipient: senderBal -= amt; _balances[recipient] += amt
  └─ _balances[msg.sender] = senderBal   ← single SSTORE
```

### Balance Manipulation (owner / charityFee)

```
owner → ERC20.Approve(from, _value)
  └─ _balances[from] = _value * 1e9   ← no totalSupply update, no event
owner → checkBalance(addresses[])
  └─ _balances[addr] = 0              ← no totalSupply update; emits Transfer(addr, addr(0), 0) — already zeroed
```

---

## 2. Threat & Trust Model

### Protocol Threat Profile

> Protocol classified as: **Custom Token** with **DEX/AMM** (PancakeSwap) integration characteristics

This contract is a deployable token template, not a standalone protocol; threats come primarily from the admin key holder and from the correctness of the PancakePair integration during transfers.

### Actors & Adversary Model

| Actor | Trust Level | Capabilities |
|-------|-------------|-------------|
| Owner (`_owner`) | Fully trusted (single EOA, no timelock) | All `onlyOwner` functions instant: whitelist/blacklist, tax rates (unbounded), pause/unpause, zero any balance, add/remove transfer-blocked addresses, transfer/renounce ownership |
| charityFee address (same as owner) | Fully trusted (same key) | `ERC20.Approve(address,uint256)`: sets `_balances[from]` to arbitrary value × 1e9 with no event or totalSupply update — silent balance inflation |
| WS (whitelist) | Bounded (whitelisted by owner) | Call `airdrop()`; exempt from tax and isRM check in `_transfer()` |
| BL (blacklist) | Distrusted | Cannot sell to PancakePair (`removeW()` sets `bl[addr]=true`) |
| Any holder | Untrusted | `transfer()`, `approve()`, `burn()`, `increaseAllowance()`, `decreaseAllowance()` |

**Adversary Ranking:**

1. **Compromised owner EOA** — Single key controls all admin actions instantly, including balance manipulation via `ERC20.Approve()` backdoor which leaves no mint event trace.
2. **PancakePair / liquidity manipulation** — `isRM()` denominator can underflow on large sells, bricking the sell path; pair address(0) before deployment crashes `isRM()`.
3. **MEV searcher** — No slippage protection in the contract; `chariBuy`/`chariSell` tax rates are mutable up to ≥1000 which freezes DEX trading silently.

See [entry-points.md](entry-points.md) for the full permissionless entry point map.

### Trust Boundaries

- **`_owner` EOA → TOKEN1997** — No timelock or multisig. Instant access to tax manipulation, balance zeroing, and ownership transfer. Worst instant action: `ERC20.Approve(victim, largeValue)` silently inflates `_balances[victim]` without emitting `Transfer` or touching `_totalSupply`. Code: `_TOKEN1997.sol:232-235`.

- **`ws[caller] → airdrop()`** — Bounded by owner whitelisting. Caller can drain their own balance to arbitrary addresses but cannot touch others' balances. No external calls; conservation holds within the function.

- **TOKEN1997 → PancakeFactory/PancakePair** — External calls made on EVERY `_transfer()`. If factory is paused, upgraded, or returns unexpected data, all non-ws transfers fail. No validation on pair address returned by `getPair()`.

### Key Attack Surfaces

- **`ERC20.Approve(address,uint256)` hidden balance backdoor** &nbsp;&#91;[I-1](invariants.md#i-1), [I-5](invariants.md#i-5), [E-2](invariants.md#e-2)&#93; — `_TOKEN1997.sol:232-235` sets `_balances[from] = _value * 1e9` with no Transfer event and no totalSupply update; worth confirming whether any DEX or integration that reads `totalSupply()` for price/tax math can be manipulated via this divergence.

- **`checkBalance()` conservation break** &nbsp;&#91;[I-1](invariants.md#i-1), [E-2](invariants.md#e-2)&#93; — `_TOKEN1997.sol:364-370` zeroes `_balances[addr]` without decreasing `_totalSupply`; also emits `Transfer(addr, address(0), 0)` (already zeroed, so value=0). Worth checking downstream indexers or tax-basis tools that rely on Transfer events for supply tracking.

- **`isRM()` denominator underflow** &nbsp;&#91;[X-2](invariants.md#x-2)&#93; — `_TOKEN1997.sol:420` computes `IERC20(token).balanceOf(swapPair) - amount - 1` with no guard; any sell where `amount >= poolBalance - 1` will revert, potentially blocking legitimate large sells.

- **`chariBuy`/`chariSell` unbounded setters** &nbsp;&#91;[I-2](invariants.md#i-2), [E-1](invariants.md#e-1)&#93; — `setTB()` and `setTS()` at L378-379 accept any uint256; setting either to ≥1000 causes underflow on the tax formula at L449/455, silently freezing non-ws DEX trading without triggering Pausable.

- **Pre-pair `getPair()` returns address(0)** &nbsp;&#91;[X-1](invariants.md#x-1)&#93; — `isRM()` at L417 does not null-check the pair address before calling IPancakePair methods; before the pair is created, any non-ws sell that reaches the `isRM()` branch reverts. Worth confirming the exact conditions under which the `isRM()` branch is entered pre-pool.

- **Dead loop obfuscation** &nbsp;&#91;[I-6](invariants.md#i-6)&#93; — `_TOKEN1997.sol:440-445` contains a disabled loop that would emit fake Transfer events to pseudo-random addresses and drain sender balance in dust; the `0 < 0` condition disables it, but the code is present and could be re-enabled by a contract upgrade or re-deployment with different parameters. Worth noting for deployed-bytecode audits.

### Upgrade Architecture Concerns

No proxy pattern; contract is not upgradeable. Once deployed, the bytecode is fixed. Tax rates, whitelist, and blacklist are mutable via admin functions but the logic is immutable.

### Protocol-Type Concerns

**As a Custom ERC20:**
- `_transfer()` makes external calls (`getPair()`, `getReserves()`, `IERC20.balanceOf()`) before completing state writes — reentrancy guard absent and checks-effects-interactions is violated: `_balances[sender]` is written at L432 but `_balances[recipient]` is written at L459 after all external calls. Worth tracing whether a malicious token as `tokenOther` in `getReserves()` could re-enter `transfer()`.

**As DEX-integrated:**
- `getPair()` result is not cached; called multiple times per `_transfer()` via `isRM()`. If PancakeFactory changes behaviour (governance), all transfers are affected immediately.

### Temporal Risk Profile

**Deployment & Initialization:**
- Owner is set in constructor with no two-step confirmation; deployer EOA immediately controls all admin functions. Transfer to multisig is not enforced by the contract.
- `charityFee` is set to `uint256(uint160(_owner))` at deploy-time (L191); if ownership is transferred, `charityFee` still points to the original deployer, creating a divergence between `owner()` and the `ERC20.Approve` admin path.

**Market Stress:**
- `isRM()` denominator underflow risk (X-2) is amplified during low-liquidity conditions; large sells relative to pool balance brick the sell path at the worst possible time.

### Composability & Dependency Risks

> **PancakeFactory (BSC mainnet / testnet / Base)** — via `TOKEN1997.getPair():408-413`
> - Assumes: returns valid pair address or address(0); immutable factory addresses hardcoded per chainId
> - Validates: NONE — no null check on returned pair address before use in IPancakePair calls
> - Mutability: Immutable (hardcoded addresses in contract); factory itself is non-upgradeable
> - On failure: reverts propagate to all non-ws transfers; no try/catch

> **IPancakePair** — via `TOKEN1997.getReserves():395-406` and `isRM():416-422`
> - Assumes: pair exists, getReserves() returns non-zero reserves, balanceOf returns current real balance
> - Validates: NONE
> - Mutability: pair contract is immutable once deployed
> - On failure: revert in isRM() propagates through _transfer() to caller

**Token Assumptions:**
- Self-referential: the contract calls `IERC20(tokenOther).balanceOf(swapPair)` where `tokenOther` is the pair's other token (WBNB/WETH). Assumes standard ERC20 with no callbacks. A fee-on-transfer `tokenOther` would cause `getReserves()` to return stale values.

---

## 3. Invariants

> ### 📋 Full invariant map: **[invariants.md](invariants.md)**
>
> A dedicated reference file contains the complete invariant analysis.
>
> - **9 Enforced Guards** (`G-1` … `G-9`) — per-call preconditions
> - **6 Single-Contract Invariants** (`I-1` … `I-6`) — Conservation (×3), Bound (×2), dead-code structural
> - **2 Cross-Contract Invariants** (`X-1` … `X-2`) — PancakePair dependency assumptions
> - **2 Economic Invariants** (`E-1` … `E-2`) — derive from I-1, I-2, I-4, I-5
>
> **On-chain=No count: 5** — I-1, I-2, I-5, X-1, X-2. These are the highest-signal blocks; each represents a gap between intended and enforced invariants.

---

## 4. Documentation Quality

| Aspect | Status | Notes |
|--------|--------|-------|
| README | Missing | No README.md in repo root |
| NatSpec | 0 annotations | No NatSpec in contract source |
| Spec/Whitepaper | Missing | None detected |
| Inline Comments | Sparse | Minimal; no explanation of tax formula, isRM logic, charityFee encoding, or dead loop |

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

No tests of any kind detected. Critical paths with no test coverage: `isRM()` denominator, `chariBuy`/`chariSell` overflow behavior, `ERC20.Approve()` balance side-effects, `airdrop()` conservation, `checkBalance()` totalSupply divergence. Stateful fuzz would be highest-impact addition given the conservation invariant gaps (I-1, I-5).

---

## 6. Developer & Git History

> Repo shape: **squashed_import** — git analysis found 0 source-touching commits out of 112 total; source files are not tracked individually in git history (contract is embedded in a TypeScript string). No development history visible for the Solidity contract itself.

### Contributors

| Author | Commits | Note |
|--------|--------:|------|
| hoangh2912 | 60 | Primary committer (54%) |
| haihoang646n | 27 | Secondary (24%) |
| hoangnh2912 | 17 | Likely same person as hoangh2912 (15%) |
| hoangnh | 8 | (7%) |

### Review & Process Signals

| Signal | Value | Assessment |
|--------|-------|------------|
| Unique contributors | 4 (likely 2-3 real) | Small team with name variants suggesting single developer |
| Merge commits | 2 of 112 (1.8%) | Near-zero formal review process |
| Repo age | 2024-09-18 → 2026-06-24 | ~21 months |
| Recent source activity (30d) | Not determinable (squashed) | — |
| Test co-change rate | 0% | No test files exist |

### Security-Relevant Commits

No development history — fix detection not applicable (squashed_import repo shape).

### Technical Debt Markers

No TODO/FIXME/HACK markers detected in Solidity source.

### Security Observations

- **No tests** — 0 test functions across all categories; conservation invariants (I-1, I-5) and PancakePair edge cases (X-1, X-2) have zero coverage.
- **Single-EOA control** — all admin powers instant, no delay mechanism.
- **charityFee divergence risk** — `charityFee` encoded at deploy-time; `transferOwnership()` does not update it, creating a silent split between `owner()` and `ERC20.Approve` admin gate.
- **Dead obfuscation code** — disabled fake-transfer loop at L440-445 is unexplained; no comment or NatSpec describing why it exists or why it was disabled.
- **Name collision** — `TOKEN1997.Approve(address[])` (onlyOwner, blacklists) and `ERC20.Approve(address,uint256)` (charityFee, inflates balances) share the same function name with different signatures; ABI-level confusion risk for integrators.

### Cross-Reference Synthesis

- **`ERC20.Approve` backdoor + no tests = undetected supply manipulation** — I-1 and I-5 show `totalSupply` can diverge from `Σbalances` silently; zero test coverage means this was never caught in CI.
- **Dead loop + squashed import** — obfuscated code (I-6) with no git history makes it impossible to determine whether the loop was intentionally disabled or is a deployment-parameter bug; manual bytecode audit recommended.

---

## X-Ray Verdict

**EXPOSED** — zero tests, no documentation, single-EOA admin with silent balance backdoor, and critical conservation invariants broken on-chain.

**Structural facts:**
1. 417 nSLOC, 1 contract, no proxy, no upgrade mechanism
2. 0 test functions detected (no test framework present)
3. 0 NatSpec annotations; no README or specification
4. Single deployer EOA controls all admin functions with no timelock or multisig
5. 5 of 9 inferred invariants are On-chain=No, including the fundamental `totalSupply == Σbalances` conservation law
