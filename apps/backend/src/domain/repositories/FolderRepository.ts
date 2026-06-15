import { prisma } from "../../infrastructure/prisma/prisma";
import { FolderEntity } from "../entities/Folder";

export class FolderRepository {
  async findAllFolders(): Promise<FolderEntity[]> {
    return prisma.folder.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  async findChildren(folderId: number): Promise<FolderEntity[]> {
    return prisma.folder.findMany({
      where: {
        parentId: folderId,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findContent(folderId: number) {
    const folders = await prisma.folder.findMany({
      where: {
        parentId: folderId,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        folderId,
      },
    });

    return {
      folders,
      files,
    };
  }

  async search(keyword: string) {
    return prisma.folder.findMany({
      where: {
        name: {
          contains: keyword,
        },
      },
    });
  }
}