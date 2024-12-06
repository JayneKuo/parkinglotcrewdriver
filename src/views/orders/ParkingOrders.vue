<template>
  <div class="parking-orders">
    <van-nav-bar title="Parking Orders" />
    <van-empty description="No orders" v-if="!orders.length" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const orders = ref([])
</script>

<style scoped>
.parking-orders {
  min-height: 100vh;
  background: #f7f8fa;
}
</style> 