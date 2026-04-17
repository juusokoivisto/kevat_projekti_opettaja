-- CreateTable
CREATE TABLE "opettajat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nimi" TEXT NOT NULL,
    "sukunimi" TEXT NOT NULL,
    "sahkoposti" TEXT NOT NULL,
    "sopimustunnit_vuosi" INTEGER NOT NULL,
    "vapaa_resurssi" INTEGER NOT NULL,
    "vari" TEXT
);

-- CreateTable
CREATE TABLE "kurssit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nimi" TEXT NOT NULL,
    "koodi" TEXT NOT NULL,
    "opintopisteet" INTEGER NOT NULL,
    "suunnitellut_tunnit" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "opiskelijaryhmat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ryhmatunnus" TEXT NOT NULL,
    "aloitusvuosi" INTEGER NOT NULL,
    "opiskelijamaara" INTEGER NOT NULL,
    "tutkinto_ohjelma" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "resurssivaraukset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opettaja_id" INTEGER NOT NULL,
    "kurssi_id" INTEGER NOT NULL,
    "ryhma_id" INTEGER NOT NULL,
    "varatut_tunnit" INTEGER NOT NULL,
    "rooli" TEXT NOT NULL,
    CONSTRAINT "resurssivaraukset_opettaja_id_fkey" FOREIGN KEY ("opettaja_id") REFERENCES "opettajat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resurssivaraukset_kurssi_id_fkey" FOREIGN KEY ("kurssi_id") REFERENCES "kurssit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resurssivaraukset_ryhma_id_fkey" FOREIGN KEY ("ryhma_id") REFERENCES "opiskelijaryhmat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tyojarjestys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kurssi_id" INTEGER NOT NULL,
    "opettaja_id" INTEGER NOT NULL,
    "ryhma_id" INTEGER NOT NULL,
    "tila_id" INTEGER NOT NULL,
    "alkaa" DATETIME NOT NULL,
    "paattyy" DATETIME NOT NULL,
    CONSTRAINT "tyojarjestys_kurssi_id_fkey" FOREIGN KEY ("kurssi_id") REFERENCES "kurssit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tyojarjestys_opettaja_id_fkey" FOREIGN KEY ("opettaja_id") REFERENCES "opettajat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tyojarjestys_ryhma_id_fkey" FOREIGN KEY ("ryhma_id") REFERENCES "opiskelijaryhmat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tyojarjestys_tila_id_fkey" FOREIGN KEY ("tila_id") REFERENCES "tilat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tilat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "huoneen_numero" TEXT NOT NULL,
    "kapasiteetti" INTEGER NOT NULL,
    "tyyppi" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "yllapitajat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kayttajatunnus" TEXT NOT NULL,
    "salasana_hash" TEXT NOT NULL,
    "nimi" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "opettajat_sahkoposti_key" ON "opettajat"("sahkoposti");

-- CreateIndex
CREATE UNIQUE INDEX "kurssit_koodi_key" ON "kurssit"("koodi");

-- CreateIndex
CREATE UNIQUE INDEX "opiskelijaryhmat_ryhmatunnus_key" ON "opiskelijaryhmat"("ryhmatunnus");

-- CreateIndex
CREATE UNIQUE INDEX "yllapitajat_kayttajatunnus_key" ON "yllapitajat"("kayttajatunnus");
