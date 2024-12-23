<template>
  <div class="order-detail">
    <van-nav-bar
      title="Order Details"
      left-arrow
      @click-left="router.back()"
      class="custom-nav"
    />

    <div class="content">
      <!-- Order Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Order Information</h2>
          <van-tag :type="statusType" class="status-tag">{{ status }}</van-tag>
        </div>
        <div class="info-row">
          <span class="label">Order No.</span>
          <span class="value order-id"># {{ orderId }}</span>
        </div>
        <div class="info-row">
          <span class="label">Created Time</span>
          <span class="value">- {{ formatTime(createdTime) }}</span>
        </div>
      </div>

      <!-- Driver Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Driver Information</h2>
        </div>
        <div class="info-row">
          <span class="label">Carrier</span>
          <span class="value">{{ driverInfo.carrier }}</span>
        </div>
        <div class="info-row">
          <span class="label">Driver Name</span>
          <span class="value">{{ driverInfo.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">Phone Number</span>
          <span class="value clickable" @click="handleCall">
            {{ driverInfo.phone }}
            <van-icon name="phone-o" class="action-icon" />
          </span>
        </div>
        <div class="info-row">
          <span class="label">License Plate</span>
          <span class="value plate">{{ driverInfo.vehiclePlate }}</span>
        </div>
      </div>

      <!-- Cargo Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Cargo Information</h2>
        </div>
        <div class="info-row">
          <span class="label">Cargo Type</span>
          <span class="value">{{ cargoInfo.type }}</span>
        </div>
        <div class="info-row" v-if="cargoInfo.poNumber">
          <span class="label">PO Number</span>
          <span class="value">{{ cargoInfo.poNumber }}</span>
        </div>
        <div class="info-row">
          <span class="label">Weight</span>
          <span class="value">{{ cargoInfo.weight }} kg</span>
        </div>
        <div class="info-row">
          <span class="label">Quantity</span>
          <span class="value">{{ cargoInfo.quantity }}</span>
        </div>
        <div class="info-row" v-if="cargoInfo.description">
          <span class="label">Description</span>
          <span class="value">{{ cargoInfo.description }}</span>
        </div>
      </div>

      <!-- Booking Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Booking Information</h2>
        </div>
        <div class="info-row">
          <span class="label">Parking Lot</span>
          <span class="value">{{ parkingInfo.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">Address</span>
          <span class="value clickable" @click="handleNavigate">
            {{ parkingInfo.address }}
            <van-icon name="location-o" class="action-icon" />
          </span>
        </div>
        <div class="info-row">
          <span class="label">Load Type</span>
          <span class="value">{{ loadType }}</span>
        </div>
        <div class="info-row">
          <span class="label">Start Time</span>
          <span class="value">{{ formatTime(startTime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Duration</span>
          <span class="value">{{ duration }} {{ unit }}(s)</span>
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
        Modify Request
      </van-button>
      <van-button 
        block 
        type="danger"
        class="cancel-btn"
        @click="handleCancel"
      >
        Cancel Request
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { formatTime } from '@/utils/format';

const route = useRoute();
const router = useRouter();

const orderId = route.params.id;
const createdTime = ref(new Date().toISOString());
const status = ref('Requested');

// 从路由参数获取信息
const driverInfo = ref({
  carrier: route.query.carrier || '',
  name: route.query.driverName || '',
  phone: route.query.driverPhone || '',
  vehiclePlate: route.query.vehiclePlate || ''
});

const cargoInfo = ref({
  type: route.query.cargoType || '',
  poNumber: route.query.poNumber || '',
  weight: route.query.weight || '',
  quantity: route.query.quantity || '',
  description: route.query.description || ''
});

const parkingInfo = ref({
  name: 'Central Business Parking',
  address: '123 Business Avenue, Central District'
});

const loadType = computed(() => 
  route.query.loadType === 'inbound' ? 'Inbound Loading' : 'Outbound Loading'
);
const startTime = ref(route.query.startTime || '');
const duration = ref(route.query.duration || '');
const unit = ref(route.query.unit || 'hour');

const statusType = computed(() => {
  const types: Record<string, string> = {
    'Requested': 'warning',
    'Confirmed': 'success',
    'Cancelled': 'danger'
  };
  return types[status.value] || 'default';
});

// 处理电话拨打
const handleCall = () => {
  window.location.href = `tel:${driverInfo.value.phone}`;
};

// 处理导航
const handleNavigate = () => {
  // TODO: 实现导航功能
  showToast('Navigation feature coming soon');
};

// 处理修改请求
const handleModify = () => {
  router.push({
    path: '/dock/modify',
    query: {
      ...route.query,
      orderId: orderId
    }
  });
};

// 处理取消请求
const handleCancel = () => {
  showDialog({
    title: 'Cancel Request',
    message: 'Are you sure you want to cancel this dock request?',
    showCancelButton: true,
  }).then(() => {
    // TODO: 调用取消API
    showToast('Request cancelled');
    status.value = 'Cancelled';
  });
};
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: var(--page-background);
  padding-bottom: 120px;
  padding-top: 46px;
}

.custom-nav {
  background: var(--card-background);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

:deep(.van-nav-bar__title) {
  color: var(--text-primary);
  font-size: 18px;
}

:deep(.van-nav-bar__arrow) {
  color: var(--text-primary) !important;
}

.content {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row:first-child {
  padding-top: 0;
}

.label {
  color: var(--text-secondary);
  font-size: 14px;
}

.value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.value.plate {
  font-family: 'SF Mono', monospace;
  letter-spacing: 0.5px;
}

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

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: var(--card-background);
  border-top: 1px solid var(--border-color);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  box-shadow: var(--shadow-md);
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
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .order-detail {
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }
}

.value.order-id {
  font-family: 'SF Mono', monospace;
  letter-spacing: 0.5px;
  font-size: 15px;
}

:deep(.van-tag) {
  padding: 2px 8px;
  border-radius: 4px;
}

:deep(.van-tag--warning) {
  background: var(--warning-background);
  color: var(--warning-color);
  border: 1px solid var(--warning-color);
}

:deep(.van-tag--success) {
  background: var(--success-background);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

:deep(.van-tag--danger) {
  background: var(--danger-background);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.simple-card {
  background: var(--card-background);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h2 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-header .van-icon {
  color: var(--text-tertiary);
  font-size: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.label {
  font-size: 15px;
  color: var(--text-secondary);
}

.value {
  font-size: 15px;
  color: var(--text-primary);
}

.value.order-id {
  font-family: 'SF Mono', monospace;
  letter-spacing: 0.5px;
}

.status-tag {
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
}

:deep(.van-tag--warning) {
  background: var(--warning-background);
  color: var(--warning-color);
  border: 1px solid var(--warning-color);
}

:deep(.van-tag--success) {
  background: var(--success-background);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

:deep(.van-tag--danger) {
  background: var(--danger-background);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}
</style> 