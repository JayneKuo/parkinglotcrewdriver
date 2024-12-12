<template>
  <div class="order-detail">
    <van-nav-bar
      title="Valet Order Details"
      left-arrow
      @click-left="handleBack"
      fixed
      class="custom-nav"
    />

    <div class="content">
      <!-- 订单信息 -->
      <div class="info-card">
        <div class="card-header">
          <h3>Order Information</h3>
          <div class="status-badge" :class="getStatusType(safeGetStatus(order?.status))">
            {{ getStatusText(safeGetStatus(order?.status)) }}
          </div>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Order No.</span>
            <span class="value">#{{ order?.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">Created Time</span>
            <span class="value">{{ formatTime(order?.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status</span>
            <span class="value">{{ getStatusText(safeGetStatus(order?.status)) }}</span>
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
            <span class="value">{{ order?.driver?.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone</span>
            <span class="value">{{ order?.driver?.phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">License Plate</span>
            <span class="value plate">{{ order?.vehicles[0]?.licensePlate }}</span>
          </div>
          <div class="info-row">
            <span class="label">Vehicle Info</span>
            <span class="value">{{ getVehicleInfo(order?.vehicles[0]) }}</span>
          </div>
        </div>
      </div>

      <!-- 泊车员信息 -->
      <div class="info-card" v-if="order?.valet">
        <div class="card-header">
          <h3>Valet Information</h3>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Name</span>
            <span class="value">{{ order?.valet?.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone</span>
            <span class="value">{{ order?.valet?.phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status</span>
            <span class="value">{{ order?.valet?.status }}</span>
          </div>
          <div class="info-row">
            <span class="label">Assigned Time</span>
            <span class="value">{{ formatTime(order?.valet?.assignedTime) }}</span>
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
            <span class="value">{{ order?.parkingLot?.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Address</span>
            <span class="value">{{ order?.parkingLot?.address }}</span>
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
            <span class="label">Rate</span>
            <span class="value">${{ order?.rate?.toFixed(2) }}/hr</span>
          </div>
          <div class="info-row">
            <span class="label">Spots</span>
            <span class="value">{{ order?.spotCount || 1 }}</span>
          </div>
          <div class="info-row">
            <span class="label">Start Time</span>
            <span class="value">{{ formatTime(order?.startTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Spot No.</span>
            <span class="value" :class="{ 'hint-text': !order?.spotNo }">
              {{ order?.spotNo || 'Will be assigned after check-in' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 停车信息 -->
      <div class="info-card" v-if="hasParkedInfo">
        <div class="card-header">
          <h3>Parking Information</h3>
        </div>
        <div class="info-content">
          <div class="info-row" v-if="order?.checkInTime">
            <span class="label">Check-in Time</span>
            <span class="value">{{ formatTime(order.checkInTime) }}</span>
          </div>
          <div class="info-row" v-if="order?.parkedTime">
            <span class="label">Parked Time</span>
            <span class="value">{{ formatTime(order.parkedTime) }}</span>
          </div>
          <div class="info-row" v-if="order?.requestTime">
            <span class="label">Request Time</span>
            <span class="value">{{ formatTime(order.requestTime) }}</span>
          </div>
          <div class="info-row" v-if="order?.checkOutTime">
            <span class="label">Check-out Time</span>
            <span class="value">{{ formatTime(order.checkOutTime) }}</span>
          </div>
          <div class="info-row" v-if="order?.duration">
            <span class="label">Duration</span>
            <span class="value">{{ formatDuration(order.duration) }}</span>
          </div>
        </div>
      </div>

      <!-- 车辆图片信息 -->
      <div class="info-card" v-if="hasVehiclePhotos">
        <div class="card-header">
          <h3>Vehicle Photos</h3>
        </div>
        <div class="photo-grid">
          <template v-if="order?.vehiclePhotos">
            <div v-for="(photo, index) in vehiclePhotos" :key="index" class="photo-item">
              <img :src="photo.url" :alt="photo.type" @click="previewImage(photo.url)" />
              <span class="photo-label">{{ photo.label }}</span>
            </div>
          </template>
          <div v-if="order?.parkedPhoto" class="photo-item">
            <img :src="order.parkedPhoto" alt="Parked" @click="previewImage(order.parkedPhoto)" />
            <span class="photo-label">Parked Photo</span>
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
            <span class="value">{{ order?.rateType }}</span>
          </div>
          <div class="info-row">
            <span class="label">Duration</span>
            <span class="value">{{ formatDuration(order?.duration) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Service Fee</span>
            <span class="value">${{ order?.serviceFee?.toFixed(2) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Tax</span>
            <span class="value">${{ order?.tax?.toFixed(2) }}</span>
          </div>
          <div class="info-row total">
            <span class="label">Total</span>
            <span class="value">${{ order?.totalAmount?.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="info-card" v-if="order?.payment">
        <div class="card-header">
          <h3>Payment Information</h3>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="label">Amount</span>
            <span class="value">${{ order?.payment?.amount?.toFixed(2) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Method</span>
            <span class="value">{{ order?.payment?.method }}</span>
          </div>
          <div class="info-row">
            <span class="label">Transaction ID</span>
            <span class="value">{{ order?.payment?.transactionId }}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Time</span>
            <span class="value">{{ formatTime(order?.payment?.time) }}</span>
          </div>
        </div>
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

// 获取车辆信息
function getVehicleInfo(vehicle?: Vehicle): string {
  if (!vehicle) return '-';
  return `${vehicle.brand} ${vehicle.model} (${vehicle.color})`;
}

// 计算是否显示停车信息
const hasParkedInfo = computed(() => {
  return !!(
    order.value?.checkInTime ||
    order.value?.parkedTime ||
    order.value?.requestTime ||
    order.value?.checkOutTime ||
    order.value?.duration
  );
});

// 处理车辆照片
const vehiclePhotos = computed(() => {
  if (!order.value?.vehiclePhotos) return [];
  return order.value.vehiclePhotos.map(photo => ({
    url: photo.url,
    type: photo.type,
    label: getPhotoLabel(photo.type)
  }));
});

const hasVehiclePhotos = computed(() => vehiclePhotos.value.length > 0);

// 获取照片标签
function getPhotoLabel(type: string): string {
  const labels: Record<string, string> = {
    front: 'Front View',
    back: 'Back View',
    left: 'Left Side',
    right: 'Right Side',
    dashboard: 'Dashboard',
    detail: 'Detail',
    parked: 'Parked'
  };
  return labels[type] || type;
}

// 图片预览
function previewImage(url: string) {
  showImagePreview([url]);
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
        activeTab: lastTab || 'valet'
      }
    });
  }
}

// 初始化数据
onMounted(() => {
  const orderData = route.query.data;
  if (orderData) {
    try {
      const parsedData = JSON.parse(String(orderData));
      console.log('Parsed Order Data:', parsedData);  // 打印解析后的数据
      order.value = parsedData;
    } catch (error) {
      console.error('Failed to parse order data:', error);
    }
  } else {
    console.warn('No order data provided');
  }
});

// 格式化时长
function formatDuration(duration?: string | number): string {
  if (!duration) return '-';
  if (typeof duration === 'string') return duration;
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);
  return `${hours}h ${minutes}m`;
}
</script>

<style scoped>
/* 基础布局 */
.order-detail {
  min-height: 100vh;
  background: #1a1a1a;
  padding-top: 46px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.content {
  padding: 16px;
}

/* 导航栏样式 */
:deep(.custom-nav) {
  background: #1a1a1a;
  
  .van-nav-bar__title {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }
  
  .van-nav-bar__arrow {
    color: #fff;
    font-size: 20px;
  }
}

/* 卡片样式 */
.info-card {
  background: #222;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    color: #fff;
    font-size: 16px;
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
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    color: #888;
    font-size: 14px;
  }
  
  .value {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    text-align: right;
  }
}

/* 状态标签 */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 车牌号样式 */
.plate {
  font-family: 'SF Mono', monospace;
  background: rgba(124, 77, 255, 0.15);
  color: #7c4dff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  letter-spacing: 0.5px;
}

/* 照片网格 */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #2a2a2a;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.photo-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  text-align: center;
}

/* 总计样式 */
.total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  .label {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
  }
  
  .value {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }
}

/* 提示文本 */
.hint-text {
  color: #888 !important;
  font-size: 13px;
  font-style: italic;
  font-weight: normal !important;
}

/* 安全区适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .order-detail {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
</style>