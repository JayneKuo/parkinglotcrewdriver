<template>
  <div class="layout">
    <router-view />
    <van-tabbar v-model="active" route v-show="!hideTabbar">
      <van-tabbar-item to="/home" icon="home-o">Home</van-tabbar-item>
      <van-tabbar-item to="/parking-orders" icon="orders-o">Orders</van-tabbar-item>
      <van-tabbar-item to="/records" icon="clock-o">Records</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">Profile</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const active = ref(0);

// Hide the bottom navigation in some pages
const hideTabbar = computed(() => {
  return route.path.includes('/parking/') || 
         route.path.includes('/parking-orders/') ||
         route.path.includes('/profile/');
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

:deep(.van-tabbar) {
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
}

:deep(.van-tabbar-item) {
  color: #666;
}

:deep(.van-tabbar-item--active) {
  color: #7c4dff;
}
</style> 