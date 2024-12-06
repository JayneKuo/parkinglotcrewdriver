<template>
  <div class="layout">
    <router-view />
    <van-tabbar 
      v-model="active" 
      v-show="!hideTabbar"
    >
      <van-tabbar-item to="/home" icon="home-o">Home</van-tabbar-item>
      <van-tabbar-item to="/map" icon="location-o">Map</van-tabbar-item>
      <van-tabbar-item to="/parking-orders" icon="records">Orders</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

// 计算是否隐藏底部导航
const hideTabbar = computed(() => {
  return route.path.includes('/parking/') || route.path.includes('/parking-orders/');
})

// 根据路由更新底部导航激活状态
watch(
  () => route.path,
  (path: string) => {
    switch (path) {
      case '/home':
        active.value = 0
        break
      case '/map':
        active.value = 1
        break
      case '/parking-orders':
        active.value = 2
        break
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: #000;
}
</style> 