/*
  Warnings:

  - Added the required column `tabId` to the `Stepper` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stepper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tabId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "data" TEXT NOT NULL,
    "gasLimit" INTEGER NOT NULL,
    "gasPrice" INTEGER NOT NULL
);
INSERT INTO "new_Stepper" ("createdAt", "data", "from", "gasLimit", "gasPrice", "id", "to", "value") SELECT "createdAt", "data", "from", "gasLimit", "gasPrice", "id", "to", "value" FROM "Stepper";
DROP TABLE "Stepper";
ALTER TABLE "new_Stepper" RENAME TO "Stepper";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
