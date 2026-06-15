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
}