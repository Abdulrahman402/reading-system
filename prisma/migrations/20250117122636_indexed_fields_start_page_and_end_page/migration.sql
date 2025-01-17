-- DropIndex
DROP INDEX "ReadingInterval_userId_bookId_idx";

-- CreateIndex
CREATE INDEX "ReadingInterval_startPage_idx" ON "ReadingInterval"("startPage");

-- CreateIndex
CREATE INDEX "ReadingInterval_endPage_idx" ON "ReadingInterval"("endPage");
