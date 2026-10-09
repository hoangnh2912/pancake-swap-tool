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

    // *SupportingFeeOnTransferTokens — bắt buộc cho token có thuế buy/sell (TOKEN1997
    // chariBuy/chariSell). Hàm swapExactETHForTokens/swapExactTokensForETH thường tính
    // amountOut theo pool thuần, không biết token tự trừ thêm thuế lúc transfer — Pair
    // nhận/gửi lệch số thật, vi phạm invariant constant-product, revert "Pancake: K".
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;
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
        // .transfer() dùng stipend cố định 2300 gas — verify thực tế trên fork mainnet (anvil)
        // cho thấy revert ngay cả khi gửi cho 1 EOA bình thường. .call{value}("") forward hết
        // gas còn lại, đúng khuyến nghị hiện tại của Solidity (compiler cũng cảnh báo .transfer
        // deprecated).
        (bool ok, ) = payable(owner).call{value: address(this).balance}("");
        require(ok, "withdraw failed");
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
            // Buy token
            router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amountIn}(
                0,
                pathWT,
                address(this),
                block.timestamp + 100000000
            );
            // Dùng balance THỰC nhận được, không tin số Router trả về — token có thể có thuế
            // buy (TOKEN1997 chariBuy) khiến số thực nhận ít hơn số Router tính theo pool
            // thuần, bán nhiều hơn số dư thực có sẽ revert.
            uint256 tokenBalance = IERC20(token).balanceOf(address(this));
            // Sell token
            router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                tokenBalance,
                0,
                pathTW,
                address(this),
                block.timestamp + 100000000
            );
            // Vòng kế tiếp dùng đúng số BNB THỰC đang có (không phải số Router tính) — nhất
            // quán với cách lấy tokenBalance ở trên.
            amountIn = address(this).balance;
        }
    }
}
`

// Tăng mỗi khi sửa nội dung Solidity ở trên — automationService.ts so khớp với version đã lưu
// trong Config để biết khi nào contract đã deploy cũ còn mang logic lỗi, bắt buộc deploy lại
// thay vì âm thầm tái sử dụng (ownership check không phát hiện được thay đổi logic/bytecode).
export const FAKE_VOLUME_VERSION = 'v4-call-not-transfer'

export default FAKE_VOLUME_CONTRACT
