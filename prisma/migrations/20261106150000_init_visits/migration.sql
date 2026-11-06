CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "visitedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "visitorKey" TEXT NOT NULL,
    "country" VARCHAR(2),
    "device" VARCHAR(20) NOT NULL,
    "browser" VARCHAR(30) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "referrerHost" VARCHAR(255),
    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Visit_visitedAt_idx" ON "Visit"("visitedAt");
CREATE INDEX "Visit_visitorKey_visitedAt_idx" ON "Visit"("visitorKey", "visitedAt");
CREATE INDEX "Visit_country_visitedAt_idx" ON "Visit"("country", "visitedAt");
CREATE INDEX "Visit_device_visitedAt_idx" ON "Visit"("device", "visitedAt");
CREATE INDEX "Visit_path_visitedAt_idx" ON "Visit"("path", "visitedAt");
