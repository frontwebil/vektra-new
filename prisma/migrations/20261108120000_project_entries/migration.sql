CREATE TABLE "ProjectEntry" (
    "slug" VARCHAR(80) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProjectEntry_pkey" PRIMARY KEY ("slug")
);

CREATE INDEX "ProjectEntry_position_idx" ON "ProjectEntry"("position");
