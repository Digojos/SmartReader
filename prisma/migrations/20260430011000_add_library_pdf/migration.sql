CREATE TABLE `LibraryPdf` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `originalName` VARCHAR(191) NOT NULL,
  `storagePath` VARCHAR(191) NOT NULL,
  `fileSize` INTEGER NOT NULL,
  `pageCount` INTEGER NOT NULL DEFAULT 0,
  `extractedText` LONGTEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `LibraryPdf_userId_createdAt_idx`(`userId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `LibraryPdf`
  ADD CONSTRAINT `LibraryPdf_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
