<template>
  <div class="parking-map">
    <van-nav-bar title="Parking Map" />
    <div class="map-container">
      <!-- Map container -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mapRef = ref(null)
</script>

<style scoped>
.parking-map {
  height: 100vh;
  background: var(--background-color);
}
.map-container {
  height: calc(100vh - 46px);
  background: var(--surface-color);
}
</style> 