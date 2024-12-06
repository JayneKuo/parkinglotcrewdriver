<template>
  <div class="valet-orders">
    <van-nav-bar title="泊车订单" />
    <van-empty description="暂无泊车订单" v-if="!orders.length" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const orders = ref([])
</script>

<style scoped>
.valet-orders {
  min-height: 100vh;
  background: #f7f8fa;
}
</style> 