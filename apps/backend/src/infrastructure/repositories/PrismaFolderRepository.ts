import { prisma } from "../prisma/prisma";

export class FolderRepository {
  async findAllFolders() {
    return prisma.folder.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  async findChildren(folderId: number) {
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
  async createFolder(
    name: string,
    parentId?: number
  ) {
    return prisma.folder.create({
      data: {
        name,
        parentId: parentId || null,
      },
    });
  }
  async renameFolder(
    id: number,
    name: string
  ) {
    return prisma.folder.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }
  async deleteFolder(
    id: number
  ) {
    return prisma.folder.delete({
      where: {
        id,
      },
    });
  }
}