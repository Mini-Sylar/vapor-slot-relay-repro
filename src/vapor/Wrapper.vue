<script setup lang="ts" vapor>
import MenuLike from './MenuLike.vue'
import type { Item } from './MenuLike.vue'

defineProps<{ items: Item[] }>()
</script>

<template>
  <!-- Wrapper ALWAYS gives MenuLike its own #item override (never gated on
       whether the caller — App.vue — provided one), and that override itself
       contains an unfilled <slot name="item"> falling back to default
       content. This "slot forwarding a slot" is the shape that matters. -->
  <MenuLike :items="items">
    <template #item="{ item }">
      <slot name="item" :item="item">
        <span class="default-label">{{ item.label }}</span>
      </slot>
    </template>
  </MenuLike>
</template>
