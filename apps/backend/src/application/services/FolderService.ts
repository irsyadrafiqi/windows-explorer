import { FolderRepository } from "../../domain/repositories/FolderRepository";
import { FolderEntity } from "../../domain/entities/Folder";

export class FolderService {
  constructor(
    private readonly repository =
      new FolderRepository()
  ) {}

  async getTree() {
    const folders: FolderEntity[] =
      await this.repository.findAllFolders();

    const map = new Map<number, FolderEntity & { children: any[] }>();

    folders.forEach((folder: FolderEntity) => {
      map.set(folder.id, {
        ...folder,
        children: [],
      });
    });

    const roots: Array<FolderEntity & { children: any[] }> = [];

    folders.forEach((folder: FolderEntity) => {
      if (folder.parentId) {
        map
          .get(folder.parentId)!
          .children.push(
            map.get(folder.id)!
          );
      } else {
        roots.push(
          map.get(folder.id)!
        );
      }
    });

    return roots;
  }

  async getChildren(id: number) {
    return this.repository.findChildren(
      id
    );
  }

  async getContent(id: number) {
    return this.repository.findContent(
      id
    );
  }

  async search(keyword: string) {
    return this.repository.search(
      keyword
    );
  }

  async createFolder(
    name: string,
    parentId?: number
  ) {
    return this.repository.createFolder(
      name,
      parentId
    );
  }
  
  async renameFolder(
    id: number,
    name: string
  ) {
    return this.repository.renameFolder(
      id,
      name
    );
  }
  async deleteFolder(
    id: number
  ) {
    return this.repository.deleteFolder(
      id
    );
  }
}