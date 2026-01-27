-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "warning_count" INTEGER NOT NULL DEFAULT 0,
    "aggregated_bounce_rate_trend" REAL NOT NULL DEFAULT 0.0,
    "paused_reason" TEXT
);
INSERT INTO "new_Domain" ("aggregated_bounce_rate_trend", "domain", "id", "paused_reason", "status") SELECT "aggregated_bounce_rate_trend", "domain", "id", "paused_reason", "status" FROM "Domain";
DROP TABLE "Domain";
ALTER TABLE "new_Domain" RENAME TO "Domain";
CREATE UNIQUE INDEX "Domain_domain_key" ON "Domain"("domain");
CREATE TABLE "new_Mailbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "hard_bounce_count" INTEGER NOT NULL DEFAULT 0,
    "delivery_failure_count" INTEGER NOT NULL DEFAULT 0,
    "window_sent_count" INTEGER NOT NULL DEFAULT 0,
    "window_bounce_count" INTEGER NOT NULL DEFAULT 0,
    "window_start_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mailbox_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "Domain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mailbox" ("delivery_failure_count", "domain_id", "email", "hard_bounce_count", "id", "last_activity_at", "status") SELECT "delivery_failure_count", "domain_id", "email", "hard_bounce_count", "id", "last_activity_at", "status" FROM "Mailbox";
DROP TABLE "Mailbox";
ALTER TABLE "new_Mailbox" RENAME TO "Mailbox";
CREATE INDEX "Mailbox_domain_id_idx" ON "Mailbox"("domain_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
