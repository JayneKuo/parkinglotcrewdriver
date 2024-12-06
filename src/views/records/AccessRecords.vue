<template>
  <div class="access-records">
    <van-nav-bar title="Access Records" />
    <van-empty description="No records" v-if="!records.length" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const records = ref([])
</script>

<style scoped>
.access-records {
  min-height: 100vh;
  background: #f7f8fa;
}
</style> 