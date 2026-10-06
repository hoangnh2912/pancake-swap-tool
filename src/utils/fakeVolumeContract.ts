// Nguồn: khách cung cấp (swap-ref.txt) — contract riêng tạo volume THẬT qua PancakeSwap Router
// (mua rồi bán lại nhiều vòng), KHÔNG phải kiểu "fake event" như airdrop() trong defaultContract.ts.
// Deploy 1 lần, owner = swapWallet (để withdraw()/withdrawToken() trả thẳng về đúng ví swap).
const FAKE_VOLUME_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function decimals() external view returns (uint8);

    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);
}

interface IPancakeRouter {
    function WETH() external pure returns (address);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract FakeVolume {
    IPancakeRouter public router;
    address private owner;

    constructor(uint256 _chainId) payable {
        if (_chainId == 97)
            router = IPancakeRouter(0xD99D1c33F9fC3444f8101754aBC46c52416550D1);
        else
            router = IPancakeRouter(0x10ED43C718714eb63d5aA57B78B54704E256024E);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function withdrawToken(address token) public onlyOwner {
        IERC20(token).transfer(owner, IERC20(token).balanceOf(address(this)));
    }

    receive() external payable {}

    function swap(
        address token,
        uint256 times,
        uint256 amount
    ) public onlyOwner {
        address[] memory pathWT = new address[](2);
        pathWT[0] = router.WETH();
        pathWT[1] = token;
        address[] memory pathTW = new address[](2);
        pathTW[0] = token;
        pathTW[1] = router.WETH();
        if (IERC20(token).allowance(address(this), address(router)) == 0) {
            IERC20(token).approve(address(router), type(uint256).max);
        }
        uint amountIn = amount;
        for (uint256 i = 0; i < times; i++) {
            // 0: swapExactETHForTokens
            // Buy token
            uint[] memory outWT = router.swapExactETHForTokens{value: amountIn}(
                0,
                pathWT,
                address(this),
                block.timestamp + 100000000
            );
            amountIn = outWT[1];
            // 1: swapTokensForExactETH
            // Sell token
            uint[] memory outTW = router.swapExactTokensForETH(
                amountIn,
                0,
                pathTW,
                address(this),
                block.timestamp + 100000000
            );
            amountIn = outTW[1];
        }
    }
}
`

export default FAKE_VOLUME_CONTRACT
