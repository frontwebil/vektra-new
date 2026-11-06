CREATE TABLE "ServicePageContent" (
    "slug" VARCHAR(80) NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ServicePageContent_pkey" PRIMARY KEY ("slug")
);
