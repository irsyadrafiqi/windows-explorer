import { FolderService } from "../../application/services/FolderService";

const service =
  new FolderService();

export class FolderController {
  static async getTree() {
    return service.getTree();
  }

  static async getChildren(
    id: number
  ) {
    return service.getChildren(id);
  }

  static async getContent(
    id: number
  ) {
    return service.getContent(id);
  }

  static async search(
    keyword: string
  ) {
    return service.search(keyword);
  }

  static async createFolder(
    name: string,
    parentId?: number
  ) {
    return service.createFolder(
      name,
      parentId
    );
  }
  
  static async renameFolder(
    id: number,
    name: string
  ) {
    return service.renameFolder(
      id,
      name
    );
  }

  static async deleteFolder(
    id: number
  ) {
    return service.deleteFolder(
      id
    );
  }
}