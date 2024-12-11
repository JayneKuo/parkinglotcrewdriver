<template>
  <div class="order-detail">
    <van-nav-bar
      title="Order Details"
      left-arrow
      @click-left="router.back()"
      class="custom-nav"
    />

    <div class="content">
      <!-- Order Status -->
      <div class="status-card">
        <div class="status-header">
          <div class="order-info">
            <div class="order-id">{{ route.params.id }}</div>
            <div class="order-time">{{ formatTime(String(route.query.startTime)) }}</div>
          </div>
          <van-tag 
            :type="getStatusType" 
            size="medium"
          >
            {{ route.query.status }}
          </van-tag>
        </div>
      </div>

      <!-- Booking Information -->
      <div class="section">
        <h2 class="section-title">BOOKING INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Load Type</span>
            <span>{{ route.query.loadType === 'inbound' ? 'Inbound Loading' : 'Outbound Loading' }}</span>
          </div>
          <div class="info-row">
            <span>Start Time</span>
            <span>{{ formatTime(String(route.query.startTime)) }}</span>
          </div>
          <div class="info-row">
            <span>Duration</span>
            <span>{{ route.query.duration }} {{ route.query.unit }}(s)</span>
          </div>
          <div class="info-row">
            <span>Dock Number</span>
            <span>{{ route.query.dockNumber || 'Not assigned' }}</span>
          </div>
        </div>
      </div>

      <!-- Driver Information -->
      <div class="section">
        <h2 class="section-title">DRIVER INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Carrier</span>
            <span>{{ route.query.carrier }}</span>
          </div>
          <div class="info-row">
            <span>Driver Name</span>
            <span>{{ route.query.driverName }}</span>
          </div>
          <div class="info-row">
            <span>Driver Phone</span>
            <span class="clickable" @click="handleCall">
              {{ route.query.driverPhone }}
              <van-icon name="phone-o" class="action-icon" />
            </span>
          </div>
          <div class="info-row">
            <span>Vehicle Plate</span>
            <span>{{ route.query.vehiclePlate }}</span>
          </div>
        </div>
      </div>

      <!-- Cargo Information -->
      <div class="section">
        <h2 class="section-title">CARGO INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Cargo Type</span>
            <span>{{ route.query.cargoType }}</span>
          </div>
          <div class="info-row" v-if="route.query.containerNumber">
            <span>Container No.</span>
            <span>{{ route.query.containerNumber }}</span>
          </div>
          <div class="info-row" v-if="route.query.poNumber">
            <span>PO No.</span>
            <span>{{ route.query.poNumber }}</span>
          </div>
          <div class="info-row">
            <span>Weight</span>
            <span>{{ route.query.weight }} kg</span>
          </div>
          <div class="info-row">
            <span>Quantity</span>
            <span>{{ route.query.quantity }}</span>
          </div>
          <div class="info-row" v-if="route.query.description">
            <span>Description</span>
            <span>{{ route.query.description }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="section">
        <h2 class="section-title">PAYMENT INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Payment Status</span>
            <van-tag 
              :type="route.query.paymentStatus === 'paid' ? 'success' : 'warning'"
              size="medium"
            >
              {{ route.query.paymentStatus || 'Unpaid' }}
            </van-tag>
          </div>
          <div class="info-row">
            <span>Amount</span>
            <span class="price">${{ route.query.totalAmount || '0.00' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar" v-if="showActions">
      <van-button 
        block 
        type="primary"
        class="action-btn"
        @click="handleCancel"
      >
        Cancel Booking
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { formatTime } from '@/utils/format';

const route = useRoute();
const router = useRouter();

// 根据状态返回不同的标签类型
const getStatusType = computed(() => {
  const status = route.query.status as string;
  switch (status?.toLowerCase()) {
    case 'requested':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'primary';
  }
});

// 是否显示操作按钮
const showActions = computed(() => {
  const status = route.query.status as string;
  return status?.toLowerCase() === 'requested';
});

// 处理电话点击
const handleCall = () => {
  const phone = route.query.driverPhone;
  if (phone) {
    window.location.href = `tel:${phone}`;
  }
};

// 处理取消预订
const handleCancel = () => {
  showDialog({
    title: 'Cancel Booking',
    message: 'Are you sure you want to cancel this booking?',
    theme: 'round-button',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No',
    confirmButtonColor: '#ee0a24',
  }).then(() => {
    // TODO: 调用取消API
    router.push({
      path: route.path,
      query: {
        ...route.query,
        status: 'cancelled'
      }
    });
  }).catch(() => {
    // 用户点击取消
  });
};
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
}

.custom-nav {
  background: #1a1a1a;
}

:deep(.custom-nav .van-nav-bar__title) {
  color: #fff;
  font-size: 18px;
}

:deep(.van-nav-bar__arrow) {
  color: #fff !important;
}

.content {
  padding: 20px;
}

.status-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-id {
  font-size: 16px;
  font-weight: 500;
}

.status-time {
  font-size: 14px;
  color: #666;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #7c4dff;
  margin: 0 0 12px;
  letter-spacing: 1px;
}

.info-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row:first-child {
  padding-top: 0;
}

.info-row > span:first-child {
  color: #666;
}

:deep(.van-tag--warning) {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.2);
}

:deep(.van-tag--success) {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

:deep(.van-tag--danger) {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-time {
  font-size: 12px;
  color: #666;
}

.clickable {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.action-icon {
  color: #7c4dff;
  font-size: 16px;
}

.price {
  color: #7c4dff;
  font-size: 16px;
  font-weight: 500;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
}

.action-btn {
  background: #ee0a24;
  border: none;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

:deep(.van-dialog) {
  background: #2a2a2a;
}

:deep(.van-dialog__header) {
  color: #fff;
}

:deep(.van-dialog__message) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.van-dialog__cancel),
:deep(.van-dialog__confirm) {
  color: #fff;
}
</style> 