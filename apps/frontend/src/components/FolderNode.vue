<script setup lang="ts">
import { ref, computed } from "vue";
import type { Folder } from "../types/folder";

const props = defineProps<{
  folder: Folder;
  selectedId?: number;
  depth?: number;
}>();

const emit = defineEmits<{
  select: [Folder];
}>();

const isOpen = ref(false);
const hasChildren = computed(
  () => !!props.folder.children && props.folder.children.length > 0
);

const indent = computed(() => 12 + (props.depth ?? 0) * 14);
</script>

<template>
  <div>
    <div
      class="flex items-center gap-1.5 py-1.5 pr-3 cursor-pointer text-sm transition-colors rounded-none select-none"
      :class="
        props.selectedId === props.folder.id
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      "
      :style="{ paddingLeft: `${indent}px` }"
      @click="emit('select', props.folder)"
    >
      <!-- Chevron toggle -->
      <button
        v-if="hasChildren"
        type="button"
        class="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 shrink-0"
        @click.stop="isOpen = !isOpen"
        :aria-label="isOpen ? 'Collapse' : 'Expand'"
      >
        <svg
          class="w-3 h-3 transition-transform"
          :class="isOpen ? 'rotate-90' : ''"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
      <span v-else class="w-4 shrink-0" />

      <!-- Folder icon -->
      <span class="text-sm leading-none shrink-0">
        {{ isOpen && hasChildren ? "📂" : "📁" }}
      </span>

      <!-- Name -->
      <span class="truncate flex-1">{{ props.folder.name }}</span>
    </div>

    <!-- Children -->
    <div v-if="isOpen && hasChildren">
      <FolderNode
        v-for="child in props.folder.children ?? []"
        :key="child.id"
        :folder="child"
        :selected-id="props.selectedId"
        :depth="(props.depth ?? 0) + 1"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>