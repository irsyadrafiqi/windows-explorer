import axios from "axios";
import type { FolderContent } from "../types/folder";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

export const getFolderTree = async () => {
  const { data } = await api.get("/folders/tree");
  return data;
};

export const getFolderChildren = async (id: number) => {
  const { data } = await api.get(`/folders/${id}/children`);
  return data;
};

export const getFolderContent = async (id: number) => {
  const { data } = await api.get(`/folders/${id}/content`);

  const folderItems: FolderContent[] = data.folders.map(
    (folder: { id: number; name: string }) => ({
      id: folder.id,
      name: folder.name,
      type: "folder",
    })
  );

  const fileItems: FolderContent[] = data.files.map(
    (file: { id: number; name: string; extension: string }) => ({
      id: file.id,
      name: file.name,
      type: "file",
      extension: file.extension,
    })
  );

  return [...folderItems, ...fileItems];
};

export const searchFolders = async (keyword: string) => {
  const { data } = await api.get("/folders/search", {
    params: {
      q: keyword,
    },
  });

  return data;
};