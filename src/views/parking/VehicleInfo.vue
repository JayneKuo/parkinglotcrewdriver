<template>
  <div class="vehicle-page">
    <van-nav-bar
      title="Vehicle Information"
      left-arrow
      @click-left="handleBack"
      class="custom-nav"
    />

    <div class="content">
      <!-- Driver Information -->
      <div class="section">
        <h2 class="section-title">DRIVER INFORMATION</h2>
        <div class="form-card">
          <div class="input-group">
            <div class="input-field">
              <input 
                v-model="driverInfo.name"
                placeholder="Driver Name *"
                class="custom-input"
              >
            </div>
            <div class="input-field">
              <input 
                v-model="driverInfo.phone"
                placeholder="Phone Number *"
                type="tel"
                class="custom-input"
              >
            </div>
            <div class="input-field">
              <input 
                v-model="driverInfo.email"
                placeholder="Email (Optional)"
                type="email"
                class="custom-input"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicle Information -->
      <div class="section">
        <h2 class="section-title">VEHICLE</h2>
        <div class="form-card">
          <!-- Recent Vehicles -->
          <div v-if="recentVehicles.length" class="recent-vehicles">
            <h3 class="form-subtitle">Recent Vehicles</h3>
            <div class="recent-plates">
              <div 
                v-for="vehicle in recentVehicles"
                :key="vehicle.licensePlate"
                class="plate-tag"
                @click="selectVehicle(vehicle)"
              >
                <span class="plate-number">{{ vehicle.licensePlate }}</span>
                <span v-if="vehicle.brand" class="vehicle-info">
                  {{ vehicle.brand }} {{ vehicle.model }}
                </span>
              </div>
            </div>
          </div>

          <!-- Vehicle Form -->
          <div class="input-group">
            <div class="input-field">
              <input 
                v-model="vehicles[0].licensePlate"
                placeholder="License Plate *"
                class="custom-input"
              >
            </div>
            <template v-if="isValetService">
              <div class="input-field">
                <input 
                  v-model="vehicles[0].brand"
                  placeholder="Brand *"
                  class="custom-input"
                >
              </div>
              <div class="input-field">
                <input 
                  v-model="vehicles[0].model"
                  placeholder="Model *"
                  class="custom-input"
                >
              </div>
              <div class="input-field">
                <input 
                  v-model="vehicles[0].color"
                  placeholder="Color *"
                  class="custom-input"
                >
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Button -->
    <div class="bottom-bar">
      <van-button 
        block 
        :disabled="!isValid"
        @click="handleConfirm"
        class="submit-btn"
      >
        Confirm Reservation
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';

interface Vehicle {
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}

interface DriverInfo {
  name: string;
  phone: string;
  email: string;
}

const route = useRoute();
const router = useRouter();
const isValetService = computed(() => route.query.service === 'valet');
const maxVehicles = Number(route.query.spots || 1);

// 最近使用的车辆信息
const recentVehicles = ref<Vehicle[]>(
  JSON.parse(localStorage.getItem('recentVehicles') || '[]')
);

// 车辆信息列表
const vehicles = ref<Vehicle[]>([{
  licensePlate: '',
  brand: '',
  model: '',
  color: ''
}]);

// 添加司机信息
const driverInfo = ref<DriverInfo>({
  name: '',
  phone: '',
  email: ''
});

const canAddMore = computed(() => vehicles.value.length < maxVehicles);

const isValid = computed(() => {
  const hasDriverInfo = !!driverInfo.value.name && !!driverInfo.value.phone;
  const hasValidVehicles = vehicles.value.every(vehicle => {
    const hasLicensePlate = !!vehicle.licensePlate;
    if (isValetService.value) {
      return hasLicensePlate && 
             !!vehicle.brand && 
             !!vehicle.model && 
             !!vehicle.color;
    }
    return hasLicensePlate;
  });
  
  return hasDriverInfo && hasValidVehicles;
});

function addVehicle() {
  if (canAddMore.value) {
    vehicles.value.push({
      licensePlate: '',
      brand: '',
      model: '',
      color: ''
    });
  }
}

function removeVehicle(index: number) {
  vehicles.value.splice(index, 1);
}

function selectVehicle(selectedVehicle: Vehicle) {
  if (vehicles.value.length > 0) {
    const emptyVehicleIndex = vehicles.value.findIndex(v => !v.licensePlate);
    const targetIndex = emptyVehicleIndex >= 0 ? emptyVehicleIndex : 0;
    vehicles.value[targetIndex] = { ...selectedVehicle };
  }
}

function saveVehicleToRecent(vehicle: Vehicle) {
  const existingVehicles = recentVehicles.value;
  const existingIndex = existingVehicles.findIndex(v => v.licensePlate === vehicle.licensePlate);
  
  if (existingIndex >= 0) {
    existingVehicles.splice(existingIndex, 1);
  }
  
  existingVehicles.unshift(vehicle);
  const newVehicles = existingVehicles.slice(0, 5); // 只保留最近5个
  recentVehicles.value = newVehicles;
  localStorage.setItem('recentVehicles', JSON.stringify(newVehicles));
}

function handleBack() {
  router.back();
}

function handleConfirm() {
  // 保存车辆信息到最近使用记录
  vehicles.value.forEach(vehicle => {
    if (vehicle.licensePlate) {
      saveVehicleToRecent(vehicle);
    }
  });

  // 跳转到确认页面，并传递数据
  router.push({
    path: `/parking/${route.params.id}/confirm`,
    query: {
      ...route.query,
      vehicles: JSON.stringify(vehicles.value),
      driver: JSON.stringify(driverInfo.value),
      startTime: route.query.startTime,
      duration: route.query.duration,
      spots: route.query.spots,
      price: route.query.price,
      priceType: route.query.priceType
    }
  });
}
</script>

<style scoped>
.vehicle-page {
  min-height: 100vh;
  background: var(--page-background);
  color: var(--text-primary);
  padding-top: 46px;
  padding-bottom: 80px;
}

.custom-nav {
  background: var(--card-background);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

:deep(.van-nav-bar__title),
:deep(.van-nav-bar__text),
:deep(.van-nav-bar .van-icon) {
  color: var(--text-primary);
}

.content {
  padding: 16px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0 4px;
}

.recent-plates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
}

.plate-tag {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--card-background);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  min-width: 100px;
  position: relative;
  overflow: hidden;
}

.plate-tag:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.plate-tag:hover .plate-number {
  color: #ffffff;
}

.plate-tag:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.plate-number {
  font-family: 'SF Mono', monospace;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.2s ease;
}

.vehicle-info {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.plate-tag:hover .vehicle-info {
  color: rgba(255, 255, 255, 0.9);
}

/* 添加选中效果 */
.plate-tag::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-color);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.plate-tag:hover::after {
  opacity: 0.1;
}

.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vehicle-form {
  composes: form-card;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.vehicle-count {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
  margin-top: 16px;
}

.add-btn {
  background: transparent;
  border: 1px dashed var(--primary-color);
  color: var(--primary-color);
  height: 44px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--highlight-background);
  border-style: solid;
}

.add-btn:active {
  transform: scale(0.98);
}

.input-field {
  background: var(--secondary-background);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.custom-input {
  width: 100%;
  height: 48px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  padding: 0 16px;
  outline: none;
}

.custom-input::placeholder {
  color: var(--text-tertiary);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: var(--card-background);
  border-top: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  z-index: 100;
}

.submit-btn {
  background: var(--primary-color);
  border: none;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
}

:deep(.submit-btn.van-button--disabled) {
  opacity: 0.5;
  background: var(--status-default);
}

/* 安全区适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-bar {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
  
  .vehicle-page {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}

/* 输入框获得焦点时的样式 */
.custom-input:focus {
  background: var(--highlight-background);
  border-color: var(--primary-color);
}

/* 添加输入框动画 */
.input-field {
  transition: all 0.2s ease;
}

.input-field:hover {
  border-color: var(--primary-color);
}

/* 优化标签样式 */
.section-title {
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

/* 优化表单布局 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--secondary-background);
  padding: 16px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.remove-btn {
  font-size: 12px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--danger-color);
}

.form-card {
  background: var(--card-background);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 16px;
  margin-bottom: 24px;
  transition: all 0.2s ease;
}

.form-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.form-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 16px;
}

/* 优化输入框组样式 */
.input-field {
  background: var(--secondary-background);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.input-field:hover,
.input-field:focus-within {
  border-color: var(--primary-color);
  background: var(--highlight-background);
}

.custom-input {
  width: 100%;
  height: 48px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 15px;
  padding: 0 16px;
  outline: none;
}

.custom-input::placeholder {
  color: var(--text-tertiary);
}

/* 必填字段标记 */
.custom-input[placeholder*="*"]::placeholder {
  color: var(--text-primary);
  font-weight: 500;
}

/* 添加输入框下划线动画 */
.input-field::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.input-field:focus-within::after {
  width: 100%;
}

.form-card {
  background: var(--card-background);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.form-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.form-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.recent-vehicles {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 调整标题样式 */
.section-title {
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style> 