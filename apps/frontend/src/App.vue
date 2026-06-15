<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import FolderTree from "./components/FolderTree.vue";

import {
  getFolderTree,
  getFolderChildren,
  getFolderContent,
  searchFolders,
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
  if (!value.trim()) {
    searchResult.value = [];
    return;
  }
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
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 flex flex-col">

    <!-- TOP BAR -->
    <header class="flex items-center gap-2 px-3 sm:px-5 py-3 bg-blue-600 text-white shrink-0 z-20">

      <!-- Hamburger (mobile only) -->
      <button
        class="lg:hidden p-1.5 rounded hover:bg-white/15 transition shrink-0"
        aria-label="Toggle sidebar"
        @click="sidebarOpen = !sidebarOpen"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <span class="text-xl leading-none shrink-0">📁</span>
      <span class="font-semibold text-base tracking-tight whitespace-nowrap hidden sm:inline">Windows Explorer</span>
      <span class="opacity-30 mx-1 hidden sm:inline">|</span>
      <span class="text-sm opacity-75 whitespace-nowrap hidden md:inline">Irsyad rafiqi</span>

      <!-- Search bar -->
      <div class="flex-1 flex items-center bg-white/15 rounded-full px-3 py-2 gap-2 mx-2 sm:mx-4 min-w-0">
        <svg class="w-4 h-4 shrink-0 opacity-75" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="Search files and folders..."
          class="bg-transparent border-none outline-none text-sm text-white placeholder-white/60 w-full min-w-0"
        />
      </div>

      <button
        class="p-1.5 rounded hover:bg-white/15 transition opacity-80 hover:opacity-100 shrink-0"
        title="Refresh"
        @click="getFolderTree().then(d => (folders = d))"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 14.93-3H15"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14.93 3H9"/><path d="M4 20v-5h5"/>
        </svg>
      </button>
    </header>

    <!-- BODY -->
    <div class="flex flex-1 overflow-hidden relative">

      <!-- Overlay (mobile) -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/30 z-10 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- SIDEBAR -->
      <aside
        class="fixed top-14 bottom-0 left-0 z-20 w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto flex flex-col transition-transform duration-200 lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-widest select-none">
          Folders
        </div>

        <!-- Search results -->
        <div v-if="searchResult.length" class="mx-2 mb-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div class="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 bg-slate-50 uppercase tracking-widest">
            Search results
          </div>
          <div
            v-for="folder in searchResult"
            :key="folder.id"
            class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition"
            :class="{ 'bg-blue-50 text-blue-700 font-medium': selectedFolder?.id === folder.id }"
            @click="handleSelectFolder(folder)"
          >
            <span>📁</span>
            <span class="truncate">{{ folder.name }}</span>
          </div>
        </div>

        <!-- Folder tree -->
        <div v-if="!keyword.trim()" class="py-1">
          <FolderTree
            :folders="folders"
            :selected-id="selectedFolder?.id"
            @select="handleSelectFolder"
          />
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 flex flex-col overflow-hidden bg-white min-w-0">

        <!-- Breadcrumb + Toolbar -->
        <div class="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 shrink-0">

          <!-- Breadcrumb -->
          <div class="flex items-center gap-1 min-w-0 flex-1">
            <template v-if="selectedFolder">
              <span class="text-sm font-medium text-blue-600 shrink-0">🏠 Root</span>
              <span class="text-slate-300 text-sm shrink-0">›</span>
              <span class="text-sm font-semibold text-slate-700 truncate">{{ selectedFolder.name }}</span>
            </template>
            <template v-else>
              <span class="text-sm text-slate-400">Select a folder to explore</span>
            </template>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 shrink-0">

            <!-- View toggle -->
            <div class="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                class="px-2.5 py-1.5 transition"
                :class="viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-50'"
                title="Grid view"
                @click="viewMode = 'grid'"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zM9 10.5A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5z"/>
                </svg>
              </button>
              <button
                class="px-2.5 py-1.5 transition border-l border-slate-200"
                :class="viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-50'"
                title="List view"
                @click="viewMode = 'list'"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Content area -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5">
          <div v-if="selectedFolder">

            <!-- Sub Folders -->
            <section class="mb-7">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Direct sub folders</span>
                <span class="text-sm text-slate-400">{{ children.length }} items</span>
              </div>

              <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                <div
                  v-for="folder in children"
                  :key="folder.id"
                  class="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition text-center group"
                  @click="handleSelectFolder(folder)"
                >
                  <span class="text-3xl group-hover:scale-110 transition-transform">📁</span>
                  <span class="text-sm text-slate-700 font-medium leading-tight line-clamp-2 w-full">{{ folder.name }}</span>
                </div>
              </div>

              <div v-else class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                <div
                  v-for="folder in children"
                  :key="folder.id"
                  class="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 cursor-pointer transition"
                  @click="handleSelectFolder(folder)"
                >
                  <span class="text-lg">📁</span>
                  <span class="text-sm text-slate-700 font-medium">{{ folder.name }}</span>
                </div>
              </div>

              <div v-if="children.length === 0" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-400 text-center">
                No direct subfolders found for this folder.
              </div>
            </section>

            <!-- Folder Contents -->
            <section>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Folder contents</span>
                <span class="text-sm text-slate-400">{{ contents.length }} items</span>
              </div>

              <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                <div
                  v-for="item in contents"
                  :key="item.id"
                  class="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition text-center group"
                >
                  <span class="text-3xl group-hover:scale-110 transition-transform">{{ fileIcon(item) }}</span>
                  <span class="text-sm text-slate-700 font-medium leading-tight line-clamp-2 w-full">{{ item.name }}{{ item.type=="file" ? ".":null }}{{ item.extension }}</span>
                </div>
              </div>

              <div v-else class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                <div
                  v-for="item in contents"
                  :key="item.id"
                  class="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 cursor-pointer transition"
                >
                  <span class="text-lg">{{ fileIcon(item) }}</span>
                  <span class="text-sm text-slate-700">{{ item.name }}{{ item.type=="file" ? ".":null }}{{item.extension }}</span>
                </div>
              </div>

              <div v-if="contents.length === 0" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-400 text-center">
                No files or folders inside this folder yet.
              </div>
            </section>
          </div>

          <!-- Empty state -->
          <div v-else class="flex flex-col items-center justify-center h-full py-20 gap-4 text-slate-400">
            <span class="text-6xl opacity-25">📦</span>
            <p class="text-sm text-center px-4">Select a folder from the left panel to view its contents</p>
          </div>
        </div>
      </main>
    </div>

    <!-- STATUS BAR -->
    <footer class="flex items-center gap-2.5 px-4 sm:px-5 py-2 border-t border-slate-200 bg-slate-50 text-sm text-slate-400 shrink-0">
      <span class="w-2 h-2 rounded-full bg-green-400 inline-block shrink-0"></span>
      <span class="truncate">{{ statusText }}</span>
    </footer>
  </div>
</template>