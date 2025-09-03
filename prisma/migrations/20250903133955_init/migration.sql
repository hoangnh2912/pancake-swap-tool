-- CreateTable
CREATE TABLE "ScanContract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contract" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "token" TEXT,
    "isAirdrop" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScanBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "token" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
