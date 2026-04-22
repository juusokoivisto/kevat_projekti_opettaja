-- CreateTable
CREATE TABLE "opettaja_kurssit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opettaja_id" INTEGER NOT NULL,
    "kurssi_id" INTEGER NOT NULL,
    CONSTRAINT "opettaja_kurssit_opettaja_id_fkey" FOREIGN KEY ("opettaja_id") REFERENCES "opettajat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opettaja_kurssit_kurssi_id_fkey" FOREIGN KEY ("kurssi_id") REFERENCES "kurssit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "opettaja_kurssit_opettaja_id_kurssi_id_key" ON "opettaja_kurssit"("opettaja_id", "kurssi_id");
