-- CreateTable
CREATE TABLE "Tab" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL
);

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
    "gasPrice" INTEGER NOT NULL,
    CONSTRAINT "Stepper_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "Tab" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Stepper" ("createdAt", "data", "from", "gasLimit", "gasPrice", "id", "tabId", "to", "value") SELECT "createdAt", "data", "from", "gasLimit", "gasPrice", "id", "tabId", "to", "value" FROM "Stepper";
DROP TABLE "Stepper";
ALTER TABLE "new_Stepper" RENAME TO "Stepper";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
