<script setup lang="ts" vapor>
import { useSlots } from 'vue'
import type { FunctionalComponent, VNodeChild } from 'vue'
// Explicit self-import — a filename-implicit recursive self-reference
// behaves differently under Vapor than this explicit form.
import MenuLike from './MenuLike.vue'

export interface Item {
  label: string
  value: string
  children?: Item[]
}

defineProps<{ items: Item[] }>()

const slots = useSlots()

// A bare <slot name="item"> written directly inside the recursive MenuLike
// usage below re-resolves against the NESTED instance's own (empty) scope
// under Vapor instead of the caller's — a separate, already-known Vapor
// gotcha. The workaround: capture the real slot once here and forward it
// through a plain functional component, dispatched dynamically via
// <component :is>.
const relayItemSlot: FunctionalComponent<{ item: Item }> = (relayProps) =>
  slots.item?.(relayProps) as VNodeChild
</script>

<template>
  <ul class="menu-like">
    <li v-for="item in items" :key="item.value">
      <div class="row"><slot name="item" :item="item" /></div>
      <MenuLike v-if="item.children" :items="item.children">
        <template #item="scope">
          <component :is="relayItemSlot" :item="scope.item" />
        </template>
      </MenuLike>
    </li>
  </ul>
</template>

<style scoped>
.menu-like {
  list-style: none;
  margin: 0;
  padding-left: 1.25rem;
}
.menu-like:first-of-type {
  padding-left: 0;
}
</style>
