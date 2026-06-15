<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import FolderTree from "./components/FolderTree.vue";

import {
  getFolderTree,
  getFolderChildren,
  getFolderContent,
  searchFolders,
  createFolder,
  renameFolder,
  deleteFolder,
} from "./services/api";

import type { Folder, FolderContent } from "./types/folder";

const folders = ref<Folder[]>([]);
const selectedFolder = ref<Folder | null>(null);
const children = ref<Folder[]>([]);
const contents = ref<FolderContent[]>([]);
const keyword = ref("");
const searchResult = ref<Folder[]>([]);
const viewMode = ref<"grid" | "list">("grid");
const statusText = ref("Ready");
const sidebarOpen = ref(false);

// Create
const showCreateModal = ref(false);
const newFolderName = ref("");

// Rename
const showRenameModal = ref(false);
const renameValue = ref("");
const renameFolderId = ref<number>();

// Delete
const showDeleteModal = ref(false);
const deleteTarget = ref<Folder | null>(null);
const isDeleting = ref(false);

onMounted(async () => {
  folders.value = await getFolderTree();
});

const handleSelectFolder = async (folder: Folder) => {
  selectedFolder.value = folder;
  keyword.value = "";
  searchResult.value = [];
  sidebarOpen.value = false;

  const [childResponse, contentResponse] = await Promise.all([
    getFolderChildren(folder.id),
    getFolderContent(folder.id),
  ]);

  children.value = childResponse;
  contents.value = contentResponse;

  const total = childResponse.length + contentResponse.length;
  statusText.value = `${total} item${total !== 1 ? "s" : ""} — ${folder.name}`;
};

watch(keyword, async (value) => {
  if (!value.trim()) { searchResult.value = []; return; }
  searchResult.value = await searchFolders(value);
});

const fileIcon = (item: FolderContent): string => {
  if (item.type === "folder") return "📁";
  const ext = item.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
  if (ext === "pdf") return "📕";
  if (["zip", "tar", "gz", "rar"].includes(ext)) return "🗜️";
  if (["xls", "xlsx"].includes(ext)) return "📊";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["html", "css", "js", "ts", "vue", "json"].includes(ext)) return "💻";
  return "📄";
};

const handleCreateFolder = async () => {
  if (!selectedFolder.value || !newFolderName.value.trim()) return;
  await createFolder(newFolderName.value, selectedFolder.value.id);
  newFolderName.value = "";
  showCreateModal.value = false;
  await handleSelectFolder(selectedFolder.value);
  folders.value = await getFolderTree();
};

const openRename = (folder: Folder) => {
  renameFolderId.value = folder.id;
  renameValue.value = folder.name;
  showRenameModal.value = true;
};

const handleRename = async () => {
  if (!renameFolderId.value) return;
  await renameFolder(renameFolderId.value, renameValue.value);
  showRenameModal.value = false;
  folders.value = await getFolderTree();
  if (selectedFolder.value) await handleSelectFolder(selectedFolder.value);
};

const openDelete = (folder: Folder) => {
  deleteTarget.value = folder;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteFolder(deleteTarget.value.id);
    showDeleteModal.value = false;
    deleteTarget.value = null;
    folders.value = await getFolderTree();
    if (selectedFolder.value) await handleSelectFolder(selectedFolder.value);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 flex flex-col">

    <!-- TOP BAR -->
    <header class="flex items-center gap-2 px-3 sm:px-5 py-3 bg-blue-600 text-white shrink-0 z-20 shadow-md">
      <button class="lg:hidden p-1.5 rounded hover:bg-white/15 transition shrink-0" aria-label="Toggle sidebar"
        @click="sidebarOpen = !sidebarOpen">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="text-xl leading-none shrink-0">📁</span>
      <span class="font-semibold text-base tracking-tight whitespace-nowrap hidden sm:inline">Windows Explorer</span>
      <span class="opacity-30 mx-1 hidden sm:inline">|</span>
      <span class="text-sm opacity-75 whitespace-nowrap hidden md:inline">Irsyad Rafiqi</span>

      <div class="flex-1 flex items-center bg-white/15 rounded-lg px-3 py-2 gap-2 mx-2 sm:mx-4 min-w-0">
        <svg class="w-4 h-4 shrink-0 opacity-75" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input v-model="keyword" type="text" placeholder="Search files and folders..."
          class="bg-transparent border-none outline-none text-sm text-white placeholder-white/60 w-full min-w-0" />
        <button v-if="keyword" @click="keyword = ''" class="opacity-60 hover:opacity-100 shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <button class="p-1.5 rounded hover:bg-white/15 transition shrink-0" title="Refresh"
        @click="getFolderTree().then(d => (folders = d))">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M4 12a8 8 0 0 1 14.93-3H15" />
          <path d="M20 4v5h-5" />
          <path d="M20 12a8 8 0 0 1-14.93 3H9" />
          <path d="M4 20v-5h5" />
        </svg>
      </button>
    </header>

    <!-- BODY -->
    <div class="flex flex-1 overflow-hidden relative">
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black/30 z-10 lg:hidden" @click="sidebarOpen = false" />

      <!-- SIDEBAR -->
      <aside
        class="fixed top-14 bottom-0 left-0 z-20 w-64 bg-white border-r border-slate-200 overflow-y-auto flex flex-col transition-transform duration-200 lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'">
        <div class="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-widest select-none">
          Folders
        </div>

        <div v-if="searchResult.length"
          class="mx-2 mb-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div
            class="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 bg-slate-50 uppercase tracking-widest">
            Search results
          </div>
          <div v-for="folder in searchResult" :key="folder.id"
            class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition"
            :class="{ 'bg-blue-50 text-blue-700 font-medium': selectedFolder?.id === folder.id }"
            @click="handleSelectFolder(folder)">
            <span>📁</span>
            <span class="truncate">{{ folder.name }}</span>
          </div>
        </div>

        <div v-if="!keyword.trim()" class="py-1">
          <FolderTree :folders="folders" :selected-id="selectedFolder?.id" @select="handleSelectFolder" />
        </div>
      </aside>

      <!-- MAIN -->
      <main class="flex-1 flex flex-col overflow-hidden bg-white min-w-0">

        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 shrink-0 bg-white">
          <div class="flex items-center gap-1.5 min-w-0 flex-1 text-sm">
            <template v-if="selectedFolder">
              <span class="text-blue-500 shrink-0">🏠</span>
              <span class="text-slate-300 shrink-0">›</span>
              <span class="font-medium text-slate-700 truncate">{{ selectedFolder.name }}</span>
            </template>
            <template v-else>
              <span class="text-slate-400">Select a folder to explore</span>
            </template>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button v-if="selectedFolder"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              @click="showCreateModal = true">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Folder
            </button>

            <div class="flex border border-slate-200 rounded-lg overflow-hidden">
              <button class="px-2.5 py-1.5 transition"
                :class="viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50'"
                title="Grid view" @click="viewMode = 'grid'">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zM9 10.5A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5z" />
                </svg>
              </button>
              <button class="px-2.5 py-1.5 transition border-l border-slate-200"
                :class="viewMode === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50'"
                title="List view" @click="viewMode = 'list'">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50">
          <div v-if="selectedFolder">

            <!-- Subfolders -->
            <section class="mb-7">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Subfolders</span>
                <span class="text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5">{{
                  children.length }}</span>
              </div>

              <!-- Grid -->
              <div v-if="viewMode === 'grid'"
                class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                <div v-for="folder in children" :key="folder.id"
                  class="relative group bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-sm transition cursor-pointer"
                  @click="handleSelectFolder(folder)">
                  <div class="flex flex-col items-center gap-1.5 pt-1">
                    <span class="text-4xl">📁</span>
                    <span class="text-sm font-medium text-slate-700 text-center leading-tight line-clamp-2 w-full">{{
                      folder.name }}</span>
                  </div>
                  <div class="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-blue-50 transition text-xs"
                      @click.stop="openRename(folder)" title="Rename">✏️</button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-red-50 transition text-xs"
                      @click.stop="openDelete(folder)" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>

              <!-- List -->
              <div v-else class="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div v-for="folder in children" :key="folder.id"
                  class="group flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition cursor-pointer"
                  @click="handleSelectFolder(folder)">
                  <span class="text-xl shrink-0">📁</span>
                  <span class="text-sm font-medium text-slate-700 flex-1 truncate">{{ folder.name }}</span>
                  <div class="hidden group-hover:flex items-center gap-1 shrink-0">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-blue-50 transition text-xs"
                      @click.stop="openRename(folder)" title="Rename">✏️</button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-red-50 transition text-xs"
                      @click.stop="openDelete(folder)" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>

              <div v-if="children.length === 0"
                class="rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-10 text-sm text-slate-400 text-center">
                No subfolders here yet.
              </div>
            </section>

            <!-- Files -->
            <section>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Files</span>
                <span class="text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5">{{
                  contents.length }}</span>
              </div>

              <div v-if="viewMode === 'grid'"
                class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                <div v-for="item in contents" :key="item.id"
                  class="bg-white flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition text-center group cursor-pointer">
                  <span class="text-4xl group-hover:scale-110 transition-transform">{{ fileIcon(item) }}</span>
                  <span class="text-sm text-slate-600 font-medium leading-tight line-clamp-2 w-full">
                    {{ item.name }}{{ item.type === "file" ? "." : "" }}{{ item.extension }}
                  </span>
                </div>
              </div>

              <div v-else class="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div v-for="item in contents" :key="item.id"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition cursor-pointer">
                  <span class="text-xl shrink-0">{{ fileIcon(item) }}</span>
                  <span class="text-sm text-slate-700 truncate">
                    {{ item.name }}{{ item.type === "file" ? "." : "" }}{{ item.extension }}
                  </span>
                </div>
              </div>

              <div v-if="contents.length === 0"
                class="rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-10 text-sm text-slate-400 text-center">
                No files in this folder yet.
              </div>
            </section>
          </div>

          <!-- Empty state -->
          <div v-else class="flex flex-col items-center justify-center h-full py-20 gap-3 text-slate-300">
            <svg class="w-14 h-14" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p class="text-sm text-slate-400">Select a folder from the sidebar</p>
          </div>
        </div>
      </main>
    </div>

    <!-- STATUS BAR -->
    <footer
      class="flex items-center gap-2 px-4 sm:px-5 py-2 border-t border-slate-200 bg-white text-xs text-slate-400 shrink-0">
      <span class="w-2 h-2 rounded-full bg-green-400 inline-block shrink-0"></span>
      <span class="truncate">{{ statusText }}</span>
    </footer>
  </div>

  <!-- CREATE MODAL -->
  <Teleport to="body">
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="showCreateModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-800">New Folder</h3>
          <p class="text-xs text-slate-400 mt-0.5">Inside: {{ selectedFolder?.name }}</p>
        </div>
        <div class="px-6 py-4">
          <input v-model="newFolderName"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Folder name" @keyup.enter="handleCreateFolder" autofocus />
        </div>
        <div class="flex justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            class="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition text-slate-600"
            @click="showCreateModal = false">Cancel</button>
          <button
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            :disabled="!newFolderName.trim()" @click="handleCreateFolder">Create</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- RENAME MODAL -->
  <Teleport to="body">
    <div v-if="showRenameModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="showRenameModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-800">Rename Folder</h3>
        </div>
        <div class="px-6 py-4">
          <input v-model="renameValue"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Folder name" @keyup.enter="handleRename" />
        </div>
        <div class="flex justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            class="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition text-slate-600"
            @click="showRenameModal = false">Cancel</button>
          <button
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            :disabled="!renameValue.trim()" @click="handleRename">Rename</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- DELETE MODAL -->
  <Teleport to="body">
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="!isDeleting && (showDeleteModal = false)">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-5 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-800">Delete Folder</h3>
            <p class="text-sm text-slate-500 mt-1">
              Hapus <span class="font-semibold text-slate-700">"{{ deleteTarget?.name }}"</span>? Aksi ini tidak bisa
              dibatalkan.
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            class="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition text-slate-600 disabled:opacity-50"
            :disabled="isDeleting" @click="showDeleteModal = false">Cancel</button>
          <button
            class="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-60 flex items-center gap-2"
            :disabled="isDeleting" @click="handleDelete">
            <svg v-if="isDeleting" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v8z" />
            </svg>
            {{ isDeleting ? "Menghapus..." : "Hapus" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>