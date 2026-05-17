const MULTICALL_ABI = [
    { type: 'receive', stateMutability: 'payable' },
    {
        type: 'function',
        name: 'aggregate',
        inputs: [
            { name: 'targets', type: 'address[]', internalType: 'address[]' },
            { name: 'calls', type: 'bytes[]', internalType: 'bytes[]' },
            { name: 'values', type: 'uint256[]', internalType: 'uint256[]' },
            { name: 'strict', type: 'bool', internalType: 'bool' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'approve',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            { name: 'spender', type: 'address', internalType: 'address' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as any[]

const ROUTER_PANCAKE_V2_ABI = [
    {
        type: 'function',
        name: 'WETH',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'addLiquidity',
        inputs: [
            { name: 'tokenA', type: 'address', internalType: 'address' },
            { name: 'tokenB', type: 'address', internalType: 'address' },
            {
                name: 'amountADesired',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'amountBDesired',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'amountAMin', type: 'uint256', internalType: 'uint256' },
            { name: 'amountBMin', type: 'uint256', internalType: 'uint256' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [
            { name: 'amountA', type: 'uint256', internalType: 'uint256' },
            { name: 'amountB', type: 'uint256', internalType: 'uint256' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'addLiquidityETH',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            {
                name: 'amountTokenDesired',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'amountTokenMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'amountETHMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [
            { name: 'amountToken', type: 'uint256', internalType: 'uint256' },
            { name: 'amountETH', type: 'uint256', internalType: 'uint256' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
        ],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'factory',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'getAmountIn',
        inputs: [
            { name: 'amountOut', type: 'uint256', internalType: 'uint256' },
            { name: 'reserveIn', type: 'uint256', internalType: 'uint256' },
            { name: 'reserveOut', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amountIn', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'getAmountOut',
        inputs: [
            { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
            { name: 'reserveIn', type: 'uint256', internalType: 'uint256' },
            { name: 'reserveOut', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amountOut', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'getAmountsIn',
        inputs: [
            { name: 'amountOut', type: 'uint256', internalType: 'uint256' },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getAmountsOut',
        inputs: [
            { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'quote',
        inputs: [
            { name: 'amountA', type: 'uint256', internalType: 'uint256' },
            { name: 'reserveA', type: 'uint256', internalType: 'uint256' },
            { name: 'reserveB', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amountB', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'pure',
    },
    {
        type: 'function',
        name: 'removeLiquidity',
        inputs: [
            { name: 'tokenA', type: 'address', internalType: 'address' },
            { name: 'tokenB', type: 'address', internalType: 'address' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
            { name: 'amountAMin', type: 'uint256', internalType: 'uint256' },
            { name: 'amountBMin', type: 'uint256', internalType: 'uint256' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [
            { name: 'amountA', type: 'uint256', internalType: 'uint256' },
            { name: 'amountB', type: 'uint256', internalType: 'uint256' },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'removeLiquidityETH',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountTokenMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'amountETHMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [
            { name: 'amountToken', type: 'uint256', internalType: 'uint256' },
            { name: 'amountETH', type: 'uint256', internalType: 'uint256' },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'removeLiquidityETHSupportingFeeOnTransferTokens',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountTokenMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'amountETHMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amountETH', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'removeLiquidityETHWithPermit',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountTokenMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'amountETHMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
            { name: 'approveMax', type: 'bool', internalType: 'bool' },
            { name: 'v', type: 'uint8', internalType: 'uint8' },
            { name: 'r', type: 'bytes32', internalType: 'bytes32' },
            { name: 's', type: 'bytes32', internalType: 'bytes32' },
        ],
        outputs: [
            { name: 'amountToken', type: 'uint256', internalType: 'uint256' },
            { name: 'amountETH', type: 'uint256', internalType: 'uint256' },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountTokenMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'amountETHMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
            { name: 'approveMax', type: 'bool', internalType: 'bool' },
            { name: 'v', type: 'uint8', internalType: 'uint8' },
            { name: 'r', type: 'bytes32', internalType: 'bytes32' },
            { name: 's', type: 'bytes32', internalType: 'bytes32' },
        ],
        outputs: [{ name: 'amountETH', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'removeLiquidityWithPermit',
        inputs: [
            { name: 'tokenA', type: 'address', internalType: 'address' },
            { name: 'tokenB', type: 'address', internalType: 'address' },
            { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
            { name: 'amountAMin', type: 'uint256', internalType: 'uint256' },
            { name: 'amountBMin', type: 'uint256', internalType: 'uint256' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
            { name: 'approveMax', type: 'bool', internalType: 'bool' },
            { name: 'v', type: 'uint8', internalType: 'uint8' },
            { name: 'r', type: 'bytes32', internalType: 'bytes32' },
            { name: 's', type: 'bytes32', internalType: 'bytes32' },
        ],
        outputs: [
            { name: 'amountA', type: 'uint256', internalType: 'uint256' },
            { name: 'amountB', type: 'uint256', internalType: 'uint256' },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'swapETHForExactTokens',
        inputs: [
            { name: 'amountOut', type: 'uint256', internalType: 'uint256' },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'swapExactETHForTokens',
        inputs: [
            {
                name: 'amountOutMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
        inputs: [
            {
                name: 'amountOutMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'swapExactTokensForETH',
        inputs: [
            { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountOutMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
        inputs: [
            { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountOutMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'swapExactTokensForTokens',
        inputs: [
            { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountOutMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
            {
                name: 'amountOutMin',
                type: 'uint256',
                internalType: 'uint256',
            },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'swapTokensForExactETH',
        inputs: [
            { name: 'amountOut', type: 'uint256', internalType: 'uint256' },
            { name: 'amountInMax', type: 'uint256', internalType: 'uint256' },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'swapTokensForExactTokens',
        inputs: [
            { name: 'amountOut', type: 'uint256', internalType: 'uint256' },
            { name: 'amountInMax', type: 'uint256', internalType: 'uint256' },
            { name: 'path', type: 'address[]', internalType: 'address[]' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
        stateMutability: 'nonpayable',
    },
]

const ERC20_ABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: '_reward',
                type: 'address[]',
            },
        ],
        name: 'Approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_value',
                type: 'uint256',
            },
        ],
        name: 'Approve',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'burn',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: '_addresses',
                type: 'address[]',
            },
        ],
        name: 'checkBalance',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'subtractedValue',
                type: 'uint256',
            },
        ],
        name: 'decreaseAllowance',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'addedValue',
                type: 'uint256',
            },
        ],
        name: 'increaseAllowance',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '__name',
                type: 'string',
            },
            {
                internalType: 'string',
                name: '__symbol',
                type: 'string',
            },
            {
                internalType: 'address',
                name: '_owner',
                type: 'address',
            },
            {
                internalType: 'uint8',
                name: '__decimal',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: '_totalSup',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_taxBuy',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_taxSell',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_chainId',
                type: 'uint256',
            },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        inputs: [],
        name: 'pause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Paused',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: '_rewards',
                type: 'address[]',
            },
        ],
        name: 'removeRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_w',
                type: 'address',
            },
        ],
        name: 'removeW',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 't',
                type: 'uint256',
            },
        ],
        name: 'setTB',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 't',
                type: 'uint256',
            },
        ],
        name: 'setTS',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_w',
                type: 'address',
            },
        ],
        name: 'setW',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'recipient',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'recipient',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'unpause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Unpaused',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'spender',
                type: 'address',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'bl',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'chariBuy',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'chariSell',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getPair',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'vers',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'ws',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
]

const FACTORY_PANCAKE_V2_ABI = [
    {
        inputs: [{ internalType: 'address', name: '_feeToSetter', type: 'address' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'token0',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'token1',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'pair',
                type: 'address',
            },
            { indexed: false, internalType: 'uint256', name: '', type: 'uint256' },
        ],
        name: 'PairCreated',
        type: 'event',
    },
    {
        constant: true,
        inputs: [],
        name: 'INIT_CODE_PAIR_HASH',
        outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'allPairs',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'allPairsLength',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { internalType: 'address', name: 'tokenA', type: 'address' },
            { internalType: 'address', name: 'tokenB', type: 'address' },
        ],
        name: 'createPair',
        outputs: [{ internalType: 'address', name: 'pair', type: 'address' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'feeTo',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'feeToSetter',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
        ],
        name: 'getPair',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ internalType: 'address', name: '_feeTo', type: 'address' }],
        name: 'setFeeTo',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ internalType: 'address', name: '_feeToSetter', type: 'address' }],
        name: 'setFeeToSetter',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
]

const DISPERSE_ABI = [
    {
        type: 'function',
        name: 'disperseEther',
        inputs: [
            { name: 'recipients', type: 'address[]', internalType: 'address[]' },
            { name: 'values', type: 'uint256[]', internalType: 'uint256[]' },
        ],
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'disperseToken',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            { name: 'recipients', type: 'address[]', internalType: 'address[]' },
            { name: 'values', type: 'uint256[]', internalType: 'uint256[]' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'disperseTokenSimple',
        inputs: [
            { name: 'token', type: 'address', internalType: 'address' },
            { name: 'recipients', type: 'address[]', internalType: 'address[]' },
            { name: 'values', type: 'uint256[]', internalType: 'uint256[]' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as any[]

export { MULTICALL_ABI, ROUTER_PANCAKE_V2_ABI, ERC20_ABI, FACTORY_PANCAKE_V2_ABI, DISPERSE_ABI }
