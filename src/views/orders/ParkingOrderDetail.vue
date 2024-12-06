<template>
  <div class="order-detail">
    <van-nav-bar 
      title="Order Details" 
      left-arrow 
      @click-left="router.back()" 
      fixed
    />

    <div class="content" :class="{ 'has-actions': showActionButtons }" v-if="order">
      <!-- 订单信息 -->
      <div class="info-card">
        <div class="card-header">
          <h3>Order Information</h3>
          <div class="status-badge" :class="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </div>
        </div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">Order No.</span>
            <span class="value">#{{ order.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">Created At</span>
            <span class="value">{{ formatTime(order.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 停车信息 -->
      <div class="info-card">
        <h3>Parking Information</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="label">Location</span>
            <span class="value">{{ order.parkingLot.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Address</span>
            <span class="value">{{ order.parkingLot.address }}</span>
          </div>
          <div class="info-item">
            <span class="label">Spot</span>
            <span class="value">{{ order.parkingLot.area }}-{{ order.spotNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">Reserved Start</span>
            <span class="value">{{ formatTime(order.reservedStartTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Reserved End</span>
            <span class="value">{{ formatTime(order.reservedEndTime) }}</span>
          </div>
          <template v-if="order.checkInTime">
            <div class="info-item">
              <span class="label">Check-in Time</span>
              <span class="value">{{ formatTime(order.checkInTime) }}</span>
            </div>
          </template>
          <template v-if="order.checkOutTime">
            <div class="info-item">
              <span class="label">Check-out Time</span>
              <span class="value">{{ formatTime(order.checkOutTime) }}</span>
            </div>
          </template>
          <div class="info-item">
            <span class="label">Duration</span>
            <span class="value">{{ getDuration() }}</span>
          </div>
        </div>
      </div>

      <!-- 客户信息 -->
      <div class="info-card">
        <h3>Customer Information</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="label">Name</span>
            <span class="value">{{ order.customer.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Phone</span>
            <span class="value">{{ order.customer.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email</span>
            <span class="value">{{ order.customer.email }}</span>
          </div>
        </div>
      </div>

      <!-- 车辆信息 -->
      <div class="info-card">
        <h3>Vehicle Information</h3>
        <div class="vehicle-info">
          <div class="plate">{{ order.vehicles[0].licensePlate }}</div>
          <div class="details">
            <span>{{ order.vehicles[0].brand }}</span>
            <span>{{ order.vehicles[0].model }}</span>
            <span>{{ order.vehicles[0].color }}</span>
          </div>
        </div>
      </div>

      <!-- 费用信息 -->
      <div class="info-card">
        <h3>Payment Details</h3>
        <div class="fee-list">
          <div class="fee-item">
            <div class="fee-label">
              <span>Parking Fee</span>
              <span class="fee-desc">${{ order.pricing.rateAmount }}/{{ order.pricing.rateUnit }}</span>
            </div>
            <span class="fee-amount">${{ order.pricing.parkingFee.toFixed(2) }}</span>
          </div>
          <div class="fee-item" v-if="order.pricing.serviceFee">
            <span>Service Fee</span>
            <span>${{ order.pricing.serviceFee.toFixed(2) }}</span>
          </div>
          <div class="fee-item" v-if="order.pricing.tax">
            <span>Tax</span>
            <span>${{ order.pricing.tax.toFixed(2) }}</span>
          </div>
          <div class="fee-divider"></div>
          <div class="fee-item total">
            <span>Total</span>
            <span>${{ order.pricing.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="info-card" v-if="order.payment">
        <h3>Payment Information</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="label">Method</span>
            <span class="value">{{ order.payment.method }}</span>
          </div>
          <div class="info-item">
            <span class="label">Time</span>
            <span class="value">{{ formatTime(order.payment.time) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Transaction ID</span>
            <span class="value">{{ order.payment.transactionId }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="orderActions.length">
        <van-button 
          v-for="action in orderActions"
          :key="action.handler"
          :type="action.type"
          block
          @click="handleAction(action.handler)"
        >
          {{ action.text }}
        </van-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <van-loading type="spinner" color="#7c4dff" size="24px">Loading...</van-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { OrderStatus, OrderStatusConfig, OrderActionConfig } from '@/types/orders';
import { formatTime } from '@/utils/format';

const router = useRouter();
const route = useRoute();

// 模拟订单数据
const mockOrder = {
  id: '123456',
  orderNo: 'P202403150001',
  status: 'InUse',
  createdAt: '2024-03-15 10:00:00',
  customer: {
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@example.com'
  },
  parkingLot: {
    name: 'Central Parking',
    address: '123 Main Street, City',
    area: 'A'
  },
  spotType: 'Standard',
  spotNo: 'A-123',
  reservedStartTime: '2024-03-15 10:30:00',
  reservedEndTime: '2024-03-15 14:30:00',
  checkInTime: '2024-03-15 10:35:00', // 实际进场时间
  checkOutTime: null, // 实际出场时间
  vehicles: [{
    licensePlate: 'ABC123',
    brand: 'Toyota',
    model: 'Camry',
    color: 'Silver'
  }],
  pricing: {
    rateType: 'Hourly',
    rateAmount: 5,
    rateUnit: 'hour',
    parkingFee: 20,
    serviceFee: 2,
    tax: 1.76,
    totalAmount: 23.76,
    overtimeFee: 0
  },
  payment: {
    method: 'Credit Card',
    time: '2024-03-15 10:00:00',
    transactionId: 'TXN123456789'
  },
  refundInfo: null
};

// 订单数据
const order = ref(mockOrder);

// 获取状态配置
const getStatusConfig = (status: OrderStatus) => {
  return OrderStatusConfig[status] || {
    text: status,
    type: 'default'
  };
};

// 获取状态类型
function getStatusType(status: OrderStatus) {
  return getStatusConfig(status).type;
}

// 获取状态文本
function getStatusText(status: OrderStatus) {
  return getStatusConfig(status).text;
}

// 计算当前可用的操作按钮
const orderActions = computed(() => {
  if (!order.value?.status) return [];
  
  const config = OrderStatusConfig[order.value.status as OrderStatus];
  if (!config?.actions) return [];
  
  return config.actions.map(actionKey => ({
    ...OrderActionConfig[actionKey],
    key: actionKey
  }));
});

// 处理按钮点击
const handleAction = (handler: string) => {
  const actionHandlers: Record<string, () => void> = {
    handlePayment: () => {
      showToast('Processing payment...');
      // 实现支付逻辑
    },
    handleRetryPayment: () => {
      showToast('Retrying payment...');
      // 实现重试支付逻辑
    },
    handleCancel: () => {
      showToast('Cancelling order...');
      // 实现取消逻辑
    },
    handleCheckIn: () => {
      showToast('Processing check-in...');
      // 实现入场逻辑
    },
    handleCheckOut: () => {
      showToast('Processing check-out...');
      // 实现出场逻辑
    },
    handleOvertimePayment: () => {
      showToast('Processing overtime payment...');
      // 实现超时支付逻辑
    },
    handleRefundRequest: () => {
      showToast('Processing refund request...');
      // 实现退款申请逻辑
    },
    handleCancelRefund: () => {
      showToast('Cancelling refund request...');
      // 实现取消退款逻辑
    },
    showRefundFailReason: () => {
      showToast(order.value?.refundFailReason || 'No reason provided');
      // 实现显示退款失败原因逻辑
    }
  };

  const actionHandler = actionHandlers[handler];
  if (actionHandler) {
    actionHandler();
  }
};

// 计算实际使用时长
function getDuration() {
  if (!order.value) return '';
  
  let start, end;
  if (order.value.checkInTime) {
    start = new Date(order.value.checkInTime);
    end = order.value.checkOutTime ? new Date(order.value.checkOutTime) : new Date();
  } else {
    start = new Date(order.value.reservedStartTime);
    end = new Date(order.value.reservedEndTime);
  }
  
  const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  return `${hours}h`;
}

// 计算是否显示操作按钮
const showActionButtons = computed(() => {
  if (!order.value) return false;
  return ['PendingPayment', 'AwaitingUse', 'InUse', 'Completed', 'Overtime', 'RefundRequested', 'RefundFailed'].includes(order.value.status);
});

// 计算是否显示退款信息
const showRefundInfo = computed(() => {
  if (!order.value) return false;
  const refundStatuses = [
    'RefundRequested',
    'ProcessingRefund',
    'Refunded',
    'RefundFailed'
  ];
  return refundStatuses.includes(order.value.status);
});

// 计算是否有超时费用
const hasOvertimeFee = computed(() => {
  return order.value?.pricing?.overtimeFee && order.value.pricing.overtimeFee > 0;
});

onMounted(() => {
  // 如果需要，这里可以根据路由参数加载不同的订单数据
  const orderId = route.params.id;
  console.log('Loading order:', orderId);
});
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 56px 16px 16px;
}

.content {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 16px;
}

.content.has-actions {
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
}

.info-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-card h3 {
  color: #fff;
  font-size: 16px;
  margin: 0 0 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #888;
  font-size: 14px;
}

.info-item .value {
  color: #fff;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.status-badge.primary {
  background: rgba(124, 77, 255, 0.15);
  color: #7c4dff;
}

.status-badge.success {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.status-badge.warning {
  background: rgba(255, 152, 0, 0.15);
  color: #ff9800;
}

.status-badge.danger {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
}

.vehicle-info {
  background: #333;
  border-radius: 8px;
  padding: 12px;
}

.vehicle-info .plate {
  background: rgba(124, 77, 255, 0.15);
  color: #7c4dff;
  padding: 4px 12px;
  border-radius: 6px;
  display: inline-block;
  font-family: monospace;
  margin-bottom: 8px;
}

.vehicle-info .details {
  display: flex;
  gap: 8px;
  color: #fff;
  font-size: 14px;
}

.fee-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 14px;
}

.fee-label {
  display: flex;
  flex-direction: column;
}

.fee-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.fee-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
}

.fee-item.total {
  color: #fff;
  font-weight: 500;
  font-size: 16px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 72px);
}

.action-buttons {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
}

.action-buttons .van-button {
  height: 44px;
  border-radius: 22px;
}

.action-buttons .van-button--default {
  background: #2a2a2a;
  border: none;
  color: #fff;
}

/* 添加导航栏状态徽章样式 */
.nav-status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}

.nav-status-badge.primary {
  background: rgba(124, 77, 255, 0.15);
  color: #7c4dff;
}

.nav-status-badge.success {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.nav-status-badge.warning {
  background: rgba(255, 152, 0, 0.15);
  color: #ff9800;
}

.nav-status-badge.danger {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
}

/* 调整导航栏样式 */
:deep(.van-nav-bar) {
  background-color: #1a1a1a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

:deep(.van-nav-bar__arrow) {
  color: #fff;
}

:deep(.van-nav-bar__text) {
  color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}
</style> 