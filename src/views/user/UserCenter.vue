<template>
  <div class="user-center">
    <van-nav-bar title="Profile" />
    <div class="user-info">
      <van-cell-group inset>
        <van-cell title="Phone" :value="userInfo.phone || '-'" />
        <van-cell title="Nickname" :value="userInfo.nickname || '-'" />
      </van-cell-group>
    </div>
    <div class="action-buttons">
      <van-button block type="primary" @click="handleLogout">Sign Out</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const router = useRouter()
const { userInfo } = storeToRefs(userStore)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background: var(--background-color);
}
.user-info {
  margin-top: 12px;
}
.action-buttons {
  margin: 24px 16px;
}
.van-cell-group {
  background: var(--surface-color);
}
</style> 