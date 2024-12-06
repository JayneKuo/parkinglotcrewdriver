<template>
  <div class="confirm-page">
    <van-nav-bar
      title="Confirm Order"
      left-arrow
      @click-left="handleBack"
      class="custom-nav"
    />

    <div class="content">
      <!-- User Information -->
      <div class="section">
        <h2 class="section-title">USER INFORMATION</h2>
        <div class="info-form">
          <div class="input-field">
            <input 
              v-model="userInfo.name"
              placeholder="Name *"
              class="custom-input"
            >
          </div>
          <div class="input-field">
            <input 
              v-model="userInfo.phone"
              placeholder="Phone *"
              class="custom-input"
              type="tel"
            >
            <div class="input-hint">Used for receiving booking notifications</div>
          </div>
          <div class="input-field">
            <input 
              v-model="userInfo.email"
              placeholder="Email (Optional)"
              class="custom-input"
              type="email"
            >
            <div class="input-hint">Used for receiving booking confirmation</div>
          </div>
        </div>
      </div>

      <!-- Order Information -->
      <div class="section">
        <h2 class="section-title">ORDER INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="label">Order No.</span>
            <span class="value">{{ orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">Created Time</span>
            <span class="value">{{ formatTime(createdTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status</span>
            <span class="value status">Pending Payment</span>
          </div>
        </div>
      </div>

      <!-- Parking Information -->
      <div class="section">
        <h2 class="section-title">PARKING INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="label">Parking Lot</span>
            <span class="value">{{ parkingLot.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Spot Type</span>
            <span class="value">{{ spotType }}</span>
          </div>
          <div class="info-row">
            <span class="label">Location</span>
            <span class="value">{{ spotLocation }}</span>
          </div>
          <div class="info-row">
            <span class="label">Start Time</span>
            <span class="value">{{ formatTime(startTime) }}</span>
          </div>
          <template v-if="!isValetService">
            <div class="info-row">
              <span class="label">End Time</span>
              <span class="value">{{ formatTime(endTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Duration</span>
              <span class="value">{{ duration }} hours</span>
            </div>
          </template>
          <div class="info-row">
            <span class="label">Spots</span>
            <span class="value">{{ spots }}</span>
          </div>
        </div>
      </div>

      <!-- Vehicle Information -->
      <div class="section">
        <h2 class="section-title">VEHICLE INFORMATION</h2>
        
        <!-- 自助停车布局 -->
        <template v-if="!isValetService">
          <div class="info-card">
            <!-- 默认显示第一辆车 -->
            <div class="vehicle-simple">
              <div class="vehicle-header">Vehicle 1</div>
              <div class="plate-number">{{ vehicles[0].licensePlate }}</div>
            </div>
            
            <!-- 其他车辆（默认折叠） -->
            <template v-if="vehicles.length > 1">
              <div v-show="showAllVehicles" class="other-vehicles">
                <div class="divider"></div>
                <div 
                  v-for="(vehicle, index) in vehicles.slice(1)"
                  :key="index + 1"
                  class="vehicle-simple"
                >
                  <div class="vehicle-header">Vehicle {{ index + 2 }}</div>
                  <div class="plate-number">{{ vehicle.licensePlate }}</div>
                </div>
              </div>
              
              <!-- 展开/收起按钮 -->
              <div class="expand-section">
                <div class="divider"></div>
                <div class="expand-button" @click="showAllVehicles = !showAllVehicles">
                  <span>{{ showAllVehicles ? 'Show Less' : `Show All ${vehicles.length} Vehicles` }}</span>
                  <van-icon :name="showAllVehicles ? 'arrow-up' : 'arrow-down'" />
                </div>
              </div>
            </template>
          </div>
        </template>
        
        <!-- 代客泊车布局 -->
        <template v-else>
          <div class="info-card">
            <!-- 默认显示第一辆车 -->
            <div class="vehicle-info-grid">
              <div class="vehicle-info-item">
                <span class="label">Vehicle 1</span>
                <span class="value plate">{{ vehicles[0].licensePlate }}</span>
              </div>
              <div class="vehicle-info-item">
                <span class="label">Brand</span>
                <span class="value">{{ vehicles[0].brand }}</span>
              </div>
              <div class="vehicle-info-item">
                <span class="label">Model</span>
                <span class="value">{{ vehicles[0].model }}</span>
              </div>
              <div class="vehicle-info-item">
                <span class="label">Color</span>
                <span class="value">{{ vehicles[0].color }}</span>
              </div>
            </div>

            <!-- 其他车辆（默认折叠） -->
            <template v-if="vehicles.length > 1">
              <div v-show="showAllVehicles" class="other-vehicles">
                <div 
                  v-for="(vehicle, index) in vehicles.slice(1)"
                  :key="index + 1"
                >
                  <div class="divider"></div>
                  <div class="vehicle-info-grid">
                    <div class="vehicle-info-item">
                      <span class="label">Vehicle {{ index + 2 }}</span>
                      <span class="value plate">{{ vehicle.licensePlate }}</span>
                    </div>
                    <div class="vehicle-info-item">
                      <span class="label">Brand</span>
                      <span class="value">{{ vehicle.brand }}</span>
                    </div>
                    <div class="vehicle-info-item">
                      <span class="label">Model</span>
                      <span class="value">{{ vehicle.model }}</span>
                    </div>
                    <div class="vehicle-info-item">
                      <span class="label">Color</span>
                      <span class="value">{{ vehicle.color }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 展开/收起按钮 -->
              <div class="expand-section">
                <div class="divider"></div>
                <div class="expand-button" @click="showAllVehicles = !showAllVehicles">
                  <span>{{ showAllVehicles ? 'Show Less' : `Show All ${vehicles.length} Vehicles` }}</span>
                  <van-icon :name="showAllVehicles ? 'arrow-up' : 'arrow-down'" />
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>

      <!-- Payment Details -->
      <div class="section">
        <h2 class="section-title">PAYMENT DETAILS</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="label">Rate</span>
            <span class="value">${{ rate }}/{{ rateUnit }}</span>
          </div>
          <template v-if="!isValetService">
            <div class="info-row">
              <span class="label">Duration Fee</span>
              <span class="value">${{ durationFee }}</span>
            </div>
          </template>
          <div class="info-row">
            <span class="label">Service Fee</span>
            <span class="value">${{ serviceFee }}</span>
          </div>
          <div class="info-row total">
            <span class="label">Total Amount</span>
            <span class="value price">${{ totalAmount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Button -->
    <div class="bottom-bar">
      <van-button 
        block 
        :disabled="!isValid"
        @click="handlePayment"
        class="submit-btn"
      >
        Pay Now ${{ totalAmount }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { mockParkingLots } from '@/utils/helpers';

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

interface Vehicle {
  licensePlate: string;
  brand?: string;
  model?: string;
  color?: string;
}

const route = useRoute();
const router = useRouter();

const userInfo = ref<UserInfo>({
  name: '',
  phone: '',
  email: ''
});

// 从路由获取数据
const vehicles = ref<Vehicle[]>(
  JSON.parse(route.query.vehicles as string || '[]')
);

// 获取停车场信息
const parkingLot = computed(() => {
  const id = Number(route.params.id);
  return mockParkingLots.find(lot => lot.id === id) || {
    name: 'Unknown Parking Lot',
    id: id
  };
});

// 从路由参数获取预订信息
const startTime = computed(() => new Date(route.query.startTime as string));
const duration = Number(route.query.duration || 0);
const spots = Number(route.query.spots || 1);
const rate = Number(route.query.price || 0);
const rateUnit = route.query.priceType || 'hour';
const isValetService = computed(() => route.query.service === 'valet');

// 计算结束时间（仅用于自助停车）
const endTime = computed(() => {
  if (isValetService.value) return null;
  return new Date(startTime.value.getTime() + duration * 3600000);
});

// 计算费用
const durationFee = computed(() => {
  if (isValetService.value) {
    return rate * spots;
  }
  return rate * duration * spots;
});

const serviceFee = computed(() => {
  // 代客泊车服务费更高
  return isValetService.value ? 5 : 2;
});

const totalAmount = computed(() => {
  return durationFee.value + serviceFee.value;
});

// 生成订单号
const orderNo = 'P' + Date.now().toString().slice(-8);
const createdTime = new Date();

// 车位信息
const spotType = ref('Standard');  // 这里可以从之前的选择中获取
const spotLocation = ref('Zone A - 123');  // 这里可以是动态分配的

const isValid = computed(() => {
  return userInfo.value.name && userInfo.value.phone;
});

function formatTime(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

function handleBack() {
  router.back();
}

function handlePayment() {
  if (!isValid.value) {
    showToast('Please fill in required fields');
    return;
  }
  
  // 处理支付逻辑
  showToast('Processing payment...');
  // 支付成功后跳转到订单列表
  setTimeout(() => {
    router.push('/parking-orders');
  }, 1500);
}

// 控制车辆列表的展开/收起
const showAllVehicles = ref(false);
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
  padding-bottom: 80px;
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

.info-form {
  display: grid;
  gap: 12px;
}

.input-field {
  background: #2a2a2a;
  border-radius: 8px;
}

.custom-input {
  width: 100%;
  height: 48px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  padding: 0 16px;
  outline: none;
}

.custom-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.info-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
}

.card-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.label {
  color: rgba(255, 255, 255, 0.6);
}

.value {
  font-weight: 500;
}

.value.status {
  color: #ffd700;
}

.value.price {
  color: #7c4dff;
  font-size: 18px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
}

.submit-btn {
  background: #7c4dff;
  border: none;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

:deep(.submit-btn.van-button--disabled) {
  opacity: 0.5;
  background: #7c4dff;
}

.input-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  padding: 0 16px;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.vehicle-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.vehicle-header {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.plate-number {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
}

.valet-vehicle {
  margin-bottom: 12px;
}

.valet-vehicle:last-child {
  margin-bottom: 0;
}

.vehicle-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.vehicle-info-item {
  display: flex;
  flex-direction: column;
}

.vehicle-info-item .label {
  font-size: 12px;
  margin-bottom: 4px;
}

.vehicle-info-item .value {
  font-size: 16px;
  font-weight: 500;
}

.vehicle-info-item .value.plate {
  font-size: 18px;
  letter-spacing: 1px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.expand-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.expand-button:hover {
  background: rgba(124, 77, 255, 0.1);
}

.expand-button span {
  font-size: 13px;
  color: #7c4dff;
}

.expand-button .van-icon {
  color: #7c4dff;
  font-size: 14px;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.vehicle-simple {
  padding: 12px 0;
}

.vehicle-simple:first-child {
  padding-top: 0;
}

.vehicle-simple:last-child {
  padding-bottom: 0;
}

.other-vehicles {
  margin-top: 8px;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.expand-section {
  margin-top: 8px;
}

.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-button:hover {
  opacity: 0.8;
}

.expand-button span {
  font-size: 14px;
  color: #7c4dff;
}

.expand-button .van-icon {
  color: #7c4dff;
  font-size: 14px;
}
</style> 