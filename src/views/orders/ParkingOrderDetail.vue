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
      <!-- Order Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Order Information</h2>
          <van-tag :type="getStatusType(safeGetStatus(order?.status))" class="status-tag">
            {{ getStatusText(safeGetStatus(order?.status)) }}
          </van-tag>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Order No.</span>
            <span class="value order-id"># {{ order?.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">Created Time</span>
            <span class="value">{{ formatTime(order?.createdTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Amount</span>
            <span class="value">${{ order?.total?.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Driver Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Driver Information</h2>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Name</span>
            <span class="value">{{ order?.driverInfo?.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone</span>
            <span class="value clickable" @click="handleCall">
              {{ order?.driverInfo?.phone }}
              <van-icon name="phone-o" class="action-icon" />
            </span>
          </div>
          <div class="info-row" v-if="order?.driverInfo?.email">
            <span class="label">Email</span>
            <span class="value">{{ order?.driverInfo?.email }}</span>
          </div>
        </div>
      </div>

      <!-- Vehicle Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Vehicle Information</h2>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">License Plate</span>
            <span class="value plate">{{ order?.vehicles?.[0]?.licensePlate }}</span>
          </div>
          <div class="info-row">
            <span class="label">Brand</span>
            <span class="value">{{ order?.vehicles?.[0]?.brand }}</span>
          </div>
          <div class="info-row">
            <span class="label">Model</span>
            <span class="value">{{ order?.vehicles?.[0]?.model }}</span>
          </div>
          <div class="info-row">
            <span class="label">Color</span>
            <span class="value">{{ order?.vehicles?.[0]?.color }}</span>
          </div>
        </div>
      </div>

      <!-- Parking Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Parking Information</h2>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Parking Lot</span>
            <span class="value">{{ order?.parkingLot?.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Address</span>
            <span class="value clickable" @click="handleNavigate">
              {{ order?.parkingLot?.address }}
              <van-icon name="location-o" class="action-icon" />
            </span>
          </div>
          <div class="info-row">
            <span class="label">Spot Type</span>
            <span class="value">{{ order?.spotType }}</span>
          </div>
          <div class="info-row">
            <span class="label">Rate Type</span>
            <span class="value">{{ order?.rateType }}</span>
          </div>
          <div class="info-row">
            <span class="label">Rate Price</span>
            <span class="value">${{ order?.ratePrice?.toFixed(2) }}/hr</span>
          </div>
          <div class="info-row">
            <span class="label">Start Time</span>
            <span class="value">{{ formatTime(order?.startTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">End Time</span>
            <span class="value">{{ formatTime(order?.endTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Duration</span>
            <span class="value">{{ order?.duration }} minutes</span>
          </div>
          <div class="info-row" v-if="order?.spotNumber">
            <span class="label">Spot Number</span>
            <span class="value">{{ order?.spotNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Check In/Out Information -->
      <div class="simple-card" v-if="hasCheckInInfo">
        <div class="card-header">
          <h2>Check In/Out Information</h2>
        </div>
        <div class="info-content">
          <div class="info-row" v-if="order?.checkInTime">
            <span class="label">Check In Time</span>
            <span class="value">{{ formatTime(order?.checkInTime) }}</span>
          </div>
          <div class="info-row" v-if="order?.totalDuration">
            <span class="label">Total Duration</span>
            <span class="value">{{ order?.totalDuration }} minutes</span>
          </div>
        </div>
      </div>

      <!-- Overtime Information -->
      <div class="simple-card" v-if="hasOvertimeInfo">
        <div class="card-header">
          <h2>Overtime Information</h2>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Overtime Start</span>
            <span class="value">{{ formatTime(order?.overtimeStart) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Overtime Duration</span>
            <span class="value">{{ order?.overtimeDuration }} minutes</span>
          </div>
          <div class="info-row">
            <span class="label">Overtime Rate</span>
            <span class="value">${{ order?.overtime?.rate?.toFixed(2) }}/hr</span>
          </div>
          <div class="info-row">
            <span class="label">Overtime Fee</span>
            <span class="value">${{ order?.overtime?.total?.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Payment Information</h2>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Service Fee</span>
            <span class="value">${{ order?.serviceFee?.toFixed(2) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Tax</span>
            <span class="value">${{ order?.tax?.toFixed(2) }}</span>
          </div>
          <div class="info-row total">
            <span class="label">Total Amount</span>
            <span class="value">${{ order?.total?.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="bottom-bar">
      <van-button 
        block 
        class="modify-btn"
        @click="handleModify"
      >
        Modify Order
      </van-button>
      <van-button 
        block 
        type="danger"
        class="cancel-btn"
        @click="handleCancel"
      >
        Cancel Order
      </van-button>
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

// 计算属性：是否显示入场信息
const hasCheckInInfo = computed(() => {
  return order.value?.checkInTime || order.value?.totalDuration;
});

// 计算属性：是否显示超时信息
const hasOvertimeInfo = computed(() => {
  return order.value?.overtimeStart || order.value?.overtimeDuration;
});
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: var(--page-background);
  padding-top: 46px;
  padding-bottom: 80px;
  position: relative;
}

.custom-nav {
  background: var(--card-background);
  border-bottom: 1px solid var(--border-color);
}

.content {
  padding: 16px;
}

.simple-card {
  background: var(--card-background);
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  
  h2 {
    color: var(--text-primary);
    font-size: 17px;
    font-weight: 600;
    margin: 0;
  }
}

.info-content {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .value {
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    text-align: right;
  }
}

/* 状态标签 */
.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

/* 车牌号样式 */
.value.plate {
  font-family: 'SF Mono', monospace;
  background: rgba(124, 77, 255, 0.15);
  color: var(--primary-color);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  letter-spacing: 0.5px;
}

/* 可点击项样式 */
.value.clickable {
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-icon {
  font-size: 16px;
}

/* 总计样式 */
.total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  
  .label {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 500;
  }
  
  .value {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
  }
}

/* 底部操作按钮样式 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-background);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  z-index: 100;
}

.modify-btn {
  background: var(--primary-color);
  border: none;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
}

.cancel-btn {
  background: var(--danger-color);
  border: none;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

/* 安全区适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-bar {
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
  
  .order-detail {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}

/* 高亮显示的值 */
.value.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

/* 等宽字体 */
.value.monospace {
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.5px;
}

/* 支付状态标签 */
.payment-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.payment-status.paid {
  background: var(--success-background);
  color: var(--success-color);
}

.payment-status.unpaid {
  background: var(--warning-background);
  color: var(--warning-color);
}
</style> 