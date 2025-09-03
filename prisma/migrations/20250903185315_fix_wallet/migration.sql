/*
  Warnings:

  - Added the required column `wallet` to the `ScanContract` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScanContract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "token" TEXT,
    "isAirdrop" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ScanContract" ("balance", "contract", "createdAt", "id", "isAirdrop", "token") SELECT "balance", "contract", "createdAt", "id", "isAirdrop", "token" FROM "ScanContract";
DROP TABLE "ScanContract";
ALTER TABLE "new_ScanContract" RENAME TO "ScanContract";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
