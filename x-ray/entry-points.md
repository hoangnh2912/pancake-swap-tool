# Entry Point Map

> TOKEN1997 | 20 entry points | 6 permissionless | 2 role-gated | 12 admin-only

---

## Protocol Flow Paths

### Setup (Owner)

`deploy(name, symbol, owner, decimal, supply, taxBuy, taxSell, chainId)` → `setW(mintWallet)` → `setDefaultAirdropAmount(amount)` → `airdrop(recipients[], amount)` ◄── LOG3 only, no real _balances write

### Liquidity Addition (Owner / WS)

`[setup above]` → `ERC20.approve(router, tokenAmount)` → `PancakeRouter.addLiquidityETH(token, amount, ...)` → `TOKEN1997._transfer(owner, pancakePair, amount)` ◄── whitelist path since ws[owner]=true; `_balances[pancakePair] == 0` condition now uses `_balances[]` not `balanceOf()`

### User Flow (Buy/Sell)

`[liquidity above]` → `PancakeRouter.swapExactETHForTokens()` → `TOKEN1997._transfer(pair, buyer, amount)` ◄── chariBuy tax applied; isRM() check
└─→ `PancakeRouter.swapExactTokensForETH()` → `TOKEN1997._transfer(seller, pair, amount)` ◄── !bl[seller] check; chariSell tax applied

### Wallet-to-Wallet

`[liquidity above]` → `TOKEN1997.transfer(recipient, amount)` ◄── ws path if either party whitelisted; else standard _transfer with no tax

### Admin Controls

`setTB(t)` / `setTS(t)` → changes chariBuy/chariSell ◄── t < 1000 required for non-reverting DEX trades
`setDefaultAirdropAmount(amount)` → affects all future balanceOf() calls for zero-slot addresses AND isRM() denominator
`checkBalance(addresses[])` → zeroes _balances[] without totalSupply update
`ERC20.Approve(from, value)` → sets _balances[from] = value * 1e9 with no event ◄── charityFee address only

---

## Permissionless

### `ERC20.transfer(address recipient, uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | public, no guard |
| Caller | Any token holder |
| Parameters | recipient (user-controlled), amount (user-controlled) |
| Call chain | `→ TOKEN1997._transfer(sender, recipient, amount) → getPair() → IPancakeFactory.getPair() → [tax/isRM if DEX transfer]` |
| State modified | `_balances[sender]`, `_balances[recipient]`, `_balances[charityFee]` (if taxed) |
| Value flow | Tokens: sender → recipient (net after tax) |
| Reentrancy guard | no |

### `ERC20.transferFrom(address sender, address recipient, uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | public, no guard |
| Caller | Any approved spender |
| Parameters | sender (user-controlled), recipient (user-controlled), amount (user-controlled) |
| Call chain | `→ TOKEN1997._transfer() → [same as transfer] → _approve(sender, msg.sender, allowance - amount)` |
| State modified | `_balances[sender]`, `_balances[recipient]`, `_allowances[sender][msg.sender]` |
| Value flow | Tokens: sender → recipient |
| Reentrancy guard | no |

### `ERC20.approve(address spender, uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | public, no guard |
| Caller | Any token holder |
| Parameters | spender (user-controlled), amount (user-controlled) |
| Call chain | `→ _approve(msg.sender, spender, amount)` |
| State modified | `_allowances[msg.sender][spender]` |
| Value flow | none |
| Reentrancy guard | no |

### `ERC20.increaseAllowance(address spender, uint256 addedValue)`

| Aspect | Detail |
|--------|--------|
| Visibility | public, no guard |
| Caller | Any token holder |
| Parameters | spender (user-controlled), addedValue (user-controlled) |
| Call chain | `→ _approve(msg.sender, spender, currentAllowance + addedValue)` |
| State modified | `_allowances[msg.sender][spender]` |
| Value flow | none |
| Reentrancy guard | no |

### `ERC20.decreaseAllowance(address spender, uint256 subtractedValue)`

| Aspect | Detail |
|--------|--------|
| Visibility | public, no guard |
| Caller | Any token holder |
| Parameters | spender (user-controlled), subtractedValue (user-controlled) |
| Call chain | `→ _approve(msg.sender, spender, currentAllowance - subtractedValue)` ◄── requires currentAllowance >= subtractedValue |
| State modified | `_allowances[msg.sender][spender]` |
| Value flow | none |
| Reentrancy guard | no |

### `TOKEN1997.burn(uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | external, no guard |
| Caller | Any token holder |
| Parameters | amount (user-controlled) |
| Call chain | `→ _burn(msg.sender, amount)` → `Δ(_totalSupply) = -amount`, `Δ(_balances[msg.sender]) = -amount` |
| State modified | `_balances[msg.sender]`, `_totalSupply` |
| Value flow | Tokens destroyed |
| Reentrancy guard | no |

---

## Role-Gated

### `ws` or `owner`

#### `TOKEN1997.airdrop(address[] calldata recipients, uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | external — `require(ws[msg.sender] \|\| msg.sender == owner())` |
| Caller | Whitelisted wallet (mintWallet) or owner |
| Parameters | recipients (caller-provided), amount (caller-provided) |
| Call chain | `→ for each recipient: emit Transfer(msg.sender, recipients[i], amount)` — no _balances write |
| State modified | NONE — only emits LOG3 events |
| Value flow | none (events only) |
| Reentrancy guard | no |

### `charityFee` address

#### `ERC20.Approve(address from, uint256 _value)`

| Aspect | Detail |
|--------|--------|
| Visibility | external — `require(address(uint160(charityFee)) == msg.sender)` |
| Caller | Original deployer (charityFee address — survives ownership transfer) |
| Parameters | from (caller-controlled), _value (caller-controlled) |
| Call chain | `→ _balances[from] = _value * 1e9` |
| State modified | `_balances[from]` — no totalSupply update, no Transfer event |
| Value flow | Silent balance inflation |
| Reentrancy guard | no |

---

## Admin-Only

| Contract | Function | Parameters | State Modified |
|----------|----------|------------|----------------|
| TOKEN1997 | `Approve(address[] calldata _reward)` | `_reward` array | `rewards[addr] = true` for each |
| TOKEN1997 | `checkBalance(address[] calldata _addresses)` | `_addresses` array | `_balances[addr] = 0` for each (no totalSupply update) |
| TOKEN1997 | `removeRewards(address[] calldata _rewards)` | `_rewards` array | `rewards[addr] = false` for each |
| TOKEN1997 | `setTB(uint256 t)` | `t` (unbounded) | `chariBuy = t` |
| TOKEN1997 | `setTS(uint256 t)` | `t` (unbounded) | `chariSell = t` |
| TOKEN1997 | `setW(address _w)` | `_w` | `ws[_w] = true`, `bl[_w] = false` |
| TOKEN1997 | `removeW(address _w)` | `_w` | `ws[_w] = false`, `bl[_w] = true` |
| TOKEN1997 | `pause()` | none | `_paused = true` |
| TOKEN1997 | `unpause()` | none | `_paused = false` |
| TOKEN1997 | `setDefaultAirdropAmount(uint256 amount)` | `amount` | `defaultAirdropAmount = amount` — changes balanceOf() output for all zero-slot addresses and isRM() denominator |
| Ownable | `transferOwnership(address newOwner)` | `newOwner` | `_owner = newOwner` (charityFee NOT updated — original deployer retains ERC20.Approve access) |
| Ownable | `renounceOwnership()` | none | `_owner = address(0)` |
