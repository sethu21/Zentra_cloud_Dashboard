-- CreateTable
CREATE TABLE "EtReading" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "port1_wc" DOUBLE PRECISION,
    "port2_wc" DOUBLE PRECISION,
    "port3_wc" DOUBLE PRECISION,
    "port1_se_ec" DOUBLE PRECISION,
    "port2_se_ec" DOUBLE PRECISION,
    "port3_se_ec" DOUBLE PRECISION,
    "port1_temp" DOUBLE PRECISION,
    "port2_temp" DOUBLE PRECISION,
    "port3_temp" DOUBLE PRECISION,
    "port4_wc" DOUBLE PRECISION,
    "port5_wc" DOUBLE PRECISION,
    "port6_wc" DOUBLE PRECISION,
    "port4_se_ec" DOUBLE PRECISION,
    "port4_temp" DOUBLE PRECISION,

    CONSTRAINT "EtReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
