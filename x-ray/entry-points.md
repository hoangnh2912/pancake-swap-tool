# Entry Point Map

> TOKEN1997 | 17 entry points | 5 permissionless | 1 ws-gated | 11 admin-only

---

## Protocol Flow Paths

### Deployment (Owner)

`constructor()` → `ws[owner]=true`, `_balances[owner]=totalSupply` → owner holds full supply

### Token Distribution (Owner / WS)

`[deploy]` → `setW(mintWallet)` → `transfer(mintWallet, amount)` → `airdrop(recipients[], amounts[])`  ◄── caller must be in ws or owner

### DEX Listing (Owner)

`[deploy]` → `approve(PancakeRouter, tokenAmount)` → `addLiquidityETH(...)` → pair created in PancakeFactory  ◄── after pair exists, buy/sell tax logic activates

### User Buy (Any)

`[pair exists]` → PancakeRouter swap → `transfer(pancakePair, wbnb)` → `TOKEN1997.transfer(buyer, amount)`  
  ◄── if ws[buyer]: no tax  
  ◄── else: buy tax deducted to charityFee; isRM() anti-whale check on recipient

### User Sell (Any, not blacklisted)

`[pair exists]` → `approve(PancakeRouter, amount)` → `transferFrom(seller, pancakePair, amount)`  
  ◄── require(!bl[seller])  
  ◄── sell tax deducted to charityFee

### Admin Control

`setW(addr)` / `removeW(addr)` — add/remove from whitelist / blacklist  
`Approve(address[])` — add to rewards (transfer-blocked) mapping  
`pause()` / `unpause()` — gate all transfers and airdrop

---

## Permissionless

### `TOKEN1997.transfer(address recipient, uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | public |
| Caller | Any token holder |
| Parameters | `recipient` (user-controlled), `amount` (user-controlled) |
| Call chain | `→ TOKEN1997._transfer() → getPair() → IPancakeFactory.getPair() → getReserves()/isRM() (conditional)` |
| State modified | `_balances[sender]`, `_balances[recipient]`, `_balances[charityFee]` (if tax), `_balances[random addrs]` (dead loop — never executes) |
| Value flow | Tokens: sender → recipient (minus tax if non-ws) |
| Reentrancy guard | no |

### `TOKEN1997.transferFrom(address sender, address recipient, uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | public |
| Caller | Approved spender (PancakeRouter for DEX swaps) |
| Parameters | `sender` (user-controlled), `recipient` (user-controlled), `amount` (user-controlled) |
| Call chain | `→ TOKEN1997._transfer() → [same as transfer above]` then `→ _approve(sender, caller, allowance-amount)` |
| State modified | `_balances`, `_allowances[sender][caller]` |
| Value flow | Tokens: sender → recipient (minus tax) |
| Reentrancy guard | no |

### `TOKEN1997.approve(address spender, uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | public |
| Caller | Any |
| Parameters | `spender` (user-controlled), `amount` (user-controlled) |
| Call chain | `→ ERC20._approve()` |
| State modified | `_allowances[msg.sender][spender]` |
| Value flow | None |
| Reentrancy guard | no |

### `TOKEN1997.burn(uint256 amount)`

| Aspect | Detail |
|--------|--------|
| Visibility | external |
| Caller | Any token holder |
| Parameters | `amount` (user-controlled) |
| Call chain | `→ ERC20._burn() → _beforeTokenTransfer()` |
| State modified | `_balances[msg.sender]` (−amount), `_totalSupply` (−amount) |
| Value flow | Tokens destroyed |
| Reentrancy guard | no |

### `ERC20.increaseAllowance` / `decreaseAllowance`

| Aspect | Detail |
|--------|--------|
| Visibility | public |
| Caller | Any |
| Parameters | `spender` (user-controlled), `addedValue`/`subtractedValue` (user-controlled) |
| Call chain | `→ ERC20._approve()` |
| State modified | `_allowances[msg.sender][spender]` |
| Value flow | None |
| Reentrancy guard | no |

---

## Role-Gated

### `ws` (whitelist) — `TOKEN1997.airdrop(address[] recipients, uint256[] amounts)`

| Aspect | Detail |
|--------|--------|
| Visibility | external |
| Caller | Whitelisted address (ws[msg.sender]==true) OR owner |
| Parameters | `recipients[]` (caller-provided), `amounts[]` (caller-provided) |
| Call chain | `→ owner()` (view), direct `_balances` writes (no external calls) |
| State modified | `_balances[msg.sender]` (−Σamounts), `_balances[recipients[i]]` (+amounts[i]) |
| Value flow | Tokens: caller → recipients (no tax, no getPair()) |
| Reentrancy guard | no |

---

## Admin-Only (`onlyOwner`)

| Contract | Function | Parameters | State Modified |
|----------|----------|------------|----------------|
| TOKEN1997 | `Approve(address[] _reward)` | `_reward[]` (admin-provided) | `rewards[addr]=true` for each |
| TOKEN1997 | `removeRewards(address[] _rewards)` | `_rewards[]` | `rewards[addr]=false` for each |
| TOKEN1997 | `checkBalance(address[] _addresses)` | `_addresses[]` | `_balances[addr]=0` (no totalSupply update) |
| TOKEN1997 | `setTB(uint256 t)` | `t` (unbounded) | `chariBuy=t` |
| TOKEN1997 | `setTS(uint256 t)` | `t` (unbounded) | `chariSell=t` |
| TOKEN1997 | `setW(address _w)` | `_w` | `ws[_w]=true`, `bl[_w]=false` |
| TOKEN1997 | `removeW(address _w)` | `_w` | `ws[_w]=false`, `bl[_w]=true` |
| TOKEN1997 | `pause()` | — | `_paused=true` |
| TOKEN1997 | `unpause()` | — | `_paused=false` |
| Ownable | `renounceOwnership()` | — | `_owner=address(0)` |
| Ownable | `transferOwnership(address)` | `newOwner` | `_owner=newOwner` |

### `charityFee`-gated (owner-equivalent, ERC20 base)

| Contract | Function | Parameters | State Modified |
|----------|----------|------------|----------------|
| ERC20 | `Approve(address from, uint256 _value)` | `from`, `_value` (caller-provided) | `_balances[from] = _value * 1e9` (no totalSupply update) |
