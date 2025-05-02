-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignee" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "worklog" TEXT,
    "fields" TEXT,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteUrlTable" (
    "site_id" SERIAL NOT NULL,
    "site_url" TEXT NOT NULL,

    CONSTRAINT "SiteUrlTable_pkey" PRIMARY KEY ("site_id")
);

-- CreateTable
CREATE TABLE "Project2" (
    "id" TEXT NOT NULL,
    "site_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "project_key" TEXT NOT NULL,
    "board" TEXT,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JiraUser" (
    "id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "jira_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JiraUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JiraUserToProject2" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Project2_label_key" ON "Project2"("label");

-- CreateIndex
CREATE UNIQUE INDEX "JiraUser_jira_id_key" ON "JiraUser"("jira_id");

-- CreateIndex
CREATE UNIQUE INDEX "_JiraUserToProject2_AB_unique" ON "_JiraUserToProject2"("A", "B");

-- CreateIndex
CREATE INDEX "_JiraUserToProject2_B_index" ON "_JiraUserToProject2"("B");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project2" ADD CONSTRAINT "Project2_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "SiteUrlTable"("site_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JiraUserToProject2" ADD CONSTRAINT "_JiraUserToProject2_A_fkey" FOREIGN KEY ("A") REFERENCES "JiraUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JiraUserToProject2" ADD CONSTRAINT "_JiraUserToProject2_B_fkey" FOREIGN KEY ("B") REFERENCES "Project2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
