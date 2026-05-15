-- CreateTable
CREATE TABLE "Permission" (
    "id" CHAR(36) NOT NULL,
    "subject" TEXT NOT NULL,
    "actions" JSONB,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
