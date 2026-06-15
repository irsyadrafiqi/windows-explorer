<script setup lang="ts">
import type { Folder } from "../types/folder";
import FolderNode from "./FolderNode.vue";

defineProps<{
  folders: Folder[];
  selectedId?: number;
}>();

const emit = defineEmits<{
  select: [Folder];
}>();
</script>

<template>
  <FolderNode
    v-for="folder in folders"
    :key="folder.id"
    :folder="folder"
    :selected-id="selectedId"
    @select="emit('select', $event)"
  />
</template>