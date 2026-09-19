<script setup lang="ts">
// A plain VDOM root (no `vapor` attribute) that embeds the VAPOR-marked
// Wrapper as a child component — bridged by `vaporInteropPlugin`, registered
// on this app instance in main.ts. This is the one scenario of the three
// that actually triggers the bug.
import Wrapper from './vapor/Wrapper.vue'
import { items } from './items'
</script>

<template>
  <Wrapper :items="items" />
</template>
