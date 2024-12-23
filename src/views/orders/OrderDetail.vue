<template>
  <div class="order-detail">
    <van-nav-bar
      title="Parking Order Details"
      left-arrow
      @click-left="router.back()"
      class="custom-nav"
    />

    <div class="content">
      <!-- Order Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Order Information</h2>
          <van-tag :type="getStatusType(order?.status)" class="status-tag">
            {{ getStatusText(order?.status) }}
          </van-tag>
        </div>
        <div class="info-row">
          <span class="label">Order No.</span>
          <span class="value order-id"># {{ order?.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">Created Time</span>
          <span class="value">- {{ formatTime(order?.createdTime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Amount</span>
          <span class="value">$ {{ order?.amount?.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Driver Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Driver Information</h2>
        </div>
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

      <!-- Vehicle Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Vehicle Information</h2>
        </div>
        <div class="info-row">
          <span class="label">License Plate</span>
          <span class="value plate">{{ order?.vehicles?.[0]?.licensePlate }}</span>
        </div>
        <template v-if="order?.serviceType === 'valet'">
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
        </template>
      </div>

      <!-- Parking Information -->
      <div class="simple-card">
        <div class="card-header">
          <h2>Parking Information</h2>
        </div>
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
          <span class="label">Start Time</span>
          <span class="value">{{ formatTime(order?.startTime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Duration</span>
          <span class="value">{{ order?.duration }} hours</span>
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

// 处理电话拨打
const handleCall = () => {
  if (order.value?.driverInfo?.phone) {
    window.location.href = `tel:${order.value.driverInfo.phone}`;
  }
};

// 处理导航
const handleNavigate = () => {
  // TODO: 实现导航功能
  showToast('Navigation feature coming soon');
};

// 处理修改请求
const handleModify = () => {
  router.push({
    path: '/parking/modify',
    query: {
      ...route.query,
      orderId: order.value?.orderNo
    }
  });
};
</script>

<style scoped>
/* 使用与 DockOrderDetail.vue 相同的样式 */
</style> 