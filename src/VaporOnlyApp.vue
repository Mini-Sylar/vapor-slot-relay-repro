<script setup lang="ts" vapor>
import Wrapper from './vapor/Wrapper.vue'
import { items } from './items'
</script>

<template>
  <Wrapper :items="items" />
</template>
