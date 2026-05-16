BSC_RPC ?= https://public-bsc-mainnet.fastnode.io
PORT    ?= 8545
# 100 BNB in hex wei  (100 * 10^18)
FUND_AMOUNT ?= 0x56BC75E2D63100000

# ── Target wallets ─────────────────────────────────────────────────────────────
ADDR_MAIN = 0x62636FFD17bB80B1a7c177e5F45d774A1eE0d228
ADDR_SWAP = 0x3C90D8be4573F0582a2613e5CeFE8727431dB2f2
ADDR_MINT = 0x658Cb9E52cF6f804F7976BD6b36dE1C990D8079f

# ── Install foundry ────────────────────────────────────────────────────────────
install-foundry:
	curl -L https://foundry.paradigm.xyz | bash
	@echo ""
	@echo "Run: foundryup   (then restart terminal)"

# ── Start BSC fork ─────────────────────────────────────────────────────────────
# PancakeSwap Router + Factory tồn tại sẵn ở địa chỉ thật
# Instant mining (không cần --block-time)
fork:
	@echo "============================================================"
	@echo "  BSC Fork  →  http://127.0.0.1:$(PORT)"
	@echo "  Chain ID  :  56"
	@echo "  PancakeSwap Router: 0x10ED43C718714eb63d5aA57B78B54704E256024E"
	@echo "============================================================"
	@echo "  Ví chủ : $(ADDR_MAIN)"
	@echo "  Ví swap: $(ADDR_SWAP)"
	@echo "  Ví mint: $(ADDR_MINT)"
	@echo "============================================================"
	@echo "  Sau khi fork chạy, dùng: make fund-all"
	@echo "============================================================"
	anvil \
		--fork-url $(BSC_RPC) \
		--chain-id 56 \
		--port $(PORT) \
		--balance 10000 \
		--no-rate-limit \
		--no-storage-caching

# ── Fund cả 3 ví cùng lúc ─────────────────────────────────────────────────────
fund-all:
	cast rpc anvil_setBalance $(ADDR_MAIN) $(FUND_AMOUNT) --rpc-url http://127.0.0.1:$(PORT)
	@echo "Funded Ví chủ  $(ADDR_MAIN)"
	cast rpc anvil_setBalance $(ADDR_SWAP) $(FUND_AMOUNT) --rpc-url http://127.0.0.1:$(PORT)
	@echo "Funded Ví swap $(ADDR_SWAP)"
	cast rpc anvil_setBalance $(ADDR_MINT) $(FUND_AMOUNT) --rpc-url http://127.0.0.1:$(PORT)
	@echo "Funded Ví mint $(ADDR_MINT)"
	@echo ""
	@echo "Tất cả ví đã được fund 100 BNB"

# ── Fund bất kỳ địa chỉ nào ───────────────────────────────────────────────────
# Usage: make fund WALLET=0x...
fund:
	@if [ -z "$(WALLET)" ]; then \
		echo "Usage: make fund WALLET=0xYourAddress"; exit 1; \
	fi
	cast rpc anvil_setBalance $(WALLET) $(FUND_AMOUNT) --rpc-url http://127.0.0.1:$(PORT)
	@echo "Funded $(WALLET) with 100 BNB"

# ── Kiểm tra số dư cả 3 ví ────────────────────────────────────────────────────
balance-all:
	@echo "Ví chủ  $(ADDR_MAIN):"
	@cast balance $(ADDR_MAIN) --ether --rpc-url http://127.0.0.1:$(PORT)
	@echo "Ví swap $(ADDR_SWAP):"
	@cast balance $(ADDR_SWAP) --ether --rpc-url http://127.0.0.1:$(PORT)
	@echo "Ví mint $(ADDR_MINT):"
	@cast balance $(ADDR_MINT) --ether --rpc-url http://127.0.0.1:$(PORT)

# ── Kiểm tra số dư 1 ví ───────────────────────────────────────────────────────
# Usage: make balance WALLET=0x...
balance:
	@if [ -z "$(WALLET)" ]; then \
		echo "Usage: make balance WALLET=0xYourAddress"; exit 1; \
	fi
	cast balance $(WALLET) --ether --rpc-url http://127.0.0.1:$(PORT)

.PHONY: install-foundry fork fund-all fund balance-all balance
