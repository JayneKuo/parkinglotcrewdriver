<template>
  <div class="order-detail">
    <van-nav-bar
      title="Parking Order Details"
      left-arrow
      @click-left="handleBack"
      fixed
      class="custom-nav"
    />

    <div class="content">
      <!-- 基本订单信息 -->
      <div class="info-card">
        <div class="card-header">
          <h3>Order Information</h3>
          <div class="status-badge" :class="getStatusType(safeGetStatus(order?.status))">
            {{ getStatusText(safeGetStatus(order?.status)) }}
          </div>
        </div>
        <!-- ... 其他内容 ... -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getStatusType, getStatusText } from '@/types/orderStatus';
import type { Order, OrderStatus, Vehicle } from '@/types/orders';
import { formatTime } from '@/utils/format';
import { showImagePreview } from 'vant';

const router = useRouter();
const route = useRoute();
const order = ref<Order | null>(null);

// 安全的状态获取函数
function safeGetStatus(status: OrderStatus | undefined | null): string {
  return status ? String(status) : '';
}

// 处理返回
function handleBack() {
  const lastTab = route.query.activeTab;
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace({
      path: '/orders',
      query: {
        activeTab: lastTab || 'parking'
      }
    });
  }
}

// 初始化数据
onMounted(() => {
  const orderData = route.query.data;
  if (orderData) {
    order.value = JSON.parse(String(orderData));
  }
});
</script>

<style scoped>
/* 复用 OrderDetail.vue 的样式 */
.order-detail {
  min-height: 100vh;
  background: #1a1a1a;
  padding-top: 46px;
  padding-bottom: 80px;
  position: relative;
}

.content {
  padding: 16px;
}

/* ... 其他样式 ... */
</style> 