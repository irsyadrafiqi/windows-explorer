export interface Folder {
  id: number;
  name: string;
  children?: Folder[];
}

export interface FolderContent {
  id: number;
  name: string;
  type: "folder" | "file";
  extension: string;
}