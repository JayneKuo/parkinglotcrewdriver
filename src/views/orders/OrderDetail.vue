<template>
  <div class="order-detail">
    <van-nav-bar
      title="Order Details"
      left-arrow
      @click-left="handleBack"
      fixed
      class="custom-nav"
    />

    <div class="content">
      <template v-if="order">
        <!-- 基本订单信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3>Order Information</h3>
            <div class="status-badge" :class="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </div>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Order No.</span>
              <span class="value">#{{ order.orderNo }}</span>
            </div>
            <div class="info-row">
              <span class="label">Created Time</span>
              <span class="value">{{ formatTime(order.createdAt) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Status</span>
              <span class="value">{{ getStatusText(order.status) }}</span>
            </div>
          </div>
        </div>

        <!-- 司机信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3>Driver Information</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Name</span>
              <span class="value">{{ order.driver?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone</span>
              <span class="value">{{ order.driver?.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">Carrier</span>
              <span class="value carrier">{{ order.driver?.carrier || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">License Plate</span>
              <span class="value plate">{{ order.vehicles[0].licensePlate }}</span>
            </div>
          </div>
        </div>

        <!-- 预定信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3>Reservation Information</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Location</span>
              <span class="value">{{ order.parkingLot.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Address</span>
              <span class="value">{{ order.parkingLot.address }}</span>
            </div>
            <div class="info-row">
              <span class="label">Load Type</span>
              <span class="value">{{ order.loadType }}</span>
            </div>
            <div class="info-row">
              <span class="label">Rate Type</span>
              <span class="value">{{ order.rateType }}</span>
            </div>
            <div class="info-row">
              <span class="label">Spots</span>
              <span class="value">{{ order.spotCount }}</span>
            </div>
            <div class="info-row">
              <span class="label">Start Time</span>
              <span class="value">{{ formatTime(order.startTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Estimated Duration</span>
              <span class="value">{{ order.duration }}</span>
            </div>
            <div class="info-row">
              <span class="label">Dock No.</span>
              <span class="value" :class="{ 'hint-text': !order.spotNo }">
                {{ order.spotNo || 'Will be assigned after check-in' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 停车信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3>Parking Information</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Check-in Time</span>
              <span class="value">{{ order.checkInTime ? formatTime(order.checkInTime) : '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Loading Completed Time</span>
              <span class="value">{{ order.loadingCompletedTime ? formatTime(order.loadingCompletedTime) : '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Check-out Time</span>
              <span class="value">{{ order.checkOutTime ? formatTime(order.checkOutTime) : '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 货物信息 -->
        <div class="info-card" v-if="order.cargo">
          <div class="card-header">
            <h3>Cargo Information</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Cargo Type</span>
              <span class="value">{{ order.cargo.type }}</span>
            </div>
            <div class="info-row">
              <span class="label">PO Number</span>
              <span class="value highlight">{{ order.cargo.poNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Weight</span>
              <span class="value">{{ order.cargo.weight }}</span>
            </div>
            <div class="info-row">
              <span class="label">Quantity</span>
              <span class="value">{{ order.cargo.quantity }}</span>
            </div>
            <div class="info-row" v-if="order.cargo.description">
              <span class="label">Description</span>
              <span class="value">{{ order.cargo.description }}</span>
            </div>
          </div>
        </div>

        <!-- 订单摘要 -->
        <div class="info-card">
          <div class="card-header">
            <h3>Order Summary</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Rate Type</span>
              <span class="value">{{ order.rateType }}</span>
            </div>
            <div class="info-row">
              <span class="label">Duration</span>
              <span class="value">{{ order.duration }}</span>
            </div>
            <div class="info-row">
              <span class="label">Service Fee</span>
              <span class="value">${{ order.serviceFee?.toFixed(2) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Tax</span>
              <span class="value">${{ order.tax?.toFixed(2) }}</span>
            </div>
            <div class="info-row total">
              <span class="label">Total</span>
              <span class="value">${{ order.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 支付信息 -->
        <div class="info-card" v-if="order.payment">
          <div class="card-header">
            <h3>Payment Information</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">Amount</span>
              <span class="value">${{ order.payment.amount.toFixed(2) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Method</span>
              <span class="value">{{ order.payment.method }}</span>
            </div>
            <div class="info-row">
              <span class="label">Transaction ID</span>
              <span class="value">{{ order.payment.transactionId }}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Time</span>
              <span class="value">{{ formatTime(order.payment.time) }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-else class="loading-state">
        <van-loading type="spinner" color="#7c4dff" size="24px">Loading...</van-loading>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-actions" v-if="order?.actions?.length">
      <div class="action-buttons">
        <van-button
          v-for="action in order.actions"
          :key="action"
          :type="getActionType(action)"
          size="normal"
          class="action-button"
          @click="handleAction(action)"
        >
          {{ getActionText(action) }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import type { OrderDetail, ServiceType, OrderStatus } from '@/types/orders';
import { OrderActionConfig } from '@/types/orders';
import { formatTime } from '@/utils/format';
import { generateOrderDetail } from '@/utils/orderDetailGenerator';
import { getStatusType, getStatusText } from '@/types/orderStatus';

// 订单数据
const order = ref<OrderDetail | null>(null);
const router = useRouter();
const route = useRoute();

// 初始化数据
function initializeOrderDetail() {
  try {
    const orderData = route.query.data;
    if (!orderData) {
      showToast('Invalid order data');
      router.back();
      return;
    }

    const parsedData = JSON.parse(orderData as string);
    order.value = generateOrderDetail({
      ...parsedData,
      serviceType: parsedData.serviceType as ServiceType,
      status: parsedData.status as OrderStatus
    });

  } catch (error) {
    console.error('Failed to parse order data:', error);
    showToast('Failed to load order details');
    router.back();
  }
}

// 在组件挂载时初始化
onMounted(() => {
  initializeOrderDetail();
});

// 添加辅助函数
function getServiceTypeText(type: string) {
  const typeMap: Record<string, string> = {
    valet: 'Valet',
    parking: 'Parking',
    dock: 'Dock'
  };
  return typeMap[type] || type;
}

// 计算属性：是否有车辆详细信息
const hasVehicleDetails = computed(() => {
  const vehicle = order.value?.vehicles[0];
  return vehicle && (vehicle.brand || vehicle.model || vehicle.color);
});

// 计算实际停车时长
const getActualDuration = computed(() => {
  if (!order.value?.checkInTime) return '-';
  
  const start = new Date(order.value.checkInTime);
  const end = order.value.checkOutTime ? 
    new Date(order.value.checkOutTime) : 
    new Date();
  
  const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  
  if (hours < 24) {
    return `${hours}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? 
      `${days}d ${remainingHours}h` : 
      `${days}d`;
  }
});

// 判断是否超时
const isOvertime = computed(() => {
  return order.value?.status === 'Overtime';
});

// 获取操作按钮类型
function getActionType(action: string): 'primary' | 'default' {
  const config = OrderActionConfig[action];
  return config ? config.type : 'default';
}

// 获取操作按钮文本
function getActionText(action: string): string {
  const config = OrderActionConfig[action];
  return config ? config.text : action;
}

// 处理操作按钮点击
function handleAction(action: string) {
  const config = OrderActionConfig[action];
  if (config) {
    console.log(`Handling action: ${action} with handler: ${config.handler}`);
    // 这里可以根据不同的 action 执行不同的操作
    switch (action) {
      case 'modify-request':
        showToast('Modifying request...');
        break;
      case 'cancel-request':
        showToast('Cancelling request...');
        break;
      case 'modify-appointment':
        showToast('Modifying appointment...');
        break;
      case 'cancel-appointment':
        showToast('Cancelling appointment...');
        break;
      case 'check-in':
        showToast('Checking in...');
        break;
      case 'retry-payment':
        showToast('Retrying payment...');
        break;
      case 'check-out':
        showToast('Checking out...');
        break;
      default:
        showToast(`Handling ${action}...`);
    }
  }
}

// 修改返回函数
function handleBack() {
  // 从路由参数中获取当前订单的类型和上一个 tab
  const orderType = route.query.type as string;  // 当前订单类型
  const lastTab = route.query.activeTab;  // 上一个 tab

  if (window.history.length > 1) {
    // 如果有历史记录，直接返回
    router.back();
  } else {
    // 如果没有历史记录，导航到订单列表
    router.replace({
      path: '/orders',
      query: {
        // 优先使用订单类型作为 tab，如果没有则使用上一个 tab，都没有则默认为 'all'
        activeTab: orderType || lastTab || 'all'
      }
    });
  }
}
</script>

<style scoped>
/* 修改基础布局样式 */
.order-detail {
  background: var(--page-background);
  min-height: 100vh;
  padding: 56px 16px 80px;
}

.content {
  padding: 16px;
}

.custom-nav {
  background: var(--card-background);
}

:deep(.van-nav-bar) {
  background: var(--card-background);
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar__text),
:deep(.van-nav-bar .van-icon) {
  color: var(--text-primary);
}

/* 卡片样式 */
.info-card {
  background: var(--card-background);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

/* 内容样式 */
.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
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

.value.highlight,
.plate,
.carrier {
  color: var(--primary-color) !important;
  background: var(--highlight-background);
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'SF Mono', monospace;
  letter-spacing: 0.5px;
}

.plate {
  background: var(--highlight-background);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'SF Mono', monospace;
  letter-spacing: 0.5px;
}

/* 状态标签样式 */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.pending { background: var(--status-pending); color: #ffffff; }
.status-badge.warning { background: var(--status-warning); color: #ffffff; }
.status-badge.primary { background: var(--status-primary); color: #ffffff; }
.status-badge.success { background: var(--status-success); color: #ffffff; }
.status-badge.danger { background: var(--status-danger); color: #ffffff; }
.status-badge.processing { background: var(--status-processing); color: #ffffff; }
.status-badge.default { background: var(--status-default); color: #ffffff; }

/* 总计样式 */
.total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.total .label {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.total .value {
  color: var(--text-primary) !important;
  font-size: 18px;
  font-weight: 600;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* 添加承运商样式 */
.carrier {
  color: var(--primary-color) !important;
  font-weight: 500;
}

/* 添加提示文本样式 */
.hint-text {
  color: var(--text-tertiary) !important;
  font-size: 13px;
  font-style: italic;
  font-weight: normal !important;
}

/* 添加超时样式 */
.overtime {
  color: var(--danger-color) !important;
}

/* 底部操作按钮样式 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-background);
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  z-index: 100;
  box-shadow: var(--shadow-md);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-button {
  flex: 1;
  height: 44px;
}

/* 自定义按钮样式 */
:deep(.van-button) {
  width: 100%;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

:deep(.van-button--primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.van-button--default) {
  background: transparent;
  border-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.van-button--danger) {
  background: var(--danger-color);
  border-color: var(--danger-color);
  color: #ffffff;
}

/* 安全区适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-actions {
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
  
  .order-detail {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}

/* 顶部订单卡片样式 */
.order-header-card {
  background: var(--card-background);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.order-id {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.created-time {
  color: var(--text-tertiary);
  font-size: 14px;
  margin-top: 4px;
}

/* 分组标题样式 */
.section-title {
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 500;
  margin: 24px 0 16px;
  padding: 0 4px;
}

/* 电话图标样式 */
.phone-icon {
  color: var(--primary-color);
}
</style> 