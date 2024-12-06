<template>
  <div class="map-view">
    <van-nav-bar
      title="Parking Map"
      left-arrow
      @click-left="router.back()"
      fixed
    />
    
    <div class="map-container">
      <!-- Map component will be implemented here -->
      <div class="map-placeholder">
        <van-empty description="Map feature coming soon..." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.map-view {
  min-height: 100vh;
  background: #1a1a1a;
}

.map-container {
  padding-top: 46px;
  height: calc(100vh - 50px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder {
  color: #666;
}

:deep(.van-nav-bar) {
  background-color: #1a1a1a;
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

:deep(.van-nav-bar__arrow) {
  color: #fff;
}

:deep(.van-empty__description) {
  color: #666;
}
</style> 