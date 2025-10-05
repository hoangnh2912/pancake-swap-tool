-- CreateTable
CREATE TABLE "Stepper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "data" TEXT NOT NULL,
    "gasLimit" INTEGER NOT NULL,
    "gasPrice" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepperId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "gasUsed" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_stepperId_fkey" FOREIGN KEY ("stepperId") REFERENCES "Stepper" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");
