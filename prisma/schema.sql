-- CreateTable
CREATE TABLE "ScanWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet" TEXT NOT NULL,
    "tx" TEXT NOT NULL,
    "token" TEXT,
    "destination" TEXT,
    "amount" TEXT,
    "isTransferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "rpc" TEXT NOT NULL DEFAULT 'https://bsc.drpc.org',
    "chainId" TEXT NOT NULL DEFAULT '56',
    "mainKey" TEXT NOT NULL DEFAULT '',
    "swapKey" TEXT NOT NULL DEFAULT '',
    "mintKey" TEXT NOT NULL DEFAULT '',
    "contractCode" TEXT NOT NULL DEFAULT '',
    "tokensJson" TEXT NOT NULL DEFAULT '[]',
    "solcVersion" TEXT NOT NULL DEFAULT '0.8.27',
    "swapCommandsJson" TEXT NOT NULL DEFAULT '[]',
    "swapDelay" TEXT NOT NULL DEFAULT '0',
    "swapRepeat" TEXT NOT NULL DEFAULT '1',
    "transferBnbToMain" TEXT NOT NULL DEFAULT '',
    "scanContract" TEXT NOT NULL DEFAULT '',
    "disperseAmount" TEXT NOT NULL DEFAULT '',
    "disperseBatchSize" TEXT NOT NULL DEFAULT '10000',
    "scanContractsJson" TEXT NOT NULL DEFAULT '[]',
    "scanMode" TEXT NOT NULL DEFAULT 'allBlocks',
    "scanDelay" TEXT NOT NULL DEFAULT '30',
    "scanMaxDuration" TEXT NOT NULL DEFAULT '0',
    "implAddress" TEXT NOT NULL DEFAULT '',
    "factoryAddress" TEXT NOT NULL DEFAULT '',
    "logsJson" TEXT NOT NULL DEFAULT '[]',
    "stepStatesJson" TEXT NOT NULL DEFAULT '{}',
    "fakeVolumeEnabled" TEXT NOT NULL DEFAULT '',
    "fakeVolumeTimes" TEXT NOT NULL DEFAULT '3',
    "fakeVolumeBnbAmount" TEXT NOT NULL DEFAULT '',
    "fakeVolumeAddress" TEXT NOT NULL DEFAULT '',
    "fakeVolumeVersion" TEXT NOT NULL DEFAULT '',
    "fakeVolumeCode" TEXT NOT NULL DEFAULT '',
    "seedBuyBnb" TEXT NOT NULL DEFAULT '0.0001',
    "seedBuyTimes" TEXT NOT NULL DEFAULT '2',
    "gasPriceGwei" TEXT NOT NULL DEFAULT '0.05',
    "tabsJson" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE INDEX "ScanWallet_destination_idx" ON "ScanWallet"("destination");
