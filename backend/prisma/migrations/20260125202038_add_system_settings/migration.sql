-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CampaignToMailbox" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CampaignToMailbox_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CampaignToMailbox_B_fkey" FOREIGN KEY ("B") REFERENCES "Mailbox" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignToMailbox_AB_unique" ON "_CampaignToMailbox"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignToMailbox_B_index" ON "_CampaignToMailbox"("B");
