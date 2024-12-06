<template>
  <div class="order-detail">
    <van-nav-bar
      title="Order Details"
      left-arrow
      @click-left="router.back()"
      fixed
    />

    <template v-if="order">
      <!-- 订单状态 -->
      <div class="status-card">
        <div class="status-badge" :class="order.status.toLowerCase()">
          {{ order.status }}
        </div>
        <div class="order-no">Order #{{ order.orderNo }}</div>
      </div>

      <!-- 停车场信息 -->
      <div class="info-card">
        <h3>Parking Information</h3>
        <div class="info-item">
          <van-icon name="location" />
          <div class="info-content">
            <div class="title">{{ order.parkingLot.name }}</div>
            <div class="subtitle">{{ order.parkingLot.address }}</div>
          </div>
        </div>
      </div>

      <!-- 车辆信息 -->
      <div class="info-card">
        <h3>Vehicle Information</h3>
        <div class="info-item">
          <van-icon name="car-o" />
          <div class="info-content">
            <div class="car-plate-info">
              <span class="plate">{{ order.vehicles[0].licensePlate }}</span>
            </div>
            <div class="vehicle-details">
              <span>{{ order.vehicles[0].brand }}</span>
              <span>{{ order.vehicles[0].model }}</span>
              <span>{{ order.vehicles[0].color }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="info-card">
        <h3>Time Information</h3>
        <div class="time-info">
          <div class="time-item">
            <span class="label">Start Time</span>
            <span class="value">{{ formatTime(order.startTime) }}</span>
          </div>
          <div class="time-item">
            <span class="label">End Time</span>
            <span class="value">{{ formatTime(order.endTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 费用信息 -->
      <div class="info-card">
        <h3>Payment Information</h3>
        <div class="fee-info">
          <div class="fee-item">
            <span class="label">Parking Fee</span>
            <span class="value">${{ order.parkingFee.toFixed(2) }}</span>
          </div>
          <div class="fee-item" v-if="order.serviceFee">
            <span class="label">Service Fee</span>
            <span class="value">${{ order.serviceFee.toFixed(2) }}</span>
          </div>
          <div class="fee-item total">
            <span class="label">Total</span>
            <span class="value">${{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <van-loading type="spinner" color="#7c4dff" size="24px">Loading...</van-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import type { OrderDetail } from '@/types/orders';
import { formatTime } from '@/utils/format';

// 订单数据
const order = ref<OrderDetail | null>(null);
const router = useRouter();
const route = useRoute();

// 模拟获取订单详情
function getOrderDetail(orderId: string): Promise<OrderDetail> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: orderId,
        orderNo: 'P20240301001',
        status: 'InUse',
        createdAt: '2024-03-01 10:00:00',
        customer: {
          name: 'John Doe',
          phone: '+1 (555) 123-4567',
          email: 'john@example.com'
        },
        parkingLot: {
          name: 'Central Parking',
          address: '123 Main St',
          area: 'A'
        },
        spotType: 'Standard',
        spotNo: 'A-123',
        startTime: '2024-03-01 10:00:00',
        endTime: '2024-03-01 14:00:00',
        vehicles: [{
          licensePlate: 'ABC123',
          brand: 'Toyota',
          model: 'Camry',
          color: 'Silver'
        }],
        rateType: 'Hourly',
        rateAmount: 5,
        rateUnit: 'hour',
        parkingFee: 20,
        serviceFee: 2,
        tax: 1.76,
        totalAmount: 23.76,
        payment: {
          method: 'Credit Card',
          time: '2024-03-01 10:00:00',
          transactionId: 'TXN123456789'
        }
      });
    }, 1000);
  });
}

// 获取订单详情
async function fetchOrderDetail() {
  const orderId = route.params.id as string;
  if (!orderId) {
    showToast('Invalid order ID');
    router.back();
    return;
  }

  try {
    order.value = await getOrderDetail(orderId);
  } catch (error) {
    showToast('Failed to load order details');
    router.back();
  }
}

// 初始化
fetchOrderDetail();
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: #1a1a1a;
  padding-bottom: 16px;
}

.custom-nav {
  background: #1a1a1a;
}

:deep(.custom-nav .van-nav-bar__title) {
  color: #fff;
}

.content {
  padding: 16px;
}

.status-section {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.info-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-header .label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.info-header .value {
  color: #fff;
  font-size: 16px;
}

.info-content {
  color: #fff;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .van-icon {
  color: #7c4dff;
  font-size: 20px;
}

.item-content {
  display: flex;
  flex-direction: column;
}

.item-content .label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.item-content .value {
  color: #fff;
  font-size: 16px;
}

.vehicle-info {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.vehicle-info:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.vehicle-info:first-child {
  padding-top: 0;
}

.plate-number {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.vehicle-details {
  display: flex;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
}
</style> 